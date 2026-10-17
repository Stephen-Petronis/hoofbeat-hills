
/* ---------------- Racers & physics ---------------- */
function makeRacer(kind,P,lane,o={}){
  return Object.assign({kind,P,lane,laneY:lane,prefLane:lane,x:START_X,prevX:START_X,alt:0,vz:0,vx:0,angle:0,state:'ground',stride:0,
    tumble:0,spin:0,safe:0,respawnX:0,jumpBuf:0,jumped:false,jumpsLeft:0,glide:P.glideTime||0,gliding:false,hover:P.hoverTime||0,hovering:false,airT:0,mult:1,finishT:null,dustT:0,laneT:0,
    trail:[],trailT:0,rainbow:0,shield:false,magnetT:0,superT:0,combo:0,bestCombo:0,cloud:null,slowmoUsed:false,gemN:0,gemT:0,gems:0,
    isPlayer:false,ai:false,idx:0,name:'',spr:ponySet(kind),hat:null,trailStyle:'rainbow',skeleton:false,turboOn:false,wanderT:2,powerCD:0,turboT:0,phaseT:0,phaseAlt:0,phaseTotal:0,chargeT:0},o);
}
let mode='title', twoP=false, demo=true;
let players=[], racers=[], ghost=null, rec=[], recT=0;
const cams=[{x:0,y:0},{x:0,y:0}];
let raceT=0, countdown=0, finishTimer=0, firstFinish=null, t=0, lastCount=0;
let shake=0, slowT=0, cheerT=0, gaspT=0, fabT=0, fabIn=0;
const fabI=()=>fabT<=0?0:Math.min(1,fabIn,fabT/CONFIG.fab.fade);
let fabKind='rainbow';
function startFab(kind='rainbow',time=CONFIG.fab.time){ const was=fabT>0; fabKind=kind; fabT=Math.max(fabT,time); if(!was){ fabIn=0; SFX.fab(); if(!muted) Music.fab(true); } }
// view flip (Backwards Bay, Rainbow Road flips) and swapped up/down (Mirror Lake, during rainbow flips)
let flipV=1, flipTarget=1, rbClock=0, rbWarned=false, invOn=false;
const controlsSwapped=()=>!!(WR.mirror || (WR.flipEvery && flipTarget<0));
const textBackwards=()=>['countdown','race','finish'].includes(mode) && !demo && !twoP && (WR.backwards || (WR.flipEvery && flipTarget<0));
// STAR TURBO meter
function addStar(r,v){ if(!r.isPlayer||demo||twoP||r.starT>0) return; const was=(r.star||0)>=1; r.star=Math.min(1,(r.star||0)+v); if(!was && r.star>=1){ SFX.fanfare(); toast('STAR TURBO READY!'); } }
function useStar(r){ if(r.state==='tumble') return; if((r.star||0)<1 || r.starT>0){ SFX.nope(); return; }
  r.star=0; r.starT=CONFIG.star.time; r.vx=Math.max(r.vx,r.P.top*1.4); startFab('gold',CONFIG.star.time+.4); emit('star',r); }
// flippy flop: double-tap jump in the air
function startFlip(r){ if(r.flipT>0) return; r.flipT=CONFIG.flip.time; if(r.isPlayer && !demo) SFX.double(); }
function flipReward(r){
  r.flipT=0; r.flipA=0; const n=r.flips||0; r.flips=0; if(!n) return;
  r.vx+=CONFIG.flip.boost*n; r.gems+=CONFIG.flip.gems*n; r.rainbow=Math.max(r.rainbow,1); addStar(r,CONFIG.star.flip*n); emit('flippy',r,n); }
let viewZoom=1;   // camera pulls back for big jumps, bullet time and a big free-run herd
let level = Math.max(1, save.maxLevel|0);
let chosen='unicorn', chosen2='pegasus', pickStage=0;
const particles=[];
const NO_INPUT={gallop:false,jump:false,slow:false,push:false};
const mkInput=()=>({gallop:false,jump:false,slow:false,push:false,power:false,star:false,tap:false,ptap:false,stap:false,lanes:[]});
const INP=[mkInput(),mkInput()];

function setupRace(isDemo){
  demo=isDemo;
  const free=freeMode && !isDemo;
  halloween=!free && isHalloween();
  if(free){ buildFree(); fr.themeI=0; setThemeIndex(0); }
  else { worldOrbs.length=0; friends.length=0; buildTrack(level); setTheme(level); if(halloween) setThemeIndex(THEMES.findIndex(T=>T.spooky)); }
  const LV=CONFIG.levels, sp=free?1:levelSpeed(level);
  const two=twoP && !isDemo;
  const mkP=(kind,lane,idx)=>{ const base=CONFIG.ponies[kind], eq=equipOf(kind);
    return makeRacer(kind,{...base,top:base.top*sp,accel:base.accel*sp},lane,{isPlayer:true,ai:isDemo,idx,name:ponyName(kind),
      spr:ponySet(kind,eq.mane),hat:eq.hat==='none'?null:eq.hat,trailStyle:eq.trail}); };
  players=[mkP(chosen,two?0:1,0)];
  if(two) players.push(mkP(chosen2,2,1));
  racers=[...players];
  const spooky=themeOf(level).spooky||halloween, rv=1+.15*levelDifficulty(level);
  const skel=(i,lane,ahead)=>makeRacer('skeleton',{top:(122+10*i)*sp*rv,accel:125*sp,gravity:560,jump:240,jump2:0,airJumps:0,glideTime:0,glideFall:0},lane,
    {ai:true,skeleton:true,name:['BONES','RATTLES','SPOOKS'][i],spr:ponySet('skeleton'),x:START_X+ahead,prevX:START_X+ahead,wanderT:2+i*1.3});
  if(free){ /* free run: no rivals, friendly horses come and go */ }
  else if(!two){
    if(!isDemo && isBoss(level)){ const bk=bossKind(level), B=CONFIG.bosses[bk];
      racers.push(makeRacer(bk,{top:B.top*sp,accel:130*sp,gravity:560,jump:250,jump2:0,airJumps:0,glideTime:0,glideFall:0,uphillMin:B.uphillMin},0,
        {ai:true,boss:true,name:B.name,spr:ponySet(bk),hat:bk==='queen'?'crown':null,trailStyle:B.trail,rainbow:999}));
      if(spooky){ racers.push(skel(0,2,140)); racers.push(skel(1,1,280)); } }
    else if(spooky){ racers.push(skel(0,0,0)); racers.push(skel(1,2,0)); if(levelDifficulty(level)>.45) racers.push(skel(2,1,200)); }
    else for(const r of CONFIG.rivals) racers.push(makeRacer(r.kind,{top:r.top*sp*rv,accel:120*sp,gravity:560,jump:240,jump2:0,airJumps:0,glideTime:0,glideFall:0},r.lane,{ai:true,name:r.name}));
  } else if(spooky){ racers.push(skel(0,1,160)); racers.push(skel(1,1,340)); }
  ghost = (!two && !isDemo && !free && save.ghost) ? loadGhost(chosen,level) : null;
  rec=[]; recT=0;
  shrooms.forEach(s=>s.squish=0);
  particles.length=0; raceT=0; firstFinish=null; slowT=0; fabT=0; rbClock=0; rbWarned=false; flipTarget=flipV=(!isDemo && !two && WR.backwards)?-1:1;
  for(const c of cams){ c.x=START_X-100; c.y=0; }
  setCanvasMode(two);
  buildProgressDots();
}

function burst(x,y,cols,n=14,spd=70,vx0=0){
  for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, s=spd*(.4+Math.random()*.6); particles.push({x,y,vx:Math.cos(a)*s+vx0,vy:Math.sin(a)*s-30,life:.6+Math.random()*.4,c:cols[i%cols.length],sz:i%3?1:2}); }
}
const RAINBOW=['#ff6fae','#ffd76a','#7fe3bd','#c9b3ff','#fff6fb'];
const ry = r => laneY(r.laneY)-r.alt;
function emit(type,r,arg){
  const x=r.x, y=ry(r)-10;
  if(type==='rattle'){ burst(x,y,['#ece6d6','#bdb4a0','#7fffb0'],10,60,r.vx*.4); if(!demo) SFX.rattle(); return; }
  if(type==='fire') burst(x,y,['#ff4f1a','#ffa53a','#ffe066'],20,100,r.vx*.5);
  if(type==='moon') burst(x,y,['#cfe0ff','#ffffff','#fff4a8'],20,80,r.vx*.4);
  if(type==='winghop') burst(x,y,['#ffffff','#e6dcff','#c9b3ff'],12,60,r.vx*.4);
  if(type==='slam'||type==='thud') burst(x,y+10,type==='slam'?RAINBOW:['#fff6fb','#d9f7e9'],type==='slam'?16:8,80,r.vx*.5);
  if(type==='smooth') burst(x,y+8,['#ffffff','#ffd76a'],6,40,r.vx*.3);
  if(type==='crash'){ burst(x,y,['#ffd76a','#fff6fb','#ff6fae'],14,70,r.vx*.5); if(r.isPlayer){ shake=Math.max(shake,3); gaspT=1.3; } }
  if(type==='star') burst(x,y,['#ffd76a','#fff4a8','#ffffff','#ffb347'],30,120,r.vx*.5);
  if(type==='flippy') burst(x,y,RAINBOW,22,90,r.vx*.5);
  if(type==='double'||type==='boost'||type==='bounce'||type==='item') burst(x,y,RAINBOW,type==='double'?18:12,70,r.vx*.5);
  if(type==='pop') burst(x,y,['#bfe0ff','#ffffff','#7fb8ff'],16,90,r.vx*.5);
  if(type==='smash') burst(x,y+6,['#fff6fb','#ffd76a','#ff6fae'],12,90,r.vx*.6);
  if(type==='splash') burst(x,y+10,['#8fe8f0','#c7f7fa','#ffffff'],12,60,r.vx*.4);
  if(type==='giggle') burst(x,y,['#ff8fc8','#ffffff'],10,50,r.vx*.4);
  if(type==='boost') r.rainbow=CONFIG.levels.rainbowTime;
  if(type==='double') r.rainbow=Math.max(r.rainbow,.8);
  if(type==='hardland' && r.isPlayer) shake=Math.max(shake,2);
  if(type==='clear' && r.isPlayer) cheerT=Math.max(cheerT,.6);
  if(!r.isPlayer || demo) return;
  const who=twoP?r.name+' ':'';
  switch(type){
    case 'jump': SFX.jump(); break;
    case 'winghop': SFX.flap(); toast(who+'WING HOP!'); break;
    case 'fire': SFX.fire(); toast(who+'FIRE TURBO!'); shake=Math.max(shake,2); break;
    case 'moon': SFX.moon(); toast(who+'MOON PHASE!'); break;
    case 'charge': SFX.charge(); toast(who+'CHARGE!'); break;
    case 'slam': SFX.slam(); toast(who+'DIVE BOOST!'); shake=Math.max(shake,2); break;
    case 'thud': SFX.land(); break;
    case 'smooth': SFX.smooth(); if(r.airT>.7) toast(who+'SWEET LANDING!'); break;
    case 'double': SFX.double(); break;
    case 'land': case 'hardland': SFX.land(); break;
    case 'crash': SFX.crash(); toast(who+'OUCH!'); break;
    case 'boost': SFX.boost(); toast(who+'BOOST!'); break;
    case 'bounce': SFX.bounce(); break;
    case 'pop': SFX.pop(); toast(who+'BUBBLE SAVED YOU!'); break;
    case 'smash': SFX.smash(); break;
    case 'giggle': SFX.giggle(); toast(['BOING!','WHEE!','HEE HEE!'][(Math.random()*3)|0]); break;
    case 'cloud': SFX.cloud(); break;
    case 'splash': SFX.splash(); break;
    case 'star': SFX.fanfare(); toast('★ STAR TURBO! ★',true); shake=Math.max(shake,3); break;
    case 'flippy': SFX.combo(3); toast(who+(arg>1?'FLIPPY FLOP ×'+arg+'!':'FLIPPY FLOP!')+'  +'+CONFIG.flip.gems*arg+' ◆'); cheerT=1.4; break;
    case 'item': if(r.isPlayer && !twoP && !demo){ startFab(); addStar(r,CONFIG.star.item); } SFX.item(); toast(who+{shield:'BUBBLE SHIELD!',magnet:'GEM MAGNET!',super:'SUPER RAINBOW!'}[arg]); cheerT=1.2; break;
    case 'combo': SFX.combo(arg.n); toast(who+'COMBO ×'+arg.n+'  +'+arg.bonus+' ◆'); cheerT=1.6; break;
  }
}

function crash(r,respawnX){
  if(r.ai || r.safe>0 || r.state==='tumble') return;
  if(r.superT>0||r.turboT>0||r.starT>0){ if(!(r.smashCD>0)){ r.smashCD=.25; emit('smash',r); } return; }
  if(r.shield){ r.shield=false; r.safe=CONFIG.safeTime; emit('pop',r); return; }
  r.combo=0;
  if(save.noLose && r.isPlayer){ r.state='air'; r.cloud=null; r.vz=CONFIG.shroomBounce; r.airT=0; r.jumped=true; r.jumpsLeft=r.P.airJumps||0; r.safe=.9; emit('giggle',r); return; }
  r.flipT=0; r.flipA=0; r.flips=0;
  r.state='tumble'; r.cloud=null; r.dive=false; r.tumble=CONFIG.tumbleTime; r.vz=110; r.spin=0; r.respawnX=respawnX; r.vx*=.5; emit('crash',r);
}
function land(r,g){
  const dive=r.dive, hard=r.vz<-380 && !dive && !WR.bounce, ls=slopeAt(r.x), vin=r.vz;
  flipReward(r);
  r.dive=false; r.alt=g; r.state='ground'; r.cloud=null; r.angle=Math.atan(ls);
  if(hard) r.vx*=.93;
  if(dive && ls<-0.06){ r.vx+=CONFIG.dive.boost+(-ls)*60; r.rainbow=Math.max(r.rainbow,1.2); emit('slam',r); addStar(r,CONFIG.star.dive); }
  else if(dive){ emit('thud',r); if(ls>0.3) r.vx*=.85; }
  else if(ls<-0.15 && r.airT>.25){ r.vx+=CONFIG.smoothLanding; if(r.isPlayer) emit('smooth',r); addStar(r,CONFIG.star.smooth); }
  else if(ls>0.3) r.vx*=.85;
  r.vz=slopeAt(r.x)*r.vx; r.glide=r.P.glideTime||0; r.gliding=false; r.hover=r.P.hoverTime||0; r.hovering=false; r.slowmoUsed=false;
  if(WR.sticky && !dive){ r.vx*=1-WR.sticky; burst(r.x,ry(r)-2,['#ff7fc1','#ffc0e0','#ffffff'],5,30,0); }
  if(r.isPlayer && r.combo>=2){ const bonus=CONFIG.combo(r.combo); r.gems+=bonus; addStar(r,CONFIG.star.combo*r.combo); r.bestCombo=Math.max(r.bestCombo,r.combo); emit('combo',r,{n:r.combo,bonus}); burst(r.x,ry(r)-14,RAINBOW,20,90,0); }
  r.combo=0;
  emit(hard?'hardland':'land',r);
  // Mushroom Grove: everything bounces (dive to stick the landing)
  if(WR.bounce && !dive && vin<-150 && r.state==='ground'){ r.state='air'; r.alt=g+.2; r.vz=-vin*WR.bounce; r.airT=0; r.jumped=true; r.jumpsLeft=r.P.airJumps||0; emit('bounce',r); }
}
function goAir(r,nx,alt,vz,jumped){
  r.chargeT=0; r.state='air'; r.cloud=null; r.dive=false; r.x=nx; r.alt=alt; r.vz=vz; r.airT=0; r.jumped=jumped; r.jumpsLeft=r.P.airJumps||0;
}

function stepRacer(r,inp,dt,live){
  const P=r.P;
  r.prevX=r.x; const prevAlt=r.alt;
  r.laneY += Math.sign(r.lane-r.laneY)*Math.min(Math.abs(r.lane-r.laneY), dt*9*WR.lane);
  if(r.smashCD>0) r.smashCD-=dt; if(r.swimCD>0) r.swimCD-=dt;
  if(r.starT>0){ r.starT-=dt; r.rainbow=Math.max(r.rainbow,.25);
    if(Math.random()<.9) particles.push({x:r.x-12+Math.random()*8,y:ry(r)-6-Math.random()*18,vx:-50-Math.random()*50,vy:-15+Math.random()*30,life:.5,c:['#ffd76a','#fff4a8','#ffffff','#ffb347'][(Math.random()*4)|0],shape:'star',g:0}); }
  if(r.flipT>0 && r.state==='air'){ const st=Math.min(dt,r.flipT); r.flipA=(r.flipA||0)+Math.PI*2*st/CONFIG.flip.time; r.flipT-=st; if(r.flipT<=0){ r.flips=(r.flips||0)+1; r.flipA=0; if(r.isPlayer&&!demo) SFX.smooth(); } }
  if(r.safe>0) r.safe-=dt;
  if(r.jumpBuf>0) r.jumpBuf-=dt;
  if(r.magnetT>0) r.magnetT-=dt;
  if(r.superT>0){ r.superT-=dt; r.rainbow=Math.max(r.rainbow,.25); }
  if(r.powerCD>0) r.powerCD-=dt;
  if(r.turboT>0){ r.turboT-=dt; r.rainbow=Math.max(r.rainbow,.25);
    if(Math.random()<.8) particles.push({x:r.x-14+Math.random()*6,y:ry(r)-8-Math.random()*14,vx:-60-Math.random()*40,vy:-10-Math.random()*20,life:.4,c:['#ff4f1a','#ffa53a','#ffe066'][(Math.random()*3)|0],sz:2,g:-20}); }
  if(r.phaseT>0){ stepPhase(r,dt); return; }

  if(r.state==='tumble'){
    r.tumble-=dt; r.spin+=dt*13;
    r.vx=Math.max(0,r.vx-260*dt); r.x+=r.vx*dt;
    const g=heightAt(r.x); r.vz-=P.gravity*dt; r.alt+=r.vz*dt;
    if(r.alt<=g){ r.alt=g; r.vz=Math.abs(r.vz)*.35; if(r.vz<30) r.vz=0; }
    if(r.tumble<=0){
      if(r.respawnX>r.x) r.x=r.respawnX;
      r.state='ground'; r.spin=0; r.alt=heightAt(r.x); r.vz=0; r.angle=Math.atan(slopeAt(r.x)); r.safe=CONFIG.safeTime;
    }
    return;
  }
  if(r.state==='ground'){
    const c=r.cloud, swim=!!P.swim;
    const inGoo=!c && gooAt(r.x,r.lane);
    let maxV=0;
    if(live && inp.gallop) maxV=P.top*WR.top*r.mult*(r.starT>0?CONFIG.star.speed:1)*(r.superT>0?CONFIG.items.superSpeed:1)*(r.turboT>0?CONFIG.powers.fireSpeed:1)*(inGoo&&swim?1.08:1);
    if(inGoo && !swim && r.superT<=0 && r.turboT<=0 && !(r.starT>0)) maxV=Math.min(maxV,CONFIG.gooSpeed);
    const s=c?0:slopeAt(r.x);
    // uphill: slow toward a hiking crawl; downhill: push past top speed (momentum carries over the next crest)
    // Mountain King: press jump on an uphill to charge up it; keep holding to keep charging
    if(P.charge && live && !c && r.jumpBuf>0 && s>0.1){ r.jumpBuf=0; if(r.chargeT<=0) emit('charge',r); r.chargeT=CONFIG.powers.chargeTime; }
    if(r.chargeT>0){ r.chargeT-=dt; if(s>0.06 && inp.jump) r.chargeT=Math.max(r.chargeT,.15); r.rainbow=Math.max(r.rainbow,.2);
      if(Math.random()<.5) particles.push({x:r.x-8,y:ry(r)-1,vx:-40-Math.random()*40,vy:-20-Math.random()*20,life:.35,c:'#c8b8a0',sz:2}); }
    let target=maxV;
    if(r.chargeT>0) target=Math.max(maxV,P.top*CONFIG.powers.chargeSpeed);
    else if(s>0.02 && r.turboT<=0 && !(r.starT>0)) target=maxV*clamp(1-s*(P.uphillDrag??CONFIG.uphillDrag), P.uphillMin??CONFIG.uphillMin, 1);
    if(r.vx<target) r.vx=Math.min(target, r.vx+P.accel*WR.accel*(r.starT>0?2.5:1)*(r.chargeT>0?4:r.superT>0||r.turboT>0?1.8:1)*dt);
    else { const drag = inGoo&&!swim ? 420 : s>0.02 ? Math.max(80,CONFIG.uphillBrake*s*(P.uphillDrag?P.uphillDrag/CONFIG.uphillDrag:1)) : maxV>0 ? CONFIG.coastDrag : 110; r.vx=Math.max(target, r.vx-drag*WR.coast*dt); }
    if(s<-0.02) r.vx += -s*CONFIG.downhillPush*dt;
    r.vx=Math.min(r.vx, P.top*WR.top*CONFIG.speedCap*(r.superT>0?1.15:1)*(r.starT>0?1.3:1));
    // pegasus wing hop: during a speed burst (dive boost, boost pad, turbo) her wings lift her over what's ahead
    if(P.wingHop && r.isPlayer && !r.ai && live && r.jumpBuf<=0 && (r.rainbow>0 || r.vx>P.top*1.35)){
      const near=r.vx*.16+6; let hit=false;
      for(const h of hurdles) if(h.lanes.includes(r.lane) && h.x>r.x && h.x-r.x<near){ hit=true; break; }
      if(!hit) for(const b of brambles) if(b.lanes.includes(r.lane) && b.x>r.x && b.x-r.x<near){ hit=true; break; }
      if(hit){ r.jumpBuf=.05; emit('winghop',r); }
    }
    const nx=r.x+r.vx*dt;
    if(c){
      if(live && r.jumpBuf>0){ r.jumpBuf=0; goAir(r,nx,r.alt+.1,P.jump*WR.jump,true); emit('jump',r); }
      else if(nx>c.x+c.len){ goAir(r,nx,r.alt,0,false); }
      else { r.x=nx; r.vz=0; r.angle*=.8; }
    } else {
      const ng=heightAt(nx), ball=r.alt+r.vz*dt-0.5*P.gravity*WR.grav*dt*dt;
      let sh=null;
      for(const m of shrooms) if(m.lane===r.lane && r.x<m.x && nx>=m.x){ sh=m; break; }
      if(live && r.jumpBuf>0){
        r.jumpBuf=0; const splash=inGoo&&swim;
        goAir(r,nx,ng+.1,(Math.max(r.vz,0)+P.jump*WR.jump)*(splash?1.3:1),true); emit(splash?'splash':'jump',r);
      } else if(sh){ sh.squish=.3; goAir(r,nx,ng+.1,CONFIG.shroomBounce,true); emit('bounce',r); }
      else if(ng<ball-0.06 && r.vx>20){ goAir(r,nx,ball,r.vz,false); }
      else { r.vz=(ng-r.alt)/dt; r.alt=ng; r.x=nx; r.angle+=(Math.atan(s)-r.angle)*Math.min(1,dt*20); }
    }
    r.stride+=r.vx*dt/7;
    r.dustT-=dt;
    if(r.state==='ground' && r.vx>50 && r.dustT<=0){
      r.dustT=.07;
      const cols = inGoo ? (swim?['#8fe8f0','#ffffff']:['#9a5bd6']) : c ? ['#ffffff','#ece2ff'] : ['#fff6fb','#ffc2e0','#d9f7e9'];
      particles.push({x:r.x-6,y:ry(r)-1,vx:-20-Math.random()*30,vy:-15-Math.random()*20,life:.35,c:cols[(Math.random()*cols.length)|0],sz:1});
    }
  } else {
    r.airT+=dt;
    if(r.jumpBuf>0){
      if(!r.jumped && r.airT<CONFIG.coyoteTime){ r.jumpBuf=0; r.jumped=true; r.vz=Math.max(r.vz,0)+P.jump*WR.jump; emit('jump',r); }
      else if(r.jumpsLeft>0){ r.jumpBuf=0; r.jumpsLeft--; r.vz=P.jump2*WR.jump; emit('double',r); }
      else if(WR.swim && !(r.swimCD>0)){ r.jumpBuf=0; r.swimCD=.22; r.vz=Math.max(r.vz,0)*.4+P.jump*.5; emit('splash',r); }   // Splash Lagoon: paddle up
    }
    if(!r.ai){
      if(inp.slow) r.vx=Math.max(P.top*.45, r.vx-CONFIG.airSlow*dt);
      else if(inp.push && r.vx<P.top*1.1) r.vx=Math.min(P.top*1.1, r.vx+CONFIG.airPush*dt);
    }
    r.vz-=P.gravity*WR.grav*dt;
    r.gliding=false; const wasHover=r.hovering; r.hovering=false;
    if(r.dive){ r.vz=Math.min(r.vz-1600*dt,-CONFIG.dive.speed*.6); if(r.vz<-CONFIG.dive.speed) r.vz=-CONFIG.dive.speed;
      if(Math.random()<.7) particles.push({x:r.x-4+Math.random()*8,y:ry(r)-24-Math.random()*10,vx:0,vy:-40,life:.18,c:'#ffffff',shape:'streak',g:0}); }
    else if(P.hoverTime && inp.jump && r.hover>0 && r.vz<60){
      // Boney's ghost hover: float in place while jump is held, until the meter runs out or you press down
      r.hovering=true; r.hover-=dt; r.vz=Math.sin(t*5)*12; r.jumpsLeft=0;
      if(!wasHover && r.isPlayer && !demo) SFX.ghost();
      if(Math.random()<.35) particles.push({x:r.x-10+Math.random()*20,y:ry(r)-6-Math.random()*20,vx:-10-Math.random()*10,vy:-8-Math.random()*8,life:.6,c:Math.random()<.5?'#9affb0':'#e8fff0',sz:1,g:0}); }
    else if(inp.jump && r.glide>0 && r.vz<0 && P.glideTime){ r.glide-=dt; r.gliding=true; if(r.vz<-P.glideFall) r.vz=-P.glideFall; }
    r.vx=Math.max(0, r.vx-4*dt);
    r.x+=r.vx*dt; r.alt+=r.vz*dt;
    r.angle=clamp(Math.atan2(r.vz,Math.max(r.vx,40))*.6,-.7,.7);
    for(const c of clouds){ if(r.vz<=0 && prevAlt>=c.h-.5 && r.alt<=c.h && r.x>=c.x && r.x<=c.x+c.len){
      flipReward(r); r.dive=false; r.alt=c.h; r.state='ground'; r.cloud=c; r.vz=0; r.angle=0; r.glide=P.glideTime||0; r.gliding=false; r.hover=P.hoverTime||0; r.hovering=false; r.slowmoUsed=false; emit('cloud',r); break; } }
    if(r.state==='air'){ const g=heightAt(r.x); if(r.alt<=g) land(r,g); }
    if(r.isPlayer && !r.ai && !twoP && !r.slowmoUsed && r.state==='air' && r.alt-heightAt(r.x)>CONFIG.slowmo.height && Math.abs(r.vz)<70){
      r.slowmoUsed=true; slowT=CONFIG.slowmo.time; cheerT=Math.max(cheerT,1); }
  }
  // skeleton horses: touching one trips you, jumping over one counts toward your combo
  if(r.isPlayer && live && !demo) for(const k of racers){ if(!k.skeleton || r.P.ghostFriend || Math.abs(k.laneY-r.laneY)>=.5) continue;
    if(Math.abs(k.x-r.x)<CONFIG.skeletonHit && Math.abs(k.alt-r.alt)<12 && r.state!=='tumble'){ if(r.safe<=0){ crash(r,r.x); emit('rattle',k); } }
    else if(r.state==='air' && r.prevX<k.prevX && r.x>=k.x){ r.combo++; emit('clear',r); }
  }
  // hazards
  for(const h of hurdles) if(h.lanes.includes(r.lane) && r.prevX<h.x && r.x>=h.x){
    if(r.alt-heightAt(h.x)<CONFIG.hurdleHeight){ crash(r,h.x+10); break; }
    if(r.state==='air' && r.isPlayer){ r.combo++; emit('clear',r); }
  }
  if(r.state==='ground' && !r.cloud){ const b=brambleAt(r.x,r.lane); if(b) crash(r,b.x+b.len+6); }
  if(r.isPlayer && r.state==='air') for(const b of brambles){ const e=b.x+b.len; if(b.lanes.includes(r.lane) && r.prevX<e && r.x>=e){ r.combo++; emit('clear',r); } }
  if(r.isPlayer){
    for(const p of pads) if(p.lane===r.lane && r.prevX<p.x && r.x>=p.x && r.state==='ground' && !r.cloud){ r.vx=Math.max(r.vx,Math.min(r.vx+CONFIG.boost,P.top*1.6)); emit('boost',r); }
    collect(r,dt);
  }
}

function collect(r,dt){
  const cy=r.alt+10;
  if(r.gemT>0) r.gemT-=dt; else r.gemN=0;
  for(const g of gems){
    if(g.taken) continue;
    const dx=g.x-r.x;
    if(dx<-40 || dx>CONFIG.items.magnetRange+10) continue;
    if(r.magnetT>0 && !g.pull && Math.abs(dx)<CONFIG.items.magnetRange && Math.abs(g.alt-cy)<60) g.pull=r;
    const near = g.pull===r ? (Math.abs(dx)<7 && Math.abs(g.alt-cy)<10) : (Math.abs(g.ly-r.laneY)<.55 && Math.abs(dx)<8 && Math.abs(g.alt-cy)<12);
    if(near){ g.taken=true; r.gems+=g.v; r.gemN++; r.gemT=.7; addStar(r,g.big?CONFIG.star.bigGem:CONFIG.star.gem);
      if(r.isPlayer && !demo) SFX.gem(r.gemN);
      for(let i=0;i<5;i++) particles.push({x:g.x,y:laneY(g.ly)-g.alt,vx:(Math.random()-.5)*60,vy:-20-Math.random()*40,life:.4,c:g.big?'#ffd76a':['#ffffff','#ffb3d6','#a6f2d6'][i%3],sz:1,star:i%2===0});
      if(g.big) cheerT=Math.max(cheerT,.8); }
  }
  for(const o of orbs){
    if(o.taken) continue; const dx=o.x-r.x;
    if(Math.abs(dx)<9 && Math.abs(o.ly-r.laneY)<.55 && Math.abs(o.alt-cy)<14){
      o.taken=true;
      if(o.type==='shield') r.shield=true;
      else if(o.type==='magnet') r.magnetT=CONFIG.items.magnetTime;
      else { r.superT=CONFIG.items.superTime; r.rainbow=Math.max(r.rainbow,CONFIG.items.superTime); }
      emit('item',r,o.type);
    }
  }
}

function aiInput(r){
  if(r.skeleton){ r.wanderT-=1/120; if(r.wanderT<=0){ r.wanderT=2+Math.random()*2.5; r.prefLane=clamp(r.lane+(Math.random()<.5?-1:1),0,2); r.lane=r.prefLane; } }
  r.laneT-=1/120;
  if(r.laneT<=0){ r.laneT=.12;
    const ahead=l=>{ for(let d=20;d<=170;d+=15) if(gooAt(r.x+d,l)) return true; return false; };
    if(!r.P.swim && ahead(r.lane)){ for(const l of [r.lane-1,r.lane+1,r.lane-2,r.lane+2]) if(l>=0&&l<=2&&!ahead(l)){ r.lane=l; break; } }
    else if(r.lane!==r.prefLane && !ahead(r.prefLane) && !gooAt(r.x,r.prefLane)) r.lane=r.prefLane;
  }
  if(r.state==='ground' && !r.cloud){
    const near=r.vx*.13+4;
    for(const h of hurdles) if(h.lanes.includes(r.lane) && h.x>r.x && h.x-r.x<near){ r.jumpBuf=.05; break; }
    for(const b of brambles) if(b.lanes.includes(r.lane) && b.x>r.x && b.x-r.x<near){ r.jumpBuf=.05; break; }
  }
  return {gallop:true,jump:false,slow:false,push:false};
}

/* ---------------- Ghost: replay of your best run ---------------- */
function loadGhost(kind,L){
  const s=store.get('ghost2.'+kind+'.'+L,null); if(!s) return null;
  const a=s.split(',').map(Number); if(a.length<8) return null;
  const eq=equipOf(kind);
  return {data:a, n:a.length/4, spr:ponySet(kind,eq.mane), x:START_X, laneY:1, alt:0, st:0, stride:0};
}
function stepGhost(){
  if(!ghost) return;
  const f=raceT/0.05, i=Math.min(ghost.n-2,Math.floor(f)), k=Math.min(1,f-i), d=ghost.data, j=i*4, j2=j+4;
  if(i<0) return;
  ghost.x=d[j]+(d[j2]-d[j])*k; ghost.laneY=(d[j+1]+(d[j2+1]-d[j+1])*k)/100; ghost.alt=d[j+2]+(d[j2+2]-d[j+2])*k; ghost.st=d[j+3]; ghost.stride=ghost.x/7;
}

/* ---------------- Update ---------------- */
const STEP=1/120;
function update(dt){
  t+=dt;
  if(cheerT>0) cheerT-=dt; if(gaspT>0) gaspT-=dt;
  if(mode==='cutscene'){ updateCutscene(dt); stepParticles(dt); return; }
  if(mode==='dance'){ updateDance(dt); stepParticles(dt); return; }
  if(mode==='paused'||mode==='photo'||mode==='shop'){ stepParticles(dt); return; }
  if(mode==='countdown'){
    countdown-=dt; const n=Math.ceil(countdown);
    if(n!==lastCount){ lastCount=n; if(n>0){ countEl.textContent=n; SFX.beep(); } }
    if(countdown<=0){ mode='race'; countEl.textContent=''; toast('GO!'); SFX.go(); if(!muted) Music.start(level); }
  }
  const live = demo || mode==='race' || mode==='finish';
  if(!demo && mode==='race'){
    raceT+=dt;
    const sw=controlsSwapped()?-1:1;
    for(const p of players){ const I=INP[p.idx]; if(I.stap){ I.stap=false; if(!twoP) useStar(p); }
      if(I.tap && p.state==='air' && raceT-(p.lastTap??-9)<CONFIG.flip.window) startFlip(p); if(I.tap) p.lastTap=raceT;
      while(I.lanes.length){ const v=I.lanes.shift()*sw; if(v>0 && p.state==='air' && !p.dive){ p.dive=true; p.gliding=false; if(p.vz>0) p.vz=0; SFX.dive(); } else if(!(v>0 && p.state==='air')) p.lane=clamp(p.lane+v,0,2); } if(I.tap){ p.jumpBuf=CONFIG.jumpBuffer; I.tap=false; } if(I.ptap){ usePower(p); I.ptap=false; } }
  } else for(const I of INP){ I.lanes.length=0; I.tap=false; I.stap=false; }
  // Rainbow Road: every so often the world flips around (and so do up/down)
  if(!demo && !twoP && WR.flipEvery && mode==='race'){ rbClock+=dt; const cyc=WR.flipEvery+WR.flipTime, ph=rbClock%cyc;
    if(ph>WR.flipEvery-1.3 && ph<WR.flipEvery && !rbWarned){ rbWarned=true; SFX.warn(); toast(WR.invert?'MIRROR FLIP!':'RAINBOW FLIP!'); } if(ph<1) rbWarned=false;
    flipTarget=ph>WR.flipEvery?-1:1; }
  else flipTarget=(!demo && !twoP && WR.backwards && mode!=='title')?-1:1;
  flipV+=clamp(flipTarget-flipV,-dt*5,dt*5);
  { const inv=!!(WR.invert && flipTarget<0 && !demo); if(inv!==invOn){ invOn=inv; cv.classList.toggle('inv',inv); if(inv){ shake=Math.max(shake,2); SFX.ghost(); } } }
  if(spiders.length && live) stepSpiders(dt);
  const [lo,hi]=CONFIG.rubberBand, lead=Math.max(...players.map(p=>p.x));
  for(const r of racers){
    if(!r.isPlayer) r.mult = demo?1:clamp(1+(lead-r.x)/1800,lo,r.boss?hi+.04:hi);
    let inp;
    if(r.isPlayer && !demo){ const I=INP[r.idx];
      inp = (mode==='finish'||r.finishT!==null) ? NO_INPUT : {gallop:true, jump:I.jump, slow:false, push:false}; }
    else inp = aiInput(r);
    if(live) stepRacer(r,inp,dt,live);
    if(!demo && r.finishT===null && r.x>=FINISH_X){ r.finishT=raceT;
      if(r.isPlayer){ SFX.finish(); toast(twoP? r.name+' FINISHED!' : 'FINISH!'); cheerT=2; if(firstFinish===null) firstFinish=raceT; } }
  }
  if(!demo && mode==='race'){
    const all=players.every(p=>p.finishT!==null);
    if(all || (twoP && firstFinish!==null && raceT-firstFinish>6)){ mode='finish'; finishTimer=1.8; Music.stop(); }
  }
  if(freeMode && !demo && mode==='race') freeTick(dt);
  if(!demo && !twoP && !freeMode && mode==='race'){ recT-=dt; if(recT<=0){ recT+=.05; const p=players[0]; rec.push(Math.round(p.x),Math.round(p.laneY*100),Math.round(p.alt),p.state==='air'?1:p.state==='tumble'?2:0); } }
  if(ghost && (mode==='race'||mode==='finish')) stepGhost();
  if(demo && players[0].x>FINISH_X+260) setupRace(true);
  if(mode==='finish'){ finishTimer-=dt; if(finishTimer<=0) endRace(); }
  // magnet pulls
  for(const g of gems) if(g.pull && !g.taken){ const r=g.pull, k=Math.min(1,dt*9); g.x+=(r.x-g.x)*k; g.alt+=(r.alt+10-g.alt)*k; g.ly+=(r.laneY-g.ly)*k; }
  // rainbow trail + pixie dust when going fast
  for(const r of racers){
    if(!(r.isPlayer||r.boss)) continue;
    if(r.rainbow>0 && r.rainbow<900) r.rainbow-=dt;
    r.trailT-=dt;
    if(r.trailT<=0){ r.trailT=1/60;
      const going=r.state!=='tumble' && (live||mode==='results'), fast=going && (r.rainbow>0 || r.vx>r.P.top*1.03 || (r.P.alwaysTrail && r.vx>20));
      if(fast) r.trail.push({x:r.x-13,y:ry(r)-16+Math.sin(t*14)*1.2}); else if(r.trail.length) r.trail.shift();
      const maxLen=r.P.alwaysTrail && !(r.rainbow>0 || r.vx>r.P.top*1.03) ? 18 : 48;
      while(r.trail.length>maxLen) r.trail.shift();
      const TS=TRAILS[r.trailStyle]||TRAILS.rainbow;
      if(going && r.vx>r.P.top*.85 && Math.random()<(fast?.9:.3))
        particles.push({x:r.x-14+Math.random()*4,y:ry(r)-15+Math.random()*7,vx:-20-Math.random()*30,vy:TS.fire?-25-Math.random()*30:-12+Math.random()*14,life:.5+Math.random()*.5,c:TS.pc[(Math.random()*TS.pc.length)|0],sz:1,shape:TS.p,g:TS.fire?-15:0});
    }
  }
  // fabulous mode countdown + glitter around your horse
  if(fabT>0){ fabT-=dt; fabIn=Math.min(1,fabIn+dt*3); const p=players[0];
    if(Math.random()<.7*fabI()) particles.push({x:p.x-20+Math.random()*40,y:ry(p)-10-Math.random()*30,vx:-30-Math.random()*40,vy:-10-Math.random()*25,life:.7,c:`hsl(${(t*200+Math.random()*90)%360},95%,75%)`,shape:Math.random()<.4?'heart':'star',g:-10});
    if(fabT<=0){ fabT=0; SFX.unfab(); Music.fab(false); } }
  // zoom: pull back on big air and in bullet time so the landing (and the ramp) stays in view
  { let zt=1; const p0=players[0];
    if(!twoP && !demo && (mode==='race'||mode==='finish')){
      if(freeMode) zt=Math.min(zt,fr.herdZoom||1);
      const Z=CONFIG.zoom, gh=heightAt(p0.x);
      // high up on a mountain: pull way back so you can see the valley and the cloud routes
      if(gh>Z.peakStart) zt=Math.min(zt,1-clamp((gh-Z.peakStart)/Z.peakRange,0,1)*(1-Z.peakMin));
      // in the air (or hopping clouds): the higher above the ground, the further out. Float like a cloud, swoop like a hawk
      if(p0.state==='air'||p0.state==='phase'||p0.cloud){ const hg=p0.alt-gh; zt=Math.min(zt,1-clamp((hg-Z.airStart)/Z.airRange,0,1)*(1-Z.airMin)); }
      // grinding up a hill: lean in close
      else if(p0.state==='ground' && gh<=Z.peakStart && slopeAt(p0.x)>.12 && !freeMode) zt=Z.uphill;
      if(slowT>0) zt=Math.min(zt,Z.slowmo);
    }
    viewZoom+=(zt-viewZoom)*Math.min(1,dt*(zt<viewZoom?CONFIG.zoom.outSpeed:CONFIG.zoom.inSpeed)); }
  // cameras
  const views = (twoP && !demo) ? players : [players[0]];
  views.forEach((p,i)=>{ const c=cams[i], lead=clamp((p.vx-p.P.top)*.35,0,60);
    const z=(!twoP&&!demo)?viewZoom:1;
    c.x+=(p.x-100/z+lead-c.x)*Math.min(1,dt*8);
    const headY=ry(p)-30;
    if(z<.97){
      // zoomed out: frame the horse AND the ground under her, so kids can see where they'll come down
      const h=(twoP?180:VH)/z, extra=h-180; let gl=heightAt(p.x+p.vx*.4); for(let k=1;k<=8;k++) gl=Math.min(gl,heightAt(p.x+k*45/z)); const gY=laneY(p.laneY)-gl;
      const want=Math.max(0,Math.max(h-30-gY,24-headY)-extra);
      c.y+=(want-c.y)*Math.min(1,dt*5);
      if(headY+c.y+extra<8) c.y=8-headY-extra;
    } else {
      c.y+=(Math.max(0,36-headY)-c.y)*Math.min(1,dt*7);
      const feetS=ry(p)+c.y; if(feetS>180/z-16) c.y=180/z-16-ry(p); if(headY+c.y<14) c.y=Math.max(0,14-headY);
    } });
  // turbo: speed lines and a shout when a downhill gets you going really fast
  for(const p of players){
    if(p.vx>p.P.top*1.4 && p.state!=='tumble' && Math.random()<.6) particles.push({x:p.x+Math.random()*220-30,y:ry(p)-44+Math.random()*56,vx:-p.vx*.7,vy:0,life:.22,c:'#ffffff',shape:'streak',g:0});
    if(p.vx>p.P.top*1.65 && !p.turboOn){ p.turboOn=true; p.rainbow=Math.max(p.rainbow,1); if(!demo && mode==='race'){ SFX.turbo(); toast((twoP?p.name+' ':'')+'TURBO!'); } }
    else if(p.vx<p.P.top*1.25) p.turboOn=false;
  }
  stepParticles(dt);
  for(const s of shrooms) if(s.squish>0) s.squish-=dt;
}
function endRace(){
  if(!twoP && isBoss(level) && standings()[0]===players[0]) startCutscene(); else showResults();
}
function stepParticles(dt){
  for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.life-=dt; if(p.life<=0){ particles.splice(i,1); continue; } p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=(p.g??120)*dt; }
}
