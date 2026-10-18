/* INKAI social.js — вхід, нік, майстри, розіграш ТОП-10, друзі, рейтинг, нагороди, профіль, адмінка
   ПРАВИЛА FIRESTORE — файл firestore.rules (вставити в Firebase Console → Firestore → Rules, замінити ADMIN_UID):
rules_version='2'; service cloud.firestore { match /databases/{d}/documents {
  function admin(){ return request.auth.uid in ['ADMIN_UID']; }
  function masterOn(m){ return get(/databases/$(database)/documents/masters/$(m)).data.paidUntil > request.time; }   // майстер оплатив — інакше заявка неможлива
  match /users/{u}   { allow read: if request.auth.uid==u || admin(); allow write: if request.auth.uid==u; }
  match /public/{u}  { allow read: if request.auth!=null; allow write: if request.auth.uid==u; }
  match /referrals/{u}{ allow read: if request.auth!=null; allow create: if request.auth.uid==u; }
  match /daylog/{x}  { allow create: if request.auth.uid==request.resource.data.uid && request.resource.data.ts==request.time;
                       allow read: if admin() || resource.data.uid==request.auth.uid; }
  match /submissions/{s}{ allow read: if request.auth!=null && (resource.data.uid==request.auth.uid || admin());
                       allow create: if request.auth.uid==request.resource.data.uid && request.resource.data.status=='pending'; allow update: if admin(); }
  match /masters/{m} { allow read: if request.auth!=null; allow write: if admin(); }                 // список майстрів бачать усі гравці, редагує лише адмін
  match /clients/{c} { allow create: if request.auth.uid==request.resource.data.uid && masterOn(request.resource.data.master); allow read: if admin(); }
  match /claims/{c}  { allow create: if request.auth.uid==request.resource.data.uid && masterOn(request.resource.data.master);   // id заявки фіксований → подати вдруге неможливо
                       allow read, update: if admin(); }
  match /adEvents/{a}{ allow create: if request.auth!=null; }
  match /offers/{o}  { allow read: if true; allow write: if admin();
  match /events/{e}  { allow read: if request.auth!=null; allow write: if false; }      // розіграш пише лише скрипт на сервері (Admin SDK)
  match /prizes/{p}  { allow read: if request.auth.uid==resource.data.uid || admin(); allow write: if false; }
  match /meta/{m}    { allow read, write: if false; }
}}
*/

// ═══ АВАТАРИ: каталог береться з data/avatars.json (твій файл — діє для всіх гравців); PNG: img/av/<id>.png ═══
// поля: id, e (емодзі-запас), nm "укр|eng", r (рідкість 0-4), src: free | buy | chest | ad, cur (mon|jd|ln) і price для buy
const _AVF=[["fox","🦊"],["oni","👹"],["tengu","👺"],["kappa","🐸"],["skull","💀"],["dragon","🐉"],["cat","🐱"],["sakura","🌸"],["katana","⚔️"],["torii","⛩️"],["mask","🎭"],["ninja","🥷"]];
let AV=[..._AVF.map(a=>({id:a[0],e:a[1],nm:a[0]+"|"+a[0],r:0,src:"free"})),...Array.from({length:100},(_,i)=>{const n=i+1,r=n<=40?0:n<=65?1:n<=82?2:n<=95?3:4,src=n%4==0?"chest":n%7==0?"ad":"buy";
 return{id:"a"+String(n).padStart(3,"0"),e:"🎭",nm:"Аватар "+n+"|Avatar "+n,r,src,cur:["mon","mon","mon","jd","ln"][r],price:Math.round([5e4,5e5,5e6,25,60][r]*(1+(n%10)*.3))}})];
async function loadAv(){try{const r=await fetch("data/avatars.json?v="+Date.now());if(r.ok){const j=await r.json();if(Array.isArray(j)&&j.length)AV=j}}catch(e){}}
const ownAv=id=>{const a=AV.find(x=>x.id==id);return!a||a.src=="free"||S.avs.includes(id)};
const avHTML=id=>{const a=AV.find(x=>x.id==id)||AV[0];return `<img src="img/av/${a.id}.png" data-e="${a.e||"🎭"}" onerror="this.outerHTML=this.dataset.e" class="w-full h-full object-cover">`};
function pickAv(id){if(!ownAv(id))return;S.av=id;save();push();rProfile()}
let avR=-1,avN=24;
function avF(r){avR=r;avN=24;rProfile()}function avMore(){avN+=24;rProfile()}
function avAct(id){const a=AV.find(x=>x.id==id);if(!a)return;
 if(ownAv(id))return pickAv(id);
 if(a.src=="buy"){sync();if(S[a.cur]<a.price){toast(t("Не вистачає валюти|Not enough currency"));return}S[a.cur]-=a.price;S.avs.push(id);S.av=id;save();push();rProfile();hdr()}
 else if(a.src=="ad")ad("📺 "+t("Аватар за рекламу|Avatar for an ad"),()=>{S.avs.push(id);S.av=id;save();push();rProfile()},"🎁",0);
 else toast(t("Випадає лише з сундуків|Chests only"))}
function avPicker(){const L=AV.filter(a=>avR<0||a.r==avR);
 return `<div class="card space-y-2"><h4 class="text-xs font-bold text-neonGold uppercase">${t("Мій аватар|My avatar")} · ${AV.filter(a=>ownAv(a.id)).length}/${AV.length}</h4>
 <div class="flex gap-1.5 overflow-x-auto pb-1"><button onclick="avF(-1)" class="chip shrink-0">${t("Усі|All")}</button>${RN.map((r,i)=>`<button onclick="avF(${i})" class="chip shrink-0" style="color:${r[1]}">${t(r[0])}</button>`).join("")}</div>
 <div class="grid grid-cols-4 gap-2">${L.slice(0,avN).map(a=>{const o=ownAv(a.id),e=S.av==a.id;return `<button onclick="avAct('${a.id}')" class="rounded-xl p-1 text-center space-y-1" style="border:2px solid ${e?"#ffb703":RN[a.r][1]+"88"};background:#0a090d"><div class="aspect-square rounded-lg overflow-hidden flex items-center justify-center text-3xl ${o?"":"opacity-40"}">${avHTML(a.id)}</div><div class="text-[9px] leading-tight">${e?"✓":o?t("Одягнути|Wear"):a.src=="buy"?fmt(a.price)+" "+CI[a.cur]:a.src=="ad"?"📺":"🎁"}</div></button>`}).join("")}</div>
 ${avN<L.length?`<button class="btn w-full" onclick="avMore()">${t("Показати ще|Show more")} (${L.length-avN})</button>`:""}</div>`}

// ═══ ВХІД ═══
function authMode(m){mode=m;const r=m=="reg";$("aBtn").textContent=r?t("Створити акаунт|Create account"):t("Увійти|Sign in");$("aTog").textContent=r?t("Вже є акаунт? Увійти|Have an account? Sign in"):t("Немає акаунта? Реєстрація|No account? Register")}
function toggleAuth(){authMode(mode=="reg"?"login":"reg")}
function guest(){track("guest_start");guestMode=true;user={uid:"local_guest",email:""};S.nick=S.nick||"Guest";save();go("play")}
async function social(k){track("login_click",{m:k});
 if(!FBOK){alert(t("Спершу встав ключі Firebase у core.js (розділ 0).|Paste your Firebase keys in core.js first (section 0)."));return}
 if(inApp){$("inApp").classList.remove("hidden");return}
 const prov=k=="g"?new FB.GoogleAuthProvider():new FB.OAuthProvider("apple.com");
 if(k=="a"){prov.addScope("email");prov.addScope("name")}else prov.setCustomParameters({prompt:"select_account"});
 try{await FB.signInWithPopup(auth,prov)}
 catch(e){
  if(["auth/popup-blocked","auth/operation-not-supported-in-this-environment"].includes(e.code)){try{await FB.signInWithRedirect(auth,prov)}catch(x){alert(x.message)}}
  else if(!["auth/popup-closed-by-user","auth/cancelled-popup-request"].includes(e.code))alert(e.code+"\n"+e.message);
 }
}
async function authSubmit(e){
 e.preventDefault();if(!FBOK){alert("Firebase keys?");return}
 const em=$("aEmail").value.trim(),pw=$("aPass").value;
 try{mode=="reg"?await FB.createUserWithEmailAndPassword(auth,em,pw):await FB.signInWithEmailAndPassword(auth,em,pw)}catch(x){alert(x.message)}
}
async function logout(){if(FBOK&&auth)try{await FB.signOut(auth)}catch(e){}user=null;guestMode=false;FR=[];route()}
function showNick(){
 $("nickAv").innerHTML=AV.filter(a=>a.src=="free").map(a=>`<button type="button" onclick="S.av='${a.id}';showNick()" class="aspect-square rounded-xl overflow-hidden flex items-center justify-center text-xl ${S.av==a.id?"ring-2 ring-neonGold":"opacity-60"}">${avHTML(a.id)}</button>`).join("");
 $("nickov").classList.remove("hidden");
}
async function nickCheck(v){
 if(!/^[\p{L}0-9_]{3,16}$/u.test(v))return t("3–16 символів: літери, цифри, _|3–16 chars: letters, digits, _");
 if(isReal()){try{const q=await FB.getDocs(FB.query(FB.collection(db,"public"),FB.where("nickLc","==",v.toLowerCase()),FB.limit(1)));if(!q.empty&&q.docs[0].id!=user.uid)return t("Цей нік зайнятий|This nickname is taken")}catch(e){}}
 return""}
async function saveNick(){const v=$("nickIn").value.trim(),err=$("nickErr"),e=await nickCheck(v);if(e){err.textContent=e;return}S.nick=v;save();await push();track("step_nick_set");$("nickov").classList.add("hidden");route()}
async function changeNick(){const v=($("nickNew").value||"").trim(),box=$("nickMsg"),e=await nickCheck(v);if(e){box.textContent=e;return}if(v==S.nick)return;
 S.nick=v;save();await push();toast(t("Нік змінено й збережено|Nickname changed and saved"));rProfile()}   // push() записує нік у users і public у Firebase
function initAuth(){
 FB.setPersistence(auth,FB.browserLocalPersistence).catch(()=>{});
 FB.getRedirectResult(auth).catch(e=>{if(e&&e.code&&e.code!="auth/no-auth-event")alert(e.message)});
 FB.onAuthStateChanged(auth,async u=>{
  if(!u){user=null;authReady();return}
  user=u;let fresh=0;
  try{const r=await FB.getDoc(FB.doc(db,"users",u.uid));
   if(r.exists()){const{offers,ts,lastSeen,regAt,...x}=r.data();if((x.xp||0)>=S.xp){S={...S,...x,c:{...def.c,...x.c},up:{...x.up},ck:{...def.ck,...x.ck},adw:{...def.adw,...x.adw},bp:x.bp||{}};S.jd=S.jd||0;S.ln=S.ln??3}}else fresh=1}catch(e){}
  if(fresh){track("sign_up");
   try{await FB.setDoc(FB.doc(db,"users",u.uid),{regAt:FB.serverTimestamp()},{merge:true})}catch(e){}
   if(refId&&refId!=u.uid){S.mon+=500;try{await FB.setDoc(FB.doc(db,"referrals",u.uid),{by:refId,ts:FB.serverTimestamp()})}catch(e){}}
  }
  await loadFriends();loadMasters(1);loadPrizes();watchRaffle();
  try{(await FB.getDocs(FB.query(FB.collection(db,"submissions"),FB.where("uid","==",u.uid)))).forEach(d=>{S.offers[d.data().offer]=d.data().status})}catch(e){}
  try{const o=[];(await FB.getDocs(FB.collection(db,"offers"))).forEach(d=>o.push({id:d.id,...d.data()}));if(o.length)OFFERS=o}catch(e){}
  save();if(S.nick){await push();logDay()}
  authReady();
  if(splashDone){if(!S.nick)showNick();else if(cur=="auth"||cur=="play")go("play");else rend()}
 });
}

// ═══ ДРУЗІ І ЗАВДАННЯ ПАРТНЕРІВ ═══
function copyRef(){const i=$("refIn");i.select();navigator.clipboard.writeText(i.value);toast(t("Скопійовано!|Copied!"))}
async function loadFriends(){
 FR=[];
 try{const q=await FB.getDocs(FB.query(FB.collection(db,"referrals"),FB.where("by","==",user.uid)));
  for(const d of q.docs){try{const u=await FB.getDoc(FB.doc(db,"public",d.id));if(u.exists()){const x=u.data();FR.push({n:x.nick||"?",av:x.av||"fox",m:x.coins||0,l:lvl(x.xp||0)})}}catch(e){}}}catch(e){}
 S.friends=FR.filter(f=>f.l>=3).length;
}
OFFERS=[["ig","Підпишись на Instagram YYOKAI|Follow YYOKAI on Instagram","https://instagram.com/yyokai.tattoo"],["tt","Підпишись на TikTok|Follow on TikTok","https://tiktok.com/@yyokai"],["yt","Підпишись на YouTube|Subscribe on YouTube","https://youtube.com/@yyokai"],["tc","Telegram-канал|Telegram channel","https://t.me/yyokai"],["tg","Запусти Telegram-бота|Start the Telegram bot","https://t.me/YyokaiInkBot"],["pt","Партнерський бонус|Partner bonus","https://instagram.com/yyokai.tattoo"]].map(([id,title,url])=>({id,title,url}));
async function doOffer(id){
 if(S.offers[id])return;const o=OFFERS.find(x=>x.id==id);if(!o)return;
 window.open(o.url,"_blank");S.offers[id]="done";S.mon+=CFG.offerReward;save();
 if(isReal())try{await FB.setDoc(FB.doc(db,"submissions",user.uid+"_"+id),{uid:user.uid,offer:id,status:"pending"})}catch(e){}
 rend();
}
const tasksOk=()=>Object.values(S.offers).filter(v=>v=="ok").length;   // «ok» ставить адмін після перевірки
function rFriends(){
 const link=location.origin+location.pathname+"?ref="+(isReal()?user.uid:"");
 $("view-friends").innerHTML=`<h2 class="text-xl font-black uppercase text-neonGold text-center">👥 ${t("Запроси друга в INKAI|Invite a friend to INKAI")}</h2>
 <div class="card space-y-3"><p class="text-xs text-gray-300">${t("Друг зараховується, коли зареєструється за твоїм посиланням і дійде до 3-го рівня.|A friend counts once they sign up via your link and reach level 3.")}</p>${isReal()?"":`<p class="text-[11px] text-crimsonRed">${t("Щоб посилання працювало, увійди через Google/Apple.|Sign in with Google/Apple to get a working link.")}</p>`}<div class="flex gap-2"><input id="refIn" readonly class="inp !py-2.5 text-xs font-mono text-neonGold" value="${link}"><button onclick="copyRef()" class="btn">${t("Копіювати|Copy")}</button></div></div>
 <h3 class="text-sm font-black uppercase">${t("Мої друзі|My friends")} (${S.friends} ✅)</h3>`+
 (FR.length?FR.map(f=>`<div class="card !p-3 flex items-center justify-between"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-xl">${avHTML(f.av)}</div><div><b class="text-xs">${esc(f.n)}</b><div class="text-[10px] text-gray-400">Lv ${f.l} ${f.l>=3?"✅":""}</div></div></div><span class="font-mono text-xs text-neonGold">${fmt(f.m)} 文</span></div>`).join(""):`<p class="text-xs text-gray-500">${t("Поки нікого — поділись посиланням!|No friends yet — share your link!")}</p>`)+
 `<h3 class="text-sm font-black uppercase pt-2">${t("Партнери та завдання|Partners & tasks")}</h3>`+
 OFFERS.map(o=>`<div class="card flex items-center justify-between"><div><b class="text-sm">${esc(t(o.title))}</b><div class="text-[10px] text-crimsonRed">+${fmt(CFG.offerReward)} 文</div></div><button ${S.offers[o.id]?"disabled":""} onclick="doOffer('${esc(o.id)}')" class="btn ${S.offers[o.id]?"!bg-emerald-600":""}">${S.offers[o.id]?"✓":"START"}</button></div>`).join("");
}

// ═══ РЕЙТИНГ ═══
async function rRating(){
 let L=[];
 if(FBOK&&db){try{const q=await FB.getDocs(FB.query(FB.collection(db,"public"),FB.orderBy("xp","desc"),FB.limit(100)));q.forEach(d=>{const x=d.data();L.push({id:d.id,nick:x.nick||"?",av:x.av||"fox",xp:x.xp||0,days:x.days||1})})}catch(e){}}
 const me=isReal()?user.uid:"me";
 if(L.some(u=>u.id==me))L=L.map(u=>u.id==me?{...u,xp:Math.max(u.xp,S.xp),av:S.av}:u);else L.push({id:me,nick:S.nick||t("Ти|You"),av:S.av,xp:S.xp,days:S.days});
 L.sort((a,b)=>b.xp-a.xp);PL=L.slice(0,100);
 $("view-rating").innerHTML=`<h2 class="text-xl font-black uppercase text-neonGold mb-3 text-center">⛩️ ${t("Книга Самураїв — ТОП-100|Samurai Book — TOP-100")}</h2>${raffleCard()}<div class="space-y-2">`+PL.map((u,i)=>`<button onclick="showPl(${i})" class="card !p-3 w-full flex items-center justify-between text-left ${i<5?"!border-neonGold/50":""} ${u.id==me?"!border-crimsonRed":""}"><div class="flex items-center gap-3"><span class="font-black font-mono text-sm w-8 ${i==0?"text-neonGold":i==1?"text-gray-300":i==2?"text-amber-600":""}">#${i+1}</span><div class="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-xl">${avHTML(u.av)}</div><div><b class="text-xs">${esc(u.nick)}</b><div class="text-[10px] text-gray-400">Lv ${lvl(u.xp)}</div></div></div><span class="font-mono text-xs text-neonGold">${fmt(u.xp)} XP</span></button>`).join("")+`</div>`;
}
function showPl(i){const u=PL[i];if(!u)return;const p=$("pc");p.innerHTML=`<div class="card rounded-3xl text-center space-y-2 w-full max-w-xs"><div class="w-24 h-24 mx-auto rounded-3xl overflow-hidden flex items-center justify-center text-6xl glow" style="border:2px solid #ffb703">${avHTML(u.av)}</div><div class="text-xl font-black">${esc(u.nick)}</div><div class="text-xs text-gray-300">#${i+1} · Lv ${lvl(u.xp)} · ${fmt(u.xp)} XP</div><div class="text-[11px] text-gray-400">${t("Днів у грі|Days played")}: ${u.days}</div></div>`;p.classList.replace("hidden","flex")}

// ═══ МАЙСТРИ-СПОНСОРИ: місто → майстер; знижки й призи діють лише в обраного майстра. Неоплачений майстер одразу зникає зі списку ═══
const UA_CITIES=["Бердянськ","Біла Церква","Бровари","Буча","Бориспіль","Вінниця","Дніпро","Дрогобич","Житомир","Запоріжжя","Івано-Франківськ","Ірпінь","Кам'янець-Подільський","Кам'янське","Київ","Коломия","Конотоп","Краматорськ","Кременчук","Кривий Ріг","Кропивницький","Луцьк","Львів","Мелітополь","Миколаїв","Мукачево","Нікополь","Ніжин","Нововолинськ","Одеса","Павлоград","Полтава","Прилуки","Рівне","Слов'янськ","Стрий","Суми","Тернопіль","Умань","Ужгород","Фастів","Харків","Херсон","Хмельницький","Черкаси","Чернівці","Чернігів","Червоноград","Шостка"];
let MS=[],msT=0,mpCity="",mpForce=0;
async function loadMasters(force,silent){if(!FBOK||!db)return;if(!force&&Date.now()-msT<60000)return;msT=Date.now();
 try{const q=await FB.getDocs(FB.collection(db,"masters")),ms=x=>x&&x.toMillis?x.toMillis():0;
  MS=q.docs.map(d=>{const x=d.data();return{id:d.id,nm:x.name||"?",city:x.city||"",ig:(x.ig||"").replace(/^@/,""),photo:x.photo||"",pu:ms(x.paidUntil),bu:ms(x.boostUntil)}}).filter(m=>m.pu>Date.now())   // не оплатив — зникає одразу
   .sort((a,b)=>(b.bu>Date.now())-(a.bu>Date.now())||a.nm.localeCompare(b.nm,"uk"))}                                                                                                   // платне просування: ⭐ угорі списку
 catch(e){}
 if(!silent){if(cur=="rewards")rRewards();ensureMaster()}}
const masterOf=id=>MS.find(m=>m.id==id);
const mAv=m=>{const src=m.photo||(m.ig?"img/masters/"+m.ig+".jpg":""),l=esc((m.nm||"?")[0].toUpperCase());return src?`<img src="${esc(src)}" class="w-full h-full object-cover" onerror="this.outerHTML='${l}'">`:l};
const masterRow=m=>`<div class="card !p-3 flex items-center gap-3"><div class="relative shrink-0"><div class="w-14 h-14 rounded-full overflow-hidden bg-inkDark border-2 ${m.bu>Date.now()?"border-neonGold":"border-inkBorder"} flex items-center justify-center text-xl font-black">${mAv(m)}</div>${m.bu>Date.now()?`<span class="absolute -top-1 -right-1 text-xs">⭐</span>`:""}</div><div class="flex-1 min-w-0"><b class="text-sm block truncate">${esc(m.nm)}</b><div class="text-[10px] text-gray-400 truncate">${m.ig?"@"+esc(m.ig):esc(m.city)}</div><div class="flex gap-1.5 mt-1.5"><button class="btn !px-3 !bg-inkDark border border-inkBorder" ${m.ig?"":"disabled"} onclick="window.open('https://instagram.com/${encodeURIComponent(m.ig)}','_blank')">${t("Ознайомитись|View")}</button><button class="btng !px-3" onclick="pickMaster('${esc(m.id)}')">${t("Обрати|Choose")}</button></div></div></div>`;
function masterList(force){
 if(force!==undefined)mpForce=!!force;
 const p=$("pc"),have=[...new Set(MS.map(m=>m.city).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"uk")),rest=UA_CITIES.filter(c=>!have.includes(c));
 if(!mpCity||(!have.includes(mpCity)&&!UA_CITIES.includes(mpCity)))mpCity=(S.master&&S.master.city)||have[0]||UA_CITIES[0];
 const L=MS.filter(m=>m.city==mpCity);
 p.onclick=mpForce?null:()=>p.classList.replace("flex","hidden");
 p.innerHTML=`<div class="card rounded-3xl w-full max-w-sm max-h-[85vh] overflow-y-auto space-y-3" onclick="event.stopPropagation()"><h3 class="font-black text-center">🥷 ${t("Обери майстра|Choose your master")}</h3>
 <p class="text-[11px] text-gray-400 text-center">${t("Обери місто, перегляни Instagram майстра й натисни «Обрати». Усі знижки та призи діятимуть лише в нього.|Pick a city, check the master's Instagram and tap “Choose”. All discounts and prizes work only with him.")}</p>
 <select class="inp" onchange="mpCity=this.value;masterList()"><optgroup label="${t("Є майстри|Masters available")}">${have.map(c=>`<option ${c==mpCity?"selected":""}>${esc(c)}</option>`).join("")}</optgroup><optgroup label="${t("Інші міста України|Other Ukrainian cities")}">${rest.map(c=>`<option ${c==mpCity?"selected":""}>${esc(c)}</option>`).join("")}</optgroup></select>
 ${L.length?L.map(masterRow).join(""):`<p class="text-xs text-gray-400 text-center py-4">${t("У цьому місті поки немає майстрів-партнерів.|No partner masters in this city yet.")}</p>`}
 ${mpForce?"":`<button class="btn w-full !bg-inkDark border border-inkBorder" onclick="$('pc').classList.replace('flex','hidden')">${t("Закрити|Close")}</button>`}</div>`;
 p.classList.replace("hidden","flex")}
function ensureMaster(){       // майстра обирати обов'язково (якщо є активні майстри)
 if(!splashDone||!isReal()||!S.nick||!MS.length||$("pc").classList.contains("flex"))return;
 if(!(S.master&&masterOf(S.master.id)))masterList(1)}
async function openMasterList(){if(!isReal()){alert(t("Щоб обрати майстра, увійди через Google/Apple.|Sign in with Google/Apple to choose a master."));return}await loadMasters(1,1);masterList(0)}
function masterCard(){const cm=S.master&&masterOf(S.master.id),can=!S.master||!cm||Date.now()-(S.masterAt||0)>CFG.masterSwitchDays*864e5;
 return `<div class="card space-y-2 text-center"><h3 class="font-black text-sm">🥷 ${t("Мій майстер|My tattoo master")}</h3>
 ${cm?`<div class="flex flex-col items-center gap-1"><div class="w-16 h-16 rounded-full overflow-hidden bg-inkDark border-2 border-neonGold flex items-center justify-center text-2xl font-black">${mAv(cm)}</div><b>${esc(cm.nm)}</b><div class="text-[11px] text-gray-400">${esc(cm.city)}${cm.ig?" · @"+esc(cm.ig):""}</div></div>`:S.master?`<div class="text-xs text-crimsonRed">${t("Твій майстер зараз недоступний — обери нового. Купони колишнього майстра чекатимуть на нього.|Your master is unavailable — pick a new one. Coupons from the old master wait for him.")}</div>`:`<div class="text-xs text-gray-300">${t("Обери місто й майстра: усі знижки та призи діятимуть лише в нього.|Pick a city and a master: all discounts and prizes work only with him.")}</div>`}
 ${can?"":`<div class="text-[10px] text-gray-500">${t("Змінити майстра можна раз на|You can change master once every")} ${CFG.masterSwitchDays} ${t("днів|days")}</div>`}
 <button onclick="openMasterList()" ${can?"":"disabled"} class="btng w-full py-2.5">${cm?t("Змінити майстра|Change master"):t("Обрати майстра|Choose master")}</button></div>`}
async function pickMaster(id){
 const m=masterOf(id);if(!m||!isReal())return;
 if(S.master&&S.master.id==id){mpForce=0;$("pc").classList.replace("flex","hidden");return}
 const cm=S.master&&masterOf(S.master.id);
 if(cm&&Date.now()-(S.masterAt||0)<CFG.masterSwitchDays*864e5){toast(t("Майстра можна міняти раз на 30 днів|You can change master once per 30 days"));return}
 S.master={id:m.id,nm:m.nm,city:m.city,ig:m.ig};S.masterAt=Date.now();save();push();track("step_master_picked",{city:m.city});
 try{await FB.setDoc(FB.doc(db,"clients",m.id+"_"+user.uid),{uid:user.uid,master:m.id,nick:S.nick,ts:FB.serverTimestamp()})}catch(e){}   // майстру прийде повідомлення в Telegram
 mpForce=0;$("pc").classList.replace("flex","hidden");toast(t("Майстра обрано: |Master chosen: ")+m.nm);if(cur=="rewards")rRewards()}

// ═══ РОЗІГРАШ ТАТУ СЕРЕД ТОП-10 (щомісяця о 20:00 за Києвом; результат пише сервер) ═══
let RAF=null,PZ=[],rafSeen=localStorage.ink_raf||"",rafUnsub=null;
function kyivMs(y,m,d,h){let t0=Date.UTC(y,m,d,h-3,0);for(let i=0;i<2;i++){const hh=+new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Kyiv",hour:"2-digit",hourCycle:"h23"}).format(new Date(t0));t0+=(h-hh)*36e5}return t0}
function nextRaffle(){const n=new Date();let y=n.getFullYear(),m=n.getMonth(),t0=kyivMs(y,m,1,20);if(t0<=Date.now())t0=kyivMs(y,m+1,1,20);return t0}
let rafTarget=nextRaffle();
setInterval(()=>{const left=rafTarget-Date.now(),e=$("rafT");
 if(left<=0){if(left>-10*6e4&&isReal()&&!$("raf")&&!rafDone())showRaffleWait();if(left<=-10*6e4)rafTarget=nextRaffle()}
 if(e){const s=Math.max(0,Math.floor(left/1e3)),d=s/86400|0;e.textContent=`${d}${t("д|d")} ${String(s%86400/3600|0).padStart(2,"0")}:${String(s%3600/60|0).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`}},1000);
const rafDone=()=>RAF&&RAF.month==new Date().toISOString().slice(0,7)&&RAF.ts&&RAF.ts.toMillis&&Date.now()-RAF.ts.toMillis()<20*6e4;
const raffleCard=()=>`<div class="card text-center space-y-1" style="border-color:#ffb70388"><div class="text-xs tracking-[.3em] text-neonGold font-black">🎰 ${t("РОЗІГРАШ ТАТУ|TATTOO DRAW")}</div><div id="rafT" class="text-2xl font-black font-mono">--</div><div class="text-[11px] text-gray-300">${t("Щомісяця о 20:00 (Київ). Беруть участь гравці ТОП-10: 1 безкоштовний сеанс (тату до 7000 грн) і 9 знижок. Напередодні приходить сповіщення.|Every month at 20:00 (Kyiv). TOP-10 players take part: 1 free session (tattoo up to 7000 UAH) and 9 discounts. A reminder arrives the day before.")}</div>${RAF&&RAF.winner?`<div class="text-xs text-gray-400">${t("Минулий переможець|Last winner")}: <b class="text-white">${esc(RAF.winner.nick)}</b></div>`:""}</div>`;
function watchRaffle(){if(rafUnsub||!FBOK||!db)return;
 rafUnsub=FB.onSnapshot(FB.doc(db,"events","raffle"),s=>{if(!s.exists())return;const e=s.data();RAF=e;
  const fresh=e.ts&&e.ts.toMillis&&Date.now()-e.ts.toMillis()<20*6e4;
  if(e.month&&e.month!==rafSeen){rafSeen=e.month;localStorage.ink_raf=e.month;if(fresh&&!playing())showRaffle(e)}
  loadPrizes();if(cur=="rating")rRating()},()=>{})}
async function loadPrizes(){if(!isReal())return;try{const q=await FB.getDocs(FB.query(FB.collection(db,"prizes"),FB.where("uid","==",user.uid),FB.limit(12)));PZ=q.docs.map(d=>({id:d.id,...d.data()}));if(cur=="rewards")rRewards()}catch(e){}}
function showRaffleWait(){const ov=document.createElement("div");ov.id="raf";ov.className="fixed inset-0 z-[98] flex flex-col items-center justify-center text-center";ov.style.cssText="background:radial-gradient(circle at 50% 30%,rgba(60,10,40,.92),rgba(5,4,10,.97))";
 ov.innerHTML=`<div class="text-6xl" style="animation:floatY 1.4s ease-in-out infinite">🎰</div><div class="mt-4 text-lg font-black text-neonGold">${t("Розіграш починається…|The draw is starting…")}</div><button class="btn mt-6 !bg-inkDark border border-inkBorder" onclick="$('raf').remove()">${t("Закрити|Close")}</button>`;document.body.appendChild(ov)}
function showRaffle(e){
 const old=$("raf");if(old)old.remove();const ten=e.ten||[],w=e.winner||{};if(!ten.length)return;track("raffle_view");
 const ov=document.createElement("div");ov.id="raf";ov.className="fixed inset-0 z-[98] flex flex-col items-center justify-center p-4 text-center";ov.style.cssText="background:radial-gradient(circle at 50% 30%,rgba(70,10,45,.94),rgba(5,4,10,.98));animation:stripIn .6s both";
 const N=48,X=40,strip=[...Array(N)].map((_,i)=>i==X?w:ten[R()*ten.length|0]),mine=e.prizes&&user&&e.prizes[user.uid];
 ov.innerHTML=`<div class="text-xs tracking-[.4em] text-neonGold font-black">${t("РОЗІГРАШ ТАТУ|TATTOO DRAW")}</div><h2 class="text-2xl font-black mt-1">${t("ТОП-10 рейтингу|TOP-10 of the rating")}</h2>
 <div id="rfbox" class="relative w-full max-w-md mt-5 rounded-3xl py-4" style="background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.14);-webkit-mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent);mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent)"><div class="absolute left-1/2 top-1 bottom-1 w-[3px] -ml-[1.5px] z-10 rounded-full" style="background:linear-gradient(180deg,transparent,#ffd27a,transparent);box-shadow:0 0 18px #ffb703"></div>
 <div id="rfstrip" class="flex gap-2 px-2" style="width:max-content">${strip.map(p=>`<div class="w-24 h-32 shrink-0 rounded-2xl flex flex-col items-center justify-center" style="background:radial-gradient(circle at 50% 30%,#ffb70333,rgba(19,17,24,.75));border:1px solid #ffb70366"><div class="w-14 h-14 rounded-full overflow-hidden border-2 border-neonGold/60">${avHTML(p.av)}</div><b class="text-[10px] block mt-2 px-1 max-w-full truncate">${esc(p.nick)}</b></div>`).join("")}</div></div>
 <div id="rfres" class="relative mt-6 min-h-[130px] w-full max-w-md"></div><button id="rfok" class="hidden btng px-10 py-3 mt-3" onclick="$('raf').remove()">OK</button>`;
 document.body.appendChild(ov);
 const st=$("rfstrip"),bw=$("rfbox").clientWidth,target=X*104+8+48-bw/2;
 st.style.transition="transform 7s cubic-bezier(.08,.7,.1,1)";requestAnimationFrame(()=>requestAnimationFrame(()=>{st.style.transform=`translateX(-${target}px)`}));
 let last=-1;const tk=setInterval(()=>{if(!st.isConnected){clearInterval(tk);return}const m=new DOMMatrix(getComputedStyle(st).transform),idx=Math.floor((-m.m41+bw/2-8)/104);if(idx!=last){last=idx;sfx("tick",()=>tone(1300,.04,"square",.07))}},40);
 setTimeout(()=>{clearInterval(tk);const r=$("rfres");if(!r)return;sfx("reveal",()=>[0,4,7,12].forEach((s,i)=>setTimeout(()=>tone(330*2**(s/12),.7,"triangle",.14),i*140)));
  r.innerHTML=`<div style="animation:dropBounce .9s cubic-bezier(.3,1.2,.4,1) both"><div class="w-20 h-20 rounded-full overflow-hidden mx-auto border-4 border-neonGold" style="box-shadow:0 0 40px #ffb703">${avHTML(w.av)}</div><div class="text-xl font-black mt-2 text-neonGold">🏆 ${esc(w.nick)}</div><div class="text-sm text-gray-200">${t("виграв безкоштовний сеанс (тату до 7000 грн)!|won a free session (tattoo up to 7000 UAH)!")}</div></div><div class="text-xs text-gray-300 mt-2">${mine?(mine.kind=="free"?t("Це ти! Приз — у вкладці «Нагороди».|It is you! Your prize is in the Rewards tab."):t("Ти отримуєш знижку|You get a discount of")+" "+mine.pct+"%"+t(" — у вкладці «Нагороди».| — see the Rewards tab.")):t("Інші 9 учасників отримали знижки.|The other 9 players got discounts.")}</div>`;
  fxShoot(r,40,["#ffb703","#ff2a5f","#fff"]);$("rfok").classList.remove("hidden")},7300)}

// ═══ НАГОРОДИ: складніші умови. Дні беруться з СЕРВЕРНОГО логу (SD), а не з телефона ═══
let SD=0,SDt=0;
async function loadSD(){if(!isReal()||Date.now()-SDt<60000)return;SDt=Date.now();
 try{const q=await FB.getDocs(FB.query(FB.collection(db,"daylog"),FB.where("uid","==",user.uid),FB.limit(500)));SD=new Set(q.docs.map(d=>d.data().ts.toDate().toISOString().slice(0,10))).size;if(cur=="rewards")rRewards()}catch(e){}}
const need=k=>{
 const F=["Друзів, що дійшли до 3-го рівня|Friends who reached level 3",S.friends],D=["Різних днів у грі (за даними сервера)|Different days played (server-verified)",isReal()?SD:0],
  X=["Очки XP (за раунди)|XP points (from rounds)",S.xp],T=["Підтверджені завдання партнерів|Verified partner tasks",tasksOk()],
  B=["Босів переможено|Bosses defeated",S.kills],K=["Клинків у колекції|Blades collected",S.blades.length],G2=["Фонів у колекції|Backgrounds collected",S.bgs.length],A=["Реклам переглянуто|Ads watched",S.ads],C=["Накопичено монет за весь час|Total coins earned",S.tot||0];
 return {
  d10:[[...F,1],[...D,4],[...C,1e7],[...X,20000]],
  d20:[[...F,2],[...D,6],[...C,3e7],[...X,60000],[...B,5]],
  d30:[[...F,3],[...D,9],[...C,8e7],[...X,150000],[...B,12],[...T,2]],
  d40:[[...F,4],[...D,12],[...C,2e8],[...X,300000],[...B,25],[...T,4]],
  mini:[[...F,3],[...D,30],[...C,1.5e9],[...X,900000],[...B,60],[...T,6],[...K,15]],
  big:[[...F,8],[...D,60],[...C,1.2e10],[...X,4000000],[...B,150],[...T,10],[...K,40],[...G2,35],[...A,60]]
 }[k];
};
const NAMES={d10:"🏷 Знижка 10% на тату|🏷 10% tattoo discount",d20:"🏷 Знижка 20%|🏷 20% discount",d30:"🏷 Знижка 30%|🏷 30% discount",d40:"🏷 Знижка 40%|🏷 40% discount",mini:"🎁 Міні-тату (до 1500 грн) · 1 раз|🎁 Mini tattoo (up to 1500 UAH) · once",big:"👑 Велике тату (7000 грн) · лише 1 раз|👑 Big tattoo (7000 UAH) · only once"};
const rows=r=>r.map(x=>`<div><div class="flex justify-between text-[11px]"><span class="text-gray-300">${t(x[0])}</span><span class="font-mono ${x[1]>=x[2]?"text-emerald-400":"text-neonGold"}">${fmt(Math.min(x[1],x[2]))}/${fmt(x[2])}</span></div><div class="h-1.5 bg-inkDark rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-neonGold to-crimsonRed" style="width:${Math.min(100,x[1]/x[2]*100)}%"></div></div></div>`).join("");
async function claim(id,code){
 const cp=code?S.cp.find(c=>c.code==code):null;
 if(cp?cp.used:S.claimed.includes(id))return;
 if(!isReal()){alert(t("Щоб подати заявку, увійди через Google/Apple.|Sign in with Google/Apple to claim."));authMode("reg");go("auth");return}
 const mid=cp?(cp.m||(S.master&&S.master.id)):(S.master&&S.master.id),m=mid&&masterOf(mid);
 if(!m){alert(t("Обери майстра зі списку активних партнерів (вкладка «Нагороди»).|Pick a master from the active partners list (Rewards tab)."));return}
 const ty=cp?cp.type:id,tat=ty=="mini"||ty=="big"||ty.startsWith("tat"),ym=today().slice(0,7);
 const docId=user.uid+"_"+(ty=="big"?"tat_big":ty=="mini"?"tat_mini":ty.startsWith("tat")?"tat_coupon":"disc_"+ym);   // знижка — 1 на місяць, тату — 1 раз
 try{await FB.setDoc(FB.doc(db,"claims",docId),{uid:user.uid,master:m.id,masterName:m.nm,email:user.email||"",nick:S.nick,tier:id,code:code||"",kind:tat?"tattoo":"discount",xp:S.xp,tot:S.tot||0,days:S.days,serverDays:SD,streak:S.streak,friends:S.friends,tasks:tasksOk(),ads:S.ads,kills:S.kills,blades:S.blades.length,bgs:S.bgs.length,ts:FB.serverTimestamp(),status:"new"});
  if(cp)cp.used=1;else S.claimed.push(id);save();rend();alert(t("Заявку надіслано майстру «|Request sent to master “")+m.nm+t("» і студії YYOKAI. Ми перевіримо умови й напишемо тобі.|” and YYOKAI studio. We will verify and contact you."))}
 catch(e){alert(e.code=="permission-denied"?t("Така заявка вже подавалась (знижка — раз на місяць, кожне тату — раз у житті) або майстер більше не активний.|Such a claim was already sent (one discount per month, each tattoo once per lifetime) or the master is no longer active."):e.message)}
}
const MINI_PRICE=1.5e9,MINI_DAYS=20;
async function buyMini(){
 sync();if(!isReal()){alert(t("Щоб подати заявку, увійди через Google/Apple.|Sign in with Google/Apple to claim."));return}
 const m=S.master&&masterOf(S.master.id);if(!m){alert(t("Спершу обери майстра зі списку.|Choose a master first."));return}
 if(SD<MINI_DAYS){toast(t("Потрібно більше різних днів у грі|You need more different days played"));return}
 if(S.mon<MINI_PRICE){toast(t("Не вистачає монет|Not enough coins"));return}
 try{await FB.setDoc(FB.doc(db,"claims",user.uid+"_tat_mini_"+today().slice(0,7)),{uid:user.uid,master:m.id,masterName:m.nm,email:user.email||"",nick:S.nick,tier:"mini",code:"",kind:"tattoo",xp:S.xp,tot:S.tot||0,days:S.days,serverDays:SD,ts:FB.serverTimestamp(),status:"new"});
  S.mon-=MINI_PRICE;save();push();track("purchase",{kind:"mini_tattoo"});rend();alert(t("Заявку надіслано майстру «|Request sent to master “")+m.nm+t("». Монети списано.|”. Coins deducted."))}
 catch(e){alert(e.code=="permission-denied"?t("Цього місяця таку заявку вже подано, або майстер більше не активний.|You already sent such a request this month, or the master is no longer active."):e.message)}}
async function claimPrize(pid){
 const z=PZ.find(p=>p.id==pid);if(!z||S.pzUsed.includes(pid))return;const m=S.master&&masterOf(S.master.id);
 if(!m){alert(t("Обери майстра зі списку активних партнерів.|Choose a master from the active partners list."));return}
 try{await FB.setDoc(FB.doc(db,"claims",user.uid+"_raffle_"+z.month),{uid:user.uid,master:m.id,masterName:m.nm,email:user.email||"",nick:S.nick,tier:"raffle_"+z.kind,pct:z.pct||0,code:"",kind:z.kind=="free"?"tattoo":"discount",ts:FB.serverTimestamp(),status:"new"});
  S.pzUsed.push(pid);save();rRewards();alert(t("Приз передано майстру «|Prize sent to master “")+m.nm+t("». Студія напише тобі.|”. The studio will contact you."))}
 catch(e){alert(e.code=="permission-denied"?t("Цей приз уже заявлено, або майстер більше не активний.|This prize was already claimed, or the master is no longer active."):e.message)}}
function rRewards(){
 loadSD();loadMasters(0);
 const cps=S.cp.filter(c=>!c.used),pz=PZ.filter(p=>!S.pzUsed.includes(p.id)),cm=S.master&&masterOf(S.master.id),okMini=!!cm&&SD>=MINI_DAYS&&S.mon>=MINI_PRICE;
 $("view-rewards").innerHTML=`<h2 class="text-xl font-black uppercase text-center">${t("Нагороди студії YYOKAI|YYOKAI studio rewards")}</h2>${masterCard()}${raffleCard()}
 ${pz.length?`<h3 class="text-sm font-black uppercase text-center">${t("Мої призи розіграшу|My draw prizes")}</h3>`+pz.map(z=>`<div class="card flex items-center justify-between gap-2"><div><b class="text-sm">${z.kind=="free"?"🏆 "+t("Безкоштовний сеанс (тату до 7000 грн)|Free session (tattoo up to 7000 UAH)"):"🏷 "+t("Знижка|Discount")+" "+z.pct+"%"}</b><div class="text-[10px] text-gray-400">${esc(z.month)}</div></div><button class="btng shrink-0" ${cm?"":"disabled"} onclick="claimPrize('${esc(z.id)}')">${t("Забрати|Claim")}</button></div>`).join(""):""}
 <div class="card space-y-3"><h3 class="font-black text-sm text-center">🎁 ${t("Безкоштовний сеанс (тату до 1500 грн)|Free session (tattoo up to 1500 UAH)")}</h3><p class="text-[11px] text-gray-300 text-center">${t("Можна купити за монети — раз на місяць. Сеанс виконує обраний майстер.|Can be bought with coins — once a month. Done by your chosen master.")}</p>
  ${rows([["Різних днів у грі (за даними сервера)|Different days played (server-verified)",isReal()?SD:0,MINI_DAYS],["Монет на балансі|Coins on balance",S.mon,MINI_PRICE]])}
  <button onclick="buyMini()" ${okMini?"":"disabled"} class="btng w-full py-2.5 ${okMini?"":"!from-gray-800 !to-gray-800 !text-gray-500"}">${t("Купити за|Buy for")} ${fmt(MINI_PRICE)} ${CI.mon}</button></div>
 ${cps.length?`<h3 class="text-sm font-black uppercase text-center">${t("Мої купони зі скринь|My chest coupons")}</h3>`+cps.map(c=>{const mm=masterOf(c.m||(S.master&&S.master.id)),ok=!!mm;return `<div class="card flex items-center justify-between gap-2"><div class="min-w-0"><b class="text-sm">${esc(c.lb.split(" · ")[0])}</b><div class="font-mono text-lg tracking-widest text-neonGold">#${esc(c.code)}</div><div class="text-[11px] text-gray-300">${c.mi?"@"+esc(c.mi):esc(c.mn||(mm?mm.nm:"—"))}${ok?"":" · ⛔"}</div></div><button class="btng shrink-0" ${ok?"":"disabled"} onclick="claim('${esc(c.type)}','${esc(c.code)}')">${t("Забрати|Claim")}</button></div>`}).join(""):""}
 <div class="card text-xs text-gray-300 space-y-1"><b class="text-neonGold">${t("Як це працює|How it works")}</b>
  <div>1️⃣ ${t("Обери місто й майстра — усі знижки та призи діятимуть лише в нього.|Pick a city and a master — all discounts and prizes work only with him.")}</div>
  <div>2️⃣ ${t("Грай у різні дні: лічильник днів іде з сервера, його не обдурити.|Play on different days: the day counter comes from the server.")}</div>
  <div>3️⃣ ${t("Потрапи в ТОП-10 рейтингу — щомісяця о 20:00 розіграш: 1 безкоштовний сеанс (до 7000 грн) і 9 знижок.|Reach the TOP-10 — every month at 20:00 there is a draw: 1 free session (up to 7000 UAH) and 9 discounts.")}</div>
  <div>4️⃣ ${t("Знижки 5–40% можуть випасти з будь-якого сундука: чим дорожчий сундук, тим вищий шанс (від ≈0,1% до 3%). Під кодом купона — нік майстра.|Discounts of 5–40% can drop from any chest: the pricier the chest, the higher the chance (≈0.1% to 3%). The master's nickname is shown under the coupon code.")}</div></div>`;
}
// ═══ ПРОФІЛЬ ═══
function rProfile(){
 $("view-profile").innerHTML=`
 <div class="card flex flex-col items-center text-center gap-2"><div class="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-5xl" style="border:2px solid #ffb703">${avHTML(S.av)}</div><h3 class="font-bold text-lg">${esc(S.nick||t("Гість|Guest"))}</h3><span class="inline-block px-3 py-0.5 bg-crimsonRed/20 border border-crimsonRed/40 text-crimsonRed text-[11px] font-bold rounded-full">Lv ${lvl(S.xp)} · ${fmt(S.xp)} XP</span></div>
 <div class="card space-y-2"><h4 class="text-xs font-bold text-neonGold uppercase">${t("Мій нік|My nickname")}</h4><div class="flex gap-2"><input id="nickNew" maxlength="16" value="${esc(S.nick||"")}" class="inp !py-2.5"><button onclick="changeNick()" class="btn">${t("Змінити|Change")}</button></div><div id="nickMsg" class="text-xs text-crimsonRed min-h-[14px]"></div></div>
 <button onclick="enablePush()" class="w-full py-3 rounded-xl bg-neonGold/10 border border-neonGold/40 text-neonGold font-bold text-sm">${S.fcm?t("🔔 Сповіщення увімкнено (оновити)|🔔 Notifications on (refresh)"):t("🔔 Увімкнути сповіщення|🔔 Enable notifications")}</button>
 ${avPicker()}
 <div class="card text-xs text-gray-300 grid grid-cols-2 gap-1"><div>${t("Раундів|Rounds")}: <b>${S.rounds}</b></div><div>${t("Босів|Bosses")}: <b>${S.kills}</b></div><div>${t("Днів|Days")}: <b>${S.days}</b></div><div>${t("Серія підряд|Streak")}: <b>${S.streak}</b></div></div>
 <div class="card space-y-1"><h4 class="text-xs font-bold text-neonGold uppercase">🔊 ${t("Перевірка звуків і файлів|Sound & file check")}</h4>${sndStat()}</div>
 ${matchMedia("(display-mode: standalone)").matches?"":`<button onclick="install()" class="w-full py-3 rounded-xl bg-neonGold/10 border border-neonGold/40 text-neonGold font-bold text-sm">${t("📲 Встановити гру|📲 Install game")}</button>`}
 ${isReal()?`<button onclick="logout()" class="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm">${t("Вийти з акаунта|Logout")}</button>`:`<button onclick="authMode('reg');go('auth')" class="w-full py-3 rounded-xl bg-neonGold/10 border border-neonGold/40 text-neonGold font-bold text-sm">${t("Увійти через Google/Apple|Sign in with Google/Apple")}</button>`}
 <div class="pt-16 text-center"><button onclick="adminOpen()" class="text-[9px] text-inkBorder opacity-30 px-6 py-2">·</button></div>`;
}

// ═══ АДМІНКА ═══
async function adminOpen(){const pw=prompt(t("Пароль адміна|Admin password"));if(!pw)return;if(await sha(pw)!==CFG.adminHash){alert("✗");return}adminOK=true;go("admin")}
function rAdmin(){
 if(!adminOK){go("profile");return}
 $("view-admin").innerHTML=`<div class="flex justify-between"><h2 class="text-xl font-black uppercase text-crimsonRed">Admin</h2><button onclick="adminOK=false;go('profile')" class="text-xs text-gray-400">✕</button></div>
 <div class="card space-y-2"><div class="flex gap-2"><input id="admQ" class="inp !py-2.5" placeholder="${t("Нік гравця (початок)|Player nick (prefix)")}"><button class="btn" onclick="admSearch()">🔍</button></div><button class="btn w-full !bg-inkDark border border-inkBorder" onclick="admClaims()">${t("Останні заявки|Latest claims")}</button><button class="btn w-full !bg-inkDark border border-inkBorder" onclick="admMasters()">🥷 ${t("Майстри-спонсори|Sponsor masters")}</button></div><div id="admRes" class="space-y-2"></div>`;
}
async function admSearch(){
 const q=$("admQ").value.trim().toLowerCase(),box=$("admRes");if(!q)return;box.innerHTML="…";
 try{const s=await FB.getDocs(FB.query(FB.collection(db,"users"),FB.where("nickLc",">=",q),FB.where("nickLc","<=",q+"\uf8ff"),FB.limit(20)));
  box.innerHTML=s.empty?`<div class="text-xs text-gray-500">${t("Нічого не знайдено|Nothing found")}</div>`:s.docs.map(d=>`<button class="card !p-3 w-full text-left flex justify-between" onclick="admView('${esc(d.id)}')"><b class="text-xs">${esc(d.data().nick||"?")}</b><span class="text-[10px] text-gray-400">Lv ${d.data().lvl||1} · ${fmt(d.data().coins||0)} 文</span></button>`).join("")}
 catch(e){box.innerHTML=`<div class="text-xs text-crimsonRed">${esc(e.message)}<br>${t("Увійди акаунтом адміна й перевір правила Firestore.|Sign in as admin and check Firestore rules.")}</div>`}
}
const dstr=ts=>ts&&ts.toDate?ts.toDate().toLocaleString():"—";
function streaks(dates){
 const s=[...new Set(dates)].sort();let best=0,run=0,prev=null;
 for(const d of s){run=prev&&(new Date(d)-new Date(prev))==864e5?run+1:1;best=Math.max(best,run);prev=d}
 let cur=0;const last=s[s.length-1],y=new Date(Date.now()-864e5).toISOString().slice(0,10);
 if(last==today()||last==y){cur=1;for(let i=s.length-1;i>0;i--){if((new Date(s[i])-new Date(s[i-1]))==864e5)cur++;else break}}
 return{total:s.length,best,cur,last10:s.slice(-10)};
}
async function admView(id){
 const box=$("admRes");box.innerHTML="…";
 try{const u=(await FB.getDoc(FB.doc(db,"users",id))).data(),dl=await FB.getDocs(FB.query(FB.collection(db,"daylog"),FB.where("uid","==",id),FB.limit(500)));
  const st=streaks(dl.docs.map(d=>d.data().ts.toDate().toISOString().slice(0,10)));
  box.innerHTML=`<div class="card space-y-1 text-xs"><div class="text-lg font-black">${esc(u.nick)}</div>
   <div>📧 ${esc(u.email||"—")}</div><div class="text-[10px] text-gray-500">UID: ${esc(id)}</div>
   <div>🗓 ${t("Реєстрація (сервер)|Registered (server)")}: <b>${dstr(u.regAt)}</b></div>
   <div>🟢 ${t("Остання активність (сервер)|Last seen (server)")}: <b>${dstr(u.lastSeen)}</b></div>
   <div>🪙 ${t("Монети (з гри)|Coins (from app)")}: <b class="text-neonGold">${fmt(u.coins||0)}</b> · XP: <b>${fmt(u.xp||0)}</b> · Lv ${u.lvl||1}</div>
   <div>🔥 ${t("Днів підряд ЗАРАЗ (сервер)|Streak NOW (server)")}: <b class="text-emerald-400">${st.cur}</b> · ${t("найдовша|best")}: <b>${st.best}</b> · ${t("усього днів|total days")}: <b>${st.total}</b></div>
   <div class="text-[10px] text-gray-400">${t("Останні дні|Last days")}: ${st.last10.join(", ")||"—"}</div>
   <div class="text-[10px] text-gray-400">${t("Дані гри|App-reported")}: ${u.streak||0} / ${u.days||0} · ${t("босів|bosses")}: ${u.kills||0} · ${t("клинків|blades")}: ${(u.blades||[]).length} · ${t("фонів|bgs")}: ${(u.bgs||[]).length}</div></div>
   <button class="btn w-full" onclick="admSearch()">← ${t("Назад|Back")}</button>`}
 catch(e){box.innerHTML=`<div class="text-xs text-crimsonRed">${esc(e.message)}</div>`}
}
async function admClaims(){
 const box=$("admRes");box.innerHTML="…";
 try{const s=await FB.getDocs(FB.query(FB.collection(db,"claims"),FB.orderBy("ts","desc"),FB.limit(20)));
  box.innerHTML=s.empty?`<div class="text-xs text-gray-500">—</div>`:s.docs.map(d=>{const c=d.data();return `<div class="card !p-3 text-xs space-y-0.5"><b>${esc(c.nick||"?")}</b> → <span class="text-neonGold">${esc(c.tier)}</span> ${c.code?"#"+esc(c.code):""}<div class="text-[10px] text-gray-400">XP ${fmt(c.xp||0)} · ${t("дні сервер|server days")} ${c.serverDays??"—"} (${t("в додатку|app")} ${c.days}) · ${t("серія|streak")} ${c.streak} · ${t("друзів|friends")} ${c.friends} · ${t("завдань|tasks")} ${c.tasks} · ${t("босів|bosses")} ${c.kills||0} · ${t("клинків|blades")} ${c.blades||0} · ${t("реклам|ads")} ${c.ads} · ${dstr(c.ts)}</div></div>`}).join("")}
 catch(e){box.innerHTML=`<div class="text-xs text-crimsonRed">${esc(e.message)}</div>`}
}

// ═══ АДМІНКА: майстри (оплата = paidUntil). Неоплачений майстер миттєво зникає зі списку гравців ═══
async function admMasters(){const box=$("admRes");box.innerHTML="…";
 try{const q=await FB.getDocs(FB.collection(db,"masters"));
  box.innerHTML=`<div class="card space-y-2"><b class="text-xs">${t("Новий майстер|New master")}</b><input id="mN" class="inp !py-2" placeholder="Ім'я / студія"><input id="mC" class="inp !py-2" placeholder="Місто"><input id="mI" class="inp !py-2" placeholder="Instagram (без @)"><input id="mT" class="inp !py-2" placeholder="Telegram chat id (для сповіщень майстру)"><input id="mP" class="inp !py-2" placeholder="URL фото (необов'язково)"><button class="btn w-full" onclick="admAddMaster()">+ ${t("Додати на 30 днів|Add for 30 days")}</button></div>`+
  q.docs.map(d=>{const x=d.data(),pu=x.paidUntil&&x.paidUntil.toMillis?x.paidUntil.toMillis():0,on=pu>Date.now();
   return `<div class="card !p-3 text-xs space-y-2"><div><b>${esc(x.name||"?")}</b> · ${esc(x.city||"")} <span class="${on?"text-emerald-400":"text-crimsonRed"}">${on?"✅ "+t("до|until")+" "+new Date(pu).toLocaleDateString():"⛔ "+t("не оплачено|unpaid")}</span></div><div class="flex gap-2 flex-wrap"><button class="btn" onclick="admMasterPay('${esc(d.id)}',30)">+30 ${t("днів|days")}</button><button class="btn !bg-amber-600" onclick="admMasterBoost('${esc(d.id)}',30)">⭐ +30 ${t("днів|days")}</button><button class="btn !bg-red-700" onclick="admMasterPay('${esc(d.id)}',0)">${t("Вимкнути|Disable")}</button><button class="btn !bg-inkDark border border-inkBorder" onclick="admClients('${esc(d.id)}')">${t("Клієнти|Clients")}</button></div></div>`}).join("")}
 catch(e){box.innerHTML=`<div class="text-xs text-crimsonRed">${esc(e.message)}</div>`}}
async function admAddMaster(){const v=i=>($(i).value||"").trim();if(!v("mN"))return;
 try{await FB.addDoc(FB.collection(db,"masters"),{name:v("mN"),city:v("mC"),ig:v("mI").replace(/^@/,""),tg:v("mT"),photo:v("mP"),boostUntil:FB.Timestamp.fromMillis(0),paidUntil:FB.Timestamp.fromMillis(Date.now()+30*864e5)});admMasters()}catch(e){alert(e.message)}}
async function admMasterPay(id,days){
 try{const ref=FB.doc(db,"masters",id),r=await FB.getDoc(ref),cur=r.data().paidUntil&&r.data().paidUntil.toMillis?r.data().paidUntil.toMillis():0;
  await FB.updateDoc(ref,{paidUntil:FB.Timestamp.fromMillis(days?Math.max(cur,Date.now())+days*864e5:Date.now()-1000)});admMasters()}catch(e){alert(e.message)}}
async function admMasterBoost(id,days){   // платне просування: ⭐ угорі списку міста
 try{const ref=FB.doc(db,"masters",id),r=await FB.getDoc(ref),cur=r.data().boostUntil&&r.data().boostUntil.toMillis?r.data().boostUntil.toMillis():0;
  await FB.updateDoc(ref,{boostUntil:FB.Timestamp.fromMillis(Math.max(cur,Date.now())+days*864e5)});admMasters()}catch(e){alert(e.message)}}
async function admClients(id){const box=$("admRes");box.innerHTML="…";
 try{const q=await FB.getDocs(FB.query(FB.collection(db,"clients"),FB.where("master","==",id),FB.limit(100)));
  box.innerHTML=`<button class="btn w-full" onclick="admMasters()">← ${t("Назад|Back")}</button>`+(q.empty?`<div class="text-xs text-gray-500">—</div>`:q.docs.map(d=>d.data()).sort((a,b)=>(b.ts&&b.ts.seconds||0)-(a.ts&&a.ts.seconds||0)).map(c=>`<div class="card !p-3 text-xs"><b>${esc(c.nick||"?")}</b> <span class="text-gray-400">${dstr(c.ts)}</span></div>`).join(""))}
 catch(e){box.innerHTML=`<div class="text-xs text-crimsonRed">${esc(e.message)}</div>`}}
