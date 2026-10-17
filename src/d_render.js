
/* ---------------- Render ---------------- */
function setCanvasMode(two){
  const h=two?360:(VH===360?180:VH); document.body.classList.toggle('two',two);
  if(cv.height!==h){ cv.height=h; VH=h; ctx.imageSmoothingEnabled=false; layout(); }
}
let viewDy=0;   // extra sky added above the normal 180px view (tall screens + zoom). Parallax layers stay anchored to the ground
function renderBackground(camX,cy0){
  const T=TH, A=AS, cy=cy0-viewDy;
  ctx.drawImage(A.sky,0,0,W,H);
  if(!T.night) for(let i=0;i<4;i++){ const span=W+80; let x=((i*97+30 - camX*.06 - t*4)%span+span)%span-40; ctx.drawImage(cloudSpr,Math.round(x),18+((i*37)%30)+Math.round(cy*.2)); }
  for(let i=0;i<(T.night?16:7);i++){ const span=W+40, dir=i%2?1:-1;
    const x=((i*71 - camX*.22 + t*(8+(i%3)*4)*dir)%span+span)%span-20, xi=Math.round(x);
    const y=Math.round(28+((i*37)%58)+Math.sin(t*2.2+i)*5+cy*.2);
    if(T.spooky){ if(i<7){ const flap=((t*10+i)|0)%2; ctx.fillStyle='#120c14'; ctx.fillRect(xi,y,2,2);
        if(flap){ ctx.fillRect(xi-3,y-2,3,1); ctx.fillRect(xi+2,y-2,3,1); ctx.fillRect(xi-1,y-1,1,1); ctx.fillRect(xi+2,y-1,1,1); }
        else { ctx.fillRect(xi-3,y+1,3,1); ctx.fillRect(xi+2,y+1,3,1); ctx.fillRect(xi-1,y,1,1); ctx.fillRect(xi+2,y,1,1); }
        ctx.fillStyle='#ff9a3a'; ctx.fillRect(xi,y,1,1); }
      else if(((t*1.2+i*.37)%2)<1.4){ ctx.fillStyle='#9affb0'; ctx.fillRect(xi,y,1,1); ctx.fillStyle='rgba(154,255,176,.4)'; ctx.fillRect(xi-1,y,3,1); ctx.fillRect(xi,y-1,1,3); } }
    else if(T.night){ if(((t*1.5+i*.37)%2)<1.3){ ctx.fillStyle='#fff0a0'; ctx.fillRect(xi,y,1,1); ctx.fillStyle='#c9b24f'; ctx.fillRect(xi-1,y,1,1); ctx.fillRect(xi+1,y,1,1); ctx.fillRect(xi,y-1,1,1); ctx.fillRect(xi,y+1,1,1); } }
    else { ctx.fillStyle=['#ff8fc8','#7fe3bd','#ffd76a'][i%3]; ctx.fillRect(xi,y,2,2);
      ctx.fillStyle='#ffffff'; if(((t*14)|0)%2){ ctx.fillRect(xi-1,y-1,1,1); ctx.fillRect(xi+2,y-1,1,1); } else { ctx.fillRect(xi-1,y,1,1); ctx.fillRect(xi+2,y,1,1); }
      if(((t*6+i)|0)%3===0){ ctx.fillStyle='#fff6fb'; ctx.fillRect(xi-3*dir,y+2,1,1); } }
  }
  const fy=Math.round(cy*.3)+viewDy, farX=camX*.15;
  const triw=u=>1-2*Math.abs(u-Math.floor(u)-.5);
  const farY=T.farFn ? T.farFn : wx=>T.peaks ? Math.round(102-30*triw(wx*.008)-7*triw(wx*.027+.3)) : Math.round(92-15*(.55+.45*Math.sin(wx*.011))-7*Math.sin(wx*.027+2));
  for(let sx=0;sx<W;sx++){ const y=farY(sx+farX)+fy; ctx.fillStyle=T.far[0]; ctx.fillRect(sx,y,1,1); ctx.fillStyle=T.far[1]; ctx.fillRect(sx,y+1,1,H-y);
    if(T.peaks && y<84+fy){ ctx.fillStyle='#ffffff'; ctx.fillRect(sx,y,1,Math.min(4,84+fy-y)); }
    if(T.capCol && y<T.capY+fy){ ctx.fillStyle=T.capCol; ctx.fillRect(sx,y,1,Math.min(5,T.capY+fy-y)); }
    if(T.city){ const wx=Math.floor(sx+farX), b=Math.floor(wx/18), c=wx-b*18; if(c>=3 && c<=15 && c%3===1) for(let yy=y+4;yy<H;yy+=5){ const q=hash(b*97+yy*3+c); if(q%3===0){ ctx.fillStyle=T.win[q%T.win.length]; ctx.fillRect(sx,yy,1,2); } } } }
  const CE=T.castleEvery||700;
  if(!T.noCastle) for(let k=Math.floor(farX/CE)-1;k<=Math.floor((farX+W)/CE)+1;k++){ const wx=k*CE+260; ctx.drawImage(A.castle,Math.round(wx-farX)-17,farY(wx)+fy-27); }
  const my=Math.round(cy*.5)+viewDy, mwx=camX*.35;
  const midY=wx=>Math.round(113-14*Math.max(0,Math.sin(wx*.016))-6*(.5+.5*Math.sin(wx*.041+1)));
  for(let sx=0;sx<W;sx++){ const y=midY(sx+mwx)+my; ctx.fillStyle=T.mid[0]; ctx.fillRect(sx,y,1,1); ctx.fillStyle=T.mid[1]; ctx.fillRect(sx,y+1,1,H-y); }
  for(let i=Math.floor(mwx/58)-1;i<=Math.floor((mwx+W)/58)+1;i++){ const h=hash(i+999); if(h%3===0) continue; const tx=i*58+(h%30);
    if(h%7===1) ctx.drawImage(T.spooky?pumpkinLit:houseSpr[h%2],Math.round(tx-mwx-9),midY(tx)+my-(T.spooky?11:15));
    else ctx.drawImage(A.trees[h%3],Math.round(tx-mwx-8),midY(tx)+my-21); }
  const hwx=camX*.7, hy=Math.round(cy*.8)+viewDy;
  for(let i=Math.floor(hwx/90)-1;i<=Math.floor((hwx+W)/90)+1;i++){ const h=hash(i+4242); if(h%3) continue; ctx.drawImage(A.big[h%3],Math.round(i*90+(h%40)-hwx),94+hy); }
  for(let i=Math.floor(hwx/17)-1;i<=Math.floor((hwx+W)/17)+1;i++){ ctx.drawImage(A.hedge,Math.round(i*17-hwx),111+(hash(i)%3)+hy); }
}
function renderForeground(camX){
  ctx.fillStyle=TH.fg[0]; ctx.fillRect(0,BAND_BOT,W,H-BAND_BOT+40);
  ctx.fillStyle=TH.fg[1]; ctx.fillRect(0,BAND_BOT,W,1);
  const fwx=camX*1.3;
  for(let i=Math.floor(fwx/9);i<=Math.floor((fwx+W)/9)+1;i++){ const h=hash(i+5); if(h%3) continue; ctx.fillStyle=h%2?TH.hedge[2]:'#fff6fb'; ctx.fillRect(Math.round(i*9-fwx),163+(h%5),1,1); }
  for(let i=Math.floor(fwx/40)-1;i<=Math.floor((fwx+W)/40)+1;i++){ const h=hash(i+77), x=Math.round(i*40+(h%14)-fwx), k=h%9;
    if(k<=3) ctx.drawImage(k===0?AS.happyBush:AS.bush,x,166+(h%4));
    else if(TH.spooky && k<=5){ const hop=Math.round(Math.abs(Math.sin(t*(cheerT>0?10:3)+i))*(cheerT>0?5:1)); ctx.drawImage(cheerT>0||(t*2+i)%3<2?pumpkinLit:pumpkinDark,x+6,180-13-hop); }
    else if(TH.spooky && k===6) ctx.drawImage(tombSpr,x+3,180-15);
    else if(k<=5){ const cheer=cheerT>0, gasp=gaspT>0 && !cheer;
      const hop=Math.round(Math.abs(Math.sin(t*(cheer?10:4)+i))*(cheer?5:2));
      const gx=x+6+(gasp?((t*30|0)%2?1:-1):0), gy=180-18-hop;
      ctx.drawImage((cheer?gnomeCheer:gnomeSpr)[h%3],gx,gy);
      if(cheer && (i+(t*4|0))%2===0){ ctx.fillStyle='#ff5fa8'; ctx.fillRect(gx+5,gy-5,1,1); ctx.fillRect(gx+7,gy-5,1,1); ctx.fillRect(gx+5,gy-4,3,1); ctx.fillRect(gx+6,gy-3,1,1); }
      if(gasp){ ctx.fillStyle='#fff6fb'; ctx.fillRect(gx+6,gy-7,1,3); ctx.fillRect(gx+6,gy-3,1,1); } }
    else if(k===6) ctx.drawImage(houseSpr[h%2],x+3,180-17); }
}
function drawTrail(r,cx){
  const tr=r.trail; if(tr.length<2) return;
  const TS=TRAILS[r.trailStyle]||TRAILS.rainbow, S=TS.s, shift=r.trailStyle==='candy'?((t*10)|0)%2:0;
  if(TS.fire){ const f=(t*18)|0;   // flickering flame: thin at the tail, full near the pony
    for(let i=1;i<tr.length;i++){ const a=tr[i-1], b=tr[i], x0=Math.round(a.x-cx), w=Math.max(1,Math.round(b.x-a.x)), y0=Math.round(a.y);
      const keep=Math.max(1,Math.ceil(6*(.25+.75*i/tr.length))), off=Math.floor((6-keep)/2), jit=hash(i*7+f)%3===0?-1:0;
      for(let k=0;k<keep;k++){ ctx.fillStyle=S[(off+k+(hash(i*13+k+f)%5===0?1:0))%6]; ctx.fillRect(x0,y0+off+k+jit,w,1); } }
    return; }
  for(let i=1;i<tr.length;i++){ const a=tr[i-1], b=tr[i], x0=Math.round(a.x-cx), w=Math.max(1,Math.round(b.x-a.x)), y0=Math.round(a.y), fade=i<tr.length*.35;
    for(let k=0;k<6;k++){ if(fade && (i+k)%2) continue; ctx.fillStyle=S[(k+shift)%6]; ctx.fillRect(x0,y0+k,w,1); } }
}
function drawParticle(p,cx){
  const px=Math.round(p.x-cx), py=Math.round(p.y); ctx.fillStyle=p.c;
  if(p.shape==='heart'){ ctx.fillRect(px-1,py,1,1); ctx.fillRect(px+1,py,1,1); ctx.fillRect(px-1,py+1,3,1); ctx.fillRect(px,py+2,1,1); }
  else if(p.shape==='bubble'){ ctx.fillRect(px,py-1,1,1); ctx.fillRect(px-1,py,1,1); ctx.fillRect(px+1,py,1,1); ctx.fillRect(px,py+1,1,1); }
  else if(p.shape==='star'||p.star){ ctx.fillRect(px-1,py,3,1); ctx.fillRect(px,py-1,1,3); }
  else if(p.shape==='flower'){ ctx.fillRect(px-1,py,1,1); ctx.fillRect(px+1,py,1,1); ctx.fillRect(px,py-1,1,1); ctx.fillRect(px,py+1,1,1); ctx.fillStyle='#ffd76a'; ctx.fillRect(px,py,1,1); }
  else if(p.shape==='bigheart'){ ctx.fillRect(px-2,py-1,2,1); ctx.fillRect(px+1,py-1,2,1); ctx.fillRect(px-2,py,5,2); ctx.fillRect(px-1,py+2,3,1); ctx.fillRect(px,py+3,1,1); }
  else if(p.shape==='streak'){ ctx.globalAlpha=.6; ctx.fillRect(px,py,7,1); ctx.globalAlpha=1; }
  else ctx.fillRect(px,py,p.sz||1,p.sz||1);
}
function pixelText(str,x,y,col='#ffd76a',size=8){
  ctx.font=size+'px "Press Start 2P", monospace'; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
  const o=size>=12?2:1;
  ctx.fillStyle=OUT; for(const [a,b] of [[-o,0],[o,0],[0,-o],[0,o],[o,o],[-o,-o],[o,-o],[-o,o]]) ctx.fillText(str,x+a,y+b);
  ctx.fillStyle=col; ctx.fillText(str,x,y);
}
function renderView(focus,cam,y0){
  const cx=Math.round(cam.x), cy=Math.round(cam.y);
  const sx0=shake>0?Math.round((Math.random()*2-1)*shake):0, sy0=shake>0?Math.round((Math.random()*2-1)*shake):0;
  ctx.save(); ctx.beginPath(); ctx.rect(0,y0,W,H); ctx.clip(); ctx.translate(sx0,y0+sy0);
  renderBackground(cam.x,cy);
  worldFx('back',cam.x);
  if(!twoP && !demo) renderFab('back');
  ctx.save(); ctx.translate(0,cy);
  // track columns
  for(let sx=0;sx<W;sx++){
    const wx=cx+sx, h=Math.round(heightAt(wx)), s=slopeAt(wx), top=BAND_TOP-h, bot=BAND_BOT-h;
    if(h>0){ ctx.fillStyle=RIB.face; ctx.fillRect(sx,bot,1,h); ctx.fillStyle=RIB.face2; ctx.fillRect(sx,bot,1,Math.min(2,h));
      const near=Math.min(BAND_BOT,bot+30), sc=['','#fff6fb','#c9a6ff'];
      for(let y=bot+3;y<near;y++){ const q=hash(wx*131+y*7)%31; if(q<3){ ctx.fillStyle=q===0?TH.hedge[2]:sc[q]; ctx.fillRect(sx,y,1,1); } }
      if(h>36){ const off=hash(wx>>3)%7; ctx.fillStyle=RIB.face2; for(let y=bot+(((9-off)%18)+18)%18;y<BAND_BOT;y+=18) if(y>=bot+3) ctx.fillRect(sx,y,1,1); }
      const deep=BAND_BOT-near; if(deep>40){ for(let j=0,n=(deep/45)|0;j<n;j++){ const q=hash(wx*131+j*7919); ctx.fillStyle=q%3===0?TH.hedge[2]:sc[1+q%2]; ctx.fillRect(sx,near+q%deep,1,1); } } }
    ctx.fillStyle = s>0.28?RIB.lit : s<-0.28?RIB.shade : RIB.base; ctx.fillRect(sx,top,1,bot-top);
    ctx.fillStyle=RIB.edge; ctx.fillRect(sx,top,1,1);
    ctx.fillStyle=RIB.dark; ctx.fillRect(sx,bot-1,1,1);
    if((wx>>2)&1){ ctx.fillStyle=RIB.dash; ctx.fillRect(sx,LANE0+6-h,1,1); ctx.fillRect(sx,LANE0+18-h,1,1); }
    if(hash(wx)%13===0){ ctx.fillStyle=RIB.shade; ctx.fillRect(sx,top+3+(hash(wx+1)%30),1,1); }
    for(const L of [START_X+18, FINISH_X]) if(wx>=L && wx<L+6) for(let y=top;y<bot;y++){ ctx.fillStyle=(((wx-L)>>1)+(y>>1))&1?'#fff6fb':'#6b4a90'; ctx.fillRect(sx,y,1,1); }
    for(const g of goos){ if(wx<g.x||wx>g.x+g.len) continue; const edge=Math.min(wx-g.x,g.x+g.len-wx), half=edge<2?1:edge<5?2:3;
      for(const l of g.lanes){ const yy=laneY(l)-h; ctx.fillStyle=TH.goo?TH.goo[0]:'#9a5bd6'; ctx.fillRect(sx,yy-half-1,1,half*2);
        ctx.fillStyle=TH.goo?TH.goo[1]:'#c48cf0'; ctx.fillRect(sx,yy-half-1,1,1); if(hash(wx*3+l)%17===0){ ctx.fillStyle=TH.goo?TH.goo[2]:'#e8c9ff'; ctx.fillRect(sx,yy-1,1,1);} } }
  }
  const rc=['#ff6fae','#ffd76a','#7fe3bd'];
  for(const p of pads){ const sx=Math.round(p.x-cx); if(sx<-20||sx>W) continue; const y=laneY(p.lane)-Math.round(heightAt(p.x))-1;
    for(let k=0;k<3;k++){ ctx.fillStyle=rc[k]; for(let r=-3;r<=3;r++){ ctx.fillRect(sx+k*5+(3-Math.abs(r)),y+r,2,1); } } }
  { const ax=FINISH_X+3-cx; if(ax>-60&&ax<W+60){ const cols=['#ff6fae','#ffb48a','#ffd76a','#7fe3bd','#8fc7ff','#c9a6ff'];
    cols.forEach((c,i)=>{ const R=52-i*2; ctx.fillStyle=c; for(let dx=-R;dx<=R;dx++){ const y=Math.round(BAND_BOT-Math.sqrt(R*R-dx*dx)); ctx.fillRect(Math.round(ax+dx),y,1,2); } });
    ctx.drawImage(cloudSpr,Math.round(ax-66),BAND_BOT-12); ctx.drawImage(cloudSpr,Math.round(ax+32),BAND_BOT-12); } }
  for(const r of racers) if(r.isPlayer||r.boss) drawTrail(r,cx);
  // sprites sorted by lane depth
  const list=[];
  const vis=(x,m=24)=>x-cx>-m && x-cx<W+m;
  for(const m of shrooms) if(vis(m.x)) list.push({y:laneY(m.lane),m});
  for(const s of spiders) if(vis(s.x)) list.push({y:laneY(s.lane)-.15,spider:s});
  for(const h of hurdles) if(vis(h.x)) for(const l of h.lanes) list.push({y:laneY(l)-.2,fence:h,l});
  for(const b of brambles){ if(b.x+b.len<cx-20||b.x>cx+W+20) continue; for(const l of b.lanes) list.push({y:laneY(l)-.3,br:b,l}); }
  for(const c of clouds){ if(c.x+c.len<cx-30||c.x>cx+W+30) continue; for(const l of ALL) list.push({y:laneY(l)-.45,cl:c,l}); }
  for(const g of gems) if(!g.taken && vis(g.x)) list.push({y:laneY(Math.round(g.ly))+.05,gem:g});
  for(const o of orbs) if(!o.taken && vis(o.x)) list.push({y:laneY(o.ly)+.05,orb:o});
  if(ghost && (mode==='race'||mode==='finish') && vis(ghost.x,40)) list.push({y:laneY(ghost.laneY)-.05,ghost});
  for(const r of racers) list.push({y:laneY(r.laneY)+(r.isPlayer?.1:0),r});
  if(freeMode && !demo){ for(const f of friends) if(vis(f.x,40)) list.push({y:laneY(f.laneY)-.01,r:f}); for(const o of worldOrbs) if(!o.taken && vis(o.x)) list.push({y:laneY(o.ly)+.05,world:o}); }
  list.sort((a,b)=>a.y-b.y);
  for(const it of list){
    if(it.fence){ const x=it.fence.x, sx=Math.round(x-cx), hs=hurdleSprite(); ctx.drawImage(hs,sx-(hs.width>>1),laneY(it.l)-Math.round(heightAt(x))-hs.height+1); }
    else if(it.spider) drawSpider(it.spider,cx,cy);
    else if(it.br){ const b=it.br; for(let x=b.x;x<=b.x+b.len-6;x+=7){ const sx=Math.round(x-cx); if(sx<-16||sx>W+2) continue; const j=hash(x+it.l)%3; const bs=brambleSprite(); ctx.drawImage(bs,sx-3,laneY(it.l)-Math.round(heightAt(x+4))-bs.height+2+(j===0?1:0)); } }
    else if(it.cl){ const c=it.cl; for(let x=c.x-4;x<=c.x+c.len-16;x+=14){ const sx=Math.round(x-cx); if(sx<-26||sx>W+2) continue; ctx.drawImage(cloudPlat,sx,laneY(it.l)-c.h-3+(hash(x+it.l)%2)); }
      if(c.secret && it.l===1) for(let k=0;k<5;k++){ const px=Math.round(c.x+((k*53+t*40)%Math.max(40,c.len))-cx), py=laneY(0)-c.h-8-((k*7)%10); if(((t*6+k)|0)%3) continue; ctx.fillStyle='#fff4a8'; ctx.fillRect(px-1,py,3,1); ctx.fillRect(px,py-1,1,3); } }
    else if(it.gem){ const g=it.gem, bob=Math.round(Math.sin(t*4+g.x*.1)*1.2), sx=Math.round(g.x-cx);
      const y=Math.round(laneY(g.ly)-g.alt)+bob; if(g.big) ctx.drawImage(bigGemSpr,sx-6,y-6); else ctx.drawImage(gemSpr[g.c],sx-4,y-5);
      if(((t*3+g.x*.05)|0)%5===0){ ctx.fillStyle='#ffffff'; ctx.fillRect(sx+2,y-5,1,1); } }
    else if(it.orb){ const o=it.orb, sx=Math.round(o.x-cx), y=Math.round(laneY(o.ly)-o.alt+Math.sin(t*3+o.x)*1.5);
      ctx.drawImage(orbSpr[o.type],sx-7,y-7); if(((t*8)|0)%4===0){ ctx.fillStyle='#ffffff'; ctx.fillRect(sx+5,y-6,1,1); } }
    else if(it.m){ const m=it.m, sx=Math.round(m.x-cx), y=laneY(m.lane)-Math.round(heightAt(m.x));
      if(m.squish>0) ctx.drawImage(shroomSpr,sx-7,y-9,15,10); else ctx.drawImage(shroomSpr,sx-6,y-11); }
    else if(it.ghost){ const gh=it.ghost; ctx.globalAlpha=.4; drawPonyAt(gh.spr, gh.st===1?gh.spr.air:gh.spr.run[(gh.stride|0)%4], Math.round(gh.x-cx), laneY(gh.laneY)-gh.alt, 0, null); ctx.globalAlpha=1; }
    else if(it.world) drawWorldOrb(it.world,cx);
    else drawRacer(it.r,cx);
  }
  for(const p of particles) drawParticle(p,cx);
  if(!twoP && !demo && focus.isPlayer && focus.state==='air' && focus.alt-heightAt(focus.x)>26) drawTrajectory(focus,cx);
  // combo counter over the pony
  for(const r of players) if(r.combo>=2 && r.state==='air'){ pixelText('×'+r.combo, Math.round(r.x-cx), Math.round(ry(r))-36); }
  renderForeground(cam.x);
  if(freeMode && !demo) renderFreeOverlay(cx,'world');
  ctx.restore();
  worldFx('front',cam.x);
  if(!twoP && !demo) renderFab('front');
  ctx.restore();
}
// FABULOUS MODE: rolling rainbow wash, beat flashes, glitter everywhere, a shimmering rainbow frame
function renderFab(layer){
  const I=fabI(); if(I<=0) return;
  const beat=1-((t*(Music.bpm||132)/60)%1);
  ctx.save();
  if(layer==='back'){
    const g=ctx.createLinearGradient(0,0,W,H*.6);
    const gold=fabKind==='gold';
    for(let i=0;i<=6;i++) g.addColorStop(i/6,gold?`hsl(${42+12*Math.sin(t*6+i)},100%,${62+12*Math.sin(t*4+i*1.3)}%)`:`hsl(${(t*140+i*55)%360},95%,72%)`);
    ctx.globalCompositeOperation='screen'; ctx.globalAlpha=.42*I; ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.globalAlpha=.16*I*beat*beat; ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation='source-over';
    // spinning light rays from the sun spot
    ctx.globalAlpha=(gold?.2:.13)*I; ctx.fillStyle=gold?'#fff4a8':'#fff6fb'; const ox=W*.72, oy=H*.25, R=Math.max(W,H);
    for(let k=0;k<10;k++){ const a=t*.6+k*Math.PI/5; ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+Math.cos(a)*R,oy+Math.sin(a)*R); ctx.lineTo(ox+Math.cos(a+.13)*R,oy+Math.sin(a+.13)*R); ctx.fill(); }
  }
  ctx.globalAlpha=I;
  const n=layer==='back'?Math.round(W*.16):Math.round(W*.06), cols=fabKind==='gold'?['#ffffff','#fff4a8','#ffd76a','#ffe9a8','#ffb347']:['#ffffff','#fff4a8','#ffb3d6','#a6f2ff','#c9b2ff'];
  for(let i=0;i<n;i++){ const slot=Math.floor(t*3+i*.37), h=hash(i*131+slot*7+(layer==='back'?0:999)), ph=(t*3+i*.37)%1;
    if(ph>.75) continue; const x=h%W, y=(h>>>10)%H, big=ph>.2&&ph<.55&&(h&3)===0; ctx.fillStyle=cols[(h>>>20)%5];
    ctx.fillRect(x,y,1,1); if(ph>.1&&ph<.65){ ctx.fillRect(x-1,y,3,1); ctx.fillRect(x,y-1,1,3); }
    if(big){ ctx.fillRect(x-2,y,5,1); ctx.fillRect(x,y-2,1,5); } }
  if(layer==='front'){ const th=Math.max(2,Math.round(2*W/320)), seg=8*W/320;
    for(let x=0;x<W;x+=seg){ ctx.fillStyle=fabKind==='gold'?`hsl(${45+10*Math.sin(x*.05-t*8)},100%,${65+15*Math.sin(x*.07-t*10)}%)`:`hsl(${(x*2-t*300)%360+360},95%,70%)`; ctx.fillRect(x,0,seg,th); ctx.fillRect(W-x-seg,H-th,seg,th); }
    for(let y=0;y<H;y+=seg){ ctx.fillStyle=fabKind==='gold'?`hsl(${45+10*Math.sin(y*.05-t*8)},100%,${65+15*Math.sin(y*.07-t*10)}%)`:`hsl(${(y*2-t*300)%360+360},95%,70%)`; ctx.fillRect(0,H-y-seg,th,seg); ctx.fillRect(W-th,y,th,seg); } }
  ctx.restore();
}
function drawPonyAt(S,spr,sx,feet,a,hat){
  ctx.save(); ctx.translate(sx,Math.round(feet-8)); ctx.rotate(-a); ctx.drawImage(spr,-16,-22);
  if(hat && HATS[hat]){ const H_=HATS[hat]; ctx.drawImage(H_.spr,H_.dx-1-16,H_.dy-1-22); }
  ctx.restore();
}
function drawRacer(r,cx){
  const sx=Math.round(r.x-cx), base=laneY(r.laneY), feet=base-r.alt;
  if(sx<-40||sx>W+40) return;
  if(r.safe>0 && (t*14|0)%2 && !r.shield) return;
  const S=r.spr;
  if(r.state!=='ground'||r.cloud){ const gy=Math.round(base-heightAt(r.x)); ctx.fillStyle='#4f9f7d'; ctx.fillRect(sx-6,gy-1,12,2); ctx.fillRect(sx-4,gy-2,8,1); }
  let spr, a;
  if(r.state==='tumble'){ spr=S.run[0]; a=r.spin; }
  else if(r.state==='air'){ spr = (S.airDown && (r.gliding ? (t*7|0)%2 : r.vz<0)) ? S.airDown : S.air; a=r.angle+(r.flipA||0); }
  else { spr=S.run[(r.stride|0)%4]; a=r.angle; }
  a=Math.round(a/(Math.PI/12))*(Math.PI/12);
  if(r.turboT>0 && ((t*14)|0)%2){ ctx.fillStyle='rgba(255,110,40,.4)'; ctx.fillRect(sx-15,Math.round(feet)-28,30,28); }
  if(r.starT>0){ ctx.fillStyle=((t*16)|0)%2?'rgba(255,215,106,.5)':'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(sx,Math.round(feet)-13,18+Math.sin(t*20)*2,0,7); ctx.fill(); }
  if(r.superT>0 && ((t*12)|0)%2){ ctx.fillStyle='rgba(255,215,106,.35)'; ctx.fillRect(sx-15,Math.round(feet)-28,30,28); }
  if(r.hovering||r.phaseT>0){ ctx.globalAlpha=.55+.15*Math.sin(t*10); drawPonyAt(S,spr,sx,feet,a,r.hat); ctx.globalAlpha=1;
    ctx.fillStyle=r.phaseT>0?'#cfe0ff':'#9affb0'; for(let k=0;k<6;k++){ const an=t*4+k*1.05; ctx.fillRect(Math.round(sx+Math.cos(an)*14),Math.round(feet-14+Math.sin(an)*9),1,1); } }
  else drawPonyAt(S,spr,sx,feet,a,r.hat);
  if(r.shield){ const cy=Math.round(feet)-13, R=15; ctx.fillStyle='#bfe0ff';
    for(let k=0;k<40;k++){ const an=k/40*Math.PI*2; if((k+(t*10|0))%5===0) continue; ctx.fillRect(Math.round(sx+Math.cos(an)*R),Math.round(cy+Math.sin(an)*R*.85),1,1); }
    ctx.fillStyle='#ffffff'; ctx.fillRect(sx-8,cy-9,2,1); ctx.fillRect(sx-9,cy-8,1,2); }
  if(r.magnetT>0 && ((t*6)|0)%2){ ctx.fillStyle='#e8455f'; ctx.fillRect(sx-1,Math.round(feet)-34,3,1); ctx.fillRect(sx-1,Math.round(feet)-33,1,2); ctx.fillRect(sx+1,Math.round(feet)-33,1,2); }
  if(r.isPlayer && !demo && mode==='countdown'){ ctx.fillStyle=twoP&&r.idx===1?'#7fe3bd':'#ffd76a'; const py=Math.round(feet-38+Math.sin(t*6)*2); ctx.fillRect(sx-2,py,5,1); ctx.fillRect(sx-1,py+1,3,1); ctx.fillRect(sx,py+2,1,1); }
}
const sceneCv=document.createElement('canvas'); sceneCv.width=320; sceneCv.height=180;
function renderScene(){ if(mode==='photo') renderPhoto(); else if(mode==='cutscene') renderCutscene(); else renderDance(); }
function render(){
  if(mode==='photo'||mode==='cutscene'||mode==='dance'){
    // these scenes are drawn at 320x180; on a tall screen, draw them at the bottom and stretch their top row into the extra sky
    if(VH>180 && !twoP){ const main=ctx, sc=sceneCv.getContext('2d'); sc.imageSmoothingEnabled=false; ctx=sc; W=320; H=180;
      try{ renderScene(); } finally { ctx=main; W=320; H=VH; }
      const top=VH-180; ctx.drawImage(sceneCv,0,0,320,1,0,0,320,top); ctx.drawImage(sceneCv,0,top); }
    else renderScene();
    return; }
  const flip=!twoP && !demo && Math.abs(flipV-1)>.002;
  if(flip){ ctx.save(); ctx.translate(W/2,0); ctx.scale(Math.abs(flipV)<.04?(flipV<0?-.04:.04):flipV,1); ctx.translate(-W/2,0); }
  try{ renderMain(); } finally { if(flip) ctx.restore(); }
  if(freeMode && !demo) renderFreeOverlay(cams[0].x,'screen');
}
function renderMain(){
  if(twoP && !demo){ renderView(players[0],cams[0],0); renderView(players[1],cams[1],H); return; }
  const z=demo?1:viewZoom, SH=twoP?180:VH;
  if(Math.abs(z-1)>.005 || SH>180){
    // zoomed or tall screen: draw the world into a bigger (or smaller) view, then scale it onto the screen
    const w=Math.ceil(320/z), h=Math.ceil(SH/z);
    if(zoomCv.width!==w||zoomCv.height!==h){ zoomCv.width=w; zoomCv.height=h; }
    const zc=zoomCv.getContext('2d'); zc.imageSmoothingEnabled=false;
    const main=ctx; ctx=zc; W=w; H=h;
    const c=cams[0], dy=h-180; c.y+=dy; viewDy=dy;   // put the extra room in the sky, not under the ground
    try{ renderView(players[0],c,0); } finally { ctx=main; W=320; H=SH; c.y-=dy; viewDy=0; }
    ctx.drawImage(zoomCv,0,0,w,h,0,0,W,H);
  }
  else renderView(players[0],cams[0],0);
}

/* ---------------- Photo mode ---------------- */
const POSES=[{name:'Gallop',run:true},{name:'Leap',air:true,a:.25},{name:'Rear up',run:1,a:.6,rear:true},{name:'Prance',run:2,a:-.1},{name:'Rainbow dash',air:true,a:0,trail:true}];
const photo={theme:0,pose:0,kind:'unicorn',sparkles:true,from:'select'};
function renderPhoto(){
  setThemeIndex(photo.theme);
  const camX=(700+260-160)/0.15;
  renderBackground(camX,0);
  for(let sx=0;sx<W;sx++){ ctx.fillStyle=RIB.base; ctx.fillRect(sx,BAND_TOP,1,BAND_BOT-BAND_TOP); }
  ctx.fillStyle=RIB.edge; ctx.fillRect(0,BAND_TOP,W,1);
  for(let x=0;x<W;x+=3){ const h=hash(x*7); if(h%5===0){ ctx.fillStyle=h%2?'#ff8fc8':'#fff6fb'; ctx.fillRect(x,BAND_TOP+3+(h%30),1,1); } }
  const eq=equipOf(photo.kind), S=ponySet(photo.kind,eq.mane), P=POSES[photo.pose];
  const spr = P.air ? S.air : P.run===true ? S.run[(t*9|0)%4] : S.run[P.run];
  const px=P.rear?8:16, py=30, gx=P.rear?144:160, gy=154;
  if(P.trail){ const TS=(TRAILS[eq.trail]||TRAILS.rainbow).s; for(let k=0;k<6;k++){ ctx.fillStyle=TS[k]; for(let x=0;x<gx-20;x++){ const y=Math.round(gy-44+k*2+Math.sin(x*.08+t*4)*3); ctx.fillRect(x,y,1,2); } } }
  ctx.save(); ctx.translate(gx,gy); ctx.scale(2,2); ctx.rotate(-(P.a||0)); ctx.drawImage(spr,-px,-py);
  if(eq.hat!=='none' && HATS[eq.hat]){ const h=HATS[eq.hat]; ctx.drawImage(h.spr,h.dx-1-px,h.dy-1-py); }
  ctx.restore();
  cheerT=Math.max(cheerT,.2);
  renderForeground(5333+((t*6)%40));
  if(photo.sparkles){ if(Math.random()<.6) particles.push({x:Math.random()*W,y:-4,vx:(Math.random()-.5)*10,vy:15+Math.random()*25,life:6,c:RAINBOW[(Math.random()*5)|0],shape:'star',g:0});
    for(const p of particles) drawParticle(p,0); }
  pixelText(ponyName(photo.kind),160,22,'#fff6fb');
}

// dotted guide while flying: white = where you'll land, pink = where you'd land if you dive right now
function drawTrajectory(r,cx){
  const P=r.P, base=laneY(r.laneY), dt=.035, m=viewZoom<.8?Math.max(1,Math.round(1/viewZoom)):1;   // chunkier dots when zoomed way out
  const sim=(dive,col)=>{ let x=r.x, a=r.alt, vx=r.vx, vz=dive?Math.min(r.vz,0):r.vz;
    for(let i=0;i<180;i++){
      if(dive){ vz=Math.min(vz-1600*dt,-CONFIG.dive.speed*.6); if(vz<-CONFIG.dive.speed) vz=-CONFIG.dive.speed; } else vz-=P.gravity*WR.grav*dt;
      const pa=a; x+=vx*dt; a+=vz*dt; let g=heightAt(x);
      for(const c of clouds) if(vz<0 && pa>=c.h && a<=c.h && x>=c.x && x<=c.x+c.len){ g=c.h; break; }
      if(a<=g){ const sx=Math.round(x-cx), sy=Math.round(base-g); ctx.fillStyle=col; const X=(dx,dy,w,h)=>ctx.fillRect(sx+dx*m,sy+dy*m,w*m,h*m);
        X(-2,-2,1,1); X(2,-2,1,1); X(-1,-1,3,1); X(0,-1,1,1); X(-2,0,1,1); X(2,0,1,1); return; }
      if(i%2===0 && i>1){ ctx.fillStyle=col; ctx.fillRect(Math.round(x-cx),Math.round(base-a),2*m,2*m); }
    } };
  ctx.globalAlpha=.9; sim(false,'#ffffff'); if(!r.dive) sim(true,'#ff6fae'); ctx.globalAlpha=1;
}
