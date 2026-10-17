// difficulty: levels come in chapters of 3 races + a boss. 0 = gentle, 1 = toughest
function levelDifficulty(L){
  const D=CONFIG.difficulty, ch=Math.floor((L-1)/CONFIG.bossEvery), k=(L-1)%CONFIG.bossEvery;
  return Math.min(1, ch*D.perChapter + k*D.perLevel);
}
function levelSpeed(L){
  const LV=CONFIG.levels, ch=Math.floor((L-1)/CONFIG.bossEvery), k=(L-1)%CONFIG.bossEvery;
  return Math.min(LV.maxSpeed, 1 + ch*LV.speedPerChapter + k*LV.speedPerLevel);
}
function buildTrack(L){
  HT.fill(0); for(const a of [goos,pads,shrooms,hurdles,brambles,clouds,gems,orbs]) a.length=0;
  let seed=L*7919+17;
  const R=()=>{ seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff; return seed/0x7fffffff; };
  const ri=(a,b)=>a+Math.floor(R()*(b-a+1)), pick=a=>a[Math.floor(R()*a.length)];
  const d=levelDifficulty(L), boss=isBoss(L), style=levelStyle(L);
  trackStyle=style;
  const ob=CONFIG.difficulty.obstaclesMin+(1-CONFIG.difficulty.obstaclesMin)*d;   // chance each obstacle shows up
  const maybe=f=>{ if(R()<ob) f(); };
  const thornMax=Math.round(35+65*d);
  const some=()=>{ const n=R()<.15+.55*d?3:R()<.3+.4*d?2:1, l=[0,1,2]; while(l.length>n) l.splice(Math.floor(R()*l.length),1); return l; };
  const notAll=()=>{ const l=[0,1,2]; l.splice(ri(0,2),1); if(R()<.65-.3*d) l.splice(ri(0,1),1); return l; };
  const gem=(x,lane,off,abs=false,big=false)=>gems.push({x:Math.round(x),ly:lane,off,abs,v:big?5:1,big,c:hash(Math.round(x)+lane)%3});
  const orb=(x,lane,off,abs=false)=>{ const r=R(); orbs.push({x:Math.round(x),ly:lane,off,abs,type:r<.4?'shield':r<.72?'magnet':'super'}); };
  const autoClouds=[];
  FINISH_X=(style==='speedway'?8800:style==='mountains'?8400:6400)+Math.round(1500*d); TRACK_LEN=FINISH_X+600;
  let x=300; if(d>.25) fence(x,some()); gem(x,1,26); x+=150;
  let pats;
  if(style==='speedway') pats=['bigroll','bigroll','downramp','swerve','bigroll','kick','cloud','meadow'];
  else if(style==='mountains') pats=['peak','peak','ridge','ridge','moguls','kick','meadow'];
  else if(d<.25) pats=['rolls','rolls','kick','meadow','moguls','shroom','cloud','meadow'];   // gentle opening chapter
  else pats=['rolls','kick','kick','slalom','table','moguls','shroom','fences','kickGoo','cloud'];
  if(style==='spooky') pats.push('kickGoo','rolls');
  if(boss && style==='classic') pats.push('cloud','cloud');
  if(d>.6) pats=pats.filter(p=>p!=='meadow');
  let lastPat='';
  while(x<FINISH_X-560){
    let p=pick(pats); if(p===lastPat) p=pick(pats); lastPat=p;
    if(p==='meadow'){ const len=ri(240,360), gl=ri(0,2); for(let i=0;i<8;i++) gem(x+20+i*(len-40)/7,(gl+(i>3?1:0))%3,7);
      pads.push({x:x+len/2,lane:ri(0,2)}); if(R()<.4) orb(x+len*.7,ri(0,2),12); x+=len; }
    else if(p==='rolls'){ const w=ri(120,180),h=ri(14,30); roll(x,w,h); roll(x+w,w,h); gem(x+w/2,1,12); gem(x+w*1.5,1,12);
      if(R()<.2+.6*d){ const ls=some(); fence(x+w,ls); gem(x+w,ls[0],26); } x+=2*w; }
    else if(p==='kick'){ const w=ri(80,110),h=ri(26,44),dr=ri(60,90); kick(x,w,h,dr); const len=ri(30,thornMax), tx=x+w+dr+ri(-5,15), ls=R()<.2+.7*d?ALL:some();
      maybe(()=>thorns(tx,len,ls)); const gl=pick(ls); for(let i=0;i<5;i++) gem(tx-10+(len+20)*i/4,gl,26+16*Math.sin(Math.PI*i/4));
      if(R()<.3) gem(x+w+20,pick(ls),58,false,true);
      x+=w+dr+len+50; }
    else if(p==='kickGoo'){ const w=ri(90,110),h=ri(30,40),dr=ri(70,85); kick(x,w,h,dr); const gx=x+w+dr+5, gl=ri(100,160); maybe(()=>goos.push({x:gx,len:gl,lanes:R()<.5?ALL:some()}));
      for(let i=0;i<4;i++) gem(gx+gl*i/3,ri(0,2),20); x+=w+dr+190; if(R()<.5*ob) fence(x-20,some()); }
    else if(p==='slalom'){ const n=ri(2,3+Math.round(2*d)); let gx=x; for(let i=0;i<n;i++){ const ls=d>.4&&R()<.5?some():[ri(0,2)]; maybe(()=>fence(gx,ls)); gem(gx,ls[0],26); gx+=ri(60,80)-Math.round(14*d); } x=gx+40; }
    else if(p==='table'){ const r=ri(100,130),pl=ri(100,150),f=ri(110,140),h=ri(34,46); table(x,r,pl,f,h); const tl=Math.max(20,Math.min(pl-35,ri(30,thornMax)));
      maybe(()=>thorns(x+r+20,tl,d>.4?ALL:some())); const gl=ri(0,2); for(let i=0;i<4;i++) gem(x+r+10+(tl+20)*i/3,gl,24); x+=r+pl+f; }
    else if(p==='moguls'){ const n=ri(4,6),w=ri(55,65),h=ri(8,11); moguls(x,n,w,h); for(let k=1;k<n;k++){ if(R()<.15+.55*d){ const l=ri(0,2); fence(x+k*w,[l]); gem(x+k*w,l,26); } else gem(x+k*w-w/2,ri(0,2),14); } x+=n*w; }
    else if(p==='shroom'){ const l=ri(0,2); shrooms.push({x,lane:l}); maybe(()=>fence(x+ri(60,80),d>.3?ALL:[l])); gem(x+40,l,40); gem(x+70,l,52,false,true);
      if(R()<.2+.5*d) thorns(x+ri(95,110),ri(30,50),ALL); x+=190; }
    else if(p==='fences'){ fence(x,d>.5?ALL:some()); const g=ri(90,125)-Math.round(20*d); maybe(()=>fence(x+g,d>.5?ALL:some())); gem(x,1,26); gem(x+g,1,26);
      if(d>.4&&R()<.6){ fence(x+2*g,some()); } x+=2*g+60; }
    else if(p==='cloud'){ const w=ri(90,110),h=ri(36,44),dr=ri(70,90); kick(x,w,h,dr); const lip=x+w, cx0=lip+ri(30,50), cl=ri(150,220), ch=ri(56,64);
      clouds.push({x:cx0,len:cl,h:ch}); const ts=lip+dr+5; maybe(()=>thorns(ts,Math.max(40,cx0+cl-10-ts),ALL));
      const gl=ri(0,2); for(let i=0;i<5;i++) gem(cx0+20+(cl-40)*i/4,gl,ch+9,true);
      if(R()<.6) orb(cx0+cl*.5,(gl+1)%3,ch+10,true); else gem(cx0+cl*.5,(gl+1)%3,ch+11,true,true);
      x=cx0+cl+70; }
    // ---- speedway: long downhills to build big speed, then dodge at full tilt
    else if(p==='bigroll'){ const w=ri(340,480), h=ri(48,80); roll(x,w,h); const top=x+w/2, gl=ri(0,2);
      for(let i=0;i<7;i++) gem(top+20+i*26,gl,8);
      pads.push({x:Math.round(top+w*.12),lane:ri(0,2)});
      const after=x+w+ri(40,90), ls=notAll(); maybe(()=>fence(after,ls)); if(R()<.2+.6*d) fence(after+ri(110,160),notAll());
      for(let l=0;l<3;l++) if(!ls.includes(l)) gem(after,l,8);
      x+=w+170; }
    else if(p==='downramp'){ const hh=ri(60,85), xs=profile(x,[[ri(160,200),hh],[ri(80,130),hh],[ri(380,480),0]]); const end=xs[2];
      pads.push({x:Math.round(xs[1]+60),lane:0},{x:Math.round(xs[1]+60),lane:2},{x:Math.round(xs[1]+200),lane:1});
      const kw=ri(80,95), kh=ri(28,36), kd=ri(60,70); kick(end+10,kw,kh,kd);
      const tx=end+10+kw+kd+ri(0,20), tl=ri(60,90+Math.round(60*d)); maybe(()=>thorns(tx,tl,ALL));
      const gl=ri(0,2); for(let i=0;i<6;i++) gem(tx+tl*i/5,gl,30+24*Math.sin(Math.PI*i/5));
      if(R()<.5) orb(xs[0]+40,ri(0,2),14);
      x=tx+tl+90; }
    else if(p==='swerve'){ let sx=x; const n=ri(2+Math.round(2*d),4+Math.round(3*d));
      pads.push({x:sx-40,lane:ri(0,2)});
      for(let i=0;i<n;i++){ const ls=notAll(); fence(sx,ls); for(let l=0;l<3;l++) if(!ls.includes(l)) gem(sx,l,8); sx+=ri(130,170)-Math.round(30*d); }
      x=sx+60; }
    // ---- mountains: tall ridges with dips; slow hike up, wild ride down
    else if(p==='peak'){ const sc=.75+.35*d, h1=Math.round(ri(70,110)*sc), h2=Math.round(ri(150,230)*sc);
      const xs=profile(x,[[ri(170,230),h1],[ri(40,70),h1-ri(15,30)],[ri(150,210),h2],[ri(40,70),h2+ri(0,10)],[ri(150,220),ri(20,40)],[ri(70,100),0]]);
      const summit=xs[3]; for(let i=0;i<4;i++) gem(xs[2]+(summit-xs[2])*i/3,ri(0,2),10);
      gem(summit+40,1,48,false,true); if(R()<.6) orb(xs[0]+20,ri(0,2),14);
      autoClouds.push({x:summit+30,len:ri(120,170),lane:ri(0,2)});
      maybe(()=>thorns(xs[1]-30,60,R()<.3+.6*d?ALL:some()));
      const foot=xs[4]+ri(10,40); maybe(()=>thorns(foot,ri(30,thornMax),some()));
      x=xs[5]+60; }
    else if(p==='ridge'){ const sc=.75+.35*d, a=Math.round(ri(80,120)*sc), b=Math.round(ri(150,200)*sc), c=Math.round(ri(220,280)*sc);
      const xs=profile(x,[[ri(190,230),a],[ri(80,100),a-ri(30,45)],[ri(150,180),b],[ri(80,100),b-ri(35,50)],[ri(150,180),c],[ri(50,70),c+4],[ri(200,250),ri(30,50)],[ri(80,100),0]]);
      maybe(()=>thorns(xs[1]-25,50,ALL)); maybe(()=>thorns(xs[3]-25,50,ALL));
      for(const k of [0,2,4]) gem(xs[k],ri(0,2),40,false,k===4);
      for(let i=0;i<6;i++) gem(xs[5]+20+i*30,ri(0,2),18);
      autoClouds.push({x:xs[4]-60,len:ri(130,170),lane:ri(0,2)});
      if(R()<.5) orb(xs[2],ri(0,2),30);
      maybe(()=>fence(xs[6]+ri(30,60),some()));
      x=xs[7]+60; }
    const gapMin = style==='speedway'?160:70, gapMax = style==='speedway'?300:150;
    x+=ri(gapMin,gapMax)+Math.round(60*(1-d));
    if(R()<(style==='speedway'?.6:.4)) pads.push({x:x-35,lane:ri(0,2)});
    if(R()<.5){ const gl=ri(0,2); for(let i=0;i<4;i++) gem(x-150+i*14,gl,7); }
    if(R()<.22+.1*(1-d)) orb(x-90,ri(0,2),12);
  }
  if(d>.15) fence(FINISH_X-220,some());
  for(let pass=0;pass<2;pass++){ const c=HT.slice(0,TRACK_LEN+4); for(let i=2;i<TRACK_LEN-2;i++) HT[i]=(c[i-2]+c[i-1]+c[i]+c[i+1]+c[i+2])/5; }
  for(const ac of autoClouds){ let m=0; for(let i=ac.x;i<=ac.x+ac.len;i+=4) m=Math.max(m,heightAt(i)); const h=Math.round(m+22);
    clouds.push({x:ac.x,len:ac.len,h}); for(let i=0;i<4;i++) gem(ac.x+18+(ac.len-36)*i/3,ac.lane,h+9,true); }
  for(const g of gems){ g.alt=(g.abs?0:heightAt(g.x))+g.off; g.taken=false; g.pull=null; }
  for(const o of orbs){ o.alt=(o.abs?0:heightAt(o.x))+o.off; o.taken=false; }
}
