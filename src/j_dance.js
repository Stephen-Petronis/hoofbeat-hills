
/* ---------------- Friendship Dance: after the high five, a dance party in the boss's castle courtyard ----------------
   Notes slide in from the right. Tap the matching button (JUMP / ▲ / ▼) when a note reaches the ring.
   Both horses dance along: hop, rear up, bow. Score stars = a Friendship Charm saved for later. */
const COURT = {
  queen: { title:'MOON GARDEN', sky:['#14123a','#1e1a52','#2a2468','#3a3080'], wall:'#4a4c96', wall2:'#383a7c', top:'#6a6cba', floor:['#c8d0ff','#9aa4e8','#fff4a8','#e0c8ff'], banner:'#eef0ff', mark:'#fff4a8', lights:['#fff4a8','#cfe0ff','#ffffff'], charm:'MOON CHARM' },
  dragon:{ title:'DRAGON\'S DEN', sky:['#3a0f1a','#5a1620','#8a2424','#c23c2a'], wall:'#7a3a2a', wall2:'#5a2a1e', top:'#a8503a', floor:['#ffb36b','#e0844a','#ff5f5f','#ffe066'], banner:'#5fcf8f', mark:'#ffd76a', lights:['#ffb347','#ff5f5f','#ffe066'], charm:'FLAME CHARM' },
  king:  { title:'SUMMIT HALL', sky:['#8ea4ff','#a6b8ff','#c4d0ff','#e0e6ff'], wall:'#a4a9cc', wall2:'#8a8fb4', top:'#c4c8e6', floor:['#ffffff','#c4c8e6','#ffcf5a','#cfe0ff'], banner:'#ffcf5a', mark:'#ffffff', lights:['#ffcf5a','#ffffff','#cfe0ff'], charm:'MOUNTAIN CHARM' },
};
// little-kid friendly: one or two big slow notes per bar, mostly JUMP
const DANCE_BARS = [ [[0,'J']], [[0,'J'],[2,'J']], [[0,'U']], [[0,'D']], [[0,'J'],[2,'U']], [[0,'J'],[2,'D']], [[0,'U'],[2,'J']], [[0,'J'],[2,'J']] ];
const DANCE_BPM=92, DANCE_LEAD=2, DANCE_TRAVEL=3.2, HIT_X=46, LANE_Y=30;
const dance={ t:0, t0:0, boss:'queen', notes:[], hits:0, perfect:0, combo:0, best:0, done:false, doneT:0, pose:'', poseT:0, wob:0, judge:'', judgeT:0, stars:0, reward:0, p:null };
const beatLen=()=>60/DANCE_BPM;
function startDance(){
  const boss=cs.boss, order=[0,1,0,2,1,3,4,5,6,7];
  const notes=[]; order.forEach((bi,k)=>{ for(const [b,type] of DANCE_BARS[bi]) notes.push({beat:(DANCE_LEAD+k)*4+b,type,judged:false,res:''}); });
  Object.assign(dance,{t:-.15,boss,notes,hits:0,perfect:0,combo:0,best:0,done:false,doneT:0,pose:'',poseT:0,wob:0,judge:'',judgeT:0,stars:0,reward:0,p:cs.p});
  particles.length=0; mode='dance'; shake=0;
  if(!muted && audio()){ Music.start(1,'fab'); Music.bpm=DANCE_BPM; dance.t0=Music.next; } else dance.t0=0;
}
const noteTime=n=>n.beat*beatLen();
function danceClock(dt){ if(ac && Music.timer && dance.t0) dance.t=ac.currentTime-dance.t0; else dance.t+=dt; }
function danceHit(act){
  if(mode!=='dance') return;
  if(dance.done){ if(dance.doneT>1.2) endDance(); return; }
  if(act==='tap'||act==='power'||act==='star') return;
  const type=act==='jump'?'J':act==='up'?'U':'D';
  let best=null, bd=1e9;
  for(const n of dance.notes){ if(n.judged) continue; const d=Math.abs(noteTime(n)-dance.t); if(d<bd){ bd=d; best=n; } if(noteTime(n)>dance.t+.4) break; }
  if(!best || bd>.6) return;
  best.judged=true; const perfect=best.type===type && bd<.3; best.res=perfect?'P':'G';
  dance.hits++; if(perfect) dance.perfect++; dance.combo++; dance.best=Math.max(dance.best,dance.combo);
  dance.judge=perfect?['PERFECT!','AMAZING!','WOW!','YAY!'][dance.hits%4]:['GREAT!','NICE!','GO GO!'][dance.hits%3]; dance.judgeT=.5; dance.pose=best.type; dance.poseT=.42;
  if(ac){ const base=type==='J'?84:type==='U'?88:79; tone(mf(base),.12,'triangle',.05); tone(mf(base+7),.12,'sine',.03,0,ac.currentTime+.05); }
  for(let i=0;i<(perfect?14:8);i++){ const a=Math.random()*Math.PI*2, sp=30+Math.random()*60;
    particles.push({x:(i%2?128:196),y:96,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-30,life:.8,c:FLOWER_C[i%FLOWER_C.length],shape:i%3?'heart':'flower',g:60}); }
  if(dance.combo>0 && dance.combo%8===0){ toast('COMBO '+dance.combo+'!'); SFX.combo(4); }
}
function updateDance(dt){
  danceClock(dt); cheerT=Math.max(cheerT,.3);
  if(dance.poseT>0) dance.poseT-=dt; if(dance.wob>0) dance.wob-=dt; if(dance.judgeT>0) dance.judgeT-=dt;
  for(const n of dance.notes) if(!n.judged && dance.t>noteTime(n)+.6){ n.judged=true; n.res='M'; dance.wob=.3; }
  const last=noteTime(dance.notes[dance.notes.length-1]);
  if(!dance.done && dance.t>last+.8){
    dance.done=true; dance.doneT=0; const pct=dance.hits/dance.notes.length; dance.stars=pct>=.5?3:2; dance.reward=dance.stars*5;
    save.gems=(save.gems|0)+dance.reward; save.friends=save.friends||{}; save.friends[dance.boss]=Math.max(save.friends[dance.boss]|0,dance.stars); persist();
    SFX.fanfare(); for(let i=0;i<50;i++){ const a=Math.random()*Math.PI*2, sp=40+Math.random()*110; particles.push({x:160,y:90,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-40,life:1.6,c:FLOWER_C[i%FLOWER_C.length],shape:i%2?'flower':'bigheart',g:60}); }
  }
  if(dance.done){ dance.doneT+=dt; if(Math.random()<.4) particles.push({x:Math.random()*W,y:-6,vx:(Math.random()-.5)*14,vy:20+Math.random()*25,life:8,c:FLOWER_C[(Math.random()*FLOWER_C.length)|0],shape:Math.random()<.5?'flower':'heart',g:0}); }
}
function endDance(){ Music.stop(); particles.length=0; showResults(); }
function renderDance(){
  const C=COURT[dance.boss]||COURT.queen, bt=dance.t/beatLen(), beat=Math.floor(bt), ph=bt-beat, pulse=dance.t>0?1-ph:0;
  // sky + scenery
  const ys=[0,24,44,62]; C.sky.forEach((c,i)=>{ ctx.fillStyle=c; ctx.fillRect(0,ys[i],W,(i<3?ys[i+1]:84)-ys[i]); });
  if(dance.boss==='queen'){ ctx.fillStyle='#fff6d8'; for(let dy=-14;dy<=14;dy++){ const hw=Math.floor(Math.sqrt(196-dy*dy)); ctx.fillRect(250-hw,30+dy,hw*2,1); } ctx.fillStyle=C.sky[1]; for(let dy=-12;dy<=12;dy++){ const hw=Math.floor(Math.sqrt(144-dy*dy)); ctx.fillRect(257-hw,26+dy,hw*2,1); }
    for(let i=0;i<30;i++){ const h=hash(i*41); if(((t*2+i)|0)%4) { ctx.fillStyle='#fff4d6'; ctx.fillRect(h%W,(h>>>9)%60,1,1); } } }
  if(dance.boss==='dragon'){ ctx.fillStyle='#3a1414'; ctx.beginPath(); ctx.moveTo(170,84); ctx.lineTo(225,22); ctx.lineTo(255,22); ctx.lineTo(310,84); ctx.fill(); ctx.fillStyle='#ff7a1a'; ctx.fillRect(226,20,28,4);
    for(let i=0;i<14;i++){ const h=hash(i*13), y=Math.round(84-((t*24+h%90)%90)); ctx.fillStyle=['#ff7a1a','#ffe066'][i%2]; ctx.fillRect(10+h%300,y,1,1); } }
  if(dance.boss==='king'){ ctx.fillStyle='#eef4ff'; for(const [a,b,c] of [[0,84,70],[60,84,130],[150,84,215],[230,84,300]]){ ctx.beginPath(); ctx.moveTo(a,b); ctx.lineTo((a+c)/2,26+(a%40)); ctx.lineTo(c,b); ctx.fill(); } }
  // courtyard wall with arches and battlements
  ctx.fillStyle=C.wall; ctx.fillRect(0,60,W,52); ctx.fillStyle=C.top; ctx.fillRect(0,58,W,4);
  for(let x=0;x<W;x+=16){ ctx.fillStyle=C.wall; ctx.fillRect(x,52,9,8); ctx.fillStyle=C.top; ctx.fillRect(x,52,9,2); }
  for(let i=0;i<5;i++){ const ax=18+i*66; ctx.fillStyle=C.wall2; ctx.fillRect(ax,76,30,36); ctx.beginPath(); ctx.arc(ax+15,76,15,Math.PI,0); ctx.fill(); }
  // banners sway on the beat
  for(let i=0;i<4;i++){ const bx=50+i*74, sw=Math.round(Math.sin(t*2+i)*1.5); ctx.fillStyle=C.banner; ctx.fillRect(bx+sw,62,12,22); ctx.beginPath(); ctx.moveTo(bx+sw,84); ctx.lineTo(bx+6+sw,79); ctx.lineTo(bx+12+sw,84); ctx.fill();
    ctx.fillStyle=C.mark; ctx.fillRect(bx+4+sw,68,4,4); ctx.fillRect(bx+5+sw,67,2,6); }
  // string lights blink with the music
  for(let x=0;x<W;x+=10){ const y=Math.round(48+Math.sin(x*.05)*5); ctx.fillStyle='#3a2350'; ctx.fillRect(x,y-1,10,1); ctx.fillStyle=C.lights[(x/10+beat)%C.lights.length|0]; ctx.globalAlpha=.6+.4*pulse; ctx.fillRect(x+4,y,2,2); ctx.globalAlpha=1; }
  // disco floor: tiles flash on every beat
  for(let r=0;r<6;r++){ const y0=112+r*r*1.9+r*4|0, y1=112+(r+1)*(r+1)*1.9+(r+1)*4|0, n=8+r*2, tw=W/n;
    for(let k=0;k<n;k++){ const lit=(k+r+beat)%3===0; ctx.fillStyle=lit?C.floor[2+((k+beat)%2)]:C.floor[(k+r)%2]; if(lit) ctx.globalAlpha=.7+.3*pulse; ctx.fillRect(Math.floor(k*tw),y0,Math.ceil(tw),y1-y0); ctx.globalAlpha=1; } }
  // the two friends dance
  const PS=dance.p.spr, BS=ponySet(dance.boss), bob=Math.abs(Math.sin(bt*Math.PI))*4;
  const poseOf=(isBoss)=>{ let alt=bob, ang=0, spr=isBoss?BS.run[((beat%4)+4)%4]:PS.run[(((beat+1)%4)+4)%4], air=false;
    if(dance.poseT>0){ const u=1-dance.poseT/.42;
      if(dance.pose==='J'){ alt=Math.sin(u*Math.PI)*26; air=true; }
      else if(dance.pose==='U'){ ang=.55*Math.sin(u*Math.PI); }
      else { ang=-.35*Math.sin(u*Math.PI); alt=0; } }
    if(isBoss && dance.wob>0) ang+=Math.sin(t*40)*.15;
    if(air) spr=isBoss?BS.air:PS.air; return {alt,ang,spr}; };
  const a=poseOf(false), b=poseOf(true);
  ctx.fillStyle='rgba(58,35,80,.3)'; ctx.fillRect(110,149,40,4); ctx.fillRect(176,149,40,4);
  drawBig(a.spr,128,152-a.alt,a.ang,1,dance.p.hat);
  drawBig(b.spr,198,152-b.alt,b.ang,-1,dance.boss==='queen'?'crown':null);
  for(const p of particles) drawParticle(p,0);
  // note highway across the top
  ctx.fillStyle='rgba(58,35,80,.55)'; ctx.fillRect(0,LANE_Y-11,W,22); ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(0,LANE_Y-11,W,1); ctx.fillRect(0,LANE_Y+10,W,1);
  const R=9+Math.round(pulse*2); ctx.fillStyle='#ffd76a'; for(let k=0;k<40;k++){ const an=k/40*Math.PI*2; ctx.fillRect(Math.round(HIT_X+Math.cos(an)*R),Math.round(LANE_Y+Math.sin(an)*R),2,2); }
  for(const n of dance.notes){ if(n.judged && n.res!=='M') continue; const dtN=noteTime(n)-dance.t; if(dtN>DANCE_TRAVEL||dtN<-.4) continue;
    const x=Math.round(HIT_X+(W-HIT_X+10)*dtN/DANCE_TRAVEL), y=LANE_Y; if(n.res==='M') ctx.globalAlpha=.35;
    drawNote(n.type,x,y); ctx.globalAlpha=1; }
  // judge text, meter, titles
  if(dance.judgeT>0) pixelText(dance.judge,HIT_X+4,LANE_Y+26,dance.judge==='PERFECT!'?'#ffd76a':dance.judge==='GREAT!'?'#7fe3bd':'#fff6fb',8);
  const pct=dance.hits/dance.notes.length; ctx.fillStyle='#3a2350'; ctx.fillRect(212,LANE_Y+18,100,8); ctx.fillStyle='#ff6fae'; ctx.fillRect(213,LANE_Y+19,Math.round(98*pct),6);
  ctx.fillStyle='#ffffff'; ctx.fillRect(213,LANE_Y+19,Math.round(98*pct),1); pixelText('♥ FRIENDSHIP',262,LANE_Y+40,'#fff6fb',8);
  if(dance.t<DANCE_LEAD*4*beatLen()){ pixelText(C.title,160,66,'#ffd76a',12); pixelText('DANCE PARTY WITH '+CONFIG.bosses[dance.boss].name.toUpperCase()+'!',160,80,'#fff6fb',8);
    if(((t*2)|0)%2) pixelText('TAP WHEN THE NOTE REACHES THE RING!',160,172,'#fff6fb',8); }
  if(dance.combo>=4 && !dance.done) pixelText('×'+dance.combo,160,108,'#ff6fae',8);
  if(dance.done){ ctx.fillStyle='rgba(36,22,56,.55)'; ctx.fillRect(40,56,240,74);
    pixelText('BEST FRIENDS FOREVER!',160,76,'#fff6fb',12);
    let st=''; for(let i=0;i<3;i++) st+=i<dance.stars?'★':'☆'; pixelText(st,160,96,'#ffd76a',16);
    pixelText(C.charm+' +'+dance.reward+' ◆',160,116,'#7fe3bd',8);
    if(dance.doneT>1.2 && ((t*2)|0)%2) pixelText('TAP TO CONTINUE',160,174,'#fff6fb',8); }
}
function drawNote(type,x,y){
  if(type==='J'){ ctx.fillStyle='#3a2350'; for(let dy=-8;dy<=8;dy++){ const hw=Math.floor(Math.sqrt(64-dy*dy)); ctx.fillRect(x-hw,y+dy,hw*2,1); }
    ctx.fillStyle='#ff6fae'; for(let dy=-7;dy<=7;dy++){ const hw=Math.floor(Math.sqrt(49-dy*dy)); ctx.fillRect(x-hw,y+dy,hw*2,1); }
    ctx.fillStyle='#ffb3d6'; ctx.fillRect(x-4,y-5,4,2); ctx.fillStyle='#ffffff'; ctx.fillRect(x-3,y-5,2,1);
    ctx.fillStyle='#fff6fb'; ctx.fillRect(x-2,y-1,5,3); ctx.fillRect(x+2,y-3,2,2); ctx.fillRect(x-2,y+2,1,2); ctx.fillRect(x+2,y+2,1,2); return; }
  const up=type==='U'; ctx.fillStyle='#3a2350';
  for(let k=0;k<=8;k++){ const yy=up?y-7+k*1.75:y+7-k*1.75; ctx.fillRect(x-k-1,Math.round(yy)-1,2*k+2,3); }
  ctx.fillStyle='#c9b3ff'; for(let k=0;k<=7;k++){ const yy=up?y-6+k*1.6:y+6-k*1.6; ctx.fillRect(x-k,Math.round(yy),2*k,2); }
  ctx.fillStyle='#ffffff'; ctx.fillRect(x-1,up?y-4:y+3,2,1);
}
