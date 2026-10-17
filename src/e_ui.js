
/* ---------------- HUD & UI ---------------- */
const $=id=>document.getElementById(id);
const hud=$('hud'), hud2=$('hud2'), countEl=$('count'), toastEl=$('toast'), timeEl=$('time'), heatEl=$('heat'), heatBar=$('heatBar'), placeEl=$('place'), prog=$('prog'), pwrEl=$('pwr'), gems1=$('gems1');
const DOT_COL={king:'#c4c8e6',skeleton:'#ece6d6',skelly:'#ff8a2a',unicorn:'#ff6fae',pegasus:'#7fe3bd',seapony:'#8fe8f0',clover:'#ffb48a',plum:'#a98ae6',queen:'#5a62d6',dragon:'#5fcf8f'};
let dots=[];
function buildProgressDots(){
  prog.querySelectorAll('.dot').forEach(d=>d.remove());
  const list=racers.slice().reverse().map(r=>[r,'']); if(ghost) list.unshift([ghost,'ghost']);
  dots=list.map(([r,cls])=>{ const d=document.createElement('span'); d.className='dot '+cls; d.style.background=DOT_COL[r.kind]||'#fff'; if(r.isPlayer) d.style.zIndex=2; prog.appendChild(d); return [r,d]; });
}
const fmt=s=>{ if(s==null) return '--:--.--'; const m=Math.floor(s/60), r=s-m*60; return m+':'+(r<10?'0':'')+r.toFixed(2); };
const ord=n=>['1ST','2ND','3RD','4TH'][n]||'';
function standings(){ return racers.slice().sort((a,b)=>{ if(a.finishT!==null&&b.finishT!==null) return a.finishT-b.finishT; if(a.finishT!==null) return -1; if(b.finishT!==null) return 1; return b.x-a.x; }); }
let hudT=0;
function updateHud(dt){
  hudT-=dt; if(hudT>0||demo||mode==='photo') return; hudT=1/15;
  const st=standings();
  if(twoP){
    players.forEach((p,i)=>{ const b=$('p2b'+i); b.querySelector('.n').textContent=p.name; b.querySelector('.pl').textContent=ord(st.indexOf(p)); b.querySelector('.g').textContent='◆'+p.gems; });
    return;
  }
  const p=players[0];
  { const sb=$('starBtn'), c=p.starT>0?p.starT/CONFIG.star.time:(p.star||0); sb.style.setProperty('--c',c.toFixed(3)); sb.classList.toggle('ready',(p.star||0)>=1 && !(p.starT>0)); sb.classList.toggle('going',p.starT>0);
    sb.querySelector('.sl').textContent=p.starT>0?'GO!':(p.star||0)>=1?'STAR!':'STAR'; $('pad').classList.toggle('swap',controlsSwapped()); }
  timeEl.textContent=freeMode?freeDistance()+'m':fmt(p.finishT ?? raceT);
  let fill;
  if(p.P.power){ const cd=p.P.power==='fire'?CONFIG.powers.fireCooldown:CONFIG.powers.phaseCooldown; fill=p.turboT>0||p.phaseT>0?1:1-Math.max(0,p.powerCD)/cd; $('powerBtn').classList.toggle('cool',p.powerCD>0); }
  else if(p.P.charge) fill=p.chargeT>0?1:p.state==='air'?0:1;
  else if(p.P.hoverTime) fill=p.hover/p.P.hoverTime;
  else if(p.P.glideTime) fill=p.glide/p.P.glideTime;
  else if(p.P.airJumps) fill=p.state!=='air'?1:(p.jumpsLeft>0||(!p.jumped&&p.airT<CONFIG.coyoteTime))?.5:0;
  else fill=p.state!=='air'?1:0;
  heatEl.style.width=(fill*100).toFixed(0)+'%';
  heatBar.className='bar'+(fill<.01?' hot':fill<.6?' warm':'');
  placeEl.textContent=ord(st.indexOf(p));
  gems1.textContent='◆'+p.gems;
  let chips=''; if(p.shield) chips+='<span class="chip shield">SHIELD</span>';
  if(p.magnetT>0) chips+='<span class="chip magnet">MAGNET '+Math.ceil(p.magnetT)+'</span>';
  if(p.superT>0) chips+='<span class="chip super">SUPER '+Math.ceil(p.superT)+'</span>';
  if(p.starT>0) chips+='<span class="chip super">★ STAR '+Math.ceil(p.starT)+'</span>';
  if(pwrEl.innerHTML!==chips) pwrEl.innerHTML=chips;
  for(const [r,d] of dots) d.style.left=(clamp((r.x-START_X)/(FINISH_X-START_X),0,1)*100).toFixed(1)+'%';
}
function toast(msg,long=false){ if(typeof textBackwards==='function' && textBackwards()) msg=[...msg].reverse().join(''); toastEl.textContent=msg; toastEl.classList.remove('show'); toastEl.classList.toggle('long',long); void toastEl.offsetWidth; toastEl.classList.add('show'); }

const screens={title:$('title'),select:$('select'),shop:$('shop'),paused:$('paused'),results:$('results')};
function show(name){ for(const k in screens) screens[k].hidden = k!==name; }
const wallet=()=>document.querySelectorAll('[data-wallet]').forEach(e=>e.textContent=save.gems);

/* ---------- character select ---------- */
const RACERS=[
  {kind:'unicorn', desc:'Fastest on the ground. Tap jump again in the air for a double jump.', speed:4, jump:3},
  {kind:'pegasus', desc:'Hold jump to glide. Her wings carry her up hills, and in a speed burst she hops obstacles by herself.', speed:3, jump:4},
  {kind:'queen', desc:'POWER: Moon Phase. Turn ghostly and run straight through hills.', speed:4, jump:3, locked:()=>!save.unlocked.queen, lockName:'MOON QUEEN', lockText:'Beat the Moon Queen in her boss race (level 4) to race as her.'},
  {kind:'dragon', desc:'POWER: Fire Turbo. Blast forward super fast and smash right through obstacles.', speed:4, jump:3, locked:()=>!save.unlocked.dragon, lockName:'DRAGON PONY', lockText:'Beat Dragon Pony in her boss race (level 8) to race as her.'},
  {kind:'king', desc:'Press jump on an uphill to CHARGE up it at top speed. Born for big mountains.', speed:3, jump:3, locked:()=>!save.unlocked.king, lockName:'MOUNTAIN KING', lockText:'Beat the Mountain King in his boss race (level 12) to race as him.'},
  {kind:'skelly', desc:'Every level turns to Halloween! Hold jump in the air to ghost-hover, press \u25bc to drop. Skeleton horses are his friends.', speed:4, jump:3, locked:()=>!save.seapony, lockText:'Someone mysterious is waiting behind the Level 8 boss.'},
];
const pips=n=>'<b>'+[0,1,2,3].map(i=>'<i'+(i<n?' class="f"':'')+'></i>').join('')+'</b>';
function buildCards(){
  $('cards').innerHTML=RACERS.map(R=>{
    if(R.locked&&R.locked()) return `<div class="card locked"><canvas class="pv" data-k="${R.lockName?'sil-'+R.kind:'mystery'}" width="40" height="38"></canvas><h3>${R.lockName||'???'}</h3><p>${R.lockText}</p><div class="pips"><span>SPEED</span>${pips(0)}<span>JUMP</span>${pips(0)}</div><span class="best">LOCKED</span></div>`;
    return `<div class="card" data-pony="${R.kind}"><canvas class="pv" data-k="${R.kind}" width="40" height="38"></canvas>
      <input class="pname" data-pony="${R.kind}" maxlength="10" aria-label="${CONFIG.ponies[R.kind].name} name" placeholder="${CONFIG.defaultNames[R.kind]}" value="${(save.names[R.kind]||CONFIG.defaultNames[R.kind]).replace(/"/g,'')}" title="Tap to rename">
      <h3>${CONFIG.ponies[R.kind].name.toUpperCase()}</h3><p>${R.desc}</p>
      <div class="pips"><span>SPEED</span>${pips(R.speed)}<span>JUMP</span>${pips(R.jump)}</div>
      <span class="best" data-best="${R.kind}">BEST --:--.--</span>
      <button class="btn small go" data-pony="${R.kind}">RACE ▶</button></div>`;
  }).join('');
  document.querySelectorAll('#cards .go').forEach(b=>b.addEventListener('click',()=>pick(b.dataset.pony)));
  document.querySelectorAll('#cards .card[data-pony]').forEach(c=>c.addEventListener('pointerenter',()=>{ if(mode==='select' && pickStage===0 && chosen!==c.dataset.pony){ chosen=c.dataset.pony; setupRace(true); updateLevelUI(); } }));
  document.querySelectorAll('#cards .pname').forEach(inp=>{
    inp.addEventListener('input',()=>{ save.names[inp.dataset.pony]=inp.value.replace(/[^\w \-!'.]/g,'').slice(0,10); persist(); });
    inp.addEventListener('keydown',e=>e.stopPropagation());
  });
  refreshPreviews(); refreshBest();
}
function refreshBest(){
  updateLevelUI(); wallet();
  document.querySelectorAll('[data-best]').forEach(el=>{ const b=store.get('best2.'+el.dataset.best+'.'+level,null); el.textContent='BEST '+(b?fmt(b):'--:--.--'); });
}
function updateSelectTitle(){
  $('selTitle').textContent = freeMode ? 'FREE RUN \u00b7 PICK YOUR HORSE' : !twoP ? 'CHOOSE YOUR RACER' : pickStage===0 ? 'PLAYER 1, CHOOSE YOUR RACER' : 'PLAYER 2, CHOOSE YOUR RACER';
  document.querySelectorAll('#cards .card').forEach(c=>{ c.classList.toggle('picked',twoP&&pickStage===1&&c.dataset.pony===chosen); c.querySelector('.badge')?.remove();
    if(twoP&&pickStage===1&&c.dataset.pony===chosen) c.insertAdjacentHTML('afterbegin','<span class="badge">P1</span>'); });
}
function pick(kind){
  audio();
  if(!twoP){ chosen=kind; startRace(); return; }
  if(pickStage===0){ chosen=kind; pickStage=1; updateSelectTitle(); return; }
  chosen2=kind; pickStage=0; updateSelectTitle(); startRace();
}
function setMode(m){ twoP=m===2; freeMode=m==='free'; pickStage=0;
  $('m1').setAttribute('aria-pressed',m===1); $('m2').setAttribute('aria-pressed',m===2); $('m3').setAttribute('aria-pressed',m==='free');
  document.querySelector('.lvl-pick').hidden=freeMode; updateSelectTitle(); updateKeys(); }
$('m1').addEventListener('click',()=>setMode(1));
$('m2').addEventListener('click',()=>setMode(2));
$('m3').addEventListener('click',()=>setMode('free'));
$('cPrev').addEventListener('click',()=>$('cards').scrollBy({left:-230,behavior:'smooth'}));
$('cNext').addEventListener('click',()=>$('cards').scrollBy({left:230,behavior:'smooth'}));

function updateLevelUI(){ $('lvName').textContent='LEVEL '+level+' · '+levelName(level).toUpperCase()+({speedway:' · TURBO',mountains:' · MOUNTAINS',spooky:' · SPOOKY'}[levelStyle(level)]||'')+(isBoss(level)?' · BOSS':''); $('lvPrev').disabled=level<=1; $('lvNext').disabled=level>=save.maxLevel; }
function changeLevel(dl){ const n=clamp(level+dl,1,save.maxLevel); if(n===level) return; level=n; setupRace(true); refreshBest(); }
$('lvPrev').addEventListener('click',()=>changeLevel(-1));
$('lvNext').addEventListener('click',()=>changeLevel(1));

/* ---------- race flow ---------- */
function startRace(){
  audio();
  setupRace(false);
  show(null); hud.hidden=twoP; hud2.hidden=!twoP; document.querySelector('.hud-c').hidden=freeMode; placeEl.hidden=freeMode; $('quitBtn').textContent=freeMode?'END RUN':'QUIT RACE';
  if(!twoP) $('meterLabel').textContent=CONFIG.ponies[chosen].power==='fire'?'FIRE':CONFIG.ponies[chosen].power==='moon'?'MOON':CONFIG.ponies[chosen].charge?'CHARGE':CONFIG.ponies[chosen].hoverTime?'GHOST':CONFIG.ponies[chosen].glideTime?'WINGS':CONFIG.ponies[chosen].airJumps?'JUMPS':'JUMP';
  mode='countdown'; countdown=3; lastCount=0; for(const I of INP){ for(const k in NO_INPUT) I[k]=false; I.tap=false; I.ptap=false; I.lanes.length=0; }
  drawJumpIcon();
  { const pw=CONFIG.ponies[chosen].power; $('powerBtn').hidden=twoP||!pw; $('powerBtn').textContent=pw==='fire'?'FIRE':pw==='moon'?'MOON':'POWER'; layout(); }
  $('lvl').textContent=freeMode?'FREE RUN':'LV '+level;
  const boss=!twoP && !freeMode && isBoss(level);
  if(freeMode){ toast('FREE RUN! GRAB THE GLOWING ORBS',true); return; }
  toast(boss ? 'BOSS RACE: '+CONFIG.bosses[bossKind(level)].name.toUpperCase()+'!' : 'LEVEL '+level+': '+levelName(level).toUpperCase(), true);
  if(boss) SFX.fanfare();
  const tip = WR.tip ? WR.tip : levelStyle(level)==='spooky' ? 'JUMP OVER THE SKELETON HORSES!' : levelStyle(level)==='mountains' ? 'CLIMB SLOW, RACE DOWN FAST!' : levelStyle(level)==='speedway' ? 'RACE DOWNHILL FOR TURBO SPEED!' : '';
  if(tip) setTimeout(()=>{ if(mode==='countdown'||mode==='race') toast(tip,true); },WR.tip?1400:2800);
}
let nextOnAgain=false;
function showResults(){
  mode='results'; hud.hidden=true; hud2.hidden=true;
  const st=standings(), stats=[];
  let flash='';
  const earned=players.reduce((s,p)=>s+p.gems,0);
  if(twoP){
    const w=players.slice().sort((a,b)=>(a.finishT??1e9)-(b.finishT??1e9))[0];
    $('rPlace').textContent=w.name+' WINS!';
    $('rMsg').textContent='What a race! Both riders’ gems go into the sticker book.';
    players.forEach((p,i)=>stats.push(['P'+(i+1)+' '+p.name, fmt(p.finishT)+'  ◆'+p.gems]));
    nextOnAgain=false; $('againBtn').textContent='REMATCH'; $('changeBtn').textContent='CHANGE RACERS';
  } else {
    const p=players[0], place=st.indexOf(p), time=p.finishT, boss=isBoss(level);
    const key='best2.'+p.kind+'.'+level, prev=store.get(key,null), isNew=prev===null||time<prev;
    if(isNew){ store.set(key,time); if(rec.length>8) store.set('ghost2.'+p.kind+'.'+level, rec.join(',')); flash='NEW BEST TIME! YOUR GHOST WILL RACE YOU NEXT TIME.'; }
    const cleared = boss ? place===0 : place<=1;
    let bonus=0;
    if(cleared){ save.maxLevel=Math.max(save.maxLevel,level+1); if(boss){ bonus=CONFIG.bossBonus; p.gems+=bonus; } }
    if(boss && cleared){ const bk=bossKind(level); if(!save.unlocked[bk]){ save.unlocked[bk]=true; flash=CONFIG.ponies[bk].name.toUpperCase()+' IS NOW PLAYABLE!'; } }
    if(boss && cleared && level>=CONFIG.unlockSeaPonyAt && !save.seapony){ save.seapony=true; if(!save.owned.trail.includes('fire')) save.owned.trail.push('fire'); flash='A NEW RACER JOINED: THE SKELETON HORSE!'; SFX.fanfare(); }
    nextOnAgain=cleared;
    $('rPlace').textContent = boss ? (cleared?'BOSS DEFEATED!':CONFIG.bosses[bossKind(level)].name.toUpperCase()+' WINS') : ord(place)+' PLACE';
    $('rMsg').textContent = boss ? (cleared ? 'You and '+CONFIG.bosses[bossKind(level)].name+' are best friends now! +'+bonus+' bonus gems.' : 'Bosses must be beaten in 1st place. Grab a power-up and try again!')
      : place===0 ? 'Level '+level+' cleared! Next up: '+levelName(level+1)+', and it’s faster.'
      : place===1 ? 'Level '+level+' cleared! '+levelName(level+1)+' is unlocked.'
      : 'Finish 1st or 2nd to unlock the next level. Time those landings!';
    stats.push(['TIME',fmt(time)],['BEST',fmt(isNew?time:prev)],['GEMS','+'+p.gems]);
    if(p.bestCombo>=2) stats.push(['BEST COMBO','×'+p.bestCombo]);
    $('againBtn').textContent = cleared ? 'NEXT LEVEL ▶' : 'TRY AGAIN'; $('changeBtn').textContent='CHANGE RACER';
    if(place===0) for(let i=0;i<40;i++) particles.push({x:p.x-60+Math.random()*200,y:-cams[0].y+10+Math.random()*30,vx:(Math.random()-.5)*40,vy:Math.random()*20,life:2+Math.random(),c:RAINBOW[i%5],sz:2});
  }
  save.gems+=players.reduce((s,p)=>s+p.gems,0); persist();
  stats.push(['TOTAL','◆'+save.gems]);
  $('rStats').innerHTML=stats.map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('');
  $('rFlash').hidden=!flash; $('rFlash').textContent=flash;
  show('results'); refreshBest();
}
function goSelect(){ Music.stop(); mode='select'; hud.hidden=true; hud2.hidden=true; countEl.textContent=''; pickStage=0; setupRace(true); buildCards(); updateSelectTitle(); show('select'); }
let pausedFrom='race';
function pause(on){
  if(on && (mode==='race'||mode==='countdown')){ pausedFrom=mode; mode='paused'; Music.stop(); show('paused'); }
  else if(!on && mode==='paused'){ mode=pausedFrom; show(null); if(mode==='race'&&!muted){ Music.start(level); if(fabT>0) Music.fab(true); } }
}
$('startBtn').addEventListener('click',()=>{ audio(); goSelect(); });
$('againBtn').addEventListener('click',()=>{ if(nextOnAgain) level++; startRace(); });
$('changeBtn').addEventListener('click',goSelect);
$('resumeBtn').addEventListener('click',()=>pause(false));
$('quitBtn').addEventListener('click',()=>{ if(freeMode && players[0] && !demo) showFreeResults(); else goSelect(); });
document.querySelectorAll('[data-pause]').forEach(b=>b.addEventListener('click',()=>pause(true)));
function setMute(m){ muted=m; save.muted=m; persist(); if(master) master.gain.value=m?0:1; document.querySelectorAll('[data-mute]').forEach(b=>b.style.opacity=m?.45:1);
  if(m) Music.stop(); else if(mode==='race'){ audio(); Music.start(level); } }
document.querySelectorAll('[data-mute]').forEach(b=>b.addEventListener('click',()=>setMute(!muted))); setMute(muted);
const bindToggle=(id,key,after)=>{ const el=$(id); el.checked=!!save[key]; el.addEventListener('change',()=>{ save[key]=el.checked; persist(); after&&after(); }); };
bindToggle('noLose','noLose'); bindToggle('ghostT','ghost');

/* ---------- sticker book ---------- */
let shopPony='unicorn', shopCat='mane';
const unlockedPonies=()=>RACERS.filter(R=>!(R.locked&&R.locked())).map(R=>R.kind);
function openShop(){ mode='shop'; shopPony=unlockedPonies().includes(chosen)?chosen:'unicorn'; renderShop(); show('shop'); }
function drawPonyThumb(c,kind,mane,hat){ const x=c.getContext('2d'); x.imageSmoothingEnabled=false; x.clearRect(0,0,c.width,c.height);
  const S=ponySet(kind,mane); const ox=(c.width-36)>>1, oy=c.height-32-1; x.drawImage(S.run[1],ox,oy);
  if(hat && hat!=='none' && HATS[hat]){ const h=HATS[hat]; x.drawImage(h.spr,ox+h.dx-1,oy+h.dy-1); } }
function drawTrailThumb(c,id){ const x=c.getContext('2d'); x.clearRect(0,0,c.width,c.height); const S=TRAILS[id].s;
  for(let k=0;k<6;k++){ x.fillStyle=S[k]; for(let i=0;i<c.width;i++) x.fillRect(i,Math.round(12+k*2+Math.sin(i*.25)*2),1,2); }
  const pc=TRAILS[id].pc; for(let i=0;i<6;i++){ x.fillStyle=pc[i%pc.length]; const px=4+i*6, py=30+(i%2)*4; x.fillRect(px-1,py,3,1); x.fillRect(px,py-1,1,3); } }
function renderShop(){
  wallet();
  $('shopPonies').innerHTML=unlockedPonies().map(k=>`<button class="tab" data-sp="${k}" aria-selected="${k===shopPony}">${ponyName(k)}</button>`).join('');
  $('shopPonies').querySelectorAll('[data-sp]').forEach(b=>b.addEventListener('click',()=>{ shopPony=b.dataset.sp; renderShop(); }));
  document.querySelectorAll('#shopTabs .tab').forEach(b=>b.setAttribute('aria-selected',b.dataset.cat===shopCat));
  const eq=equipOf(shopPony), items=SHOP[shopCat];
  $('shopGrid').innerHTML=items.map(it=>{ const own=save.owned[shopCat].includes(it.id), on=eq[shopCat]===it.id;
    const label = on?'WEARING':own?'WEAR':'◆'+it.price;
    return `<button class="item${on?' on':''}${!own&&save.gems<it.price?' poor':''}" data-id="${it.id}"><canvas width="40" height="38"></canvas><b>${it.name}</b><span class="price">${label}</span></button>`; }).join('');
  $('shopGrid').querySelectorAll('.item').forEach(b=>{ const id=b.dataset.id, c=b.querySelector('canvas');
    if(shopCat==='mane') drawPonyThumb(c,shopPony,id,eq.hat); else if(shopCat==='hat') drawPonyThumb(c,shopPony,eq.mane,id); else drawTrailThumb(c,id);
    b.addEventListener('click',()=>buy(id,b)); });
}
function buy(id,el){
  audio(); const it=SHOP[shopCat].find(z=>z.id===id), owned=save.owned[shopCat];
  if(!owned.includes(id)){
    if(save.gems<it.price){ SFX.nope(); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); el.querySelector('.price').textContent='NEED ◆'+(it.price-save.gems)+' MORE'; return; }
    save.gems-=it.price; owned.push(id); SFX.buy();
  } else SFX.item();
  equipOf(shopPony)[shopCat]=id; persist(); renderShop();
}
document.querySelectorAll('#shopTabs .tab').forEach(b=>b.addEventListener('click',()=>{ shopCat=b.dataset.cat; renderShop(); }));
$('shopBtn').addEventListener('click',()=>{ audio(); openShop(); });
$('shopDone').addEventListener('click',()=>{ mode='select'; setupRace(true); buildCards(); updateSelectTitle(); show('select'); });

/* ---------- photo mode ---------- */
function openPhoto(from){
  photo.from=from; photo.kind=from==='paused'?players[0].kind:chosen; photo.theme=(level-1)%THEMES.length; photo.pose=0;
  mode='photo'; show(null); hud.hidden=true; hud2.hidden=true; $('photoBar').hidden=false; document.body.classList.add('photo');
  particles.length=0; setCanvasMode(false); layout();
}
function closePhoto(){
  $('photoBar').hidden=true; document.body.classList.remove('photo'); particles.length=0;
  if(photo.from==='paused'){ setTheme(level); setCanvasMode(twoP); mode='paused'; show('paused'); }
  else { mode='select'; setupRace(true); show('select'); }
  layout();
}
$('photoBtn').addEventListener('click',()=>openPhoto('select'));
$('pausePhoto').addEventListener('click',()=>openPhoto('paused'));
$('phDone').addEventListener('click',closePhoto);
$('phWorld').addEventListener('click',()=>{ const n=Math.min(THEMES.length,save.maxLevel); photo.theme=(photo.theme+1)%n; });
$('phPose').addEventListener('click',()=>{ photo.pose=(photo.pose+1)%POSES.length; SFX.item(); });
$('phPony').addEventListener('click',()=>{ const u=unlockedPonies(); photo.kind=u[(u.indexOf(photo.kind)+1)%u.length]; });
$('phSpark').addEventListener('click',()=>{ photo.sparkles=!photo.sparkles; if(!photo.sparkles) particles.length=0; });

/* ---------- input ---------- */
function press(p,act,on){
  if(mode==='cutscene'){ if(on) cutsceneTap(); return; }
  if(mode==='dance'){ if(on) danceHit(act); return; }
  const I=INP[p];
  if(act==='up'||act==='down'){ if(on) I.lanes.push(act==='up'?-1:1); return; }
  I[act]=on; if(on){ audio(); if(act==='jump') I.tap=true; if(act==='power') I.ptap=true; if(act==='star') I.stap=true; }
}
document.querySelectorAll('.pad [data-act]').forEach(b=>{
  const act=b.dataset.act, p=+b.dataset.p, ids=new Set();
  b.addEventListener('pointerdown',e=>{ e.preventDefault(); ids.add(e.pointerId); press(p,act,true); b.classList.add('on'); });
  const up=e=>{ ids.delete(e.pointerId); if(!ids.size){ if(act!=='up'&&act!=='down') press(p,act,false); b.classList.remove('on'); } };
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,up));
  b.addEventListener('contextmenu',e=>e.preventDefault());
});
const KEY1={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'jump',KeyK:'jump',KeyX:'power',ShiftLeft:'power',ShiftRight:'power',KeyL:'power',KeyC:'star',KeyE:'star',KeyJ:'star'};
const KEY2={KeyW:[0,'up'],KeyS:[0,'down'],KeyD:[0,'jump'],KeyF:[0,'jump'],Space:[0,'jump'],ArrowUp:[1,'up'],ArrowDown:[1,'down'],ArrowRight:[1,'jump'],KeyL:[1,'jump'],Enter:[1,'jump']};
const keyAct=code=>{ if(twoP){ const m=KEY2[code]; return m?m:null; } const a=KEY1[code]; return a?[0,a]:null; };
function updateKeys(){
  $('keys').innerHTML = twoP
    ? 'P1: <kbd>W</kbd><kbd>S</kbd> lanes (S in air = dive) · <kbd>D</kbd> jump &nbsp;&nbsp; P2: <kbd>↑</kbd><kbd>↓</kbd> lanes · <kbd>→</kbd> jump &nbsp;&nbsp; <kbd>P</kbd> pause'
    : '<kbd>Space</kbd> jump (hold to glide or hover) · <kbd>↑</kbd><kbd>↓</kbd> change lane · <kbd>↓</kbd> in the air: dive · <kbd>C</kbd> star turbo · <kbd>X</kbd> power · <kbd>P</kbd> pause';
  layout();
}
addEventListener('keydown',e=>{
  if(e.target && e.target.tagName==='INPUT') return;
  if(mode==='cutscene'){ cutsceneTap(); return; }
  if(mode==='dance'){ const m=keyAct(e.code); if(m && !e.repeat) danceHit(m[1]); else if(e.code==='Enter') danceHit('jump'); e.preventDefault(); return; }
  if(e.code==='KeyP'||e.code==='Escape'){ if(mode==='photo') closePhoto(); else pause(mode!=='paused'); return; }
  if(e.code==='Enter' && mode==='title'){ audio(); goSelect(); return; }
  if(!['countdown','race','finish'].includes(mode)) return;
  const m=keyAct(e.code); if(!m) return;
  e.preventDefault(); if(e.repeat && (m[1]==='up'||m[1]==='down'||m[1]==='jump')) return; press(m[0],m[1],true);
});
$('stage').addEventListener('pointerdown',()=>{ if(mode==='cutscene') cutsceneTap(); else if(mode==='dance') danceHit('tap'); });
addEventListener('keyup',e=>{ const m=keyAct(e.code); if(m && m[1]!=='up' && m[1]!=='down') INP[m[0]][m[1]]=false; });
addEventListener('blur',()=>{ for(const I of INP) for(const k in NO_INPUT) I[k]=false; if(mode==='race') pause(true); });

/* ---------- layout ---------- */
function layout(){
  const desktop=matchMedia('(hover: hover) and (pointer: fine)').matches;
  const over=!desktop && matchMedia('(orientation: landscape) and (max-height: 560px)').matches;
  document.body.classList.toggle('no-pad',desktop); document.body.classList.toggle('pad-over',over);
  const app=$('app'), cs=getComputedStyle(app);
  let aw=app.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  let ah=app.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
  if(document.body.classList.contains('photo')) ah-=$('photoBar').offsetHeight+14;
  else if(desktop) ah-=$('keys').offsetHeight+14;
  else if(!over) ah-=(twoP&&VH>180?$('pad2'):$('pad')).offsetHeight+44;
  const ratio=W/VH, w=Math.max(160,Math.min(aw,ah*ratio)), st=$('stage');
  st.style.width=Math.floor(w)+'px'; st.style.height=Math.floor(w/ratio)+'px';
}
addEventListener('resize',layout); addEventListener('orientationchange',()=>setTimeout(layout,200));

/* ---------- jump button: your horse's head peeking over the top ---------- */
function drawJumpIcon(){ const c=$('jumpIcon'); if(!c) return; const x=c.getContext('2d'); x.imageSmoothingEnabled=false; x.clearRect(0,0,24,26);
  const k=chosen, eq=equipOf(k), ox=-15, oy=6; x.drawImage(ponySet(k,eq.mane).run[0],ox,oy);
  if(eq.hat!=='none' && HATS[eq.hat]){ const h=HATS[eq.hat]; x.drawImage(h.spr,ox+h.dx-1,oy+h.dy-1); } }
/* ---------- previews ---------- */
let previews=[];
function refreshPreviews(){ previews=[...document.querySelectorAll('canvas.pv')].map(c=>{ const x=c.getContext('2d'); x.imageSmoothingEnabled=false; return [c.dataset.k,x]; }); }
const shopX=$('shopPv').getContext('2d'); shopX.imageSmoothingEnabled=false;
function drawPreviews(){
  const f=(t*9|0)%4;
  for(const [k,x] of previews){ if(x.canvas.offsetParent===null) continue; x.clearRect(0,0,40,38);
    if(k==='mystery'){ x.drawImage(ponySet('mystery').run[0],2,5); continue; }
    if(k.startsWith('sil-')){ x.drawImage(ponySet(k.slice(4)).run[0],2,5); x.globalCompositeOperation='source-atop'; x.fillStyle='#4a3466'; x.fillRect(0,0,40,38); x.globalCompositeOperation='source-over'; continue; }
    const eq=equipOf(k); x.drawImage(ponySet(k,eq.mane).run[f],2,5);
    if(eq.hat!=='none'&&HATS[eq.hat]){ const h=HATS[eq.hat]; x.drawImage(h.spr,2+h.dx-1,5+h.dy-1); } }
  if(mode==='shop'){ const eq=equipOf(shopPony), S=TRAILS[eq.trail].s; shopX.clearRect(0,0,64,40);
    for(let k=0;k<6;k++){ shopX.fillStyle=S[k]; for(let i=0;i<26;i++) shopX.fillRect(i,Math.round(14+k+Math.sin(i*.3+t*6)*1.5),1,1); }
    shopX.drawImage(ponySet(shopPony,eq.mane).run[f],22,6);
    if(eq.hat!=='none'&&HATS[eq.hat]){ const h=HATS[eq.hat]; shopX.drawImage(h.spr,22+h.dx-1,6+h.dy-1); } }
}

/* ---------- loop ---------- */
buildCards(); updateKeys(); drawJumpIcon(); layout(); if(document.fonts) document.fonts.ready.then(layout);
setupRace(true);
let last=performance.now(), acc=0;
function frame(now){
  const rdt=Math.min(.1,(now-last)/1000); last=now;
  if(slowT>0) slowT-=rdt;
  acc+=rdt*(slowT>0?CONFIG.slowmo.scale:1);
  while(acc>=STEP){ update(STEP); acc-=STEP; }
  if(shake>0) shake=Math.max(0,shake-rdt*10);
  render(); updateHud(rdt); drawPreviews();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
</script>
