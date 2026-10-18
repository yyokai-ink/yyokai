/* INKAI core.js — спільне ядро: налаштування, стан, звук, навігація, заставка, реклама-стрілка */

// ═══ 0. НАЛАШТУВАННЯ 🔧 ═══
const firebaseConfig={apiKey:"PASTE_API_KEY",authDomain:"PASTE_PROJECT_ID.firebaseapp.com",projectId:"PASTE_PROJECT_ID",storageBucket:"PASTE_PROJECT_ID.appspot.com",messagingSenderId:"PASTE_SENDER_ID",appId:"PASTE_APP_ID",measurementId:"PASTE_MEASUREMENT_ID"};
const CFG={
 hero:{name:"INKAI",quote:"Кожна лінія — це історія. Кожен йокай — частина неї.|Every line tells a story. Every yokai is a part of her."},
 promo:{text:"Підпишись на Instagram YYOKAI|Follow YYOKAI on Instagram",url:"https://instagram.com/yyokai.tattoo"},
 adEvery:3,offerReward:1000,offlineBaseMin:120,adminHash:"__HASH__",
 adw:{max:3,gap:600000},
 vapidKey:"PASTE_VAPID_KEY",   // Firebase → Project settings → Cloud Messaging → Web push certificates
 shogun:{day:6,from:20,to:23},   // «Ніч Сьогуна»: субота 20:00–23:00 за часом гравця, монети ×2
 masterSwitchDays:30,           // як часто можна міняти майстра

 vol:{menu:.4,battle:.15}   // гучність музики: меню 40%, у грі 15% (щоб не перебивала звук розрізу)   // стрілка-реклама: 3 рази на день, пауза 10 хв
};

// ═══ 1. FIREBASE (ініціалізується в boot) ═══
let FB={},app,auth,db,FBOK=false,authReady,FA={};
function track(n,p){try{if(FA.log)FA.log(FA.a,n,p||{})}catch(e){}}      // Google Analytics 4 (безкоштовно): події для статистики
const authReadyP=new Promise(r=>authReady=r);
async function fbInit(){try{
 const B="https://www.gstatic.com/firebasejs/10.8.0/";
 const m=await Promise.all([import(B+"firebase-app.js"),import(B+"firebase-auth.js"),import(B+"firebase-firestore.js")]);
 FB=Object.assign({},...m);app=FB.initializeApp(firebaseConfig);auth=FB.getAuth(app);db=FB.getFirestore(app);
 FBOK=!firebaseConfig.apiKey.startsWith("PASTE");
 if(FBOK){try{const A=await import(B+"firebase-analytics.js");FA={a:A.getAnalytics(app),log:A.logEvent}}catch(e){}initAuth()}else authReady();
}catch(e){authReady()}}

// ═══ 2. ДОПОМІЖНЕ ═══
const $=i=>document.getElementById(i),R=Math.random,today=()=>new Date().toISOString().slice(0,10),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fmt=n=>{n=Math.floor(n);if(n<1e6)return n.toLocaleString();let i=0;while(n>=1000&&i<5){n/=1000;i++}return(n<100?n.toFixed(1):Math.floor(n))+["","K","M","B","T","Q"][i]};
const ICOK=new Set();   // які PNG-іконки реально існують (перевіряється один раз при старті → жодного блимання емодзі)
const ico=(n,e,c="h-4 w-4 inline-block align-middle object-contain")=>ICOK.has(n)?`<img src="img/ico/${n}.png" class="${c}" alt="">`:e;   // своя PNG-іконка або емодзі
const icoH=(n,h,c)=>ICOK.has(n)?`<img src="img/ico/${n}.png" class="${c}" alt="">`:h;   // PNG або запасний HTML (іконка FontAwesome)
/* ── УНІВЕРСАЛЬНА ЗАМІНА ЕМОДЗІ НА PNG ──
   Поклади img/emoji/<код>.png (код = кодпоінт у hex, напр. 🎁 → 1f381.png, ⛩️ → 26e9.png). Гра сама знайде файл і замінить цей емодзі
   в усіх текстах, кнопках, нагородах і на canvas. Список кодів, які є в грі, — EMALL нижче й у inkai-assets.md */
const EMALL=["1f3ad","1f3ee","1f48e","1f381","26e9","1f451","2694","1f4fa","1f465","1f3f7","1f98a","1f479","1f409","1f527","1f47a","1f438","1f977","26a1","1f4dc","2744","1f480","23f3","1f514","2716","1f338","2b50","1f525","1f573","1f319","2705","1f50a","1f3c6","1f4f2","1fa99","1f4c5","1f47b","1f517","1f32a","1f5e1","1f49a","1f1fa-1f1e6","1f4a4","1f3c5","1f91d","1f3af","1faa8","1f4b0","1f9db","2600","2728","2764","1f507","274c","25b6","1f431","1f3b0","26d4","1f3b5","1f916","1f308","1f30b","1f30c","1f432","1f3ef","1f98c","1f3f0","1f4a5","1f6e1","1f300","1f570","1f680","23ed","23f1","1f5bc","1f4c8","1f4e3","1f31f","1f54a","1fa9e","1f41d","1f388","1f9ec","1f343","1f98e","1f4a8","26a0","2601","2604","2623","2668","2702","2708","1f1ec-1f1e7","1f50d","1f4e7","1f5d3","1f7e2","1f4f8","1fa78","1f4a0","1f52e","1f327","1f32c","1f4c4","1f41f","1f47e","1f320","1f38b","1f5fb","1f30a","1f41a","1f35c","1f3b2","1f4e6","1f634","1f9ff","1f4ab","1f497","1f6ab","1f340","1f948","1f947","1f3fa","1f33e","26f0","1faad","1f375","1f38e","1f33a","1f38c","1f682","1f4fc","1fab7","1f303","1f985","1f39f","1f987"];
let EMJ=new Set();const EIM={};
const EMRX=/(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?)*)/gu;
const emCode=s=>[...s].map(c=>c.codePointAt(0).toString(16)).filter(h=>h!="fe0f").join("-");
function emojiSwap(root){if(!EMJ.size||!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),L=[];let n;
 while(n=w.nextNode()){const p=n.parentNode;if(!p||/^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION)$/.test(p.nodeName))continue;EMRX.lastIndex=0;if(EMRX.test(n.nodeValue))L.push(n)}
 for(const n of L){const s=n.nodeValue,fr=document.createDocumentFragment();EMRX.lastIndex=0;let last=0,m,ch=0;
  while(m=EMRX.exec(s)){const code=emCode(m[0]);if(!EMJ.has(code))continue;fr.append(s.slice(last,m.index));const im=document.createElement("img");im.src="img/emoji/"+code+".png";im.alt=m[0];im.className="emj";im.onerror=function(){EMJ.delete(code);this.replaceWith(document.createTextNode(this.alt))};fr.append(im);last=m.index+m[0].length;ch=1}
  if(ch){fr.append(s.slice(last));n.replaceWith(fr)}}}
function rich(c,s,x,y,size){      // текст на canvas із PNG замість емодзі
 const parts=[];EMRX.lastIndex=0;let last=0,m;
 while(m=EMRX.exec(s)){const code=emCode(m[0]);if(!EMJ.has(code)||!EIM[code])continue;if(m.index>last)parts.push([0,s.slice(last,m.index)]);parts.push([1,code]);last=m.index+m[0].length}
 if(!parts.length){c.fillText(s,x,y);return}
 if(last<s.length)parts.push([0,s.slice(last)]);
 const wd=parts.map(p=>p[0]?size*1.15:c.measureText(p[1]).width),tot=wd.reduce((a,b)=>a+b,0),al=c.textAlign;let px=al=="center"?x-tot/2:al=="right"?x-tot:x;c.textAlign="left";
 parts.forEach((p,i)=>{if(p[0])c.drawImage(EIM[p[1]],px,y-size*.85,size*1.15,size*1.15);else c.fillText(p[1],px,y);px+=wd[i]});c.textAlign=al}
async function startEmoji(){
 const q=new Set();new MutationObserver(ms=>{if(!EMJ.size)return;for(const m of ms){m.addedNodes.forEach(n=>{if(n.nodeType==1)q.add(n);else if(n.nodeType==3&&n.parentNode)q.add(n.parentNode)});if(m.type=="characterData"&&m.target.parentNode)q.add(m.target.parentNode)}
  if(q.size&&!q.t){q.t=requestAnimationFrame(()=>{q.t=0;const a=[...q];q.clear();a.forEach(n=>n.isConnected&&emojiSwap(n))})}}).observe(document.body,{childList:true,subtree:true,characterData:true});
 await Promise.all(EMALL.map(code=>new Promise(r=>{const i=new Image();i.onload=()=>{EMJ.add(code);EIM[code]=i;r()};i.onerror=r;i.src="img/emoji/"+code+".png"})));
 if(EMJ.size)emojiSwap(document.body)}
function hdrIcons(){$("iCoin").innerHTML=ico("coin","文");$("iSoul").innerHTML=ico("soul","⛩️");$("iJade").innerHTML=ico("jade","💎");$("iLan").innerHTML=ico("lantern","🏮")}
async function probeIco(){const names=["coin","soul","jade","lantern",...["play","shop","chests","friends","rewards","rating","profile"].map(x=>"nav_"+x),...BS.map(b=>"b_"+b[0]),...UP.map(u=>"u_"+u[0])];
 await Promise.all(names.map(n=>new Promise(r=>{const i=new Image();i.onload=()=>{ICOK.add(n);r()};i.onerror=r;i.src="img/ico/"+n+".png"})));
 if(ICOK.size){hdrIcons();navIcons();rend()}}
function navIcons(){document.querySelectorAll(".nv").forEach(e=>e.innerHTML=icoH("nav_"+e.dataset.n,`<i class="fa-solid fa-${e.dataset.fa}"></i>`,"h-6 w-6 object-contain"))}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let lang=localStorage.ink_lang||"ua";const t=s=>{const a=String(s).split("|");return lang=="ua"?a[0]:a[1]||a[0]};
async function sha(s){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
function toast(m){const e=$("toast");e.textContent=m;e.classList.remove("hidden");setTimeout(()=>e.classList.add("hidden"),4500)}
const tm=ms=>{const s=Math.ceil(ms/1000),d=s/86400|0,h=s%86400/3600|0,m=s%3600/60|0;return d?`${d}${t("д|d")} ${h}${t("г|h")}`:h?`${h}:${String(m).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`:`${m}:${String(s%60).padStart(2,"0")}`};
const wp=a=>{let x=R()*a.reduce((s,v)=>s+v,0),i=0;for(;i<a.length-1;i++){x-=a[i];if(x<0)break}return i};   // випадок за вагами
const rr=(a,b)=>a+(R()*(b-a+1)|0);                                                                          // ціле від a до b
const inApp=/Instagram|FBAN|FBAV|Telegram|TikTok|Line\//i.test(navigator.userAgent);
["gesturestart","gesturechange","gestureend"].forEach(n=>document.addEventListener(n,e=>e.preventDefault(),{passive:false}));
document.addEventListener("touchmove",e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
function mkAmb(el,n){const E=["🦊","👹","👺","🐸","💀","🐉"],N=["fox","oni","tengu","kappa","skull","dragon"];el.innerHTML=Array.from({length:n},(_,i)=>{const k=i%6,s=46+R()*50;return `<div class="fl" style="--x0:${R()*90}vw;--x1:${R()*90}vw;--rt:${(R()-.5)*160}deg;animation-duration:${22+R()*26}s;animation-delay:-${R()*40}s;width:${s}px;height:${s}px;font-size:${s*.8}px;line-height:${s}px;text-align:center"><img src="img/yokai/${N[k]}.png" data-e="${E[k]}" onerror="this.outerHTML=this.dataset.e" style="width:100%;height:100%;object-fit:contain"></div>`}).join("")}

// ═══ 3. ДАНІ ГРАВЦЯ ═══
const def={
 mon:500,souls:10,jd:0,ln:3,                // 文 монети · ⛩️ душі · 💎 нефрит (jd) · 🏮 ліхтарі (ln)
 xp:0,rounds:0,kills:0,ads:0,
 days:1,streak:1,best:1,last:today(),dl:"",
 seen:Date.now(),nick:"",av:"fox",
 blade:0,bg:0,blades:[0],bgs:[0],up:{},
 // бустери (зберігаються між раундами й сесіями). Нові: br мост, mb ×1.5 монет, sl0 повільний старт, bh0 чорна діра, shd щит,
 // st +300, cmb комбо ×10, bos ранній бос, wide широке лезо, slw повільне падіння, lx ×2 ліхтарі, sx +1 душа, m10/m30 = ×2 монет на 10/30 с
 c:{x2:0,x3:0,plus:0,fz:0,chg:0,br:0,mb:0,sl0:0,bh0:0,shd:0,st:0,cmb:0,bos:0,wide:0,slw:0,lx:0,sx:0,m10:0,m30:0,mx5:0,hrt:0,fz15:0,nsc:0,bhf:0,sc2:0,lck:0},
 ck:{s:0,sn:0,sd:"",g:0,d:0},bp:{},bpd:"",
 adw:{n:0,d:"",t:0},                        // стрілка-реклама
 avs:[],pzUsed:[],qd:{},qt:{},friends10:0,tot:0,lm:0,master:null,masterAt:0,tatGot:0,pt:0,wk:"",pw:[0,0],fcm:"",bossWins:0,                       // для складніших умов тату (див. social.js)
 cp:[],claimed:[],friends:0,offers:{}
};
let S={...def,...JSON.parse(localStorage.ink_s5||"{}")};S.c={...def.c,...S.c};S.ck={...def.ck,...S.ck};S.adw={...def.adw,...S.adw};S.bp=S.bp||{};
let user=null,mode="reg",cur="play",guestMode=false,splashDone=false,adminOK=false,PL=[],FR=[],OFFERS=[],opening=0;
const refId=new URLSearchParams(location.search).get("ref")||localStorage.ink_ref||"";
if(new URLSearchParams(location.search).get("ref"))localStorage.ink_ref=refId;
const isReal=()=>FBOK&&user&&user.uid!="local_guest";
const lvl=x=>1+Math.floor(Math.sqrt(x/300));
const U=k=>S.up[k]||0;
const playing=()=>typeof G!="undefined"&&G.on;
const shogunNight=()=>{const d=new Date(),h=d.getHours(),z=CFG.shogun;return d.getDay()==z.day&&h>=z.from&&h<z.to};
function addPlay(sec){if(!(sec>0))return;const d=new Date(),j=new Date(d.getFullYear(),0,1),w=d.getFullYear()+"-"+Math.ceil(((d-j)/864e5+j.getDay()+1)/7);   // час у грі: усього й по тижнях (для пушів «ми сумуємо»)
 if(S.wk!==w){S.pw=[0,S.wk?S.pw[0]:0];S.wk=w}S.pt=(S.pt||0)+sec;S.pw[0]+=sec}
async function enablePush(){track("push_enable");
 if(!isReal()){toast(t("Спершу увійди через Google/Apple|Sign in with Google/Apple first"));return}
 if(!("Notification" in window)||!("serviceWorker" in navigator)){toast(t("Цей браузер не підтримує сповіщення (на iPhone спершу встанови гру на екран)|This browser has no notifications (on iPhone install the game first)"));return}
 try{const p=await Notification.requestPermission();if(p!="granted"){toast(t("Сповіщення вимкнені в налаштуваннях браузера|Notifications are blocked in browser settings"));return}
  const M=await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js"),reg=await navigator.serviceWorker.register("firebase-messaging-sw.js");
  S.fcm=await M.getToken(M.getMessaging(app),{vapidKey:CFG.vapidKey,serviceWorkerRegistration:reg});save();push();toast(t("🔔 Сповіщення увімкнено|🔔 Notifications enabled"));if(cur=="profile")rProfile()}
 catch(e){alert(e.message)}}
let KATL=new Set();      // номери катан, для яких є свій PNG (img/katana/<номер>.png); список — у data/katana.json
async function loadKat(){try{const r=await fetch("data/katana.json?v="+Date.now());if(r.ok){const j=await r.json();if(Array.isArray(j))KATL=new Set(j.map(Number))}}catch(e){}}
function sync(){if(S.mon>(S.lm||0))S.tot=(S.tot||0)+S.mon-(S.lm||0);S.lm=S.mon}   // «усього зароблено монет» для умов тату
function save(){sync();localStorage.ink_s5=JSON.stringify(S)}
(function newDay(){const d=today();if(S.last!==d){const y=new Date(Date.now()-864e5).toISOString().slice(0,10);S.streak=S.last===y?S.streak+1:1;S.best=Math.max(S.best,S.streak);S.days++;S.last=d}if(S.bpd!==d){S.bpd=d;S.bp={}}})();
async function push(){
 if(!isReal()||!S.nick)return;
 const{offers,friends,...r}=S;
 try{
  await FB.setDoc(FB.doc(db,"users",user.uid),{...r,coins:S.mon,lvl:lvl(S.xp),nickLc:S.nick.toLowerCase(),email:user.email||"",lastSeen:FB.serverTimestamp()},{merge:true});
  await FB.setDoc(FB.doc(db,"public",user.uid),{nick:S.nick,nickLc:S.nick.toLowerCase(),av:S.av,xp:S.xp,lvl:lvl(S.xp),days:S.days,coins:S.mon,ts:FB.serverTimestamp()},{merge:true});
 }catch(e){}
}
async function logDay(){if(!isReal()||S.dl===today())return;S.dl=today();try{await FB.addDoc(FB.collection(db,"daylog"),{uid:user.uid,ts:FB.serverTimestamp()})}catch(e){}}
setInterval(()=>{S.seen=Date.now();save();push()},20000);
addEventListener("visibilitychange",()=>{if(document.hidden){S.seen=Date.now();save();push()}});

// ═══ 4. ЗВУК ═══
const MUS={menu:"music/menu.mp3",battle:"music/battle.mp3"},PENT=[0,2,4,7,9];
let music=localStorage.ink_mus!=0,mTrack="menu",mStarted=0,synthT=null;const mA={};
Object.keys(MUS).forEach(k=>{const a=new Audio(MUS[k]);a.loop=true;a.volume=0;a.preload="auto";a.onerror=()=>{a.bad=1};mA[k]=a});
function tone(f,d,ty,v){try{window.AC=window.AC||new (window.AudioContext||window.webkitAudioContext)();const A=AC,o=A.createOscillator(),g=A.createGain();o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(v,A.currentTime);g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+d);o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+d)}catch(e){}}
const snd=(f,d=.09,v=.12)=>tone(f,d,"sawtooth",v);
function fade(a,to,done){const s0=a.volume,t0=performance.now(),f=n=>{const p=Math.min(1,(n-t0)/900);a.volume=Math.max(0,Math.min(1,s0+(to-s0)*p));if(p<1)requestAnimationFrame(f);else done&&done()};requestAnimationFrame(f)}
function synth(k){let n=0;synthT=setInterval(()=>{if(!music)return;if(k=="menu")tone(220*2**(PENT[R()*5|0]/12)*(R()<.5?1:2),2.2,"sine",.05);else{n++;if(n%4==1)tone(70,.25,"sine",.18);tone(110*2**([0,3,5,7,10][n%5]/12),.2,"sawtooth",.04)}},k=="menu"?1300:260)}
function setMusic(k){mTrack=k;if(!mStarted)return;clearInterval(synthT);Object.keys(mA).forEach(n=>{const a=mA[n];if(n==k&&music){a.play().catch(()=>{});fade(a,CFG.vol[k]??.4)}else fade(a,0,()=>a.pause())});if(music&&mA[k].bad)synth(k)}
function toggleMusic(){music=!music;localStorage.ink_mus=music?1:0;$("musBtn").textContent=music?"🔊":"🔇";setMusic(mTrack)}
const SFXF={slash:"sfx/slash.mp3",boss:"sfx/boss.mp3",tick:"sfx/tick.mp3",reveal:"sfx/reveal.mp3"},SA={};
Object.keys(SFXF).forEach(k=>{const a=new Audio(SFXF[k]);a.preload="auto";a.onerror=()=>{a.bad=1};SA[k]=a});
addEventListener("pointerdown",()=>{if(mStarted)return;mStarted=1;Object.values(SA).forEach(a=>a.load());try{window.AC=window.AC||new (window.AudioContext||window.webkitAudioContext)();AC.resume()}catch(e){}setMusic(mTrack)},{capture:true});
function sfx(k,fb){const a=SA[k];if(a&&!a.bad){const c=a.cloneNode();c.volume=.8;c.play().catch(()=>{a.bad=1;fb&&fb()})}else if(fb)fb()}
function testSnd(k){const a=SA[k]||mA[k];if(!a)return;const c=a.cloneNode();c.volume=.8;c.play().catch(e=>alert(k+": "+e.name+" — файл відсутній / file missing"))}
const sndStat=()=>Object.entries({...SFXF,...MUS}).map(([k,u])=>{const a=SA[k]||mA[k];return `<div class="flex justify-between text-[11px]"><span>${u}</span><span>${a.bad?"❌":"✅"} <button class="underline ml-2" onclick="testSnd('${k}')">▶</button></span></div>`}).join("");

// ═══ 5. НАВІГАЦІЯ І МОВА ═══
const RV={play:()=>rPlay(),shop:()=>rShop(),chests:()=>rChests(),friends:()=>rFriends(),rewards:()=>rRewards(),rating:()=>rRating(),profile:()=>rProfile(),admin:()=>rAdmin(),auth:()=>{}};
function hdr(){$("hCoins").textContent=fmt(S.mon);$("hSouls").textContent=fmt(S.souls);$("hJade").textContent=fmt(S.jd);$("hLan").textContent=fmt(S.ln)}
function rend(){hdr();const f=RV[cur];if(f&&!(cur=="chests"&&opening))f()}
function go(v){cur=v;document.querySelectorAll(".view").forEach(e=>e.classList.add("hidden"));const el=$("view-"+v);if(el)el.classList.remove("hidden");
 document.querySelectorAll(".nb").forEach(b=>{const a=b.dataset.g==v;b.classList.toggle("text-crimsonRed",a);b.classList.toggle("text-gray-400",!a)});
 $("hdr").style.display=$("nav").style.display=v=="auth"?"none":"";$("amb").style.display=v=="auth"?"none":"block";window.scrollTo(0,0);rend();adTick();track("screen",{name:v})}
function tr(){document.querySelectorAll("[data-t]").forEach(e=>e.textContent=t(e.dataset.t));document.querySelectorAll("[data-p]").forEach(e=>e.placeholder=t(e.dataset.p));$("langBtn").textContent=$("langBtn2").textContent=lang=="ua"?"🇺🇦":"🇬🇧";authMode(mode);if(!splashDone)$("spQ").textContent=t(CFG.hero.quote)}
function toggleLanguage(){lang=lang=="ua"?"en":"ua";localStorage.ink_lang=lang;tr();rend()}
function route(){
 if(!splashDone)return;
 if(user&&!S.nick){showNick();return}
 if(user||guestMode){go("play");ensureMaster();return}
 if(refId)$("refBanner").classList.remove("hidden");
 $("inApp").classList.toggle("hidden",!inApp);authMode("reg");go("auth");track("step_auth_view");
}

// ═══ 6. ВСТАНОВЛЕННЯ (іконка на робочий стіл) ═══
let dip=null;addEventListener("beforeinstallprompt",e=>{e.preventDefault();dip=e});
function install(){track("install_click");
 if(dip){dip.prompt();dip=null;return}
 if(/iphone|ipad|ipod/i.test(navigator.userAgent))alert(t("Safari: «Поділитись» → «На початковий екран».|Safari: Share → Add to Home Screen."));
 else alert(t("Меню браузера → «Встановити застосунок» / «Додати на головний екран».|Browser menu → Install app / Add to Home screen."));
}

// ═══ 7. ЗАСТАВКА: лого по центру між верхом і смужками ═══
function splash(){
 $("spName").textContent=CFG.hero.name;
 for(let i=0;i<14;i++){const e=document.createElement("i");e.className="ember";e.style.cssText=`left:${R()*100}%;--dx:${(R()-.5)*120}px;animation-duration:${3+R()*4}s;animation-delay:${R()*4}s`;$("splash").appendChild(e)}
 const imgs=[...Object.values(YIMG),...CHF.map(n=>{const i=new Image();i.src="img/chest/"+n+".png";return i})];
 let loaded=0,authOk=false;imgs.forEach(i=>{if(i.complete)loaded++;else i.onload=i.onerror=()=>loaded++});
 authReadyP.then(()=>authOk=true);setTimeout(()=>authOk=true,4000);
 const t0=performance.now();
 const iv=setInterval(()=>{
  const el=performance.now()-t0,real=loaded/imgs.length*.8+(authOk?.2:0),sh=Math.min(1,real,el/6000);
  $("spBar").style.width=Math.max(8,sh*100)+"%";$("spV").style.height=sh*100+"%";$("spPct").textContent=Math.round(sh*100)+"%";
  $("spTxt").textContent=sh>=1?t("Готово|Ready"):sh<.4?t("Малюємо йокаїв…|Drawing yokai…"):sh<.8?t("Куємо клинки…|Forging blades…"):t("Відкриваємо врата…|Opening the gate…");
  if(sh>=1||el>9000){clearInterval(iv);
   setTimeout(()=>{splashDone=true;route();adTick();track("step_splash_done");$("splash").style.opacity=0;setTimeout(()=>$("splash").remove(),700)},250);   // спершу готуємо потрібний екран під заставкою — жодного «блимання» гри   // 6 с — і одразу на реєстрацію
  }
 },100);
}

// ═══ 8. РЕКЛАМА: оверлей + бокова стрілка (3 рази на день, раз на 10 хв) ═══
let adCb=null,adTm=null;
function ad(txt,cbk,rw,forced){track("ad_start",{kind:String(txt).slice(0,20)});adCb=cbk;$("adText").textContent=t(txt);$("adOv").classList.replace("hidden","flex");$("adX").classList.toggle("hidden",!!forced);const b=$("adBtn");b.disabled=true;let n=5;clearTimeout(adTm);const tick=()=>{b.textContent=n>0?`${t("Зачекай|Wait")} ${n}s`:`${t("Забрати|Continue")} ${rw||""}`;if(n--<=0)b.disabled=false;else adTm=setTimeout(tick,1000)};tick()}
function adClose(){$("adOv").classList.replace("flex","hidden")}
function adClaim(){track("ad_done");adClose();S.ads++;if(isReal())FB.addDoc(FB.collection(db,"adEvents"),{uid:user.uid,ts:FB.serverTimestamp()}).catch(()=>{});if(adCb)adCb();adCb=null;save();rend()}
function mkAdw(){const d=document.createElement("div");d.id="adw";d.className="fixed right-0 z-[60]";d.style.top="38%";d.style.display="none";
 d.innerHTML=`<button id="adwB" onclick="adwGo()" class="flex items-center gap-1 pl-2.5 pr-1.5 py-2.5 rounded-l-2xl bg-gradient-to-r from-neonGold to-crimsonRed text-white text-[11px] font-black shadow-[0_0_16px_rgba(255,42,95,.5)] active:scale-95"><i class="fa-solid fa-chevron-left"></i><span>📺</span><span id="adwT" class="font-mono">3/3</span></button>`;document.body.appendChild(d)}
function adwSt(){const a=S.adw,n=Date.now();if(a.d!==today()){a.d=today();a.n=0}const left=Math.max(0,a.t+CFG.adw.gap-n);return{n:a.n,left,ok:a.n<CFG.adw.max&&!left}}
function adTick(){const e=$("adw");if(!e)return;const s=adwSt(),hide=!splashDone||cur=="auth"||playing();     // у грі стрілка зникає
 e.style.display=hide?"none":"";if(hide)return;
 $("adwT").textContent=s.n>=CFG.adw.max?t("завтра|tmrw"):s.ok?(CFG.adw.max-s.n)+"/"+CFG.adw.max:tm(s.left);$("adwB").style.opacity=s.ok?1:.6}
function adwGo(){const s=adwSt();
 if(s.n>=CFG.adw.max){toast(t("Ліміт на сьогодні. Повертайся завтра!|Daily limit. Come back tomorrow!"));return}
 if(!s.ok){toast(t("Наступна нагорода через|Next reward in")+" "+tm(s.left));return}
 ad("📺 "+t("Нагорода: 💎 · 🏮 · ×2 монет на 10–30 с|Prize: 💎 · 🏮 · ×2 coins for 10–30s"),()=>{S.adw.n++;S.adw.t=Date.now();adwReward()},"🎁",0)}
function adwReward(){const w=wp([38,24,16,7,9,6]);let m;      // монети · ×2/10с · ×2/30с · 🏮 · 💎 (рідко)
 if(w==0){const a=Math.round(800*(1+S.blade*.15)*(.7+R()*.6));S.mon+=a;m=fmt(a)+" 文"}
 else if(w==1){S.c.m10++;m=t("Бустер: ×2 монет на 10 с|Boost: ×2 coins for 10s")}
 else if(w==2){S.c.m30++;m=t("Бустер: ×2 монет на 30 с|Boost: ×2 coins for 30s")}
 else if(w==3){const a=rr(1,2);S.ln+=a;m="+"+a+" 🏮"}
 else if(w==4){const a=R()<.3?2:1;S.jd+=a;m="+"+a+" 💎"}
 else{const pl=AV.filter(a=>a.src=="ad"&&!ownAv(a.id));if(pl.length){const a=pl[R()*pl.length|0];S.avs.push(a.id);m=t("Аватар: |Avatar: ")+t(a.nm)}else{S.jd++;m="+1 💎"}}
 save();push();hdr();toast("🎁 "+m);adTick()}

// ═══ 9. ОФЛАЙН-ДОХІД І СТАРТ ═══
function offline(){const cap=(CFG.offlineBaseMin+15*U("off"))*60,away=Math.min((Date.now()-S.seen)/1000,cap),g=Math.floor(away*idleRate());if(away>60&&g>0){S.mon+=g;setTimeout(()=>toast("💤 "+t("Поки тебе не було, духи принесли|While you were away, spirits earned")+" +"+fmt(g)+" 文"),3500)}S.seen=Date.now()}
function boot(){
 mkAmb($("ambA"),10);mkAdw();
 document.querySelectorAll(".inst").forEach(b=>{b.onclick=install;if(matchMedia("(display-mode: standalone)").matches)b.style.display="none"});
 tr();hdrIcons();loadAv().then(()=>rend());loadKat().then(()=>rend());$("musBtn").textContent=music?"🔊":"🔇";hdr();offline();splash();fbInit();
 startEmoji();navIcons();probeIco();
 document.addEventListener("pointerdown",e=>{const b=e.target.closest&&e.target.closest("button");if(!b)return;track("tap",{el:(b.id||b.getAttribute("onclick")||b.textContent||"").trim().slice(0,40),screen:cur})},true);   // на яких кнопках тиснуть
 addEventListener("visibilitychange",()=>{if(document.hidden)track("leave",{screen:cur,in_game:playing()?1:0})});                                    // де саме йдуть із гри
 addEventListener("error",e=>track("js_error",{msg:String(e.message).slice(0,60)}));
 const show=()=>document.body.classList.add("rd");(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>requestAnimationFrame(()=>requestAnimationFrame(show)));setTimeout(show,1500);   // м'яке з'явлення без смикання
setInterval(adTick,1000);
}
