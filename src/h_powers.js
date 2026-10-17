
/* ---------------- Boss horse powers ---------------- */
// Dragon Pony: Fire Turbo (POWER button). Moon Queen: Moon Phase (POWER button). Mountain King: Hill Charge (JUMP on an uphill).
function usePower(r){
  const P=r.P, W_=CONFIG.powers;
  if(!P.power || r.state==='tumble') return;
  if(r.powerCD>0){ if(r.isPlayer && !demo) SFX.nope(); return; }
  if(P.power==='fire'){ r.turboT=W_.fireTime; r.powerCD=W_.fireCooldown; r.rainbow=Math.max(r.rainbow,W_.fireTime); emit('fire',r); }
  else if(P.power==='moon'){ r.phaseT=W_.phaseTime; r.phaseTotal=0; r.phaseAlt=r.alt; r.vx=Math.max(r.vx,P.top); r.powerCD=W_.phaseCooldown;
    r.dive=false; r.cloud=null; r.gliding=false; emit('moon',r); }
}
// Moon Phase: glide straight ahead at the same height, right through any hill, until she's back in open air
function stepPhase(r,dt){
  const P=r.P;
  r.phaseT-=dt; r.phaseTotal+=dt;
  r.vx+=(P.top*1.2-r.vx)*Math.min(1,dt*3); r.x+=r.vx*dt; r.alt=r.phaseAlt; r.angle=0; r.state='phase'; r.stride+=r.vx*dt/7;
  collect(r,dt);
  if(Math.random()<.6) particles.push({x:r.x-10+Math.random()*16,y:ry(r)-6-Math.random()*20,vx:-30-Math.random()*20,vy:(Math.random()-.5)*10,life:.5,c:['#cfe0ff','#ffffff','#fff4a8'][(Math.random()*3)|0],shape:'star',g:0});
  const g=heightAt(r.x);
  if(r.phaseT<=0){
    if(r.alt>=g-1 || r.phaseTotal>5){
      r.phaseT=0;
      if(r.alt<=g+2){ r.alt=g; r.state='ground'; r.vz=0; r.angle=Math.atan(slopeAt(r.x)); }
      else { r.state='air'; r.vz=0; r.airT=0; r.jumped=true; r.jumpsLeft=0; }
      r.safe=Math.max(r.safe,.4);
    } else r.phaseT=0.0001;   // still inside the hill: keep phasing until she pops out the other side
  }
}
