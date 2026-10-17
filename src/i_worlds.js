
/* =====================================================================
   WORLDS: every world has its own look AND its own rule
   bouncy mushrooms · sticky candy · swimming water · floaty space · hot lava · slippery ice
   slow castle · mirror controls · rainbow flips · backwards world · silly spiders · pumpkins · city · neon
   ===================================================================== */
const RULES = {
  none:{},
  bouncy:   { grav:.9, bounce:.62, tip:'BOUNCY! DIVE TO STOP BOUNCING' },
  sticky:   { top:.92, jump:.9, sticky:.12, tip:'STICKY CANDY! KEEP HOPPING' },
  swim:     { grav:.5, jump:.8, swim:true, tip:'SWIM! TAP JUMP IN THE WATER TO PADDLE UP' },
  pumpkins: { tip:'SO MANY PUMPKINS! JUMP JUMP JUMP' },
  hot:      { top:1.08, jump:1.12, tip:'HOT HOT HOOVES! EXTRA SPEED + BIG HOPS' },
  neon:     { top:1.06, tip:'NEON NIGHTS!' },
  space:    { grav:.33, jump:.8, tip:'SPACE! FLOAT FOREVER' },
  mirror:   { mirror:true, flipEvery:8, flipTime:4, invert:true, tip:'MIRROR WORLD: SUPER HARD BONUS! UP IS DOWN!' },
  ice:      { accel:.55, coast:.35, lane:.5, tip:'SLIPPERY ICE! WHEEEE' },
  rainbow:  { tip:'RAINBOW ROAD! RIDE THE RAINBOWS' },
  spiders:  { tip:'SILLY SPIDERS! DON\'T GET TICKLED' },
  castle:   { top:.86, tip:'CASTLE COURT: SLOW AND ROYAL' },
  city:     { tip:'BIG CITY! JUMP THE BUILDINGS' },
  backwards:{ backwards:true, tip:'SDRAWKCAB GNIHTYREVE' },
};
function worldRules(T){ return Object.assign({grav:1,jump:1,top:1,accel:1,coast:1,lane:1,bounce:0,sticky:0}, RULES[(T&&T.rule)||'none']||{}); }

/* ---------- world sprites ---------- */
const triw=u=>1-2*Math.abs(u-Math.floor(u)-.5);
const mushTree=(cap,w,h)=>makeSprite(w,h,[cap,'#fff0e0','#ffffff'],x=>{
  x.fillStyle='#fff0e0'; x.fillRect(w/2-w*.13,h*.42,w*.26,h*.58);
  x.fillStyle=cap; x.beginPath(); x.ellipse(w/2,h*.46,w*.48,h*.36,0,Math.PI,0); x.fill(); x.fillRect(w*.03,h*.44,w*.94,h*.06);
  circ(x,'#ffffff',[[w*.3,h*.26,w*.08],[w*.62,h*.18,w*.07],[w*.78,h*.34,w*.06],[w*.47,h*.36,w*.05]]);
}, x=>smiley(x,Math.round(w/2)-2,Math.round(h*.62),3), '#6e4a8c');
const coralSpr=(c,w,h)=>makeSprite(w,h,[c],x=>{ x.strokeStyle=c; x.lineCap='round'; x.lineWidth=2.4; x.beginPath();
  const cx=w/2; x.moveTo(cx,h-.5); x.lineTo(cx,h*.45); x.lineTo(cx-w*.28,h*.18); x.moveTo(cx,h*.6); x.lineTo(cx+w*.3,h*.3); x.lineTo(cx+w*.32,h*.08);
  x.moveTo(cx-w*.14,h*.32); x.lineTo(cx-w*.36,h*.4); x.moveTo(cx,h*.45); x.lineTo(cx+w*.04,h*.1); x.stroke();
  circ(x,c,[[cx-w*.28,h*.18,1.6],[cx+w*.32,h*.08,1.6],[cx+w*.04,h*.1,1.6]]); }, x=>smiley(x,Math.round(w/2)-2,Math.round(h*.62),3), '#1f4a6a');
const seaweedSpr=(c,w,h)=>makeSprite(w,h,[c,'#2fb98a'],x=>{ x.lineCap='round'; x.lineWidth=2.2;
  for(let k=0;k<3;k++){ x.strokeStyle=k===1?c:'#2fb98a'; x.beginPath(); const bx=w*(.25+.25*k); x.moveTo(bx,h);
    for(let y=h;y>h*(.1+.15*(k%2));y-=2) x.lineTo(bx+Math.sin(y*.35+k)*2.2,y); x.stroke(); } }, null, '#145650');
const snowPine=(c,w,h)=>makeSprite(w,h,[c,'#ffffff','#8a5a4a'],x=>{
  x.fillStyle='#8a5a4a'; x.fillRect(w/2-1.2,h*.78,2.4,h*.22);
  for(let k=0;k<3;k++){ const y0=h*(.08+.24*k), y1=y0+h*.36, hw=w*(.22+.12*k); poly(x,c,[w/2,y0,w/2+hw,y1,w/2-hw,y1]); poly(x,'#ffffff',[w/2,y0,w/2+hw*.45,y0+h*.12,w/2-hw*.45,y0+h*.12]); }
}, x=>smiley(x,Math.round(w/2)-2,Math.round(h*.6),3), '#3a5a7a');
const moonRock=(c,w,h)=>makeSprite(w,h,[c,'#8a88b0'],x=>{ x.fillStyle=c; x.beginPath(); x.ellipse(w/2,h*.62,w*.46,h*.38,0,0,7); x.fill();
  circ(x,'#8a88b0',[[w*.32,h*.55,w*.1],[w*.64,h*.7,w*.08],[w*.6,h*.42,w*.06]]); }, x=>smiley(x,Math.round(w/2)-2,Math.round(h*.5),3), '#3a3860');
const crystalSpr=(c,w,h)=>makeSprite(w,h,[c,'#ffffff'],x=>{ poly(x,c,[w*.5,0,w*.72,h*.3,w*.66,h,w*.34,h,w*.28,h*.3]);
  poly(x,c,[w*.15,h*.4,w*.32,h*.55,w*.3,h,w*.1,h]); poly(x,c,[w*.85,h*.35,w*.92,h,w*.7,h,w*.68,h*.5]); poly(x,'#ffffff',[w*.5,h*.06,w*.58,h*.3,w*.5,h*.8]); }, null, '#4a3f8a');
const lavaRock=(w,h)=>makeSprite(w,h,['#3a1812','#5a2618'],x=>{ x.fillStyle='#3a1812'; x.beginPath(); x.moveTo(0,h); x.lineTo(w*.2,h*.35); x.lineTo(w*.45,h*.15); x.lineTo(w*.7,h*.3); x.lineTo(w,h); x.fill(); },
  x=>{ x.fillStyle='#ff7a1a'; for(let i=0;i<5;i++){ const a=hash(i*17+w)%w, b=Math.round(h*.4+(hash(i*29+h)%Math.round(h*.5))); x.fillRect(a,b,1,2); } x.fillStyle='#ffe066'; x.fillRect(Math.round(w*.45),Math.round(h*.2),1,1); }, '#140604');
const volcanoSpr=(w,h)=>makeSprite(w,h,['#4a2016','#ff5a1a','#ffb347'],x=>{ poly(x,'#4a2016',[0,h,w*.38,h*.18,w*.62,h*.18,w,h]);
  poly(x,'#ff5a1a',[w*.38,h*.18,w*.62,h*.18,w*.58,h*.4,w*.5,h*.3,w*.44,h*.5]); x.fillStyle='#ffb347'; x.fillRect(w*.42,h*.14,w*.16,h*.06); }, null, '#140604');
const neonPalm=(w,h)=>makeSprite(w,h,['#1c1236','#ff2fa8'],x=>{ x.fillStyle='#1c1236'; x.fillRect(w/2-1,h*.3,2,h*.7);
  x.strokeStyle='#ff2fa8'; x.lineWidth=1.6; x.beginPath(); for(const [a,b] of [[-.45,.12],[.45,.12],[-.4,.32],[.42,.3],[0,0]]){ x.moveTo(w/2,h*.3); x.quadraticCurveTo(w/2+a*w*.6,h*(b-.02),w/2+a*w,h*(b+.15)); } x.stroke(); },
  x=>{ x.fillStyle='#fff23a'; x.fillRect(Math.round(w/2),Math.round(h*.28),1,1); }, '#ff7fd0');
const neonTower=(w,h)=>makeSprite(w,h,['#1c1236'],x=>{ x.fillStyle='#1c1236'; x.fillRect(1,h*.15,w-2,h*.85); x.fillRect(w/2-1,0,2,h*.15); },
  x=>{ for(let y=Math.round(h*.22);y<h-2;y+=3){ for(let xx=3;xx<w-3;xx+=3){ const q=hash(xx*31+y*7+w); if(q%3) continue; x.fillStyle=q%2?'#ff2fa8':'#fff23a'; x.fillRect(xx,y,2,1); } } x.fillStyle='#4ff0ff'; x.fillRect(Math.round(w/2),0,1,1); }, '#ff2fa8');
const cityBlock=(w,h,wall,win)=>makeSprite(w,h,[wall],x=>{ x.fillStyle=wall; x.fillRect(.5,h*.1,w-1,h*.9); x.fillRect(w*.3,0,w*.4,h*.12); },
  x=>{ for(let y=Math.round(h*.2);y<h-3;y+=4) for(let xx=2;xx<w-2;xx+=3){ x.fillStyle=hash(xx*13+y*5+w)%4?win:'#4a4a5a'; x.fillRect(xx,y,2,2); } x.fillStyle='#4a4a5a'; x.fillRect(Math.round(w/2)-1,h-4,3,4); }, '#3a3a4a');
const towerSpr=(w,h,roof)=>makeSprite(w,h,['#d8cee6',roof,'#ffd76a'],x=>{ x.fillStyle='#d8cee6'; x.fillRect(w*.2,h*.3,w*.6,h*.7);
  poly(x,roof,[w*.5,h*.02,w*.08,h*.32,w*.92,h*.32]); x.fillStyle='#ffd76a'; x.fillRect(w*.5,0,w*.25,h*.08); },
  x=>{ x.fillStyle='#8a7ea8'; x.fillRect(Math.round(w*.45),Math.round(h*.5),2,3); x.fillRect(Math.round(w*.45),h-4,2,4); }, '#5a4e7a');
const webTree=(w,h)=>{ const c=deadTree(w,h,false), x=c.getContext('2d'); x.fillStyle='rgba(255,255,255,.85)';
  const cx=Math.round(w*.25), cy=Math.round(h*.3); for(let k=0;k<8;k++){ const a=k*Math.PI/4; for(let r=1;r<7;r++) x.fillRect(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r),1,1); }
  for(const r of [3,6]) for(let k=0;k<16;k++){ const a=k*Math.PI/8; x.fillRect(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r),1,1); } return c; };

// obstacles per world (hurdles = jump over; brambles = patches you must clear)
const HURDLE_SPR = {
  pumpkin: pumpkinLit,
  shroom:  makeSprite(13,13,['#ff4f6f','#fff0e0','#ffffff'],x=>{ x.fillStyle='#fff0e0'; x.fillRect(4.5,6,4,7); x.fillStyle='#ff4f6f'; x.beginPath(); x.ellipse(6.5,6.5,6,5.5,0,Math.PI,0); x.fill(); x.fillRect(.5,6,12,1.5); circ(x,'#ffffff',[[4,3.5,1.2],[8.5,3,1],[10.5,5,.9]]); }, x=>{ x.fillStyle=OUT; x.fillRect(5,9,1,1); x.fillRect(7,9,1,1); }),
  clam:    makeSprite(14,11,['#ffc2e3','#ff9fcd','#ffffff'],x=>{ x.fillStyle='#ff9fcd'; x.beginPath(); x.ellipse(7,9,6.5,2.5,0,0,7); x.fill(); x.fillStyle='#ffc2e3'; x.beginPath(); x.ellipse(7,7,6.5,5.5,0,Math.PI,0); x.fill(); circ(x,'#ffffff',[[7,8,1.6]]); }, x=>{ x.fillStyle='#ff6fae'; for(const a of [3,5,7,9,11]) x.fillRect(a,3,1,3); }),
  magma:   lavaRock(13,12),
  neon:    makeSprite(14,12,['#1c1236','#ff2fa8','#fff23a'],x=>{ x.fillStyle='#1c1236'; x.fillRect(1,2,12,7); x.fillRect(2,9,2,3); x.fillRect(10,9,2,3); }, x=>{ for(let i=0;i<6;i++){ x.fillStyle=i%2?'#fff23a':'#ff2fa8'; x.fillRect(2+i*2,3,2,5); } }, '#ff2fa8'),
  meteor:  makeSprite(13,12,['#8a7a9a','#5a4e6a','#ffb347'],x=>{ circ(x,'#8a7a9a',[[6.5,7,5.2]]); circ(x,'#5a4e6a',[[4.5,6,1.4],[8.5,8.5,1.2]]); }, x=>{ x.fillStyle='#ffb347'; x.fillRect(11,3,1,1); x.fillRect(12,1,1,1); }),
  iceblock:makeSprite(13,12,['#c8ecff','#e8f8ff','#ffffff'],x=>{ x.fillStyle='#c8ecff'; x.fillRect(.5,1.5,12,10.5); x.fillStyle='#e8f8ff'; x.fillRect(1.5,2.5,5,5); }, x=>{ x.fillStyle='#ffffff'; x.fillRect(2,3,2,1); x.fillRect(2,4,1,1); x.fillStyle='#8fc8ea'; x.fillRect(8,7,3,1); }, '#4a7aa0'),
  wall:    makeSprite(14,12,['#d8cee6','#b8aed0'],x=>{ x.fillStyle='#d8cee6'; x.fillRect(.5,3,13,9); x.fillRect(.5,.5,3,3); x.fillRect(5.5,.5,3,3); x.fillRect(10.5,.5,3,3); }, x=>{ x.fillStyle='#968ab4'; for(let y=5;y<12;y+=3) x.fillRect(1,y,12,1); x.fillRect(5,6,1,2); x.fillRect(9,9,1,2); }, '#5a4e7a'),
  crystal: crystalSpr('#c9b3ff',11,13),
  chrome:  makeSprite(13,13,['#ffffff','#c3cada','#7e889f'],x=>{ poly(x,'#c3cada',[6.5,.5,12.5,6.5,6.5,12.5,.5,6.5]); poly(x,'#ffffff',[6.5,.5,9.5,6.5,6.5,9,3.5,6.5]); poly(x,'#7e889f',[6.5,12.5,12.5,6.5,9.5,6.5,6.5,9]); }, x=>{ x.fillStyle='#9ae8ff'; x.fillRect(6,3,1,1); }, '#262c3c'),
  building:cityBlock(13,15,'#c98a6a','#ffe8a0'),
  candy:   makeSprite(12,15,['#ffffff','#ff4f6f'],x=>{ x.fillStyle='#ffffff'; x.fillRect(1.5,4,2.4,11); x.fillRect(8.3,4,2.4,11); x.fillRect(1.5,6,9,2.4); x.beginPath(); x.arc(4.5,4,3,Math.PI,0); x.lineWidth=2.4; x.strokeStyle='#ffffff'; x.stroke(); },
             x=>{ x.fillStyle='#ff4f6f'; for(let y=5;y<15;y+=3){ x.fillRect(2,y,2,1); x.fillRect(9,y,2,1); } x.fillRect(4,6,1,2); x.fillRect(7,6,1,2); }),
};
const BRAMBLE_SPR = {
  urchin: makeSprite(14,12,['#8a5ad6','#c48cf0'],x=>{ circ(x,'#8a5ad6',[[7,8,3.6]]); x.strokeStyle='#8a5ad6'; x.lineWidth=1; x.beginPath(); for(let k=0;k<9;k++){ const a=Math.PI+k*Math.PI/8; x.moveTo(7,8); x.lineTo(7+Math.cos(a)*6.5,8+Math.sin(a)*6.5); } x.stroke(); }, x=>{ x.fillStyle='#ffffff'; x.fillRect(6,7,1,1); x.fillRect(8,7,1,1); }),
  lava:   makeSprite(14,10,['#ff5a1a','#ffb347','#ffe066'],x=>{ x.fillStyle='#ff5a1a'; x.beginPath(); x.ellipse(7,7.5,6.8,2.6,0,0,7); x.fill(); circ(x,'#ffb347',[[4,6,1.6],[9.5,5.6,1.8]]); }, x=>{ x.fillStyle='#ffe066'; x.fillRect(9,4,1,1); x.fillRect(4,5,1,1); if(true){ x.fillRect(6,2,1,1); } }, '#7a1a0a'),
  icicle: makeSprite(14,12,['#c8ecff','#ffffff'],x=>{ for(const [a,h] of [[2,7],[5,11],[8,8],[11,10]]) poly(x,'#c8ecff',[a-1.6,12,a,12-h,a+1.6,12]); }, x=>{ x.fillStyle='#ffffff'; x.fillRect(5,3,1,3); x.fillRect(11,4,1,2); }, '#4a7aa0'),
  web:    makeSprite(14,12,['#ffffff'],x=>{ x.strokeStyle='#ffffff'; x.lineWidth=.8; x.beginPath(); for(let k=0;k<7;k++){ const a=Math.PI+k*Math.PI/6; x.moveTo(7,11); x.lineTo(7+Math.cos(a)*7,11+Math.sin(a)*10); } for(const r of [3,6,9]){ x.moveTo(7-r*.7,11); x.arc(7,11,r*.75,Math.PI,0); } x.stroke(); }, null, '#5a4e7a'),
  cones:  makeSprite(10,12,['#ff8a2a','#ffffff'],x=>{ poly(x,'#ff8a2a',[5,1,8.4,11,1.6,11]); x.fillStyle='#ff8a2a'; x.fillRect(.5,10.5,9,1.5); x.fillStyle='#ffffff'; x.fillRect(3.4,5,3.2,1.6); }, null, '#7a3a0a'),
  shard:  makeSprite(14,12,['#e0e6ff','#ffffff'],x=>{ poly(x,'#e0e6ff',[1,12,3,4,5,12]); poly(x,'#e0e6ff',[5,12,8,1,10,12]); poly(x,'#e0e6ff',[9,12,12,5,13,12]); }, x=>{ x.fillStyle='#ffffff'; x.fillRect(7,4,1,4); }, '#5a62a0'),
};
function hurdleSprite(){ return HURDLE_SPR[TH.hurdle] || (TH.spooky?hurdleSpooky:hurdleSpr); }
function brambleSprite(){ return BRAMBLE_SPR[TH.bramble] || (TH.spooky?brambleSpooky:brambleSpr); }

/* ---------- the new worlds ---------- */
const r6=(a,b,c,d,e,f)=>[a,b,c,d,e,f];
const NEW_WORLDS = {
  mushroom:{ name:'Mushroom Grove', style:'classic', music:'happy', rule:'bouncy', hurdle:'shroom', fx:'spores',
    sky:r6('#b99cf2','#c9a8f2','#d9b4f0','#e8c2ee','#f6d0ea','#ffdfe8'), orbCol:['#fff6fb','#ffe6f2','#ffd0e6'],
    far:['#c7a6e8','#a985d6'], mid:['#b6e8a8','#93d488'], hedge:['#ff6f91','#a8385a','#fff6fb'],
    rib:{lit:'#c9f2b0',base:'#b2e898',shade:'#98d880',edge:'#e8ffd8',dark:'#5fa84f',dash:'#d4f7c0',face:'#d9a07a',face2:'#c48a64'},
    fg:['#5fa84f','#6fb85c','#4a9440','#2f6a2a'], trees:['#ff5f7a','#ffb347','#c48cf0'],
    treesMk:T=>T.trees.map(c=>mushTree(c,16,22)), bigMk:T=>T.trees.map(c=>mushTree(c,24,30)) },
  water:{ name:'Splash Lagoon', noCastle:true, style:'classic', music:'dreamy', rule:'swim', hurdle:'clam', bramble:'urchin', fx:'bubbles',
    sky:r6('#1f5f9a','#2670ab','#2f84bd','#3a99cc','#4aafd8','#5fc4e2'), orbCol:['#e8fbff','#c8f2ff','#a8e8ff'],
    far:['#2c8fb0','#1f7596'], mid:['#3fb8a8','#2c9a8c'], hedge:['#ff7f8f','#a8405a','#fff0a8'],
    rib:{lit:'#ffe9b8',base:'#f6dca0',shade:'#e8c888',edge:'#fff6d8',dark:'#b8945a',dash:'#fff0c8',face:'#d8b478',face2:'#c49e62'},
    fg:['#2c8f86','#3aa396','#1f7a72','#145650'], trees:['#ff7f8f','#ffb36b','#c48cf0'],
    farFn:wx=>Math.round(100-12*Math.abs(Math.sin(wx*.02))-6*Math.sin(wx*.07)),
    treesMk:T=>T.trees.map(c=>coralSpr(c,16,22)), bigMk:T=>[seaweedSpr('#5fdc9a',20,30),coralSpr('#ff9fcd',22,28),seaweedSpr('#7fe3bd',18,30)],
    skyFx:s=>{ s.fillStyle='rgba(255,255,255,.18)'; for(let k=0;k<6;k++){ s.beginPath(); s.moveTo(20+k*55,0); s.lineTo(40+k*55,0); s.lineTo(10+k*55,120); s.lineTo(-6+k*55,120); s.fill(); }
      s.fillStyle='#8fe0f4'; for(let x=0;x<320;x++){ const y=Math.round(3+Math.sin(x*.12)*2); s.fillRect(x,y,1,2); } } },
  pumpkin:{ name:'Pumpkin Patch', style:'classic', music:'happy', rule:'pumpkins', hurdle:'pumpkin', fx:'leaves',
    sky:r6('#ff9f7a','#ffad7f','#ffbb88','#ffc994','#ffd6a3','#ffe4b8'), orbCol:['#fff4d6','#ffe6b0','#ffd88a'],
    far:['#d98a6a','#bf7056'], mid:['#e8b86a','#d49e50'], hedge:['#d9662a','#7a3414','#ffe066'],
    rib:{lit:'#e8d28a',base:'#dcc474',shade:'#c9ae5e',edge:'#f6e6b0',dark:'#8a6e2e',dash:'#efdc9c',face:'#a8784a',face2:'#93653a'},
    fg:['#8a6e2e','#9c7e3a','#735a22','#4a3814'], trees:['#ff8a2a','#ffd166','#e0461a'] },
  fire:{ name:'Ember Volcano', noCastle:true, style:'speedway', music:'funk', rule:'hot', hurdle:'magma', bramble:'lava', fx:'embers', night:true,
    sky:r6('#2a0f1a','#3d1420','#561a22','#7a2424','#a8342a','#d84a2a'), orbCol:['#ffe066','#ffb347','#ff7a1a'],
    far:['#4a1a1a','#2e0f12'], mid:['#6a2a22','#4e1c18'], hedge:['#3a1a14','#1a0a08','#ff7a1a'],
    rib:{lit:'#8a4a3a',base:'#76382c',shade:'#622a22',edge:'#ffb347',dark:'#2e100c',dash:'#ff7a1a',face:'#3a1812',face2:'#ff5a1a'},
    fg:['#3a1812','#4a2016','#2a0e0a','#140604'], trees:['#ff7a1a','#ffb347','#ff4f1a'], capCol:'#ff7a1a', capY:58,
    farFn:wx=>Math.round(104-Math.min(48,72*triw(wx*.0035))-4*triw(wx*.03)),
    treesMk:()=>[lavaRock(16,14),lavaRock(14,12),lavaRock(18,15)], bigMk:()=>[volcanoSpr(26,26),lavaRock(22,20),volcanoSpr(22,22)] },
  neon:{ name:'Neon Nights', noCastle:true, style:'speedway', music:'funk', rule:'neon', hurdle:'neon', fx:'neon', night:true, city:true, win:['#ff2fa8','#fff23a','#4ff0ff'],
    sky:r6('#120a24','#1a0e33','#241245','#331659','#46196b','#5c1b78'), orbCol:['#fff23a','#fff27a','#ffe94a'],
    far:['#2a1048','#1c0a33'], mid:['#3a1660','#2a0f48'], hedge:['#ff2fa8','#5a0f48','#fff23a'],
    rib:{lit:'#3a2a5a',base:'#2e2050',shade:'#241844',edge:'#ff4fd8',dark:'#140c28',dash:'#fff23a',face:'#1c1236',face2:'#ff2fa8'},
    fg:['#1c1236','#ff2fa8','#140c28','#0a0618'], trees:['#ff2fa8','#fff23a','#4ff0ff'],
    farFn:wx=>{ const b=Math.floor(wx/18); return wx-b*18<2 ? 108 : 104-(22+hash(b+3)%44); },
    treesMk:()=>[neonPalm(16,24),neonPalm(18,24),neonPalm(16,22)], bigMk:()=>[neonTower(16,32),neonTower(20,28),neonTower(14,30)] },
  space:{ name:'Starlight Space', noCastle:true, style:'mountains', music:'dreamy', rule:'space', hurdle:'meteor', bramble:'shard', fx:'space', night:true,
    sky:r6('#05040f','#0a0820','#120d30','#1a1240','#24164e','#2e1a5c'), orbCol:['#ffc2e0','#ff9fcf','#d97ab8'],
    far:['#6a6890','#4f4c72'], mid:['#8a88b0','#6c6a94'], hedge:['#9a98c0','#4a4870','#fff4a8'],
    rib:{lit:'#d8d6ee',base:'#c4c2e0',shade:'#aeacd0',edge:'#ffffff',dark:'#6e6c94',dash:'#e6e4f6',face:'#8a88b0',face2:'#76749c'},
    fg:['#6e6c94','#8a88b0','#5a5880','#3a3860'], trees:['#c4c2e0','#ffc2e0','#a6f2ff'],
    farFn:wx=>Math.round(104-8*triw(wx*.012)-5*Math.abs(Math.sin(wx*.05))),
    treesMk:T=>T.trees.map(c=>moonRock(c,16,14)), bigMk:()=>[crystalSpr('#a6f2ff',16,26),crystalSpr('#ffc2e0',18,24),crystalSpr('#c9b3ff',14,26)],
    skyFx:s=>{ // a ringed planet and a little moon
      const px=70, py=40; s.fillStyle='#7fd8ff'; for(let dy=-11;dy<=11;dy++){ const hw=Math.floor(Math.sqrt(121-dy*dy)); s.fillRect(px-hw,py+dy,hw*2,1); }
      s.fillStyle='#b8ecff'; for(let dy=-11;dy<=-4;dy++){ const hw=Math.floor(Math.sqrt(121-dy*dy)); s.fillRect(px-hw,py+dy,hw,1); }
      s.fillStyle='#fff4a8'; for(let a=0;a<Math.PI*2;a+=.02){ const x=Math.round(px+Math.cos(a)*19), y=Math.round(py+Math.sin(a)*4.5-Math.cos(a)*2); if(Math.sin(a)<0 && Math.abs(x-px)<11 && Math.abs(y-py)<11) continue; s.fillRect(x,y,1,1); }
      s.fillStyle='#e6e4f6'; for(let dy=-4;dy<=4;dy++){ const hw=Math.floor(Math.sqrt(16-dy*dy)); s.fillRect(150-hw,24+dy,hw*2,1); } } },
  mirror:{ name:'Mirror World', style:'classic', music:'silver', bonus:true, rule:'mirror', hurdle:'chrome', bramble:'shard', fx:'chrome', noCastle:true,
    sky:r6('#3c4256','#555d74','#727b94','#939cb4','#b6bdd0','#dce1ec'), orbCol:['#ffffff','#eef1f8','#cfd6e6'],
    far:['#9aa3ba','#6c7590'], mid:['#c3cada','#8f99b2'], hedge:['#a8b1c8','#3c4458','#ffffff'],
    rib:{lit:'#ffffff',base:'#dfe4ee',shade:'#b7bfd0',edge:'#ffffff',dark:'#5c6680',dash:'#9ae8ff',face:'#7e889f',face2:'#aab3c8'},
    fg:['#5c6680','#7e889f','#48516a','#262c3c'], trees:['#e8ecf4','#c3cada','#9ae8ff'],
    farFn:wx=>Math.round(104-Math.min(52,64*triw(wx*.006))-6*triw(wx*.04)), capCol:'#ffffff', capY:62,
    treesMk:()=>[crystalSpr('#e8ecf4',12,22),crystalSpr('#9ae8ff',12,20),crystalSpr('#c3cada',14,22)], bigMk:()=>[crystalSpr('#ffffff',18,30),crystalSpr('#9ae8ff',20,28),crystalSpr('#c3cada',18,30)],
    skyFx:s=>{ s.fillStyle='rgba(255,255,255,.22)'; for(let k=0;k<5;k++){ s.beginPath(); s.moveTo(k*80-40,0); s.lineTo(k*80-10,0); s.lineTo(k*80+60,180); s.lineTo(k*80+30,180); s.fill(); } } },
  ice:{ name:'Frosty Peaks', style:'mountains', music:'dreamy', rule:'ice', hurdle:'iceblock', bramble:'icicle', fx:'snow', peaks:true,
    sky:r6('#7fa8e8','#93b8ee','#a8c8f2','#bed6f6','#d4e4f9','#eaf2fc'), orbCol:['#ffffff','#f4f8ff','#e4eeff'],
    far:['#eef4ff','#c8d8f2'], mid:['#e0eef8','#c0d8ec'], hedge:['#bfe0f0','#5a8ab0','#ffffff'],
    rib:{lit:'#f0faff',base:'#dcf0fb',shade:'#c4e2f4',edge:'#ffffff',dark:'#7fb0d0',dash:'#ffffff',face:'#a8d0ea',face2:'#8cbcdc'},
    fg:['#c8e0f0','#dcecf8','#a8c8e0','#6a90b0'], trees:['#5fae9a','#4f9a8a','#6fbeaa'],
    treesMk:T=>T.trees.map(c=>snowPine(c,16,24)), bigMk:T=>T.trees.map(c=>snowPine(c,22,30)) },
  rainbow:{ name:'Rainbow Road', style:'speedway', music:'happy', rule:'rainbow', hurdle:'candy', fx:'rainbow', rainbow:true,
    sky:r6('#ffb3d1','#ffc8b8','#fff0b8','#c8f5dc','#c4dcff','#dcc8ff'), orbCol:['#fffbe8','#fff2c2','#ffe39a'],
    far:['#ffd0f0','#e8b0e0'], mid:['#b8f0ff','#98d8f0'], hedge:['#ff6fae','#8a2f6a','#fff6fb'],
    rib:{lit:'#fff2fa',base:'#ffe4f4',shade:'#f8cce8',edge:'#ffffff',dark:'#c88ab8',dash:'#ffd76a',face:'#c9b3ff',face2:'#b39cf0'},
    fg:['#c9b3ff','#d9c6ff','#b39cf0','#7a5ac0'], trees:['#ff6fae','#ffd76a','#7fe3bd'] },
  spider:{ name:'Silly Spider Woods', style:'classic', music:'spooky', rule:'spiders', bramble:'web', fx:'webs', night:true,
    sky:r6('#1e1a2e','#26203a','#302848','#3c3058','#4a3a68','#5a4478'), orbCol:['#e8fff0','#c8ffd8','#a8f0c0'],
    far:['#3a2e50','#2a2040'], mid:['#4a6a4a','#3a5a3a'], hedge:['#5a3a6a','#2a1a32','#9affb0'],
    rib:{lit:'#8a7aa8',base:'#7a6a98',shade:'#6a5a88',edge:'#b8a8d8',dark:'#3a2e50',dash:'#9affb0',face:'#4a3e60',face2:'#3a3050'},
    fg:['#3a3050','#4a3e60','#2a2040','#140e20'], trees:['#9affb0','#c9a6ff','#ff9bd0'],
    treesMk:()=>[deadTree(16,24,false),webTree(18,24),deadTree(16,24,false)], bigMk:()=>[webTree(22,30),deadTree(24,30,true),webTree(22,30)] },
  castle:{ name:'Castle Court', style:'classic', music:'dreamy', rule:'castle', hurdle:'wall', castleEvery:150,
    sky:r6('#8fa8e8','#a0b6ec','#b2c4f0','#c4d2f4','#d6e0f8','#e8eefc'), orbCol:['#fff6c8','#ffeaa0','#ffdd7a'],
    far:['#c4b8e8','#a89cd6'], mid:['#9ad0a8','#7ab88a'], hedge:['#8a7aa8','#4a3e6a','#ffd76a'],
    rib:{lit:'#e8e0f0',base:'#d8cee6',shade:'#c4b8d8',edge:'#ffffff',dark:'#8a7ea8',dash:'#f0e8f8',face:'#a89cc4',face2:'#968ab4'},
    fg:['#6a8a5a','#7a9a6a','#5a7a4a','#3a5a2a'], trees:['#ff9bd0','#9ff0cf','#ffc2e3'],
    bigMk:()=>[towerSpr(16,30,'#ff9bd0'),towerSpr(18,30,'#9a6bff'),towerSpr(16,28,'#7fe3bd')] },
  city:{ name:'Big Apple City', noCastle:true, style:'speedway', music:'funk', rule:'city', hurdle:'building', bramble:'cones', city:true, win:['#ffe8a0','#fff6d0','#ffd76a'],
    sky:r6('#7fb0f0','#90bcf2','#a2c8f4','#b4d4f6','#c8e0f8','#dcecfa'), orbCol:['#fff6c8','#ffeaa0','#ffdd7a'],
    far:['#9aa8c8','#7a88aa'], mid:['#a8b4cc','#8a96b0'], hedge:['#3fa04f','#1f5a2a','#ffd76a'],
    rib:{lit:'#8a8aa0',base:'#7a7a92',shade:'#6a6a82',edge:'#d8d8e8',dark:'#3a3a4a',dash:'#ffd23a',face:'#b8a090',face2:'#a08878'},
    fg:['#9a9aac','#b0b0c0','#7a7a8c','#4a4a5a'], trees:['#3fa04f','#5fbf6f','#2f8a4a'],
    farFn:wx=>{ const b=Math.floor(wx/18); return wx-b*18<2 ? 108 : 104-(26+hash(b)%48); },
    bigMk:()=>[cityBlock(18,30,'#c98a6a','#ffe8a0'),cityBlock(16,32,'#9aa0b8','#fff6d0'),cityBlock(20,28,'#b8a0c8','#ffe8a0')] },
  backwards:{ name:'Backwards Bay', style:'classic', music:'happy', rule:'backwards',
    sky:r6('#a8f0d8','#b8f2dc','#c8f4e0','#d8f6e6','#e8f8ec','#f6fbf2'), orbCol:['#ffb3d6','#ff9fcd','#ff8ac4'],
    far:['#9ad8f0','#7ac0e0'], mid:['#ffc2e3','#f2a6d0'], hedge:['#7fb8ff','#3a5aa0','#ffd76a'],
    rib:{lit:'#ffe0f0',base:'#ffd0e8',shade:'#f6bcdc',edge:'#ffffff',dark:'#c47aa8',dash:'#ffffff',face:'#9ad8f0',face2:'#80c4e0'},
    fg:['#7ac0e0','#8acde8','#62aed2','#3a7aa8'], trees:['#7fb8ff','#ffd76a','#c9a6ff'] },
};
// Candy Cove becomes sticky, with taffy goo
{ const cc=THEMES.find(T=>T.name==='Candy Cove'); Object.assign(cc,{rule:'sticky',hurdle:'candy',fx:'sprinkles',goo:['#ff7fc1','#ffc0e0','#ffffff']}); }
// world order: levels walk through these, a boss every 4th level
{ const by=n=>THEMES.find(T=>T.name===n), N=NEW_WORLDS;
  const order=[by('Sunrise Meadow'),N.mushroom,by('Candy Cove'),by('Twilight Glen'),N.water,by('Crystal Peaks'),N.pumpkin,N.fire,
    N.neon,N.space,N.mirror,N.ice,by('Cloud Summit'),N.rainbow,N.spider,N.castle,N.city,N.backwards,by('Spooky Hollow')];
  THEMES.splice(0,THEMES.length,...order); }

/* ---------- silly spiders: they bob up and down on threads. Touch one and it tickles you (slows you down) ---------- */
const spiders=[];
const spiderSpr=makeSprite(15,12,['#2a2236','#ffffff','#ff8fbf'],x=>{
  x.strokeStyle='#2a2236'; x.lineWidth=1; x.beginPath();
  for(const s of [-1,1]) for(let k=0;k<4;k++){ x.moveTo(7.5,6.5); x.lineTo(7.5+s*5,3+k*2.2); x.lineTo(7.5+s*7,6+k*2); } x.stroke();
  circ(x,'#2a2236',[[7.5,6.5,4.2]]); circ(x,'#ffffff',[[5.8,5.4,1.7],[9.3,5.4,1.7]]);
}, x=>{ x.fillStyle='#2a2236'; x.fillRect(6,5,1,1); x.fillRect(9,6,1,1); x.fillStyle='#ff8fbf'; x.fillRect(6,8,4,1); x.fillRect(7,9,2,1); x.fillStyle='#ff5fa8'; x.fillRect(10,1,2,2); x.fillRect(12,2,1,1); }, '#9a8ab8');
const spiderAlt=s=>heightAt(s.x)+4+30*(.5+.5*Math.sin(t*2.2+s.ph));
function stepSpiders(dt){
  for(const s of spiders){ if(s.hitT>0) s.hitT-=dt;
    for(const r of racers){ if(r.state==='tumble' || Math.abs(r.laneY-s.lane)>=.5 || Math.abs(r.x-s.x)>7 || s.hitT>0) continue;
      if(Math.abs(spiderAlt(s)+5-(r.alt+10))<12 && !(r.starT>0)){ s.hitT=1.4; r.vx*=.55; if(r.isPlayer && !demo){ emit('giggle',r); toast('TICKLE TICKLE!'); } } } }
}
function drawSpider(s,cx,cy){
  const sx=Math.round(s.x-cx), y=Math.round(laneY(s.lane)-spiderAlt(s))-12, wig=s.hitT>0?Math.round(Math.sin(t*40)*2):0;
  ctx.fillStyle='rgba(255,255,255,.7)'; ctx.fillRect(sx,-cy-200,1,y+cy+200);
  ctx.drawImage(spiderSpr,sx-7+wig,y);
}

/* ---------- world effects: drawn behind the track ('back') and over everything ('front') ---------- */
function worldFx(layer,camX,cy=0){
  const fx=TH.fx; if(!fx) return;
  ctx.save();
  if(fx==='bubbles'){
    const n=layer==='back'?36:10;
    for(let i=0;i<n;i++){ const h=hash(i*71+(layer==='back'?0:5)), sp=10+h%18, y=Math.round(H+10-((t*sp+(h>>>8)%400)%(H+30))), x=Math.round(((h%997)/997*W - camX*(layer==='back'?.1:.4))%W+W)%W + Math.round(Math.sin(t*2+i)*2);
      ctx.fillStyle=layer==='back'?'rgba(220,250,255,.7)':'#e8fbff'; const r=layer==='back'?(h%3?1:2):2;
      ctx.fillRect(x-r,y,1,1); ctx.fillRect(x+r,y,1,1); ctx.fillRect(x,y-r,1,1); ctx.fillRect(x,y+r,1,1); if(r>1){ ctx.fillRect(x-1,y-1,1,1); } }
    if(layer==='front'){ ctx.fillStyle='rgba(40,150,210,.10)'; ctx.fillRect(0,0,W,H); }
  }
  else if(fx==='snow'||fx==='leaves'||fx==='sprinkles'){
    const n=layer==='back'?40:18, cols=fx==='snow'?['#ffffff','#e8f4ff']:fx==='leaves'?['#ff8a2a','#e0461a','#ffd166']:['#ff6fae','#7fe3bd','#ffd76a','#7fb8ff','#ffffff'];
    for(let i=0;i<n;i++){ const h=hash(i*53+(layer==='back'?11:77)), sp=(fx==='snow'?14:22)+h%20, y=Math.round(((t*sp+(h>>>9)%300)%(H+20))-10), x=Math.round((((h%991)/991*W - t*(fx==='leaves'?25:8) - camX*(layer==='back'?.2:.6))%W+W)%W+Math.sin(t*1.7+i)*3);
      ctx.fillStyle=cols[h%cols.length];
      if(layer==='front' && fx==='snow'){ ctx.fillRect(x-1,y,3,1); ctx.fillRect(x,y-1,1,3); }
      else if(fx==='leaves') ctx.fillRect(x,y,2,1+((t*4+i)|0)%2);
      else ctx.fillRect(x,y,fx==='sprinkles'?2:1,1); }
  }
  else if(fx==='embers'||fx==='spores'){
    const n=layer==='back'?30:12, cols=fx==='embers'?['#ff7a1a','#ffb347','#ffe066']:['#fff4a8','#ffc2e3','#c9f0ff'];
    for(let i=0;i<n;i++){ const h=hash(i*37+(layer==='back'?3:9)), sp=(fx==='embers'?20:8)+h%22, y=Math.round(H+10-((t*sp+(h>>>8)%300)%(H+30))), x=Math.round((((h%983)/983*W - camX*(layer==='back'?.15:.5))%W+W)%W+Math.sin(t*1.3+i)*4);
      if(((t*3+i*.7)|0)%4===0 && fx==='spores') continue; ctx.fillStyle=cols[h%3]; ctx.fillRect(x,y,1,1); if(h%4===0){ ctx.globalAlpha=.4; ctx.fillRect(x-1,y,3,1); ctx.fillRect(x,y-1,1,3); ctx.globalAlpha=1; } }
    if(layer==='front' && fx==='embers'){ ctx.fillStyle='rgba(255,90,20,.07)'; ctx.fillRect(0,0,W,H); }
  }
  else if(fx==='neon' && layer==='back'){
    const hz=Math.round(H*.62); ctx.globalAlpha=.55;
    for(let k=0;k<6;k++){ const y=hz+Math.round(Math.pow(k/6,1.6)*(H-hz)+((t*20)%8)); ctx.fillStyle=k%2?'#ff2fa8':'#fff23a'; ctx.fillRect(0,y,W,1); }
    ctx.fillStyle='#ff2fa8'; const off=(camX*.6)%24; for(let x=-off;x<W;x+=24) ctx.fillRect(Math.round(x),hz,1,H-hz);
    ctx.globalAlpha=1;
    if(((t*2)|0)%3){ ctx.fillStyle='#fff23a'; ctx.font='8px "Press Start 2P", monospace'; ctx.textAlign='left'; ctx.fillText('★ HOOF ★',Math.round(30-(camX*.08)%400+400)%(W+60)-30,30); }
  }
  else if(fx==='space' && layer==='back'){
    for(let i=0;i<3;i++){ const cyc=4+i*1.7, u=((t+i*2.3)%cyc)/cyc; if(u>.35) continue; const k=u/.35, h=hash(Math.floor((t+i*2.3)/cyc)*13+i);
      const x0=40+h%240, y0=10+(h>>>8)%50, x=Math.round(x0+k*70), y=Math.round(y0+k*28);
      ctx.fillStyle='#ffffff'; ctx.fillRect(x,y,2,1); ctx.globalAlpha=.5; for(let j=1;j<10;j++) ctx.fillRect(x-j*2,y-j,2,1); ctx.globalAlpha=1; }
  }
  else if(fx==='rainbow' && layer==='back'){
    const cols=['#ff6fae','#ffb48a','#ffd76a','#7fe3bd','#8fc7ff','#c9a6ff'], cxr=W*.5, cyr=H*.62;
    ctx.globalAlpha=.5; ctx.lineWidth=3;
    for(let i=0;i<6;i++){ ctx.strokeStyle=cols[i]; ctx.beginPath(); const a=t*.8+i*.1; ctx.arc(cxr,cyr,62-i*3,a,a+Math.PI*1.25); ctx.stroke();
      ctx.beginPath(); ctx.arc(cxr,cyr,62-i*3,a+Math.PI*1.45,a+Math.PI*1.75); ctx.stroke(); }
    ctx.globalAlpha=1;
    for(let i=0;i<2;i++){ const cyc=3+i, u=((t+i*1.4)%cyc)/cyc; if(u>.3) continue; const k=u/.3, h=hash(Math.floor((t+i*1.4)/cyc)*7+i), x=Math.round(30+h%260+k*60), y=Math.round(8+(h>>>8)%40+k*24);
      ctx.fillStyle='#fff4a8'; ctx.fillRect(x-1,y,3,1); ctx.fillRect(x,y-1,1,3); for(let j=1;j<8;j++){ ctx.fillStyle=cols[j%6]; ctx.fillRect(x-j*2,y-j,2,1); } }
  }
  else if(fx==='chrome'){
    if(layer==='back'){ const farX=camX*.15; ctx.globalAlpha=.4;
      for(let sx=0;sx<W;sx++){ const wx=sx+farX, y=Math.round(104-Math.min(52,64*triw(wx*.006))-6*triw(wx*.04)), hgt=Math.round((110-y)*.8); ctx.fillStyle=TH.far[1]; ctx.fillRect(sx,0,1,hgt); }
      ctx.globalAlpha=1;
      // the sky is a mirror: every horse runs upside down up there
      const cx=Math.round(camX); for(const r of racers){ const sx=Math.round(r.x-cx); if(sx<-30||sx>W+30) continue;
        const ground=laneY(r.laneY)-heightAt(r.x)+cy, feet=laneY(r.laneY)-r.alt+cy, ref=Math.round(8+Math.max(0,ground-feet)*.7);
        const spr=r.state==='air'?r.spr.air:r.spr.run[(r.stride|0)%4];
        ctx.save(); ctx.globalAlpha=r.isPlayer?.55:.35; ctx.translate(sx,ref); ctx.scale(1,-1); ctx.drawImage(spr,-16,-30); ctx.restore(); }
      ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fillRect(0,Math.round(6+((t*12)|0)%2),W,1); }
    else { const u=((t*.35)%1.6)-.3, x0=Math.round(u*W*1.4); ctx.globalAlpha=.22; ctx.fillStyle='#ffffff';
      ctx.beginPath(); ctx.moveTo(x0,0); ctx.lineTo(x0+W*.12,0); ctx.lineTo(x0-W*.18,H); ctx.lineTo(x0-W*.3,H); ctx.fill(); ctx.globalAlpha=1;
      for(let i=0;i<10;i++){ const h=hash(i*61+((t*2)|0)*7); if((h>>>4)%3) continue; const x=h%W, y=(h>>>9)%H; ctx.fillStyle='#ffffff'; ctx.fillRect(x-2,y,5,1); ctx.fillRect(x,y-2,1,5); ctx.fillStyle='#9ae8ff'; ctx.fillRect(x,y,1,1); } }
  }
  else if(fx==='reflect' && layer==='back'){
    // the sky is a mirror: the far hills hang upside down from the top
    const farX=camX*.15; ctx.globalAlpha=.45;
    for(let sx=0;sx<W;sx++){ const wx=sx+farX, y=Math.round(92-15*(.55+.45*Math.sin(wx*.011))-7*Math.sin(wx*.027+2)), hgt=Math.round((112-y)*.7);
      ctx.fillStyle=TH.far[1]; ctx.fillRect(sx,0,1,hgt); ctx.fillStyle='#ffffff'; if((sx+((t*10)|0))%23===0) ctx.fillRect(sx,hgt-2,1,1); }
    ctx.globalAlpha=1;
  }
  else if(fx==='webs' && layer==='back'){
    ctx.fillStyle='rgba(255,255,255,.35)';
    for(const [cx0,cy0,dir] of [[0,0,1],[W,0,-1]]){ for(let k=0;k<5;k++){ const a=k*Math.PI/8; for(let r=2;r<40;r+=1.5) ctx.fillRect(Math.round(cx0+dir*Math.cos(a)*r),Math.round(cy0+Math.sin(a)*r),1,1); }
      for(const R of [12,22,32]) for(let a=0;a<Math.PI/2;a+=.06) ctx.fillRect(Math.round(cx0+dir*Math.cos(a)*R),Math.round(cy0+Math.sin(a)*R),1,1); }
    for(let i=0;i<4;i++){ const x=Math.round(((i*97+40-camX*.25)%(W+40)+W+40)%(W+40)-20), y=Math.round(40+i*9+Math.sin(t*1.6+i)*10);
      ctx.fillStyle='rgba(255,255,255,.3)'; ctx.fillRect(x,0,1,y); ctx.fillStyle='#120e1a'; ctx.fillRect(x-1,y,3,2); ctx.fillRect(x-2,y+1,1,1); ctx.fillRect(x+2,y+1,1,1); }
  }
  ctx.restore();
}
