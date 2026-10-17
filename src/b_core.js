<script>
(() => {
'use strict';

/* =====================================================================
   CONFIG — every tunable for game feel lives here.
   ===================================================================== */
const CONFIG = {
  ponies: {
    // top: gallop speed (px/s), gravity: px/s², jump: upward speed of a jump,
    // airJumps: extra jumps in the air (unicorn's double jump), glideTime/glideFall: pegasus glide,
    // swim: sea pony runs through goo and splash-jumps out of it
    unicorn: { name:'Unicorn',  top:150, accel:150, gravity:620, jump:235, jump2:225, airJumps:1, glideTime:0,   glideFall:0 },
    // pegasus: her wings help her up hills, and during a speed burst they hop her over obstacles automatically
    pegasus: { name:'Pegasus',  top:134, accel:140, gravity:540, jump:250, jump2:0,   airJumps:0, glideTime:1.7, glideFall:38, uphillDrag:0.7, uphillMin:0.6, wingHop:true },
    // secret racer: picking it turns every level into Halloween; slime doesn't slow it and skeleton horses are its friends
    skelly:  { name:'Skeleton Horse', top:146, accel:150, gravity:600, jump:240, jump2:0, airJumps:0, glideTime:0, glideFall:0, swim:true, ghostFriend:true, hoverTime:2.4, alwaysTrail:true },
    // boss horses: unlocked by beating them in their boss race
    queen:   { name:'Moon Queen',    top:146, accel:150, gravity:580, jump:245, jump2:0, airJumps:0, glideTime:0, glideFall:0, power:'moon' },
    dragon:  { name:'Dragon Pony',   top:150, accel:150, gravity:600, jump:240, jump2:0, airJumps:0, glideTime:0, glideFall:0, power:'fire' },
    king:    { name:'Mountain King', top:140, accel:150, gravity:600, jump:235, jump2:0, airJumps:0, glideTime:0, glideFall:0, charge:true, uphillDrag:0.9, uphillMin:0.45 },
    seapony: { name:'Sea Pony', top:144, accel:150, gravity:580, jump:240, jump2:0,   airJumps:0, glideTime:0,   glideFall:0, swim:true },
  },
  defaultNames: { unicorn:'Sparkle', pegasus:'Breeze', skelly:'Boney', queen:'Luna', dragon:'Ember', king:'Granite', seapony:'Coral' },
  rivals: [ { kind:'clover', name:'Clover', lane:0, top:124 }, { kind:'plum', name:'Plum', lane:2, top:136 } ],
  bosses: { queen:{ name:'The Moon Queen', top:150, trail:'stars' }, dragon:{ name:'Dragon Pony', top:155, trail:'candy' }, king:{ name:'The Mountain King', top:148, trail:'aurora', uphillMin:.8 } },
  bossOrder: ['queen','dragon','king'],
  // powers: seconds of effect and seconds to recharge
  powers: { fireTime:2.4, fireSpeed:1.8, fireCooldown:7, phaseTime:1.6, phaseCooldown:7, chargeTime:.9, chargeSpeed:1.9 },
  bossEvery: 4,          // every 4th level is a boss race
  bossBonus: 25,         // gems for beating a boss
  unlockSeaPonyAt: 8,    // beat this level's boss to unlock the Sea Pony
  tumbleTime: 1.2, safeTime: 1.0,
  airSlow: 130, airPush: 70, jumpBuffer: 0.12, coyoteTime: 0.12,
  hurdleHeight: 10, boost: 55, gooSpeed: 58, shroomBounce: 230,
  // hills: uphill slows you toward uphillMin × top speed; downhill pushes you past top speed up to speedCap × top
  uphillDrag: 1.35, uphillMin: 0.34, uphillBrake: 420, downhillPush: 540, coastDrag: 38, speedCap: 2.3,
  smoothLanding: 28,     // speed bonus for landing on a downhill
  dive: { speed: 430, boost: 75 },
  // camera zoom: 1 = normal. Lower = further out. airMin is how far out the biggest jumps go
  // FABULOUS MODE (single player): grab a power-up and the world goes rainbow-glitter and the music drops into a K-pop banger
  fab: { time: 6.5, fade: 1.6 },
  tallMax: 310,          // tallest game screen (in pixels at 320 wide) when there's room above the controls
  // STAR TURBO: fills up slowly; when full, tap STAR to blast off golden and unstoppable
  star: { time: 5.5, speed: 1.75, gem: .009, bigGem: .04, dive: .07, item: .12, combo: .035, flip: .09, smooth: .025 },
  flip: { window: .32, time: .55, boost: 45, gems: 3 },   // double-tap jump in the air for a flippy flop
  zoom: { airStart: 10, airRange: 220, airMin: .26, peakStart: 60, peakRange: 200, peakMin: .5, uphill: 1.12, slowmo: .5, outSpeed: 2.6, inSpeed: 1.8 },   // press DOWN in the air: drop fast; land on a downhill for a boost
  skeletonHit: 14,       // how close a skeleton horse has to be to trip you
  rubberBand: [0.86, 1.06],
  items: { magnetTime: 8, magnetRange: 70, superTime: 3.2, superSpeed: 1.35 },
  combo: n => n*(n-1),   // bonus gems for clearing n obstacles in one flight
  slowmo: { height: 46, time: 0.65, scale: 0.35 },
  // levels come in chapters: 3 races then a boss. Each chapter is faster with more obstacles.
  levels: { speedPerChapter:0.12, speedPerLevel:0.03, maxSpeed:1.7, rampLevels:6, bpmPerLevel:6 },
  difficulty: { perChapter:0.32, perLevel:0.07, obstaclesMin:0.35 },   // obstaclesMin: share of obstacles kept in the gentlest levels
};

/* ===================================================================== */
let W = 320, H = 180;   // let: the free-run zoom-out briefly renders into a bigger view
let VH = 180;
const LANE0 = 131, GAP = 12, BAND_TOP = 124, BAND_BOT = 161;
let TRACK_LEN = 7900, FINISH_X = 7350; const START_X = 70;
const OUT = '#3a2350';
const cv = document.getElementById('game');
let ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

const clamp = (v,a,b) => v<a?a:v>b?b:v;
const hash = n => { n = (n ^ 61) ^ (n >>> 16); n = Math.imul(n, 9); n ^= n >>> 4; n = Math.imul(n, 0x27d4eb2d); return (n ^ (n >>> 15)) >>> 0; };
const laneY = l => LANE0 + l*GAP;
const store = {
  get(k,d){ try{ const v = localStorage.getItem('hoofbeat.'+k); return v===null?d:JSON.parse(v); }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem('hoofbeat.'+k, JSON.stringify(v)); }catch(e){} }
};
const save = Object.assign({ gems:0, maxLevel:store.get('maxLevel',1)||1, owned:{}, equip:{}, names:{}, seapony:false, unlocked:{},
  noLose:false, ghost:true, autoGallop:store.get('autoGallop',false), muted:store.get('muted',false) }, store.get('save',{}));
save.owned = Object.assign({ mane:['default'], hat:['none'], trail:['rainbow'] }, save.owned);
if(save.seapony && !save.owned.trail.includes('fire')) save.owned.trail.push('fire');
const persist = () => store.set('save', save);
const equipOf = k => (save.equip[k] ||= { mane:'default', hat:k==='queen'?'crown':'none', trail:k==='skelly'?'fire':k==='queen'?'stars':'rainbow' });
const ponyName = k => (save.names[k] || CONFIG.defaultNames[k] || CONFIG.ponies[k]?.name || '').toUpperCase();

/* ---------------- Sprite factory: smooth shapes -> quantized pixel art with outline ---------------- */
function rgb(h){ const n=parseInt(h.slice(1),16); return [n>>16&255,n>>8&255,n&255]; }
function makeSprite(w,h,palette,draw,detail,outline=OUT){
  const c=document.createElement('canvas'); c.width=w; c.height=h;
  const x=c.getContext('2d'); draw(x);
  const img=x.getImageData(0,0,w,h), d=img.data, pal=palette.map(rgb), solid=new Uint8Array(w*h);
  for(let i=0;i<w*h;i++){
    if(d[i*4+3]<120){ d[i*4+3]=0; continue; }
    let best=0,bd=1e9;
    for(let k=0;k<pal.length;k++){ const p=pal[k], a=d[i*4]-p[0], b=d[i*4+1]-p[1], e=d[i*4+2]-p[2], dd=a*a+b*b+e*e; if(dd<bd){bd=dd;best=k;} }
    const p=pal[best]; d[i*4]=p[0]; d[i*4+1]=p[1]; d[i*4+2]=p[2]; d[i*4+3]=255; solid[i]=1;
  }
  if(outline){ const o=rgb(outline);
    for(let y=0;y<h;y++) for(let xx=0;xx<w;xx++){ const i=y*w+xx; if(solid[i]) continue;
      if((xx>0&&solid[i-1])||(xx<w-1&&solid[i+1])||(y>0&&solid[i-w])||(y<h-1&&solid[i+w])){ d[i*4]=o[0];d[i*4+1]=o[1];d[i*4+2]=o[2];d[i*4+3]=255; } } }
  x.putImageData(img,0,0);
  if(detail) detail(x);
  return c;
}
// padded sprite: shapes are drawn 1px in from the edge so the outline fits
const padSprite=(w,h,pal,draw,detail,out)=>makeSprite(w+2,h+2,pal,x=>{x.translate(1,1);draw(x);},detail,out);
const poly=(x,c,p)=>{x.fillStyle=c;x.beginPath();x.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)x.lineTo(p[i],p[i+1]);x.closePath();x.fill();};
const circ=(x,c,list)=>{x.fillStyle=c;list.forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,7);x.fill();});};
const smiley=(x,ex,ey,gap)=>{ x.fillStyle=OUT; x.fillRect(ex,ey,1,1); x.fillRect(ex+gap,ey,1,1); x.fillRect(ex,ey+2,1,1); x.fillRect(ex+gap,ey+2,1,1); x.fillRect(ex+1,ey+3,gap-1,1);
  x.fillStyle='#ff8fbf'; x.fillRect(ex-1,ey+1,1,1); x.fillRect(ex+gap+1,ey+1,1,1); };

/* ---------------- Ponies ---------------- */
const PONY = {
  unicorn:{ body:'#fff6fb', snout:'#ffd8ea', mA:'#ff5fa8', mB:'#ffa8d4', hoof:'#b07cc6', shade:'#e4d0ea', horn:'#ffd76a' },
  pegasus:{ body:'#cdb8ff', snout:'#e6dbff', mA:'#2fc796', mB:'#a6f2d6', hoof:'#7d5bc4', shade:'#ad98e4', wing:'#ffffff', wing2:'#e6dcff' },
  skelly:  { body:'#f4efe2', snout:'#e4dccb', mA:'#ff8a2a', mB:'#ffd166', hoof:'#4a3f5a', shade:'#c9c0ac' },
  seapony:{ body:'#8fe8f0', snout:'#c7f7fa', mA:'#ff7f8f', mB:'#ffc2a8', hoof:'#3f9fbf', shade:'#6fcfdc', fin:'#b9a6ff' },
  skeleton:{ body:'#ece6d6', snout:'#ddd5c0', mA:'#2a2236', mB:'#4f3f66', hoof:'#5a5048', shade:'#bdb4a0' },
  clover: { body:'#ffd9c2', snout:'#ffe9dc', mA:'#2fb98a', mB:'#8fe8c6', hoof:'#b97a6a', shade:'#eec0a6' },
  plum:   { body:'#a98ae6', snout:'#c4adf2', mA:'#ff7fc1', mB:'#ffc0e0', hoof:'#5a3f99', shade:'#9177cf' },
  queen:  { body:'#5a62d6', snout:'#7d85ea', mA:'#eef0ff', mB:'#b9c2ff', hoof:'#2b2d6e', shade:'#4950b8', horn:'#fff4a8' },
  king:   { body:'#c4c8e6', snout:'#dde0f4', mA:'#ffffff', mB:'#cfe0ff', hoof:'#5a5e80', shade:'#a4a9cc', horn:'#ffcf5a' },
  dragon: { body:'#5fcf8f', snout:'#a3f0c2', mA:'#ff5f5f', mB:'#ffb36b', hoof:'#2f7f5a', shade:'#47b276', wing:'#c48cf0', wing2:'#a66fd9', horn:'#ffd76a' },
  mystery:{ body:'#4a3466', snout:'#4a3466', mA:'#4a3466', mB:'#4a3466', hoof:'#4a3466', shade:'#4a3466', out:'#8a6bbf' },
};
const LEGS = {
  r0:[[21,19,25,23,27,26],[19.5,19.5,23,24,25,27.5],[12,19,8,23,5,25.5],[10,19.5,7,24,6,27.5]],
  r1:[[21,19,23,23.5,24,27.5],[19.5,19.5,20,23.5,21.5,27],[12,19,10,23.5,9,27.5],[10,19.5,11,23.5,12.5,27]],
  r2:[[21,19,20,23,18.5,26.5],[19.5,19.5,18,23,17,27.5],[12,19,14,23,15.5,27.5],[10,19.5,13,23,14,26.5]],
  r3:[[21,19,24,22,26,24.5],[19.5,19.5,21,23.5,22,27.5],[12,19,9,23,7,27.5],[10,19.5,8,23.5,6,26]],
  air:[[21,19,24,21,26,20.5],[19.5,19.5,22.5,22,25,22.5],[12,19,8,21.5,4.5,22],[10,19.5,7,22.5,3.5,24]],
};
const TAILY = { r0:0, r1:1, r2:0, r3:-1, air:-1 };
function ponySprite(kind, frame, wing, mane){
  const C = Object.assign({}, PONY[kind]); if(mane){ C.mA=mane[0]; C.mB=mane[1]; }
  const horn = kind==='unicorn'||kind==='queen', winged = kind==='pegasus'||kind==='dragon', fins = kind==='seapony', horns = kind==='dragon', rams = kind==='king';
  const pal = [C.body,C.snout,C.mA,C.mB,C.hoof,C.shade]; if(horn||horns||rams) pal.push(C.horn); if(winged) pal.push(C.wing,C.wing2); if(fins) pal.push(C.fin);
  const legs = LEGS[frame], ty = TAILY[frame], tx = frame==='air'?-1:0;
  return makeSprite(36,32,pal,x=>{
    x.translate(0,2);
    const E=(cx,cy,rx,ry,c,r=0)=>{x.fillStyle=c;x.beginPath();x.ellipse(cx,cy,rx,ry,r,0,Math.PI*2);x.fill();};
    const L=(p,c,w)=>{x.strokeStyle=c;x.lineWidth=w;x.lineCap='round';x.lineJoin='round';x.beginPath();x.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)x.lineTo(p[i],p[i+1]);x.stroke();};
    const leg=(p,c)=>{L(p,c,2.8);E(p[p.length-2],p[p.length-1],1.5,1.4,C.hoof);};
    leg(legs[0],C.shade); leg(legs[2],C.shade);
    if(fins){ poly(x,C.mA,[9,14+ty,3,10+ty,1.5,15+ty,3.5,18+ty,0.5,22+ty,6,20.5+ty,9,17]); poly(x,C.mB,[8,15,4,13+ty,4,17+ty]); }
    else { E(7+tx,13.6+ty,2.6,2.4,C.mA); E(4.8+tx,15.8+ty,2.6,2.6,C.mB); E(3.6+tx,18.8+ty,2.4,2.4,C.mA); E(4.2+tx,21.6+ty,1.9,1.9,C.mB); }
    E(15.5,17,7.5,5,C.body); E(11,16.8,4.6,4.8,C.body); E(20,16.2,4.3,4.6,C.body);
    L([20,14,24.5,8.5],C.body,5.6);
    E(26.5,8.2,4.4,3.7,C.body,0.35); E(29.6,10.4,2.6,2.2,C.snout,0.3);
    leg(legs[1],C.body); leg(legs[3],C.body);
    E(23.5,5.8,2.3,2.3,C.mA); E(22.3,8.6,2.5,2.5,C.mB); E(21.2,11.4,2.5,2.5,C.mA); E(20,13.8,2,2,C.mB);
    if(fins){ poly(x,C.fin,[13,12.5,14.5,8.5,17.5,8,19,12.5]); poly(x,C.fin,[24,5.8,23.5,1.5,27,4.6]); }
    else poly(x,C.body,[24.2,5.6,25,1.6,26.6,5]);
    E(26.4,5,1.7,1.5,C.mB);
    if(horn) poly(x,C.horn,[26.6,5.2,28.4,5.6,31,-0.6]);
    if(horns){ poly(x,C.horn,[25.6,5,26.4,1.5,27.6,5]); poly(x,C.horn,[27.6,5.6,29.4,3,29.6,6.4]); }
    if(rams){ E(23.6,5.4,2.7,2.5,C.horn); E(22.4,7.6,1.8,1.7,C.horn); E(25.4,3.4,1.5,1.3,C.horn); }
    if(winged){
      if(wing==='up') poly(x,C.wing,[12,14,9,8,9,3,11.5,4.5,13,0.5,15.5,4,18,1.5,19.5,7,19,13]);
      else if(wing==='down') poly(x,C.wing,[12,14,8.5,18,5,21,8.5,21.5,10,20.5,12,22.5,14.5,20.5,16,22,19,14]);
      else { E(15,14,5,2.8,C.wing,-0.25); E(11.5,14.8,3,2,C.wing2); }
    }
  }, kind==='mystery'?null:x=>{
    if(kind==='skeleton'||kind==='skelly'){ x.fillStyle='#6e6458'; for(const rx of [12,14,16,18]) x.fillRect(rx,16,1,4); x.fillRect(11,15,9,1); x.fillRect(22,9,1,4);
      x.fillStyle='#1a1420'; x.fillRect(26,8,3,3); x.fillRect(29,11,2,1); x.fillStyle='#7fffb0'; x.fillRect(27,9,1,1); return; }
    x.fillStyle=OUT; x.fillRect(27,9,2,2);
    x.fillStyle='#ffffff'; x.fillRect(27,9,1,1);
    x.fillStyle='#ff8fbf'; x.fillRect(29,12,1,1);
    if(horn){ x.fillStyle='#e0a93a'; x.fillRect(28,5,1,1); x.fillRect(29,3,1,1); }
  }, C.out||OUT);
}

/* ---------------- Sticker book catalog ---------------- */
const SHOP = {
  mane:[ {id:'default',name:'Original',price:0}, {id:'sunset',name:'Sunset',price:15,c:['#ff8a3d','#ffd166']}, {id:'ocean',name:'Ocean',price:15,c:['#3f8fff','#a6dcff']},
         {id:'mint',name:'Mint',price:20,c:['#20b886','#b8f5df']}, {id:'cotton',name:'Cotton Candy',price:30,c:['#ff7fc1','#8fd8ff']},
         {id:'galaxy',name:'Galaxy',price:35,c:['#5a33c9','#c9a6ff']}, {id:'gold',name:'Golden',price:50,c:['#e8a91f','#fff0a8']} ],
  hat:[ {id:'none',name:'No Hat',price:0}, {id:'bow',name:'Bow',price:20}, {id:'flower',name:'Flower Crown',price:25}, {id:'party',name:'Party Hat',price:30},
        {id:'witch',name:'Witch Hat',price:40}, {id:'crown',name:'Crown',price:60} ],
  trail:[ {id:'rainbow',name:'Rainbow',price:0}, {id:'stars',name:'Starlight',price:25}, {id:'hearts',name:'Hearts',price:30},
          {id:'bubbles',name:'Bubbles',price:30}, {id:'candy',name:'Candy Cane',price:40}, {id:'aurora',name:'Aurora',price:60}, {id:'fire',name:'Ghost Fire',price:45} ],
};
const SPR_CACHE={};
function ponySet(kind, maneId='default'){
  const key=kind+'|'+maneId; if(SPR_CACHE[key]) return SPR_CACHE[key];
  const m=maneId!=='default'?SHOP.mane.find(z=>z.id===maneId):null, mane=m?m.c:null;
  const winged=kind==='pegasus'||kind==='dragon';
  return SPR_CACHE[key]={ run:['r0','r1','r2','r3'].map(f=>ponySprite(kind,f,'fold',mane)),
    air:ponySprite(kind,'air',winged?'up':'fold',mane), airDown:winged?ponySprite(kind,'air','down',mane):null };
}
// hats are positioned in pony-sprite coordinates (dx,dy = top-left of the padded hat sprite)
const HATS = {
  bow:   { spr:padSprite(9,6,['#ff5fa8','#ff9fcf'],x=>{ poly(x,'#ff5fa8',[4.5,3,0.4,0.4,0.4,5.6]); poly(x,'#ff5fa8',[4.5,3,8.6,0.4,8.6,5.6]); circ(x,'#ff9fcf',[[4.5,3,1.5]]); }), dx:17, dy:2 },
  flower:{ spr:padSprite(11,5,['#3fbf8f','#ff7fbf','#ffd76a','#ffffff'],x=>{ x.fillStyle='#3fbf8f'; x.fillRect(.5,2.6,10,1.6); circ(x,'#ff7fbf',[[2,2,1.7]]); circ(x,'#ffd76a',[[5.5,1.6,1.7]]); circ(x,'#ffffff',[[9,2,1.7]]); }), dx:19, dy:3 },
  party: { spr:padSprite(8,11,['#7fb8ff','#ffd76a','#ff5fa8'],x=>{ poly(x,'#7fb8ff',[4,1.6,7.6,10.6,.4,10.6]); x.fillStyle='#ffd76a'; x.fillRect(2.4,6,3.2,1.4); x.fillRect(1.2,8.8,5.6,1.4); circ(x,'#ff5fa8',[[4,1.5,1.5]]); }), dx:20, dy:-4 },
  crown: { spr:padSprite(10,7,['#ffd76a'],x=>{ poly(x,'#ffd76a',[.4,6.6,.4,1.4,3,4,5,.4,7,4,9.6,1.4,9.6,6.6]); }, x=>{ x.fillStyle='#ff5fa8'; x.fillRect(5,5,2,1); x.fillStyle='#4fd6ff'; x.fillRect(2,5,1,1); x.fillRect(9,5,1,1); }), dx:19, dy:0 },
  witch: { spr:padSprite(14,11,['#6b3fa0','#ffd76a'],x=>{ x.fillStyle='#6b3fa0'; x.fillRect(.4,8,13.2,2.4); poly(x,'#6b3fa0',[3.5,8.6,10.5,8.6,9,3,12.5,.4,6,2.4]); }, x=>{ x.fillStyle='#ffd76a'; x.fillRect(6,8,4,1); }), dx:17, dy:-5 },
};
const TRAILS = {
  rainbow:{ s:['#ff5fa8','#ffa66b','#ffe066','#6fe0b0','#7fb8ff','#b38cff'], p:'star', pc:['#ff5fa8','#ffa66b','#ffe066','#6fe0b0','#7fb8ff','#b38cff'] },
  stars:  { s:['#fff6c2','#ffe066','#ffcf3f','#ffe066','#fff6c2','#ffffff'], p:'star', pc:['#ffe066','#fff6c2','#ffffff'] },
  hearts: { s:['#ff4f96','#ff6fae','#ff8fc0','#ffb0d2','#ff8fc0','#ff6fae'], p:'heart', pc:['#ff4f96','#ff8fc0','#ffffff'] },
  bubbles:{ s:['#5fc8ff','#86d8ff','#ade6ff','#d3f4ff','#ade6ff','#86d8ff'], p:'bubble', pc:['#bff0ff','#ffffff','#7fd8ff'] },
  candy:  { s:['#ff4f6f','#ffffff','#ff4f6f','#ffffff','#ff4f6f','#ffffff'], p:'dot', pc:['#ff4f6f','#ffffff'] },
  fire:   { s:['#d8321a','#ff7a1a','#ffd166','#fff2a8','#ffa53a','#ff4f1a'], p:'dot', pc:['#ffb347','#ff7a1a','#ffe066','#ff4f1a'], fire:true },
  aurora: { s:['#4ff0c0','#4fd0f0','#6f8fff','#a37fff','#d86fff','#ff6fbf'], p:'star', pc:['#4ff0c0','#a37fff','#ffffff'] },
};

/* ---------------- Items, gems, scenery sprites ---------------- */
const shroomSpr = makeSprite(13,12,['#ff6fae','#fff0e0'],x=>{
  x.fillStyle='#ff6fae'; x.beginPath(); x.ellipse(6.5,5.5,5.5,4.2,0,0,Math.PI*2); x.fill();
  x.fillStyle='#fff0e0'; x.fillRect(4.5,6.5,4,5.5);
}, x=>{ x.fillStyle='#ffffff'; x.fillRect(3,3,2,1); x.fillRect(8,2,1,1); x.fillRect(9,4,2,1); x.fillStyle=OUT; x.fillRect(5,8,1,1); x.fillRect(7,8,1,1); });
const hurdleSpr = makeSprite(12,15,['#fff6fb','#ff6fae','#ffd76a'],x=>{
  x.fillStyle='#fff6fb'; x.fillRect(1.5,3,2.2,11.5); x.fillRect(8.3,3,2.2,11.5); x.fillRect(1.5,5.5,9,2); x.fillRect(1.5,9.5,9,2);
  x.fillStyle='#ff6fae'; x.beginPath(); x.arc(2.6,2.6,2,0,7); x.fill(); x.beginPath(); x.arc(9.4,2.6,2,0,7); x.fill();
}, x=>{ x.fillStyle='#ffd76a'; x.fillRect(2,2,1,1); x.fillRect(9,2,1,1); });
const brambleSpr = makeSprite(14,12,['#7a3f9c','#a35cc8'],x=>{
  x.fillStyle='#7a3f9c'; [[4.5,7.5,4.2],[9.5,7,4.5],[7,4.5,3.6]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,7);x.fill();}); x.fillRect(1,8,12,3.5);
  x.fillStyle='#a35cc8'; x.beginPath(); x.arc(7,4.5,2,0,7); x.fill();
}, x=>{ x.fillStyle='#e7b8ff'; [[0,6],[3,2],[7,0],[11,2],[13,6],[5,5],[9,4]].forEach(([a,b])=>x.fillRect(a,b,1,1));
  x.fillStyle='#ff4f8f'; x.fillRect(4,8,1,1); x.fillRect(10,9,1,1); });
const gemSpr = [['#ff4f9a','#ffb3d6'],['#20c48f','#a6f2d6'],['#8f6bff','#d6c8ff']].map(([a,b])=>padSprite(7,8,[a,b,'#ffffff'],x=>{
  poly(x,a,[3.5,.3,6.7,3,3.5,7.7,.3,3]); poly(x,b,[3.5,.3,6.7,3,.3,3]); }, x=>{ x.fillStyle='#ffffff'; x.fillRect(3,2,1,1); }));
const bigGemSpr = padSprite(10,11,['#ffbf1f','#fff0a8','#ffffff'],x=>{ poly(x,'#ffbf1f',[5,.3,9.7,4,5,10.7,.3,4]); poly(x,'#fff0a8',[5,.3,9.7,4,.3,4]); },
  x=>{ x.fillStyle='#ffffff'; x.fillRect(4,2,2,1); x.fillRect(4,3,1,1); });
const ORB_ICON = {
  shield:x=>{ x.fillStyle='#4f8fff'; [[5,3],[6,3],[7,3],[4,4],[8,4],[4,5],[8,5],[4,6],[8,6],[5,7],[7,7],[6,8]].forEach(([a,b])=>x.fillRect(a+1,b+1,1,1)); x.fillStyle='#bfe0ff'; x.fillRect(6,5,2,2); },
  magnet:x=>{ x.fillStyle='#e8455f'; [[4,3],[4,4],[4,5],[4,6],[8,3],[8,4],[8,5],[8,6],[5,7],[6,8],[7,7]].forEach(([a,b])=>x.fillRect(a+1,b+1,1,1)); x.fillStyle='#d8dcf0'; x.fillRect(5,3,1,1); x.fillRect(9,3,1,1); },
  super: x=>{ x.fillStyle='#ffbf1f'; [[6,2],[6,3],[5,4],[6,4],[7,4],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[5,6],[6,6],[7,6],[4,7],[5,7],[7,7],[8,7],[4,8],[8,8]].forEach(([a,b])=>x.fillRect(a+1,b+1,1,1)); },
};
const orbSpr = {}; for(const k in ORB_ICON) orbSpr[k]=padSprite(13,13,['#f3ecff','#d9c6ff'],x=>{ circ(x,'#d9c6ff',[[6.5,6.5,6.2]]); circ(x,'#f3ecff',[[6.5,6.5,5]]); }, x=>{ ORB_ICON[k](x); x.fillStyle='#ffffff'; x.fillRect(4,3,2,1); }, '#8a6bbf');
const cloudPlat = makeSprite(24,12,['#ffffff','#ece2ff'],x=>{ circ(x,'#ffffff',[[6,6.5,5],[12,5,6],[18,6.5,5]]); x.fillRect(2,6.5,20,4); x.fillStyle='#ece2ff'; x.fillRect(3,9,18,2); },null,'#c9b3ff');

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
const bossKind = L => CONFIG.bossOrder[((L/CONFIG.bossEvery)-1)%CONFIG.bossOrder.length];
const themeOf = L => THEMES[(L-1)%THEMES.length];
let halloween=false;   // true when a player picked the Skeleton Horse
const isHalloween=()=>chosen==='skelly' || (twoP && chosen2==='skelly');
function levelName(L){ const T=themeOf(L), lap=Math.floor((L-1)/THEMES.length)+1; return (isHalloween()&&!T.spooky?'Haunted ':'')+T.name+(lap>1?' '+(ROMAN[lap]||lap):''); }
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
  const sky=makeSky(T); if(T.skyFx) T.skyFx(sky.getContext('2d'));
  return ASSET[i]={ sky, hedge, bush:bush(false), happyBush:bush(!T.spooky),
    trees: T.treesMk ? T.treesMk(T) : T.spooky ? [deadTree(16,24,false),deadTree(18,24,false),deadTree(16,24,false)] : T.trees.map(midTree),
    big: T.bigMk ? T.bigMk(T) : T.spooky ? [deadTree(22,30,true),deadTree(24,30,true),deadTree(22,30,false)] : T.trees.map(happyTree),
    castle: T.spooky ? castleHaunted : castleSpr };
}
let TH=THEMES[0], AS=themeAssets(0), RIB=TH.rib, WR={grav:1,jump:1,top:1,accel:1,coast:1,lane:1,bounce:0,sticky:0};
function setThemeIndex(i){ TH=THEMES[i]; AS=themeAssets(i); RIB=TH.rib; WR=worldRules(TH); }
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
  HT.fill(0); for(const a of [goos,pads,shrooms,hurdles,brambles,clouds,gems,orbs,spiders]) a.length=0;
  const RULE=themeOf(L).rule||'none';
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
  const autoClouds=[], autoPaths=[];
  FINISH_X=(style==='speedway'?8800:style==='mountains'?8400:6400)+Math.round(1500*d); TRACK_LEN=FINISH_X+600;
  let x=300; if(d>.25) fence(x,some()); gem(x,1,26); x+=150;
  let pats;
  if(style==='speedway') pats=['bigroll','bigroll','downramp','swerve','bigroll','kick','cloud','meadow'];
  else if(style==='mountains') pats=['peak','peak','ridge','ridge','moguls','kick','meadow'];
  else if(d<.25) pats=['rolls','rolls','kick','meadow','moguls','shroom','cloud','meadow'];   // gentle opening chapter
  else pats=['rolls','kick','kick','slalom','table','moguls','shroom','fences','kickGoo','cloud'];
  if(style==='spooky') pats.push('kickGoo','rolls');
  if(boss && style==='classic') pats.push('cloud','cloud');
  // each world's rule shapes its track
  if(RULE==='pumpkins') pats.push('pumpkinRow','pumpkinRow','fences','slalom');
  if(RULE==='city') pats.push('pumpkinRow','fences','swerve');
  if(RULE==='bouncy') pats.push('shroom','shroom','moguls');
  if(RULE==='sticky') pats.push('kickGoo','kickGoo');
  if(RULE==='neon'||RULE==='rainbow') pats.push('bigroll','downramp');
  if(RULE==='space') pats.push('massif','peak','skyhop');
  pats.push('skyhop');   // cloud-hopping sky route everywhere
  if(d>.6) pats=pats.filter(p=>p!=='meadow');
  // giant mountains with secret cloud paths: from chapter 2 on mountain worlds, and later everywhere but Spooky Hollow
  if(style==='mountains' && d>=.12) pats.push('massif','massif');
  else if(d>=.35 && style!=='spooky') pats.push('massif');
  let lastPat='';
  while(x<FINISH_X-560){
    let p=pick(pats); if(p===lastPat) p=pick(pats); lastPat=p;
    if(p==='massif' && x>FINISH_X-3200) p=style==='mountains'?'peak':'rolls';
    if(p==='meadow'){ const len=ri(240,360), gl=ri(0,2); for(let i=0;i<8;i++) gem(x+20+i*(len-40)/7,(gl+(i>3?1:0))%3,7);
      pads.push({x:x+len/2,lane:ri(0,2)}); if(R()<.4) orb(x+len*.7,ri(0,2),12); x+=len; }
    else if(p==='rolls'){ const w=ri(120,180),h=ri(14,30); roll(x,w,h); roll(x+w,w,h); gem(x+w/2,1,12); gem(x+w*1.5,1,12);
      if(R()<.32+.5*d){ const ls=some(); fence(x+w,ls); gem(x+w,ls[0],26); } x+=2*w; }
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
    else if(p==='pumpkinRow'){ const n=ri(3,5), g=ri(72,96)-Math.round(10*d); for(let i=0;i<n;i++){ fence(x+i*g,R()<.6?ALL:some()); gem(x+i*g,ri(0,2),30); } x+=n*g+60; }
    else if(p==='skyhop'){ // ramp up, then hop cloud to cloud, each one higher. Miss and you drop to the low road (thorns + fences)
      const w=ri(90,110),h=ri(36,46),dr=ri(70,90); kick(x,w,h,dr); const lip=x+w; let cx0=lip+ri(40,60), ch=ri(58,66); const n=ri(3,4+Math.round(2*d)), gl=ri(0,2);
      for(let i=0;i<n;i++){ const cl=ri(70,100)-Math.round(20*d); clouds.push({x:cx0,len:cl,h:ch,hop:true});
        for(let k=0;k<3;k++) gem(cx0+12+(cl-24)*k/2,gl,ch+9,true,i===n-1&&k===1);
        if(i===n-1 && R()<.6) orb(cx0+cl+30,ri(0,2),ch+30,true);
        cx0+=cl+ri(40,58)+Math.round(12*d); ch+=ri(8,16); }
      const lowS=lip+dr+10; maybe(()=>thorns(lowS,ri(40,70),ALL)); maybe(()=>fence(lowS+ri(130,170),some())); if(d>.3) maybe(()=>fence(lowS+ri(240,280),some()));
      x=Math.max(cx0,lowS+300)+40; }
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
    else if(p==='massif'){ // two huge peaks and a deep valley. Low road: obstacles. High road: a secret cloud path between the summits
      const sc=.9+.9*d, h1=Math.round(ri(190,240)*sc), h2=Math.round(ri(200,260)*sc);
      const xs=profile(x,[[ri(240,300),Math.round(h1*.5)],[ri(70,100),Math.round(h1*.45)],[ri(200,260),h1],[ri(40,60),h1+4],[ri(220,280),ri(10,25)],[ri(150,210),ri(10,25)],
        [ri(240,300),Math.round(h2*.55)],[ri(60,90),Math.round(h2*.5)],[ri(180,230),h2],[ri(40,60),h2+4],[ri(260,320),ri(20,40)],[ri(90,110),0]]);
      const v0=xs[4], v1=xs[5];
      thorns(v0+15,Math.max(40,Math.round((v1-v0)*.6)),R()<.3+.6*d?ALL:some()); maybe(()=>fence(v1+30,some())); maybe(()=>fence(xs[1]+20,some()));
      gem(v0+(v1-v0)/2,ri(0,2),40);
      autoPaths.push({top:xs[3]-20,until:xs[8],lane:ri(0,2)});
      if(R()<.5+.4*d) autoPaths.push({top:xs[9]-20,until:xs[11]+200,lane:ri(0,2),short:true});
      x=xs[11]+80; }
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
  for(const ap of autoPaths){ const s0=ap.top+24, h=Math.round(heightAt(ap.top))+8; let e=s0+40;
    while(e<ap.until && heightAt(e)<h-12) e+=4; if(ap.short) e=Math.min(e,s0+260);
    const len=e-s0; if(len<80) continue;
    // split the secret path into separate clouds with gaps, drifting a little higher: hop across with good timing
    let cx=s0, ch=h+6, k=0; while(cx<e-40){ const cl=Math.min(e-cx,90+(k%2)*30); clouds.push({x:cx,len:cl,h:ch,secret:true,hop:true});
      gem(cx+cl/2,ap.lane,ch+9,true,k===2); gem(cx+cl/2+18,ap.lane,ch+9,true); cx+=cl+50; ch+=6+(k%3)*5; k++; } }
  if(RULE==='spiders'){ for(let sx=700;sx<FINISH_X-300;sx+=ri(200,340)) spiders.push({x:sx,lane:ri(0,2),ph:R()*6,hitT:0}); }
  for(const g of gems){ g.alt=(g.abs?0:heightAt(g.x))+g.off; g.taken=false; g.pull=null; }
  for(const o of orbs){ o.alt=(o.abs?0:heightAt(o.x))+o.off; o.taken=false; }
}
function heightAt(x){ if(x<0||x>=TRACK_LEN) return 0; const i=x|0, f=x-i; return HT[i]+(HT[i+1]-HT[i])*f; }
function slopeAt(x){ return (heightAt(x+2)-heightAt(x-2))/4; }
function gooAt(x,lane){ for(const g of goos) if(x>=g.x && x<=g.x+g.len && g.lanes.includes(lane)) return true; return false; }
function brambleAt(x,lane){ for(const b of brambles) if(x>=b.x && x<=b.x+b.len && b.lanes.includes(lane)) return b; return null; }

/* ---------------- Audio ---------------- */
let ac=null, master=null, muted=!!save.muted;
function audio(){
  if(!ac){ try{ ac=new (window.AudioContext||window.webkitAudioContext)(); master=ac.createGain(); master.gain.value=muted?0:1; master.connect(ac.destination);}catch(e){ return null; } }
  if(ac.state==='suspended') ac.resume();
  return ac;
}
const mf = m => 440*Math.pow(2,(m-69)/12);
function tone(f,dur,type='square',vol=.05,f2=0,when=0){ const a=ac; if(!a||muted) return;
  const t=(when||a.currentTime), o=a.createOscillator(), g=a.createGain(); o.type=type; o.frequency.setValueAtTime(f,t);
  if(f2) o.frequency.exponentialRampToValueAtTime(f2,t+dur); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.02); }
function noise(dur,vol){ const a=ac; if(!a||muted) return; const b=a.createBuffer(1,a.sampleRate*dur,a.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length); const s=a.createBufferSource(), g=a.createGain(); g.gain.value=vol; s.buffer=b; s.connect(g); g.connect(master); s.start(); }
const arp = (ns,step=.06,vol=.045,type='square') => { if(!ac) return; ns.forEach((n,i)=>tone(mf(n),step*1.6,type,vol,0,ac.currentTime+i*step)); };
const SFX = {
  jump(){ tone(300,.18,'square',.04,700); }, double(){ tone(520,.2,'square',.04,1200); arp([84,88],.05,.03); },
  land(){ tone(150,.07,'triangle',.08,70); }, crash(){ noise(.35,.12); tone(500,.45,'sawtooth',.035,70); },
  boost(){ arp([84,88,91,96],.05,.035); }, beep(){ tone(660,.14,'square',.05); }, go(){ tone(990,.35,'square',.05); },
  bounce(){ tone(180,.2,'square',.05,640); }, finish(){ arp([72,76,79,84,79,84,88],.1,.05); },
  gem(n){ tone(mf(84+Math.min(n,12)),.09,'triangle',.06); tone(mf(91+Math.min(n,12)),.12,'sine',.03,0,ac&&ac.currentTime+.04); },
  item(){ arp([72,79,84,91,96],.045,.04,'triangle'); }, pop(){ tone(900,.12,'sine',.07,300); noise(.08,.05); },
  smash(){ noise(.15,.08); tone(240,.15,'square',.05,900); }, giggle(){ arp([88,91,88,93,90],.06,.035,'triangle'); },
  cloud(){ tone(500,.25,'sine',.04,760); }, combo(n){ arp([76,79,84,88,91].slice(0,Math.min(5,n+1)),.06,.045); },
  splash(){ noise(.18,.06); tone(400,.2,'sine',.04,900); }, fanfare(){ arp([72,76,79,84,88,91,96],.09,.05); },
  buy(){ arp([79,84,88,96],.06,.04,'triangle'); }, nope(){ tone(220,.15,'square',.04,160); },
  highfive(){ noise(.12,.14); arp([84,88,91,96,100],.05,.05,'square'); }, turbo(){ tone(380,.4,'sawtooth',.028,1500); },
  ghost(){ tone(420,.5,'sine',.05,700); tone(630,.45,'triangle',.018,900); },
  flap(){ tone(300,.12,'triangle',.05,700); tone(500,.12,'triangle',.03,900,ac&&ac.currentTime+.08); },
  fire(){ noise(.3,.1); tone(200,.4,'sawtooth',.04,900); }, moon(){ arp([84,91,96,103],.05,.03,'sine'); tone(600,.5,'sine',.03,300); },
  charge(){ tone(160,.3,'square',.05,420); noise(.12,.06); },
  warn(){ tone(880,.08,'square',.04); tone(880,.08,'square',.04,0,ac&&ac.currentTime+.14); },
  fab(){ tone(220,.55,'sawtooth',.03,1760); noise(.5,.05); arp([81,84,88,93,96,100],.05,.035,'square'); },
  unfab(){ tone(1400,.7,'sine',.035,180); arp([88,84,81,76],.08,.025,'triangle'); },
  smooth(){ arp([79,86],.05,.03,'triangle'); }, dive(){ tone(900,.22,'square',.035,220); }, slam(){ noise(.15,.1); arp([72,79,84,91],.04,.045,'square'); }, rattle(){ for(let i=0;i<4;i++) tone(900+i*120,.04,'square',.03,0,ac&&ac.currentTime+i*.05); },
};
/* ---------------- Music: a song per world mood. Tempo rises each level. ---------------- */
let mbus=null, fxIn=null, echo=null, noiseBuf=null;
function musicBus(){
  if(mbus) return;
  mbus=ac.createGain(); mbus.gain.value=.85; mbus.connect(master);
  echo=ac.createDelay(1.5); const fb=ac.createGain(), wet=ac.createGain(), lp=ac.createBiquadFilter();
  fb.gain.value=.4; wet.gain.value=.5; lp.type='lowpass'; lp.frequency.value=2600;
  fxIn=ac.createGain(); fxIn.connect(echo); echo.connect(lp); lp.connect(fb); fb.connect(echo); lp.connect(wet); wet.connect(mbus);
  noiseBuf=ac.createBuffer(1,Math.floor(ac.sampleRate*.5),ac.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
}
function mnote(m,when,dur,type,vol,o={}){
  const osc=ac.createOscillator(), g=ac.createGain(); osc.type=type;
  if(o.from){ osc.frequency.setValueAtTime(mf(o.from),when); osc.frequency.linearRampToValueAtTime(mf(m),when+(o.glide||.12)); } else osc.frequency.value=mf(m);
  if(o.detune) osc.detune.value=o.detune;
  if(o.vib){ const lfo=ac.createOscillator(), lg=ac.createGain(); lfo.frequency.value=o.vib; lg.gain.value=mf(m)*.02; lfo.connect(lg); lg.connect(osc.frequency); lfo.start(when); lfo.stop(when+dur+.05); }
  let node=osc;
  if(o.cut){ const f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=o.cut; if(o.q) f.Q.value=o.q; osc.connect(f); node=f; }
  const a=o.attack||.006;
  g.gain.setValueAtTime(.0001,when); g.gain.linearRampToValueAtTime(vol,when+a); g.gain.exponentialRampToValueAtTime(.0001,when+dur);
  node.connect(g); g.connect(mbus);
  if(o.send){ const s=ac.createGain(); s.gain.value=o.send; g.connect(s); s.connect(fxIn); }
  osc.start(when); osc.stop(when+dur+.05);
}
function perc(when,kind,vol){
  if(kind==='kick'){ const o=ac.createOscillator(), g=ac.createGain(); o.type='sine'; o.frequency.setValueAtTime(130,when); o.frequency.exponentialRampToValueAtTime(42,when+.14);
    g.gain.setValueAtTime(vol,when); g.gain.exponentialRampToValueAtTime(.0001,when+.18); o.connect(g); g.connect(mbus); o.start(when); o.stop(when+.2); return; }
  if(kind==='block'){ mnote(84,when,.06,'sine',vol); return; }
  const s=ac.createBufferSource(), f=ac.createBiquadFilter(), g=ac.createGain(); s.buffer=noiseBuf;
  if(kind==='hat'){ f.type='highpass'; f.frequency.value=7000; } else { f.type='bandpass'; f.frequency.value=1700; f.Q.value=.8; }
  const dur=kind==='hat'?.04:.12;
  g.gain.setValueAtTime(vol,when); g.gain.exponentialRampToValueAtTime(.0001,when+dur);
  s.connect(f); f.connect(g); g.connect(mbus); s.start(when, Math.random()*.3); s.stop(when+dur+.02);
}
// dreamy: soft pads, echoing arpeggio, music-box bells (mountain worlds)
const DR_CH=[[48,[60,64,67,71]],[50,[62,66,69,74]],[47,[59,62,66,69]],[52,[64,67,71,74]],[45,[57,60,64,67]],[50,[62,66,69,72]],[43,[55,59,62,66]],[43,[55,59,62,67]]];
const DR_BELL=[[76,0,79,0],[78,0,74,0],[74,0,71,78],[79,0,0,76],[76,0,72,0],[74,0,78,0],[79,0,74,0],[71,0,0,0]];
const DR_ARP=[0,1,2,3,4,3,2,1];
// happy: bouncy bass, ukulele off-beats, cheerful lead (daytime worlds)
const HP_ROOT=[48,43,45,41,48,43,41,43];
const HP_TRI=[[60,64,67],[59,62,67],[60,64,69],[60,65,69],[60,64,67],[59,62,67],[60,65,69],[59,62,67]];
const HP_MEL=[
  [72,0,76,0,79,0,76,0,77,0,76,0,74,0,72,0],[74,0,79,0,83,0,79,0,81,0,79,0,77,0,74,0],
  [76,0,81,0,84,0,81,0,83,0,81,0,79,0,76,0],[77,0,0,76,0,0,74,0,72,0,74,0,77,0,0,0],
  [79,0,79,0,81,0,79,0,76,0,72,0,76,0,79,0],[83,0,0,81,0,0,79,0,74,0,79,0,83,0,0,0],
  [81,0,0,79,0,0,77,0,76,0,77,0,81,0,0,0],[79,0,77,0,76,0,74,0,71,0,74,0,79,0,0,0]];
// funk: swung, syncopated bass, muted chord stabs, mysterious bells (night worlds)
const FK_ROOT=[45,50,41,40];
const FK_CH=[[57,60,64,67],[60,64,66,69],[53,57,60,64],[56,59,62,64]];
const FK_BASS=[0,null,null,0,null,null,12,null,null,0,null,10,null,7,null,null];
const FK_MEL=[
  [76,0,0,0,0,0,79,0,0,0,76,0,74,0,0,0],[0,0,72,0,0,0,74,0,0,0,0,0,69,0,0,0],
  [76,0,0,0,0,0,81,0,0,0,79,0,76,0,0,0],[0,0,74,0,75,0,76,0,0,0,0,0,0,0,0,0],
  [76,0,0,0,0,0,79,0,0,0,76,0,74,0,0,0],[0,0,72,0,0,0,74,0,0,0,0,0,69,0,0,0],
  [81,0,0,0,0,0,84,0,0,0,81,0,79,0,0,0],[0,0,79,0,0,0,76,0,0,0,80,0,81,0,0,0]];
// spooky: creepy walking bass, harpsichord ticks, wobbly theremin, owl hoots
const SP_ROOT=[40,36,45,47];
const SP_CH=[[64,67,71],[64,67,72],[64,69,72],[63,66,71]];
const SP_WALK=[0,null,3,null,6,null,7,null,6,null,3,null,0,null,-1,null];
const SP_MEL=[[71,72],[76,75],[72,69],[71,75],[83,84],[88,87],[84,81],[83,79]];
// fab: K-pop power-up banger. Pumping octave bass, supersaw stabs, sparkle arps, four-on-the-floor (Am F C G)
const FB_ROOT=[45,41,48,43], FB_CH=[[57,60,64],[57,60,65],[55,60,64],[55,59,62]];
const FB_MEL=[
  [76,0,76,0,79,0,76,0,74,0,72,0,74,0,76,0],[72,0,72,0,74,0,76,0,77,0,0,0,76,0,74,0],
  [79,0,79,0,81,0,79,0,76,0,74,0,72,0,74,0],[74,0,0,74,0,0,79,0,0,0,81,0,83,0,84,0],
  [81,0,79,0,76,0,79,0,81,0,0,84,0,81,0,79],[77,0,76,0,72,0,76,0,77,0,0,81,0,77,0,76],
  [79,0,76,0,72,0,76,0,79,0,0,84,0,83,0,79],[83,0,0,83,0,0,81,0,79,0,0,0,86,0,88,0]];
const SONGS = {
  fab:{ bpm:132, play(st,bar,w,s16){
    const b=bar%4, root=FB_ROOT[b], ch=FB_CH[b];
    if(st%2===0) mnote(root-12+(st%4===2?12:0),w,s16*1.5,'sawtooth',.05,{cut:950,q:5,attack:.003});
    if(st===0||st===3||st===6||st===10||st===12) ch.forEach(n=>{ mnote(n+12,w,s16*1.3,'sawtooth',.007,{cut:3400,detune:-14}); mnote(n+12,w,s16*1.3,'sawtooth',.007,{cut:3400,detune:14}); });
    mnote(ch[st%3]+24+(st%8>=4?12:0),w,s16*.8,'square',.005,{cut:5200,send:.3});
    const m=FB_MEL[bar%8][st]; if(m){ mnote(m,w,s16*1.8,'square',.016,{cut:3600,send:.25}); mnote(m+12,w,s16*1.1,'triangle',.008); }
    if(st%4===0) perc(w,'kick',.095); if(st===4||st===12) perc(w,'clap',.05); perc(w,'hat',st%4===2?.018:.006);
    if(bar%4===3 && st>=12) perc(w,'clap',.03);   // little drum fill into the next loop
  }},
  dreamy:{ bpm:96, play(st,bar,w,s16,bpm){
    const [root,ch]=DR_CH[bar%8];
    if(st===0) ch.forEach(n=>{ mnote(n,w,s16*16.5,'sawtooth',.009,{attack:.45,cut:850}); mnote(n,w,s16*16.5,'sawtooth',.007,{attack:.5,cut:850,detune:9}); });
    if(st===0||st===8) mnote(root-12,w,s16*7,'triangle',.06,{attack:.02});
    if(st%2===0||bpm>118){ const k=DR_ARP[st%8]; mnote(ch[k%4]+12+(k>=4?12:0),w,s16*3,'triangle',.018,{send:.6}); }
    if(st%4===0){ const b=DR_BELL[bar%8][st/4]; if(b){ mnote(b+12,w,1.5,'sine',.026,{send:.8}); mnote(b+24,w,.5,'sine',.007,{send:.5}); } }
  }},
  happy:{ bpm:116, play(st,bar,w,s16){
    const b=bar%8, root=HP_ROOT[b];
    const bo={0:0,6:7,8:12,12:7,14:0}[st]; if(bo!==undefined) mnote(root+bo,w,s16*1.6,'triangle',.07,{attack:.005});
    if(st%4===2) HP_TRI[b].forEach((n,i)=>mnote(n,w+i*.008,s16*1.4,'square',.007,{cut:2200}));
    const m=HP_MEL[b][st]; if(m){ mnote(m,w,s16*1.9,'square',.015,{cut:2600,send:.2}); mnote(m+12,w,s16*1.2,'sine',.006); }
    if(st===4||st===12) perc(w,'clap',.03); if(st%2===0) perc(w,'hat',.009); if(st===0||st===8) perc(w,'kick',.07);
  }},
  funk:{ bpm:98, swing:.2, play(st,bar,w,s16){
    const b=bar%4, root=FK_ROOT[b];
    const bo=FK_BASS[st]; if(bo!==null) mnote(root+bo,w,s16*.95,'sawtooth',.05,{cut:650,q:6,attack:.004});
    if(st===3||st===10) FK_CH[b].forEach(n=>mnote(n,w,s16*1.1,'sawtooth',.007,{cut:1400,q:3}));
    const m=FK_MEL[bar%8][st]; if(m){ mnote(m,w,.7,'sine',.024,{send:.75}); mnote(m+12,w,.25,'triangle',.006,{send:.4}); }
    if(st===0||st===7||st===10) perc(w,'kick',.08); if(st===4||st===12) perc(w,'clap',.035);
    perc(w,'hat',st%2?.005:.011);
  }},
  spooky:{ bpm:94, last:0, play(st,bar,w,s16){
    const b=bar%4, root=SP_ROOT[b], lb=bar%8;
    const wk=SP_WALK[st]; if(wk!==null) mnote(root+wk,w,s16*1.3,'square',.032,{cut:900});
    if(st%2===1){ const k=[0,1,2,1][(st>>1)%4]; mnote(SP_CH[b][k]+12,w,s16*.9,'sawtooth',.006,{cut:2600}); }
    if(st===0||st===8){ const n=SP_MEL[lb][st===0?0:1]; mnote(n,w,s16*7.6,'sine',.028,{attack:.12,vib:5.5,send:.45,from:this.last||0,glide:.16}); this.last=n; }
    if(lb===3&&st===14){ mnote(67,w,.18,'sine',.03,{from:70,glide:.08}); mnote(63,w+.24,.32,'sine',.03,{from:66,glide:.1}); }
    if(st===4||st===12) perc(w,'block',.025); if(st===0) perc(w,'kick',.06);
  }},
};
const Music = { timer:null, next:0, step:0, bpm:96, song:SONGS.dreamy,
  start(L=1,name){ if(!audio()) return; musicBus(); this.stop(); this.fabOn=false;
    this.song=SONGS[name||(halloween?'spooky':themeOf(L).music)||'dreamy']; this.song.last=0;
    this.bpm=this.song.bpm+Math.min(40,CONFIG.levels.bpmPerLevel*(L-1))+(isBoss(L)&&!name?8:0);
    echo.delayTime.setValueAtTime(3*60/this.bpm/4, ac.currentTime);
    this.step=0; this.next=ac.currentTime+.1; this.timer=setInterval(()=>this.tick(),40); },
  stop(){ clearInterval(this.timer); this.timer=null; },
  // power-up drop: swap to the banger, then ease back into the world's song on the next bar
  fab(on){ if(!this.timer||!ac) return;
    if(on && !this.fabOn){ this.fabOn=true; this.saved={song:this.song,bpm:this.bpm,step:this.step};
      this.song=SONGS.fab; this.bpm=Math.max(SONGS.fab.bpm,this.saved.bpm+16); this.step=0; }
    else if(!on && this.fabOn){ this.fabOn=false; const v=this.saved; this.song=v.song; this.bpm=v.bpm; this.step=Math.ceil(v.step/16)*16; }
    else return;
    echo.delayTime.setValueAtTime(3*60/this.bpm/4, ac.currentTime); },
  tick(){
    if(muted){ this.next=ac.currentTime+.05; return; }
    const s16=60/this.bpm/4, sw=this.song.swing||0;
    while(this.next<ac.currentTime+.2){
      const st=this.step%16, bar=Math.floor(this.step/16);
      this.song.play(st,bar,this.next+(st%2?s16*sw:0),s16,this.bpm);
      this.next+=s16; this.step++;
    }
  }
};
