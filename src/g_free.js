
/* ---------------- Free Run: endless, no racing. Friendly horses, rare obstacles, world orbs ---------------- */
let freeMode=false;
const worldOrbs=[], friends=[];
const FREE={ len:15000, shiftAt:9000, shift:6000 };
const zoomCv=document.createElement('canvas');
const HERD_NAMES=['Daisy','Pip','Maple','Biscuit','Juniper','Pebble','Honey','Willow','Clover','Plum','Sunny','Bluebell'];
const fr={ zoom:1, maxHerd:0, pAir:false, x:0, seed:1, nextObstacle:0, nextOrb:0, dist:0, topSpeed:0, worlds:1, warnFor:null, warnT:0, friendT:2, flashT:0, themeI:0, startT:0 };
const worldOrbSpr = padSprite(15,15,['#ff6fae','#ffd76a','#7fe3bd','#c9b3ff','#ffffff'],x=>{
  circ(x,'#ff6fae',[[7.5,7.5,7.3]]); circ(x,'#ffd76a',[[7.5,7.5,5.6]]); circ(x,'#7fe3bd',[[7.5,7.5,4]]); circ(x,'#c9b3ff',[[7.5,7.5,2.4]]);
}, x=>{ x.fillStyle='#ffffff'; x.fillRect(4,3,2,1); x.fillRect(4,4,1,1); }, '#6b4a90');
function frR(){ fr.seed=(Math.imul(fr.seed,1103515245)+12345)&0x7fffffff; return fr.seed/0x7fffffff; }
const frI=(a,b)=>a+Math.floor(frR()*(b-a+1));

function buildFree(){
  HT.fill(0); for(const a of [goos,pads,shrooms,hurdles,brambles,clouds,gems,orbs,worldOrbs]) a.length=0;
  friends.length=0; trackStyle='free';
  Object.assign(fr,{zoom:1, maxHerd:0, pAir:false, x:300, seed:(Date.now()&0xffff)+7, nextObstacle:1400, nextOrb:700, dist:0, topSpeed:0, worlds:1, warnFor:null, warnT:0, friendT:1.5, flashT:0});
  TRACK_LEN=FREE.len; FINISH_X=1e9;
  appendFree(FREE.len-400);
}
// generate relaxed terrain from fr.x up to xEnd: big rolling hills, long downhills, gentle mountains
function appendFree(xEnd){
  const startX=fr.x, R=frR, ri=frI, pick=a=>a[Math.floor(R()*a.length)];
  const gem=(x,lane,off,abs=false,big=false)=>gems.push({x:Math.round(x),ly:lane,off,abs,v:big?5:1,big,c:hash(Math.round(x)+lane)%3});
  const notAll=()=>{ const l=[0,1,2]; l.splice(ri(0,2),1); if(R()<.55) l.splice(ri(0,1),1); return l; };
  const pats=['bigroll','bigroll','downramp','rolls','meadow','peak','kick','bigroll'];
  let x=fr.x;
  while(x<xEnd-700){
    const p=pick(pats);
    if(p==='bigroll'){ const w=ri(320,480), h=ri(40,80); roll(x,w,h); for(let i=0;i<6;i++) gem(x+w/2+20+i*26,ri(0,2),8); pads.push({x:Math.round(x+w*.62),lane:ri(0,2)}); x+=w; }
    else if(p==='downramp'){ const hh=ri(55,85), xs=profile(x,[[ri(170,210),hh],[ri(60,110),hh],[ri(380,480),0]]);
      pads.push({x:Math.round(xs[1]+70),lane:ri(0,2)},{x:Math.round(xs[1]+210),lane:ri(0,2)}); for(let i=0;i<6;i++) gem(xs[1]+40+i*40,1,8); x=xs[2]; }
    else if(p==='rolls'){ const w=ri(130,180), h=ri(16,30); roll(x,w,h); roll(x+w,w,h); gem(x+w/2,ri(0,2),12); gem(x+w*1.5,ri(0,2),12); x+=2*w; }
    else if(p==='meadow'){ const len=ri(220,320), gl=ri(0,2); for(let i=0;i<7;i++) gem(x+20+i*(len-40)/6,gl,7); if(R()<.5) shrooms.push({x:Math.round(x+len*.6),lane:ri(0,2)}); x+=len; }
    else if(p==='peak'){ const h1=ri(60,90), h2=ri(110,170); const xs=profile(x,[[ri(180,230),h1],[ri(40,60),h1-ri(10,20)],[ri(150,200),h2],[ri(40,60),h2+4],[ri(170,230),ri(15,30)],[ri(70,90),0]]);
      for(let i=0;i<4;i++) gem(xs[2]+(xs[3]-xs[2])*i/3,ri(0,2),10); gem(xs[3]+40,1,46,false,true); x=xs[5]; }
    else if(p==='kick'){ const w=ri(85,105), h=ri(30,42), dr=ri(65,85); kick(x,w,h,dr);
      if(CONFIG.cloudPlatforms && R()<.5){ const cx0=x+w+ri(30,45), cl=ri(150,200), ch=Math.round(h+ri(18,26)); clouds.push({x:cx0,len:cl,h:ch}); for(let i=0;i<4;i++) gem(cx0+20+(cl-40)*i/3,ri(0,2),ch+9,true); }
      else for(let i=0;i<5;i++) gem(x+w+20+i*24,1,30+18*Math.sin(Math.PI*i/4));
      x+=w+dr+60; }
    x+=ri(60,140);
    // an occasional obstacle on flat ground between hills, always leaving a lane open
    if(x>=fr.nextObstacle){ const k=R();
      if(k<.6){ const ls=notAll(); fence(x+30,ls); for(let l=0;l<3;l++) if(!ls.includes(l)) gem(x+30,l,8); }
      else thorns(x+20,ri(35,55),notAll());
      x+=140; fr.nextObstacle=x+ri(1000,1700); }
    if(x>=fr.nextOrb){ worldOrbs.push({x:Math.round(x-60),ly:ri(0,2),off:R()<.5?ri(30,46):12,taken:false}); fr.nextOrb=x+ri(1100,1700); }
    if(R()<.18) orbs.push({x:Math.round(x-90),ly:ri(0,2),off:12,abs:false,type:pick(['shield','magnet','super']),taken:false});
  }
  fr.x=x;
  // smooth the newly built stretch, then settle gem/orb heights onto it
  const a=Math.max(2,startX-20), b=Math.min(TRACK_LEN-2,x+20);
  for(let pass=0;pass<2;pass++){ const c=HT.slice(a-2,b+2); for(let i=a;i<b;i++){ const j=i-a+2; HT[i]=(c[j-2]+c[j-1]+c[j]+c[j+1]+c[j+2])/5; } }
  for(const g of gems) if(g.alt===undefined){ g.alt=(g.abs?0:heightAt(g.x))+g.off; g.taken=false; g.pull=null; }
  for(const o of orbs) if(o.alt===undefined){ o.alt=heightAt(o.x)+o.off; o.taken=false; }
  for(const o of worldOrbs) if(o.alt===undefined) o.alt=heightAt(o.x)+o.off;
}
// keep the world endless: slide everything back and build more ahead
function freeShift(){
  const S=FREE.shift;
  HT.copyWithin(0,S,FREE.len+4); HT.fill(0,FREE.len+4-S);
  const shiftArr=(arr,len)=>{ for(let i=arr.length-1;i>=0;i--){ arr[i].x-=S; if(arr[i].x+(len?arr[i].len:0)<-300) arr.splice(i,1); } };
  for(const a of [goos,brambles,clouds]) shiftArr(a,true);
  for(const a of [pads,shrooms,hurdles,gems,orbs,worldOrbs,friends]) shiftArr(a,false);
  for(const r of racers){ r.x-=S; r.prevX-=S; r.respawnX-=S; for(const p of r.trail) p.x-=S; }
  for(const c of cams) c.x-=S;
  for(const p of particles) p.x-=S;
  fr.x-=S; fr.nextObstacle-=S; fr.nextOrb-=S; fr.dist+=S;
  appendFree(FREE.len-400);
}
function freeDistance(){ return Math.max(0,Math.round((fr.dist+players[0].x-START_X)/10)); }
function nextObstacleAhead(p){
  let best=null;
  for(const h of hurdles){ const d=h.x-p.x; if(d>40 && (!best||d<best.d)) best={d,x:h.x,lanes:h.lanes}; }
  for(const b of brambles){ const d=b.x-p.x; if(d>40 && (!best||d<best.d)) best={d,x:b.x,lanes:b.lanes}; }
  return best;
}
function freeTick(dt){
  const p=players[0];
  if(p.x>FREE.shiftAt) freeShift();
  fr.topSpeed=Math.max(fr.topSpeed,p.vx);
  if(fr.flashT>0) fr.flashT-=dt;
  // WATCH OUT! when an obstacle is coming up (about two seconds away)
  const ob=nextObstacleAhead(p);
  if(ob && ob.d<110+Math.max(p.vx,120)*1.9){ if(fr.warnFor!==ob.x){ fr.warnFor=ob.x; SFX.warn(); } fr.warnT=.3; fr.warnX=ob.x; fr.warnLanes=ob.lanes; }
  else if(fr.warnT>0) fr.warnT-=dt;
  // world orbs change the scenery
  for(const o of worldOrbs){ if(o.taken) continue;
    if(Math.abs(o.x-p.x)<11 && Math.abs(o.ly-p.laneY)<.6 && Math.abs(o.alt-(p.alt+10))<16){ o.taken=true; changeWorld(o); } }
  // friendly horses wander in and out
  // herd: run into a standing or slow pony and it follows you (up to 5), then drifts off after a while
  const herd=friends.filter(f=>f.ftype==='follow');
  for(const f of friends){ if((f.ftype!=='stand'&&f.ftype!=='slow') || herd.length>=5) continue;
    if(Math.abs(f.x-p.x)<14 && Math.abs(f.laneY-p.laneY)<.6 && p.state!=='tumble'){ joinHerd(f,herd); herd.push(f); } }
  fr.maxHerd=Math.max(fr.maxHerd,herd.length);
  const pAir=p.state==='air';
  if(pAir && !fr.pAir) for(const f of herd) f.hopDelay=.12*(f.slot+1);   // the herd jumps after you, one by one
  fr.pAir=pAir;
  fr.herdZoom=1-.06*herd.length;
  fr.friendT-=dt;
  if(fr.friendT<=0 && friends.length-herd.length<3 && friends.length<9){ fr.friendT=2.5+frR()*3.5; spawnFriend(p); }
  for(let i=friends.length-1;i>=0;i--){ const f=friends[i]; stepFriend(f,dt); if(f.x<p.x-450||f.x>p.x+700) friends.splice(i,1); }
}
function changeWorld(o){
  let i=fr.themeI; while(i===fr.themeI) i=Math.floor(frR()*THEMES.length);
  fr.themeI=i; setThemeIndex(i); fr.worlds++; fr.flashT=.45; cheerT=1.5;
  burst(o.x,laneY(o.ly)-o.alt,RAINBOW,30,110,0);
  SFX.item(); toast(THEMES[i].name.toUpperCase()+'!',true);
  if(!muted) Music.start(1,THEMES[i].music);
}
const FRIEND_KINDS=['clover','plum','unicorn','pegasus','seapony'];
function spawnFriend(p){
  const kind=FRIEND_KINDS[Math.floor(frR()*FRIEND_KINDS.length)], r=frR(), lane=frI(0,2);
  let type, x, vx;
  if(r<.38){ type='stand'; x=p.x+frI(260,380); vx=0; }
  else if(r<.7){ type='slow'; x=p.x+frI(280,360); vx=Math.max(45,p.vx*.45); }
  else { type='runner'; x=p.x-frI(140,200); vx=Math.max(p.P.top*1.55,p.vx+80); }
  const f=makeRacer(kind,{top:150,accel:0,gravity:500,jump:0,jump2:0,airJumps:0,glideTime:0,glideFall:0},lane,{x,prevX:x,vx,friend:true,ftype:type,hopT:0,spr:ponySet(kind)});
  f.alt=heightAt(x); friends.push(f);
}
function joinHerd(f,herd){
  const used=herd.map(h=>h.slot); let slot=0; while(used.includes(slot)) slot++;
  f.ftype='follow'; f.slot=slot; f.followT=14+frR()*8; f.name=HERD_NAMES[Math.floor(frR()*HERD_NAMES.length)].toUpperCase();
  burst(f.x,ry(f)-12,['#ff5fa8','#ff8fc0','#ffffff'],14,60,0); SFX.buy(); cheerT=Math.max(cheerT,1);
  toast(f.name+' JOINED YOUR HERD!');
}
const HERD_LANE=[0,-1,1,0,-1];
function stepFriend(f,dt){
  const p=players[0];
  if(f.ftype==='follow'){
    f.followT-=dt;
    if(f.followT<=0){ f.ftype='leaving'; }
    else { const tx=p.x-22-f.slot*20; f.vx=Math.max(0,p.vx+(tx-f.x)*2.2);
      f.lane=clamp(p.lane+HERD_LANE[f.slot],0,2);
      if(f.slot>=3 && f.lane===p.lane) f.lane=clamp(p.lane+(p.lane<2?1:-1),0,2); }
  }
  if(f.ftype==='leaving') f.vx=Math.max(p.vx*.55,f.vx-30*dt);
  f.laneY+=Math.sign(f.lane-f.laneY)*Math.min(Math.abs(f.lane-f.laneY),dt*6);
  if(f.hopDelay>0){ f.hopDelay-=dt; if(f.hopDelay<=0 && f.hopT<=0) f.hopT=.6; }
  f.x+=f.vx*dt; f.stride+=f.vx*dt/7;
  const g=heightAt(f.x);
  if(f.vx>0 && f.hopT<=0){ for(const h of hurdles) if(h.lanes.includes(f.lane) && h.x-f.x>0 && h.x-f.x<f.vx*.25){ f.hopT=.5; break; }
    for(const b of brambles) if(b.lanes.includes(f.lane) && b.x-f.x>0 && b.x-f.x<f.vx*.25){ f.hopT=.4+b.len/Math.max(60,f.vx); break; } }
  if(f.hopT>0 && !f.hopDur) f.hopDur=f.hopT;
  if(f.hopT>0){ f.hopT-=dt; f.state='air'; f.alt=g+Math.sin(Math.PI*clamp(1-f.hopT/f.hopDur,0,1))*24; if(f.hopT<=0) f.hopDur=0; }
  else { f.state='ground'; f.alt=g; }
  f.angle=f.state==='ground'?Math.atan(slopeAt(f.x)):0;
  if(f.ftype==='stand' && frR()<.003) f.stride+=1;
}
// 'world' layer: the bouncing ! sign over the coming obstacle. 'screen' layer: WATCH OUT! text and the world-change flash
function renderFreeOverlay(cx,layer){
  if(layer==='world'){ if(fr.warnT<=0) return;
    const sx=Math.min(W-10,Math.round(fr.warnX-cx)), l=fr.warnLanes?fr.warnLanes[0]:1;
    const y=Math.round(laneY(l)-heightAt(Math.min(fr.warnX,cx+W-10)))-34+Math.round(Math.sin(t*10)*2);
    ctx.fillStyle='#3a2350'; ctx.fillRect(sx-4,y-1,9,15); ctx.fillStyle='#ffd76a'; ctx.fillRect(sx-3,y,7,13); ctx.fillStyle='#3a2350'; ctx.fillRect(sx-1,y+2,3,6); ctx.fillRect(sx-1,y+10,3,2);
    return; }
  if(fr.warnT>0 && ((t*6)|0)%2) pixelText('WATCH OUT!',160,80,'#ff6b6b',12);
  if(fr.flashT>0){ ctx.fillStyle='rgba(255,255,255,'+(fr.flashT/.45*.85).toFixed(2)+')'; ctx.fillRect(0,0,W,H); }
}
function drawWorldOrb(o,cx){
  const sx=Math.round(o.x-cx), y=Math.round(laneY(o.ly)-o.alt+Math.sin(t*3+o.x)*2), R=11+Math.round(Math.sin(t*6)*1.5);
  for(let k=0;k<20;k++){ const an=k/20*Math.PI*2+t; ctx.fillStyle=RAINBOW[k%5]; ctx.fillRect(Math.round(sx+Math.cos(an)*R),Math.round(y+Math.sin(an)*R),1,1); }
  ctx.drawImage(worldOrbSpr,sx-8,y-8);
}
function showFreeResults(){
  Music.stop(); mode='results'; hud.hidden=true; hud2.hidden=true;
  const p=players[0], d=freeDistance();
  save.gems+=p.gems; const best=store.get('freeBest',0); const isNew=d>best; if(isNew) store.set('freeBest',d); persist();
  $('rPlace').textContent='WHAT A RUN!';
  $('rMsg').textContent=p.name+' galloped '+d+' meters and visited '+fr.worlds+' world'+(fr.worlds===1?'':'s')+'.';
  $('rStats').innerHTML=[['DISTANCE',d+'m'],['BEST',Math.max(d,best)+'m'],['TOP SPEED',Math.round(fr.topSpeed/p.P.top*100)+'%'],['BIGGEST HERD',fr.maxHerd+' ponies'],['GEMS','+'+p.gems],['TOTAL','◆'+save.gems]].map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('');
  $('rFlash').hidden=!isNew; $('rFlash').textContent='NEW BEST DISTANCE!';
  nextOnAgain=false; $('againBtn').textContent='RUN AGAIN'; $('changeBtn').textContent='CHANGE RACER';
  show('results');
}
