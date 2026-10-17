/* ---------------- Themes: each level gets a new world ---------------- */
// style: classic | speedway (spread out, big downhills, turbo) | mountains (huge ridges) | spooky (skeleton horses)
const THEMES = [
  { name:'Sunrise Meadow', style:'classic', music:'happy', sky:['#a98bf0','#bc9cf4','#cfaef6','#e2bff3','#f2cdee','#ffd9ea'], orbCol:['#fff6fb','#ffe6f2','#ffd0e6'], rainbow:true,
    far:['#b49af0','#9a7de4'], mid:['#a9e8c8','#86d3ae'], hedge:['#b05cc8','#6e3a8a','#ffc1e3'],
    rib:{lit:'#a9efc9',base:'#8fe3b8',shade:'#72d0a2',edge:'#d8fbe8',dark:'#3f9f78',dash:'#c4f5dc',face:'#5cbf8f',face2:'#4aa97c'},
    fg:['#3f9d74','#4aa97c','#2f8a64','#1f5f48'], trees:['#ff9bd0','#9ff0cf','#ffc2e3'] },
  { name:'Twilight Glen', style:'speedway', music:'funk', sky:['#2b1f5c','#3a2873','#52308a','#74399a','#9a47a2','#c25ca6'], orbCol:['#fff4d6','#ffe6b0','#ffe6b0'], night:true,
    far:['#6a50b8','#4f3a94'], mid:['#4fb3a2','#358d82'], hedge:['#d06bb8','#7a2f78','#ffe08a'],
    rib:{lit:'#8ae6c8',base:'#6fd3b4',shade:'#56bb9e',edge:'#b6f6e2',dark:'#2c7a68',dash:'#a2eed6',face:'#3d9a85',face2:'#2f8573'},
    fg:['#2a6f5e','#337d6a','#1f5a4b','#123b31'], trees:['#ff9bd0','#ffe08a','#c9a6ff'] },
  { name:'Candy Cove', style:'classic', music:'happy', sky:['#ffa9c9','#ffb8cf','#ffc8d6','#ffd6da','#ffe3dd','#fff0e3'], orbCol:['#fffbe8','#fff2c2','#ffe39a'], rainbow:true,
    far:['#ffa3cf','#f282b6'], mid:['#a5f0dc','#82dcc2'], hedge:['#ff7fb0','#b8457a','#fff6fb'],
    rib:{lit:'#c6f8de',base:'#acefcf',shade:'#90dfba',edge:'#ecfff4',dark:'#5fb796',dash:'#dafbe9',face:'#ff9fc9',face2:'#ef84b5'},
    fg:['#f07aac','#ff92bf','#d9558f','#9c2f62'], trees:['#ffe08a','#9ff0cf','#c9a6ff'] },
  { name:'Crystal Peaks', style:'mountains', music:'dreamy', sky:['#8ea4ff','#a1b4ff','#b5c4ff','#c9d3ff','#dde2ff','#efeeff'], orbCol:['#ffffff','#f2f4ff','#e2e8ff'], peaks:true,
    far:['#d8e2ff','#aebdf5'], mid:['#bff2e9','#97dccf'], hedge:['#8f7cf0','#4c3fa0','#d9f5ff'],
    rib:{lit:'#dbf8f3',base:'#c2efe9',shade:'#a6dfda',edge:'#f4fffd',dark:'#6fb4b4',dash:'#e6fbf8',face:'#93a5f2',face2:'#7e8fe2'},
    fg:['#7383d9','#8394e4','#5d6bc4','#3b4596'], trees:['#d9f5ff','#ffc2e3','#c9b3ff'] },
  { name:'Cloud Summit', style:'mountains', music:'happy', sky:['#ffb3b8','#ffc2b8','#ffd0bc','#ffdec6','#ffead6','#fff4ea'], orbCol:['#fffbe8','#fff0c2','#ffe39a'], peaks:true, rainbow:true,
    far:['#ead8ff','#c9b2f2'], mid:['#c8e8ff','#a2cdf2'], hedge:['#a98cf0','#5a48a8','#ffe6f2'],
    rib:{lit:'#f4ecff',base:'#e2d6f8',shade:'#cbbdee',edge:'#ffffff',dark:'#8f7cc6',dash:'#efe6ff',face:'#a28fdc',face2:'#8a77c6'},
    fg:['#8270cc','#927fd8','#6c5abb','#41357e'], trees:['#ffffff','#ffc2e3','#c9f0ff'] },
  { name:'Spooky Hollow', style:'spooky', music:'spooky', sky:['#17141f','#1f1a2a','#2a2234','#382a3e','#463245','#553a4a'], orbCol:['#ffd27a','#ffb347','#ff9a3a'], night:true, spooky:true,
    far:['#3a2c34','#2a2028'], mid:['#4e3a30','#3e2e26'], hedge:['#3a2a26','#1a1210','#ff9a3a'],
    rib:{lit:'#9a7c5c',base:'#86694c',shade:'#70573e',edge:'#b39672',dark:'#4a3626',dash:'#9d7f5f',face:'#5c4532',face2:'#4a3727'},
    fg:['#3a2c22','#4a382a','#2a1f18','#120c08'], trees:['#241a22','#241a22','#241a22'], goo:['#3fae4f','#7fe38a','#c8ffcc'] },
];
const ROMAN=['','','II','III','IV','V','VI','VII','VIII','IX','X'];
const isBoss = L => L%CONFIG.bossEvery===0;
const bossKind = L => (L/CONFIG.bossEvery)%2===1 ? 'queen' : 'dragon';
const themeOf = L => THEMES[(L-1)%THEMES.length];
function levelName(L){ const T=themeOf(L), lap=Math.floor((L-1)/THEMES.length)+1; return T.name+(lap>1?' '+(ROMAN[lap]||lap):''); }
function levelStyle(L){ const T=themeOf(L), lap=Math.floor((L-1)/THEMES.length); let s=T.style; if(s==='classic' && lap%2===1) s='speedway'; return s; }

const cloudSpr = makeSprite(36,15,['#ffffff','#f3eaff'],x=>{
  circ(x,'#ffffff',[[8,9,5],[15,6.5,6],[23,7,5.5],[29,10,4]]); x.fillRect(6,9,24,4.5); x.fillStyle='#f3eaff'; x.fillRect(7,12,22,2);
},null,'#d9c6ff');
const midTree = c => makeSprite(16,24,[c,'#9a6bb8'],x=>{ x.fillStyle='#9a6bb8'; x.fillRect(7,13,2.5,10); circ(x,c,[[8,8,6.5],[4.5,10.5,3.8],[11.5,10.5,3.8]]); },
  x=>smiley(x,6,6,3),'#6e4a8c');
const happyTree = c => makeSprite(22,30,[c,'#9a6bb8'],x=>{ x.fillStyle='#9a6bb8'; x.fillRect(9.5,16,3.5,13.5); circ(x,c,[[11,10,8.5],[4.8,13,4.6],[17.2,13,4.6]]); },
  x=>{ smiley(x,9,8,4); x.fillStyle='#ffffff'; x.fillRect(6,5,2,1); },'#6e4a8c');
// spooky trees: twisty black branches, the big ones have glowing faces
const deadTree=(w,h,face)=>makeSprite(w,h,['#241a22'],x=>{
  x.strokeStyle='#241a22'; x.lineCap='round'; x.lineJoin='round'; const cx=w/2;
  x.lineWidth=w*.26; x.beginPath(); x.moveTo(cx,h-.5); x.lineTo(cx-.5,h*.4); x.stroke();
  x.lineWidth=Math.max(1.4,w*.09); x.beginPath();
  x.moveTo(cx,h*.6); x.lineTo(cx-w*.3,h*.36); x.lineTo(cx-w*.42,h*.14);
  x.moveTo(cx-w*.2,h*.47); x.lineTo(cx-w*.4,h*.5);
  x.moveTo(cx,h*.5); x.lineTo(cx+w*.28,h*.28); x.lineTo(cx+w*.42,h*.1);
  x.moveTo(cx+w*.16,h*.38); x.lineTo(cx+w*.42,h*.42);
  x.moveTo(cx-.5,h*.42); x.lineTo(cx-w*.08,h*.06); x.stroke();
},x=>{ if(face){ const cx=Math.round(w/2), ey=Math.round(h*.62); x.fillStyle='#ffb347'; x.fillRect(cx-2,ey,1,1); x.fillRect(cx+1,ey,1,1); x.fillRect(cx-1,ey+2,2,1); } },'#6e5470');
const GNOMES=[['#ff5fa8','#7fb8ff'],['#2fc796','#ff9bd0'],['#9a6bff','#ffd76a']];
const gnomeSprite=(hat,shirt,cheer)=>makeSprite(13,18,[hat,'#ffd9c2','#fff6fb',shirt,'#8a5a7a'],x=>{
  x.translate(1,1);
  x.fillStyle=shirt; x.fillRect(2,11,7,4);
  if(cheer){ x.fillRect(.2,5.5,1.6,6); x.fillRect(9.2,5.5,1.6,6); x.fillStyle='#ffd9c2'; x.fillRect(.2,4.5,1.6,1.6); x.fillRect(9.2,4.5,1.6,1.6); }
  x.fillStyle='#ffd9c2'; x.beginPath(); x.ellipse(5.5,8.3,2.8,1.9,0,0,7); x.fill();
  x.fillStyle='#fff6fb'; x.beginPath(); x.ellipse(5.5,11.6,3.2,3,0,0,7); x.fill();
  poly(x,hat,[5.5,0.2,9.6,7.4,1.4,7.4]);
  x.fillStyle='#8a5a7a'; x.fillRect(2,15,3,2); x.fillRect(6,15,3,2);
}, x=>{ x.fillStyle=OUT; x.fillRect(4,8,1,1); x.fillRect(7,8,1,1); if(cheer){ x.fillRect(5,10,2,1); } x.fillStyle='#ff8fbf'; x.fillRect(5,9,1,1); });
const gnomeSpr = GNOMES.map(([h,s])=>gnomeSprite(h,s,false)), gnomeCheer = GNOMES.map(([h,s])=>gnomeSprite(h,s,true));
const houseSpr = ['#ff6fae','#9a6bff'].map(cap=>makeSprite(18,17,[cap,'#fff0e0','#ffd76a','#8a5a7a'],x=>{
  x.fillStyle='#fff0e0'; x.fillRect(4,7,10,9.5);
  x.fillStyle=cap; x.beginPath(); x.ellipse(9,7,8.5,6,0,Math.PI,0); x.fill(); x.fillRect(.5,6.5,17,1.5);
}, x=>{ x.fillStyle='#ffffff'; [[5,3],[9,2],[13,4],[2,6],[11,5]].forEach(([a,b])=>x.fillRect(a,b,2,1));
  x.fillStyle='#8a5a7a'; x.fillRect(8,11,3,5); x.fillStyle='#ffd76a'; x.fillRect(5,10,2,2); x.fillRect(12,10,2,2); x.fillRect(10,13,1,1); }));
const castleOf=(wall,tower,roof,win,door,out)=>makeSprite(34,30,[wall,tower,roof],x=>{
  x.fillStyle=wall; x.fillRect(6,15,22,15);
  x.fillStyle=tower; x.fillRect(2,11,7,19); x.fillRect(25,11,7,19); x.fillRect(13,7,8,23);
  poly(x,roof,[5.5,2,1,11.5,10,11.5]); poly(x,roof,[28.5,2,24,11.5,33,11.5]); poly(x,roof,[17,0,12,7.5,22,7.5]);
}, x=>{ x.fillStyle=door; x.fillRect(15,23,4,7); x.fillStyle=win; x.fillRect(4,16,2,3); x.fillRect(28,16,2,3); x.fillRect(16,12,2,3); x.fillStyle='#ffd76a'; x.fillRect(16,0,2,1); }, out);
const castleSpr = castleOf('#efe2ff','#d6c2ff','#ff9bd0','#8a6bbf','#8a6bbf','#7a5aa8');
const castleHaunted = castleOf('#4a4058','#3a3248','#2a2236','#ffb347','#1a1420','#140e18');
const pumpkinSprite=lit=>padSprite(12,10,['#ff8a2a','#e0661a','#3f8f3a'],x=>{ circ(x,'#e0661a',[[3.5,5.5,3.4],[8.5,5.5,3.4]]); circ(x,'#ff8a2a',[[6,5.5,3.8]]); x.fillStyle='#3f8f3a'; x.fillRect(5.4,0,1.6,2.4); },
  x=>{ x.fillStyle=lit?'#ffe066':'#3a1a0a'; x.fillRect(4,5,2,1); x.fillRect(8,5,2,1); x.fillRect(4,8,6,1); x.fillRect(5,9,1,1); x.fillRect(8,9,1,1); }, '#2a1208');
const pumpkinLit = pumpkinSprite(true), pumpkinDark = pumpkinSprite(false);
const tombSpr = padSprite(10,12,['#9a93a8','#7d7690'],x=>{ x.fillStyle='#9a93a8'; x.beginPath(); x.moveTo(.5,12); x.lineTo(.5,4.5); x.arc(5,4.5,4.5,Math.PI,0); x.lineTo(9.5,12); x.fill(); x.fillStyle='#7d7690'; x.fillRect(.5,10.5,9,1.5); },
  x=>{ x.fillStyle='#5d5670'; x.fillRect(5,4,1,5); x.fillRect(4,5,3,1); }, '#2a2236');
const hurdleSpooky = makeSprite(12,15,['#7a5a44','#5a4232'],x=>{
  x.fillStyle='#7a5a44'; x.fillRect(1.5,2.5,2.2,12); x.fillRect(8.3,4,2.2,10.5); x.fillStyle='#5a4232';
  x.save(); x.translate(6,6.5); x.rotate(-.15); x.fillRect(-5,-1,10,2); x.restore(); x.save(); x.translate(6,10.5); x.rotate(.12); x.fillRect(-5,-1,10,2); x.restore();
}, x=>{ x.fillStyle='#c8b8a0'; x.fillRect(2,6,1,1); x.fillRect(9,10,1,1); x.fillStyle='#ff9a3a'; x.fillRect(2,1,1,1); });
const brambleSpooky = makeSprite(14,12,['#2e2230','#4a3a50'],x=>{
  circ(x,'#2e2230',[[4.5,7.5,4.2],[9.5,7,4.5],[7,4.5,3.6]]); x.fillRect(1,8,12,3.5);
  x.fillStyle='#4a3a50'; x.beginPath(); x.arc(7,4.5,2,0,7); x.fill();
}, x=>{ x.fillStyle='#a08aa8'; [[0,6],[3,2],[7,0],[11,2],[13,6],[5,5],[9,4]].forEach(([a,b])=>x.fillRect(a,b,1,1));
  x.fillStyle='#7fffb0'; x.fillRect(4,8,1,1); x.fillRect(10,9,1,1); }, '#0e0a10');

function makeSky(T){
  const c=document.createElement('canvas'); c.width=W; c.height=H; const s=c.getContext('2d');
  const ys=[0,34,58,78,96,112];
  T.sky.forEach((col,i)=>{ const y=ys[i], y2=i<5?ys[i+1]:H; s.fillStyle=col; s.fillRect(0,y,W,y2-y);
    if(i>0) for(let x=0;x<W;x++){ if(x%4===0) s.fillRect(x,y-2,1,1); if(x%2===(y&1)) s.fillRect(x,y-1,1,1); } });
  if(T.night) for(let i=0;i<(T.spooky?40:80);i++){ const h=hash(i*31+7), x=h%W, y=(h>>>9)%92; s.fillStyle=i%5?'#fff4d6':'#ffc2e0'; s.fillRect(x,y,1,1); if(i%9===0 && !T.spooky){ s.fillRect(x-1,y,3,1); s.fillRect(x,y-1,1,3); } }
  if(T.rainbow){ ['#ffb3cf','#ffd2b0','#fff0b8','#c8f5dc','#c4dcff','#dcc8ff'].forEach((col,i)=>{ const R=74-i*3; s.fillStyle=col;
    for(let dx=-R;dx<=R;dx++){ s.fillRect(70+dx,Math.round(132-Math.sqrt(R*R-dx*dx)),1,3); } }); }
  const cx=238, cy=60, r=T.spooky?20:T.night?15:26;
  for(let dy=-r;dy<=r;dy++){ const hw=Math.floor(Math.sqrt(r*r-dy*dy)); if(!T.night && dy>3 && (dy%6)<Math.floor(dy/7)) continue;
    s.fillStyle=dy<-r/2?T.orbCol[0]:dy<4?T.orbCol[1]:T.orbCol[2]; s.fillRect(cx-hw,cy+dy,hw*2,1); }
  if(T.night && !T.spooky){ s.fillStyle='#e8d49a'; [[233,54,3],[241,63,2],[235,66,2]].forEach(([a,b,w])=>s.fillRect(a,b,w,w)); }
  if(T.spooky){ s.fillStyle='#d9852a'; [[231,52,4],[243,60,3],[234,67,3]].forEach(([a,b,w])=>s.fillRect(a,b,w,w));
    s.fillStyle='#241a22'; for(let i=0;i<46;i++){ const a=i/46*Math.PI; s.fillRect(Math.round(cx-30+i*1.3),Math.round(cy+6-Math.sin(a)*8+Math.sin(i*.9)*1.5),2,1); } }
  return c;
}
const ASSET={};
function themeAssets(i){
  if(ASSET[i]) return ASSET[i];
  const T=THEMES[i];
  const hedge=makeSprite(22,14,[T.hedge[0]],x=>{ circ(x,T.hedge[0],[[6,9,5.5],[12,6.5,6.5],[17,9,5]]); x.fillRect(4,9,15,5); },
    x=>{ x.fillStyle=T.hedge[2]; [[5,7],[11,4],[15,8],[9,10],[18,11]].forEach(([a,b])=>x.fillRect(a,b,1,1)); }, T.hedge[1]);
  const bush=happy=>makeSprite(26,14,[T.fg[2]],x=>{ circ(x,T.fg[2],[[7,9,6],[14,6.5,7],[20,9,5.5]]); x.fillRect(5,9,18,5); },
    x=>{ if(happy) smiley(x,12,5,3); else { x.fillStyle=T.spooky?'#6e5440':'#ff8fc8'; [[8,6],[14,3],[19,7],[11,9]].forEach(([a,b])=>x.fillRect(a,b,1,1)); x.fillStyle=T.spooky?'#ff9a3a':'#fff6fb'; x.fillRect(16,10,1,1); } }, T.fg[3]);
  return ASSET[i]={ sky:makeSky(T), hedge, bush:bush(false), happyBush:bush(!T.spooky),
    trees: T.spooky ? [deadTree(16,24,false),deadTree(18,24,false),deadTree(16,24,false)] : T.trees.map(midTree),
    big: T.spooky ? [deadTree(22,30,true),deadTree(24,30,true),deadTree(22,30,false)] : T.trees.map(happyTree),
    castle: T.spooky ? castleHaunted : castleSpr };
}
let TH=THEMES[0], AS=themeAssets(0), RIB=TH.rib;
function setThemeIndex(i){ TH=THEMES[i]; AS=themeAssets(i); RIB=TH.rib; }
const setTheme = L => setThemeIndex((L-1)%THEMES.length);

/* ---------------- Track: generated per level, harder each time ---------------- */
const HT = new Float32Array(16000);
const goos=[], pads=[], shrooms=[], hurdles=[], brambles=[], clouds=[], gems=[], orbs=[];
const ALL=[0,1,2];
let trackStyle='classic';
function roll(a,w,h){ for(let i=0;i<=w;i++) HT[a+i]+=h*(1-Math.cos(2*Math.PI*i/w))/2; }
function kick(a,w,h,d){ for(let i=0;i<=w;i++){ const t=i/w; HT[a+i]+=h*t*t; } for(let i=1;i<=d;i++) HT[a+w+i]+=h*(1+Math.cos(Math.PI*i/d))/2; }
function table(a,r,p,f,h){ for(let i=0;i<=r;i++) HT[a+i]+=h*(1-Math.cos(Math.PI*i/r))/2; for(let i=1;i<=p;i++) HT[a+r+i]+=h; for(let i=1;i<=f;i++) HT[a+r+p+i]+=h*(1+Math.cos(Math.PI*i/f))/2; }
function moguls(a,n,w,h){ for(let k=0;k<n;k++) roll(a+k*w,w,h); }
// smooth hill through control points [dx, height]; returns the x where it ends (back at height 0)
function profile(a,pts){ let x0=a, h0=0; const xs=[];
  for(const [dx,h] of pts){ const x1=x0+dx; for(let i=x0;i<x1;i++){ const t=(i-x0)/dx; HT[i]+=h0+(h-h0)*(1-Math.cos(Math.PI*t))/2; } x0=x1; h0=h; xs.push(x1); }
  return xs; }
const fence=(x,lanes=ALL)=>hurdles.push({x:Math.round(x),lanes});
const thorns=(x,len,lanes=ALL)=>brambles.push({x:Math.round(x),len:Math.round(len),lanes});
function buildTrack(L){
  HT.fill(0); for(const a of [goos,pads,shrooms,hurdles,brambles,clouds,gems,orbs]) a.length=0;
  let seed=L*7919+17;
  const R=()=>{ seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff; return seed/0x7fffffff; };
  const ri=(a,b)=>a+Math.floor(R()*(b-a+1)), pick=a=>a[Math.floor(R()*a.length)];
  const d=Math.min(1,(L-1)/CONFIG.levels.rampLevels), boss=isBoss(L), style=levelStyle(L);
  trackStyle=style;
  const thornMax=Math.round(45+55*d);
  const some=()=>{ const n=R()<.25+.45*d?3:R()<.55?2:1, l=[0,1,2]; while(l.length>n) l.splice(Math.floor(R()*l.length),1); return l; };
  const notAll=()=>{ const l=[0,1,2]; l.splice(ri(0,2),1); if(R()<.45) l.splice(ri(0,1),1); return l; };
  const gem=(x,lane,off,abs=false,big=false)=>gems.push({x:Math.round(x),ly:lane,off,abs,v:big?5:1,big,c:hash(Math.round(x)+lane)%3});
  const orb=(x,lane,off,abs=false)=>{ const r=R(); orbs.push({x:Math.round(x),ly:lane,off,abs,type:r<.4?'shield':r<.72?'magnet':'super'}); };
  const autoClouds=[];
  FINISH_X=(style==='speedway'?8800:style==='mountains'?8400:6400)+250*Math.min(L-1,6); TRACK_LEN=FINISH_X+600;
  let x=300; fence(x); gem(x,1,26); x+=150;
  let pats;
  if(style==='speedway') pats=['bigroll','bigroll','downramp','swerve','bigroll','kick','cloud'];
  else if(style==='mountains') pats=['peak','peak','ridge','ridge','moguls','kick'];
  else pats=['rolls','kick','kick','slalom','table','moguls','shroom','fences','kickGoo','cloud'];
  if(style==='spooky') pats.push('kickGoo','rolls');
  if(boss && style==='classic') pats.push('cloud','cloud');
  let lastPat='';
  while(x<FINISH_X-560){
    let p=pick(pats); if(p===lastPat) p=pick(pats); lastPat=p;
    if(p==='rolls'){ const w=ri(120,180),h=ri(14,30); roll(x,w,h); roll(x+w,w,h); gem(x+w/2,1,12); gem(x+w*1.5,1,12);
      if(R()<.35+.45*d){ const ls=some(); fence(x+w,ls); gem(x+w,ls[0],26); } x+=2*w; }
    else if(p==='kick'){ const w=ri(80,110),h=ri(26,44),dr=ri(60,90); kick(x,w,h,dr); const len=ri(35,thornMax), tx=x+w+dr+ri(-5,15), ls=R()<.45+.45*d?ALL:some();
      thorns(tx,len,ls); const gl=pick(ls); for(let i=0;i<5;i++) gem(tx-10+(len+20)*i/4,gl,26+16*Math.sin(Math.PI*i/4));
      if(R()<.3) gem(x+w+20,pick(ls),58,false,true);
      x+=w+dr+len+50; }
    else if(p==='kickGoo'){ const w=ri(90,110),h=ri(30,40),dr=ri(70,85); kick(x,w,h,dr); const gx=x+w+dr+5, gl=ri(100,160); goos.push({x:gx,len:gl,lanes:R()<.5?ALL:some()});
      for(let i=0;i<4;i++) gem(gx+gl*i/3,ri(0,2),20); x+=w+dr+190; if(R()<.5) fence(x-20,some()); }
    else if(p==='slalom'){ const n=ri(3,3+Math.round(2*d)); let gx=x; for(let i=0;i<n;i++){ const ls=d>.4&&R()<.5?some():[ri(0,2)]; fence(gx,ls); gem(gx,ls[0],26); gx+=ri(55,75)-Math.round(12*d); } x=gx+40; }
    else if(p==='table'){ const r=ri(100,130),pl=ri(100,150),f=ri(110,140),h=ri(34,46); table(x,r,pl,f,h); const tl=Math.max(20,Math.min(pl-35,ri(35,thornMax)));
      thorns(x+r+20,tl,d>.3?ALL:some()); const gl=ri(0,2); for(let i=0;i<4;i++) gem(x+r+10+(tl+20)*i/3,gl,24); x+=r+pl+f; }
    else if(p==='moguls'){ const n=ri(4,6),w=ri(55,65),h=ri(8,11); moguls(x,n,w,h); for(let k=1;k<n;k++){ if(R()<.3+.4*d){ const l=ri(0,2); fence(x+k*w,[l]); gem(x+k*w,l,26); } else gem(x+k*w-w/2,ri(0,2),14); } x+=n*w; }
    else if(p==='shroom'){ const l=ri(0,2); shrooms.push({x,lane:l}); fence(x+ri(60,80),ALL); gem(x+40,l,40); gem(x+70,l,52,false,true);
      if(R()<.4+.3*d) thorns(x+ri(95,110),ri(30,50),ALL); x+=190; }
    else if(p==='fences'){ fence(x,ALL); const g=ri(85,120)-Math.round(20*d); fence(x+g,ALL); gem(x,1,26); gem(x+g,1,26);
      if(d>.3&&R()<.6){ fence(x+2*g,some()); } x+=2*g+60; }
    else if(p==='cloud'){ const w=ri(90,110),h=ri(36,44),dr=ri(70,90); kick(x,w,h,dr); const lip=x+w, cx0=lip+ri(30,50), cl=ri(150,220), ch=ri(56,64);
      clouds.push({x:cx0,len:cl,h:ch}); const ts=lip+dr+5; thorns(ts,Math.max(40,cx0+cl-10-ts),ALL);
      const gl=ri(0,2); for(let i=0;i<5;i++) gem(cx0+20+(cl-40)*i/4,gl,ch+9,true);
      if(R()<.6) orb(cx0+cl*.5,(gl+1)%3,ch+10,true); else gem(cx0+cl*.5,(gl+1)%3,ch+11,true,true);
      x=cx0+cl+70; }
    // ---- speedway: long downhills to build big speed, then dodge at full tilt
    else if(p==='bigroll'){ const w=ri(340,480), h=ri(48,80); roll(x,w,h); const top=x+w/2, gl=ri(0,2);
      for(let i=0;i<7;i++) gem(top+20+i*26,gl,8);
      pads.push({x:Math.round(top+w*.12),lane:ri(0,2)});
      const after=x+w+ri(40,90), ls=notAll(); fence(after,ls); if(R()<.4+.4*d) fence(after+ri(110,160),notAll());
      for(let l=0;l<3;l++) if(!ls.includes(l)) gem(after,l,8);
      x+=w+170; }
    else if(p==='downramp'){ const hh=ri(60,85), xs=profile(x,[[ri(160,200),hh],[ri(80,130),hh],[ri(380,480),0]]); const end=xs[2];
      pads.push({x:Math.round(xs[1]+60),lane:0},{x:Math.round(xs[1]+60),lane:2},{x:Math.round(xs[1]+200),lane:1});
      const kw=ri(80,95), kh=ri(28,36), kd=ri(60,70); kick(end+10,kw,kh,kd);
      const tx=end+10+kw+kd+ri(0,20), tl=ri(90,150); thorns(tx,tl,ALL);
      const gl=ri(0,2); for(let i=0;i<6;i++) gem(tx+tl*i/5,gl,30+24*Math.sin(Math.PI*i/5));
      if(R()<.5) orb(xs[0]+40,ri(0,2),14);
      x=tx+tl+90; }
    else if(p==='swerve'){ let sx=x; const n=ri(4,5+Math.round(2*d));
      pads.push({x:sx-40,lane:ri(0,2)});
      for(let i=0;i<n;i++){ const ls=notAll(); fence(sx,ls); for(let l=0;l<3;l++) if(!ls.includes(l)) gem(sx,l,8); sx+=ri(110,150)-Math.round(20*d); }
      x=sx+60; }
    // ---- mountains: tall ridges with dips; slow hike up, wild ride down
    else if(p==='peak'){ const h1=ri(70,110), h2=ri(150,230);
      const xs=profile(x,[[ri(170,230),h1],[ri(40,70),h1-ri(15,30)],[ri(150,210),h2],[ri(40,70),h2+ri(0,10)],[ri(150,220),ri(20,40)],[ri(70,100),0]]);
      const summit=xs[3]; for(let i=0;i<4;i++) gem(xs[2]+(summit-xs[2])*i/3,ri(0,2),10);
      gem(summit+40,1,48,false,true); if(R()<.6) orb(xs[0]+20,ri(0,2),14);
      autoClouds.push({x:summit+30,len:ri(120,170),lane:ri(0,2)});
      const bx=xs[1]-30; thorns(bx,60,R()<.5+.4*d?ALL:some());
      const foot=xs[4]+ri(10,40); thorns(foot,ri(40,thornMax),some());
      x=xs[5]+60; }
    else if(p==='ridge'){ const a=ri(80,120), b=ri(150,200), c=ri(220,280);
      const xs=profile(x,[[ri(190,230),a],[ri(80,100),a-ri(30,45)],[ri(150,180),b],[ri(80,100),b-ri(35,50)],[ri(150,180),c],[ri(50,70),c+4],[ri(200,250),ri(30,50)],[ri(80,100),0]]);
      thorns(xs[1]-25,50,ALL); thorns(xs[3]-25,50,ALL);
      for(const k of [0,2,4]) gem(xs[k],ri(0,2),40,false,k===4);
      for(let i=0;i<6;i++) gem(xs[5]+20+i*30,ri(0,2),18);
      autoClouds.push({x:xs[4]-60,len:ri(130,170),lane:ri(0,2)});
      if(R()<.5) orb(xs[2],ri(0,2),30);
      fence(xs[6]+ri(30,60),some());
      x=xs[7]+60; }
    const gapMin = style==='speedway'?160:70, gapMax = style==='speedway'?300:150;
    x+=ri(gapMin,gapMax)-(style==='speedway'?0:Math.round(55*d));
    if(R()<(style==='speedway'?.6:.4)) pads.push({x:x-35,lane:ri(0,2)});
    if(R()<.5){ const gl=ri(0,2); for(let i=0;i<4;i++) gem(x-150+i*14,gl,7); }
    if(R()<.22) orb(x-90,ri(0,2),12);
  }
  fence(FINISH_X-220,some());
  for(let pass=0;pass<2;pass++){ const c=HT.slice(0,TRACK_LEN+4); for(let i=2;i<TRACK_LEN-2;i++) HT[i]=(c[i-2]+c[i-1]+c[i]+c[i+1]+c[i+2])/5; }
  for(const ac of autoClouds){ let m=0; for(let i=ac.x;i<=ac.x+ac.len;i+=4) m=Math.max(m,heightAt(i)); const h=Math.round(m+22);
    clouds.push({x:ac.x,len:ac.len,h}); for(let i=0;i<4;i++) gem(ac.x+18+(ac.len-36)*i/3,ac.lane,h+9,true); }
  for(const g of gems){ g.alt=(g.abs?0:heightAt(g.x))+g.off; g.taken=false; g.pull=null; }
  for(const o of orbs){ o.alt=(o.abs?0:heightAt(o.x))+o.off; o.taken=false; }
}
function heightAt(x){ if(x<0||x>=TRACK_LEN) return 0; const i=x|0, f=x-i; return HT[i]+(HT[i+1]-HT[i])*f; }
function slopeAt(x){ return (heightAt(x+2)-heightAt(x-2))/4; }
function gooAt(x,lane){ for(const g of goos) if(x>=g.x && x<=g.x+g.len && g.lanes.includes(lane)) return true; return false; }
function brambleAt(x,lane){ for(const b of brambles) if(x>=b.x && x<=b.x+b.len && b.lanes.includes(lane)) return b; return null; }

