
/* ---------------- Boss cutscene: you and the boss become friends with a big high five ---------------- */
const FLOWER_C=['#ff6fae','#ffd76a','#7fe3bd','#c9b3ff','#ff9a5c','#ffffff'];
const CS_GROUND=152;
const cs={t:0,boss:'queen',p:null,fiveAt:1.45,fived:false,px:0,bx:0};
function startCutscene(){
  Object.assign(cs,{t:0,boss:bossKind(level),p:players[0],fived:false});
  mode='cutscene'; hud.hidden=true; hud2.hidden=true; particles.length=0; countEl.textContent='';
  SFX.fanfare(); setTimeout(()=>{ if(mode==='cutscene' && !muted) Music.start(1,'happy'); },900);
}
function cutsceneTap(){ if(mode==='cutscene' && cs.t>2.4){ Music.stop(); particles.length=0; showResults(); } }
function updateCutscene(dt){
  cs.t+=dt; cheerT=Math.max(cheerT,.3);
  if(!cs.fived && cs.t>=cs.fiveAt){ cs.fived=true; SFX.highfive(); shake=2;
    for(let i=0;i<46;i++){ const a=Math.random()*Math.PI*2, sp=40+Math.random()*100;
      particles.push({x:160,y:CS_GROUND-50,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-40,life:1.3+Math.random(),c:FLOWER_C[i%FLOWER_C.length],shape:i%2?'flower':'bigheart',g:70}); } }
  if(cs.t>cs.fiveAt+.2){
    if(Math.random()<.55) particles.push({x:Math.random()*W,y:-6,vx:(Math.random()-.5)*14,vy:20+Math.random()*25,life:8,c:FLOWER_C[(Math.random()*FLOWER_C.length)|0],shape:Math.random()<.55?'flower':'heart',g:0});
    if(Math.random()<.1) particles.push({x:(Math.random()<.5?cs.px:cs.bx)+(Math.random()-.5)*10,y:CS_GROUND-70,vx:(Math.random()-.5)*10,vy:-22,life:1.6,c:'#ff5fa8',shape:'bigheart',g:0});
  }
  if(cs.t>9) cutsceneTap();
}
function drawBig(spr,x,feet,ang,dir,hat){
  ctx.save(); ctx.translate(Math.round(x),Math.round(feet)); ctx.scale(2*dir,2); ctx.rotate(-ang);
  ctx.drawImage(spr,-18,-31);
  if(hat && HATS[hat]){ const h=HATS[hat]; ctx.drawImage(h.spr,-18+h.dx-1,-31+h.dy-1); }
  ctx.restore();
}
function renderCutscene(){
  const sx0=shake>0?Math.round((Math.random()*2-1)*shake):0;
  ctx.save(); ctx.translate(sx0,0);
  renderBackground(2400,0);
  ctx.fillStyle=RIB.base; ctx.fillRect(0,BAND_TOP,W,BAND_BOT-BAND_TOP); ctx.fillStyle=RIB.edge; ctx.fillRect(0,BAND_TOP,W,1);
  for(let x=0;x<W;x+=3){ const h=hash(x*7); if(h%5===0){ ctx.fillStyle=h%2?TH.hedge[2]:'#fff6fb'; ctx.fillRect(x,BAND_TOP+3+(h%30),1,1); } }
  renderForeground(2400);
  const t0=cs.t, F=cs.fiveAt, ease=u=>u<0?0:u>1?1:1-(1-u)*(1-u), ap=ease(t0/1.1);
  const px=-50+(134+50)*ap, bx=W+50-(W+50-186)*ap;
  let alt=0, ang=0;
  if(t0>1.1 && t0<1.9){ const u=(t0-1.1)/.8; alt=Math.sin(u*Math.PI)*22; ang=.55*Math.sin(Math.min(1,u*1.5)*Math.PI/2)*(u<.75?1:(1-u)/.25); }
  const hopP=t0>2?Math.abs(Math.sin((t0-2)*5))*6:0, hopB=t0>2?Math.abs(Math.sin((t0-2)*5+1.5))*6:0;
  cs.px=px; cs.bx=bx;
  const PS=cs.p.spr, BS=ponySet(cs.boss), running=t0<1.1, fr=(t0*12|0)%4;
  drawBig(running?PS.run[fr]:(alt>0?PS.air:PS.run[1]), px, CS_GROUND-alt-hopP, ang, 1, cs.p.hat);
  drawBig(running?BS.run[fr]:(alt>0?BS.air:BS.run[1]), bx, CS_GROUND-alt-hopB, ang, -1, cs.boss==='queen'?'crown':null);
  for(const p of particles) drawParticle(p,0);
  if(cs.fived && t0<F+1.5) pixelText('HIGH FIVE!',160,50,'#ffd76a',16);
  if(t0>=F+1.5){ pixelText('BEST FRIENDS!',160,38,'#fff6fb',12); pixelText(cs.p.name+' & '+CONFIG.bosses[cs.boss].name.toUpperCase(),160,56,'#ffd76a',8); }
  if(t0>2.4 && ((t0*2)|0)%2) pixelText('TAP TO CONTINUE',160,174,'#fff6fb',8);
  ctx.restore();
}
