/* INKAI audio.js — звуковий рушій. Підключається ПІСЛЯ core.js.
   • Музика: лобі (спокійна, koto/дрон) і бій (тайко + шамісен) — ДВА різних треки. Є файли music/menu.mp3, music/battle.mp3 → грають вони;
     немає файлів → музику «грає» сам браузер (WebAudio), тож тиші не буває.
   • Ефекти: sfx/<ім'я>.mp3 мають пріоритет, інакше синтезуються (див. таблицю SYN). Імена: slash, bosshit, bossin, bossdie, bomb, tick,
     chesthit, chestcrack, reveal, land, combo.
   • Мікс: усе йде через компресор, музика тиха, ефекти коротші й тихіші за піки — не «перебивають» одне одного. 🔧 Гучності — в AUD. */
const AUD={mus:{menu:.2,battle:.16},sfx:.5,fileVol:.5,gap:{slash:35,tick:26,bosshit:60,chesthit:70,combo:120,land:200}};
let AUX=null,ABUS=null,ANB=null;const ASL={};

function ax(){
 if(!AUX){AUX=window.AC||new(window.AudioContext||window.webkitAudioContext)();window.AC=AUX;
  const cp=AUX.createDynamicsCompressor();cp.threshold.value=-18;cp.knee.value=20;cp.ratio.value=6;cp.attack.value=.003;cp.release.value=.25;cp.connect(AUX.destination);
  const s=AUX.createGain();s.gain.value=AUD.sfx;s.connect(cp);const m=AUX.createGain();m.gain.value=1;m.connect(cp);ABUS={sfx:s,mus:m};
  ANB=AUX.createBuffer(1,AUX.sampleRate,AUX.sampleRate);const d=ANB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
 if(AUX.state=="suspended")AUX.resume().catch(()=>{});return AUX}
addEventListener("visibilitychange",()=>{if(!AUX)return;if(document.hidden)AUX.suspend().catch(()=>{});else AUX.resume().catch(()=>{})});

// старий tone() із core.js тепер іде через спільну шину ефектів
function tone(f,d,ty,v){try{const A=ax(),o=A.createOscillator(),g=A.createGain();o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(v,A.currentTime);g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+d);o.connect(g);g.connect(ABUS.sfx);o.start();o.stop(A.currentTime+d+.02)}catch(e){}}

// ── будівельні блоки ──
function aOsc(t,d,o){const A=AUX,x=A.createOscillator(),g=A.createGain(),v=o.v??.3,a=o.a??.004;x.type=o.ty||"sine";x.frequency.setValueAtTime(o.f0,t);if(o.f1)x.frequency.exponentialRampToValueAtTime(o.f1,t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);x.connect(g);g.connect(o.out||ABUS.sfx);x.start(t);x.stop(t+d+.03)}
function aNz(t,d,o){const A=AUX,s=A.createBufferSource(),f=A.createBiquadFilter(),g=A.createGain(),v=o.v??.3,a=o.a??.002;s.buffer=ANB;s.loop=true;f.type=o.type||"bandpass";f.frequency.setValueAtTime(o.f0,t);if(o.f1)f.frequency.exponentialRampToValueAtTime(o.f1,t+d);f.Q.value=o.q??1;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(o.out||ABUS.sfx);s.start(t,Math.random()*.9);s.stop(t+d+.03)}
const aBell=(t,f,d,v,out)=>{aOsc(t,d,{f0:f,v,out,a:.003});aOsc(t,d*.6,{f0:f*2.01,v:v*.35,out,a:.003});aOsc(t,d*.35,{f0:f*3.2,v:v*.15,out,a:.003})};

// ── ЕФЕКТИ (синтез). Кожен: (час, аргумент) ──
const SYN={
 slash:(t,c=0)=>{const k=Math.min(1,c/20);aNz(t,.1,{type:"bandpass",f0:2400+k*1800,f1:650,q:1.1,v:.2});aOsc(t,.06,{f0:1500+k*900,f1:800,ty:"triangle",v:.045})},                       // свист леза; з комбо — світліший
 bosshit:t=>{aOsc(t,.18,{f0:180,f1:52,v:.36});aNz(t,.08,{type:"lowpass",f0:2400,f1:300,v:.2});aOsc(t,.12,{f0:520,f1:300,ty:"triangle",v:.05})},                                     // глухий удар по босу
 bossin:t=>{aOsc(t,1.5,{f0:64,f1:42,v:.42,a:.01});aOsc(t,1.1,{f0:128,f1:90,ty:"triangle",v:.14});aNz(t,.95,{type:"bandpass",f0:180,f1:2600,q:.8,v:.14,a:.55});aOsc(t+.55,.28,{f0:140,f1:48,v:.4});aOsc(t+.8,.34,{f0:125,f1:44,v:.45})},   // поява боса: гонг + два удари тайко
 bossdie:t=>{aNz(t,.55,{type:"lowpass",f0:3200,f1:140,v:.3});aOsc(t,.75,{f0:280,f1:46,v:.36});[0,4,7,12,16].forEach((s,i)=>aBell(t+.2+i*.07,523*2**(s/12),.45,.08))},              // смерть боса
 bomb:t=>{aNz(t,.6,{type:"lowpass",f0:1700,f1:80,v:.42,a:.003});aOsc(t,.55,{f0:110,f1:30,v:.45});aNz(t,.09,{type:"highpass",f0:3200,v:.2})},                                       // вибух гарбуза/бомби
 tick:t=>{aNz(t,.024,{type:"highpass",f0:2300+Math.random()*1000,v:.2,a:.0008});aOsc(t,.028,{f0:1500+Math.random()*350,f1:880,ty:"square",v:.04})},                                // тріскачка прокрутки
 chesthit:(t,n=1)=>{aOsc(t,.12,{f0:230+n*16,f1:85,ty:"triangle",v:.38});aNz(t,.06,{type:"bandpass",f0:950,f1:380,q:3,v:.22})},                                                    // дерев'яний стук по скрині
 chestcrack:t=>{aNz(t,.2,{type:"highpass",f0:1400,f1:500,v:.34,a:.001});aOsc(t,.34,{f0:92,f1:38,v:.45});aOsc(t+.02,.3,{f0:190,f1:380,ty:"sawtooth",v:.05});[0,7,12,16].forEach((s,i)=>aBell(t+.14+i*.06,880*2**(s/12),.4,.06))},   // скриня розколюється
 reveal:(t,r=0)=>{aNz(t,.95,{type:"bandpass",f0:500,f1:5200,q:.7,v:.08,a:.45});const n=4+r;for(let i=0;i<n;i++)aBell(t+.12+i*.1,523*2**(PENT[i%5]/12+((i/5)|0)),.9,.09+.012*r);if(r>=2)[0,4,7].forEach(s=>aBell(t+.12+n*.1,523*2**(s/12),1.3,.07))},   // нагорода: арпеджіо дзвіночків, довше для рідкісних
 land:t=>{aOsc(t,.24,{f0:98,f1:46,v:.34});aNz(t,.07,{type:"lowpass",f0:900,f1:200,v:.2})},                                                                                          // приз «приземлився»
 combo:(t,n=3)=>{for(let i=0;i<Math.min(5,n);i++)aBell(t+i*.045,660*2**(PENT[i%5]/12),.3,.06)}
};

// ── публічний sfx(ключ, запасний_варіант, аргумент). Файл sfx/<ключ>.mp3 → інакше синтез → інакше запасний ──
Object.assign(SFXF,{bosshit:"sfx/boss.mp3",bossin:"sfx/bossin.mp3",bossdie:"sfx/bossdie.mp3",bomb:"sfx/bomb.mp3",chesthit:"sfx/chesthit.mp3",chestcrack:"sfx/chestcrack.mp3",land:"sfx/land.mp3",combo:"sfx/combo.mp3"});
Object.keys(SFXF).forEach(k=>{if(!SA[k]){const a=new Audio(SFXF[k]);a.preload="auto";a.onerror=()=>{a.bad=1};SA[k]=a}});
function aDuck(sec){if(!ABUS)return;const A=AUX,g=ABUS.mus.gain,t=A.currentTime;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(.4,t+.08);g.linearRampToValueAtTime(1,t+sec)}   // музика на мить тихшає під великі звуки
function aSyn(k,fb,arg){try{if(SYN[k]){const A=ax();SYN[k](A.currentTime+.005,arg);if(k=="reveal")aDuck(2.2);else if(k=="bossin"||k=="bossdie")aDuck(1.6)}else if(fb)fb()}catch(e){}}
function sfx(k,fb,arg){
 if(!music)return;                      // кнопка 🔊/🔇 вимикає і музику, і ефекти
 const n=performance.now(),g=AUD.gap[k]||0;if(g&&n-(ASL[k]||0)<g)return;ASL[k]=n;   // обмеження частоти: 10 пальців не перетворюються на кашу
 const a=SA[k];if(a&&!a.bad){const c=a.cloneNode();c.volume=AUD.fileVol;c.play().catch(()=>{a.bad=1;aSyn(k,fb,arg)});return}
 aSyn(k,fb,arg)}

// ═══ МУЗИКА ═══
const HIRA=[0,2,3,7,8];                  // гама Хіраджоші — «японське» звучання
const MUSX={k:null,iv:null,g:null,nodes:[],next:0,step:0,dly:null};let mwk=4;
function musStop(){clearInterval(MUSX.iv);MUSX.iv=null;if(MUSX.g&&AUX){const g=MUSX.g,t=AUX.currentTime,nd=MUSX.nodes;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(.0001,t+.9);
  setTimeout(()=>{nd.forEach(n=>{try{n.stop()}catch(e){}});try{g.disconnect()}catch(e){}},1000)}MUSX.g=null;MUSX.nodes=[];MUSX.k=null;MUSX.dly=null}
function aPluck(t,f,d,v){const A=AUX,o=A.createOscillator(),o2=A.createOscillator(),g=A.createGain(),fl=A.createBiquadFilter();o.type="triangle";o2.type="sine";o.frequency.value=f;o2.frequency.value=f*2;fl.type="lowpass";fl.frequency.setValueAtTime(3200,t);fl.frequency.exponentialRampToValueAtTime(500,t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(fl);o2.connect(fl);fl.connect(g);g.connect(MUSX.g);if(MUSX.dly)g.connect(MUSX.dly);o.start(t);o2.start(t);o.stop(t+d+.05);o2.stop(t+d+.05)}
function stepMus(t,s){
 if(MUSX.k=="menu"){                     // ЛОБІ: повільно, повітряно — випадкові ноти гами з відлунням і подихом вітру
  if(R()<.42){mwk=Math.max(0,Math.min(9,mwk+((R()*5|0)-2)));aPluck(t,220*2**((HIRA[mwk%5]+(mwk/5|0)*12)/12),1.8,.1+R()*.05)}
  if(s%16==0&&R()<.5)aNz(t,3,{type:"bandpass",f0:400,f1:1800,q:.6,v:.035,a:1.2,out:MUSX.g})
 }else{                                  // БІЙ: тайко, шіме, шамісен-арпеджіо; ближче до кінця раунду щільніше
  const el=(typeof G!=="undefined"&&G.el)||0,hot=Math.min(1,el/120),p=s%16;
  if(p==0||p==6||p==10)aOsc(t,.22,{f0:130,f1:48,v:.34,out:MUSX.g});
  if(p==0)aOsc(t,.4,{f0:65,f1:40,v:.2,out:MUSX.g});
  if(p==4||p==12)aNz(t,.07,{type:"bandpass",f0:2200,q:1.5,v:.1,out:MUSX.g});
  if((p%2==0&&R()<.5+hot*.25)||(p==15&&R()<.6)){mwk=Math.max(0,Math.min(9,mwk+((R()*5|0)-2)));aPluck(t,220*2**((HIRA[mwk%5]+(mwk/5|0)*12)/12),.3,.07)}
  if(p%4==2&&R()<.35+hot*.35)aNz(t,.04,{type:"highpass",f0:6000,v:.05,out:MUSX.g});
  if(s%64==48&&hot>.2)for(let i=0;i<4;i++)aOsc(t+i*.067,.12,{f0:150-i*10,f1:60,v:.25,out:MUSX.g})}}
function musStart(k){
 if(MUSX.k==k)return;musStop();const A=ax(),g=A.createGain();g.gain.setValueAtTime(.0001,A.currentTime);g.gain.linearRampToValueAtTime(AUD.mus[k]??.2,A.currentTime+1.4);g.connect(ABUS.mus);MUSX.g=g;MUSX.k=k;MUSX.step=0;MUSX.next=A.currentTime+.15;
 const dl=A.createDelay(1),fb=A.createGain(),wet=A.createGain();dl.delayTime.value=k=="menu"?.42:.22;fb.gain.value=k=="menu"?.38:.25;wet.gain.value=.5;dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(g);MUSX.dly=dl;
 const drone=(f,ty,v,lf)=>{const o=A.createOscillator(),gg=A.createGain(),fl=A.createBiquadFilter(),lfo=A.createOscillator(),lg=A.createGain();o.type=ty;o.frequency.value=f;fl.type="lowpass";fl.frequency.value=k=="menu"?500:380;gg.gain.value=v;lfo.frequency.value=lf;lg.gain.value=v*.5;lfo.connect(lg);lg.connect(gg.gain);o.connect(fl);fl.connect(gg);gg.connect(g);o.start();lfo.start();MUSX.nodes.push(o,lfo)};
 if(k=="menu"){drone(110,"sine",.22,.07);drone(164.8,"triangle",.1,.05);drone(220,"sine",.06,.09)}else{drone(55,"sawtooth",.08,.12);drone(82.4,"sine",.12,.08)}
 const la=()=>{while(MUSX.next<AUX.currentTime+.3){stepMus(MUSX.next,MUSX.step++);MUSX.next+=(k=="menu"?.5:.134)}};MUSX.iv=setInterval(la,70);la()}

// файли music/menu.mp3 / music/battle.mp3 мають пріоритет; якщо їх немає — грає синтезована музика того ж «настрою»
Object.keys(mA).forEach(k=>{mA[k].onerror=()=>{mA[k].bad=1;if(mStarted&&music&&mTrack==k)musStart(k)}});
function setMusic(k){mTrack=k;if(!mStarted)return;
 Object.keys(mA).forEach(n=>{const a=mA[n];if(n==k&&music&&!a.bad){a.play().catch(()=>{a.bad=1;if(mTrack==k&&music)musStart(k)});fade(a,CFG.vol[k]??.4)}else fade(a,0,()=>a.pause())});
 if(music&&mA[k].bad)musStart(k);else musStop()}
