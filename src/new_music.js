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
const SONGS = {
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
  start(L=1,name){ if(!audio()) return; musicBus(); this.stop();
    this.song=SONGS[name||themeOf(L).music||'dreamy']; this.song.last=0;
    this.bpm=this.song.bpm+Math.min(40,CONFIG.levels.bpmPerLevel*(L-1))+(isBoss(L)&&!name?8:0);
    echo.delayTime.setValueAtTime(3*60/this.bpm/4, ac.currentTime);
    this.step=0; this.next=ac.currentTime+.1; this.timer=setInterval(()=>this.tick(),40); },
  stop(){ clearInterval(this.timer); this.timer=null; },
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
