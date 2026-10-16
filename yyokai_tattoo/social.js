/* INKAI social.js — вхід, нік, друзі й завдання, рейтинг, нагороди (тату), профіль, адмінка
   ПРАВИЛА FIRESTORE (замінити ADMIN_UID):
     rules_version='2'; service cloud.firestore { match /databases/{d}/documents {
       function admin(){ return request.auth.uid in ['ADMIN_UID']; }
       match /users/{u}   { allow read: if request.auth.uid==u || admin(); allow write: if request.auth.uid==u; }
       match /public/{u}  { allow read: if request.auth!=null; allow write: if request.auth.uid==u; }
       match /referrals/{u}{ allow read: if request.auth!=null; allow create: if request.auth.uid==u; }
       match /daylog/{x}  { allow create: if request.auth.uid==request.resource.data.uid && request.resource.data.ts==request.time;
                            allow read: if admin() || resource.data.uid==request.auth.uid; }   // ← НОВЕ: гравець бачить свої дні
       match /submissions/{s}{ allow read: if request.auth!=null && (resource.data.uid==request.auth.uid || admin());
                            allow create: if request.auth.uid==request.resource.data.uid && request.resource.data.status=='pending'; allow update: if admin(); }
       match /claims/{c}  { allow create: if request.auth!=null; allow read, update: if admin(); }
       match /adEvents/{a}{ allow create: if request.auth!=null; }
       match /offers/{o}  { allow read: if true; allow write: if admin(); }
     }}
   Монети/XP живуть у браузері — їх можна підробити. Тому в умовах тату головні: серверні дні, друзі, підтверджені завдання. Перед тату перевіряй заявку в адмінці. */

// ═══ АВАТАРИ ═══
const AVS=[["fox","🦊"],["oni","👹"],["tengu","👺"],["kappa","🐸"],["skull","💀"],["dragon","🐉"],["cat","🐱"],["sakura","🌸"],["katana","⚔️"],["torii","⛩️"],["mask","🎭"],["ninja","🥷"]];
const avHTML=id=>{const a=AVS.find(x=>x[0]==id)||AVS[0];return `<img src="img/av/${a[0]}.png" data-e="${a[1]}" onerror="this.outerHTML=this.dataset.e" class="w-full h-full object-cover">`};
function pickAv(id){S.av=id;save();push();rProfile()}

// ═══ ВХІД ═══
function authMode(m){mode=m;const r=m=="reg";$("aBtn").textContent=r?t("Створити акаунт|Create account"):t("Увійти|Sign in");$("aTog").textContent=r?t("Вже є акаунт? Увійти|Have an account? Sign in"):t("Немає акаунта? Реєстрація|No account? Register")}
function toggleAuth(){authMode(mode=="reg"?"login":"reg")}
function guest(){guestMode=true;user={uid:"local_guest",email:""};S.nick=S.nick||"Guest";save();go("play")}
async function social(k){
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
 $("nickAv").innerHTML=AVS.map(a=>`<button type="button" onclick="S.av='${a[0]}';showNick()" class="aspect-square rounded-xl overflow-hidden flex items-center justify-center text-xl ${S.av==a[0]?"ring-2 ring-neonGold":"opacity-60"}">${avHTML(a[0])}</button>`).join("");
 $("nickov").classList.remove("hidden");
}
async function saveNick(){
 const v=$("nickIn").value.trim(),lc=v.toLowerCase(),err=$("nickErr");
 if(!/^[\p{L}0-9_]{3,16}$/u.test(v)){err.textContent=t("3–16 символів: літери, цифри, _|3–16 chars: letters, digits, _");return}
 try{const q=await FB.getDocs(FB.query(FB.collection(db,"public"),FB.where("nickLc","==",lc),FB.limit(1)));if(!q.empty&&q.docs[0].id!=user.uid){err.textContent=t("Цей нік зайнятий|This nickname is taken");return}}catch(e){}
 S.nick=v;save();await push();$("nickov").classList.add("hidden");route();
}
function initAuth(){
 FB.setPersistence(auth,FB.browserLocalPersistence).catch(()=>{});
 FB.getRedirectResult(auth).catch(e=>{if(e&&e.code&&e.code!="auth/no-auth-event")alert(e.message)});
 FB.onAuthStateChanged(auth,async u=>{
  if(!u){user=null;authReady();return}
  user=u;let fresh=0;
  try{const r=await FB.getDoc(FB.doc(db,"users",u.uid));
   if(r.exists()){const{offers,ts,lastSeen,regAt,...x}=r.data();if((x.xp||0)>=S.xp){S={...S,...x,c:{...def.c,...x.c},up:{...x.up},ck:{...def.ck,...x.ck},adw:{...def.adw,...x.adw},bp:x.bp||{}};S.jd=S.jd||0;S.ln=S.ln??3}}else fresh=1}catch(e){}
  if(fresh){
   try{await FB.setDoc(FB.doc(db,"users",u.uid),{regAt:FB.serverTimestamp()},{merge:true})}catch(e){}
   if(refId&&refId!=u.uid){S.mon+=500;try{await FB.setDoc(FB.doc(db,"referrals",u.uid),{by:refId,ts:FB.serverTimestamp()})}catch(e){}}
  }
  await loadFriends();
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
 $("view-friends").innerHTML=`<h2 class="text-xl font-black uppercase text-neonGold">👥 ${t("Запроси друга в INKAI|Invite a friend to INKAI")}</h2>
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
 $("view-rating").innerHTML=`<h2 class="text-xl font-black uppercase text-neonGold mb-3">⛩️ ${t("Книга Самураїв — ТОП-100|Samurai Book — TOP-100")}</h2><div class="space-y-2">`+PL.map((u,i)=>`<button onclick="showPl(${i})" class="card !p-3 w-full flex items-center justify-between text-left ${i<5?"!border-neonGold/50":""} ${u.id==me?"!border-crimsonRed":""}"><div class="flex items-center gap-3"><span class="font-black font-mono text-sm w-8 ${i==0?"text-neonGold":i==1?"text-gray-300":i==2?"text-amber-600":""}">#${i+1}</span><div class="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-xl">${avHTML(u.av)}</div><div><b class="text-xs">${esc(u.nick)}</b><div class="text-[10px] text-gray-400">Lv ${lvl(u.xp)}</div></div></div><span class="font-mono text-xs text-neonGold">${fmt(u.xp)} XP</span></button>`).join("")+`</div>`;
}
function showPl(i){const u=PL[i];if(!u)return;const p=$("pc");p.innerHTML=`<div class="card rounded-3xl text-center space-y-2 w-full max-w-xs"><div class="w-24 h-24 mx-auto rounded-3xl overflow-hidden flex items-center justify-center text-6xl glow" style="border:2px solid #ffb703">${avHTML(u.av)}</div><div class="text-xl font-black">${esc(u.nick)}</div><div class="text-xs text-gray-300">#${i+1} · Lv ${lvl(u.xp)} · ${fmt(u.xp)} XP</div><div class="text-[11px] text-gray-400">${t("Днів у грі|Days played")}: ${u.days}</div></div>`;p.classList.replace("hidden","flex")}

// ═══ НАГОРОДИ: складніші умови. Дні беруться з СЕРВЕРНОГО логу (SD), а не з телефона ═══
let SD=0,SDt=0;
async function loadSD(){if(!isReal()||Date.now()-SDt<60000)return;SDt=Date.now();
 try{const q=await FB.getDocs(FB.query(FB.collection(db,"daylog"),FB.where("uid","==",user.uid),FB.limit(500)));SD=new Set(q.docs.map(d=>d.data().ts.toDate().toISOString().slice(0,10))).size;if(cur=="rewards")rRewards()}catch(e){}}
const need=k=>{
 const F=["Друзів, що дійшли до 3-го рівня|Friends who reached level 3",S.friends],D=["Різних днів у грі (за даними сервера)|Different days played (server-verified)",isReal()?SD:0],
  X=["Очки XP (за раунди)|XP points (from rounds)",S.xp],T=["Підтверджені завдання партнерів|Verified partner tasks",tasksOk()],
  B=["Босів переможено|Bosses defeated",S.kills],K=["Клинків у колекції|Blades collected",S.blades.length],G2=["Фонів у колекції|Backgrounds collected",S.bgs.length],A=["Реклам переглянуто|Ads watched",S.ads];
 return {
  d10:[[...F,1],[...D,4],[...X,20000]],
  d20:[[...F,2],[...D,6],[...X,60000],[...B,5]],
  d30:[[...F,3],[...D,9],[...X,150000],[...B,12],[...T,2]],
  d40:[[...F,4],[...D,12],[...X,300000],[...B,25],[...T,4]],
  mini:[[...F,2],[...D,20],[...X,600000],[...B,40],[...T,4],[...K,12]],
  big:[[...F,6],[...D,45],[...X,2500000],[...B,100],[...T,8],[...K,30],[...G2,25],[...A,40]]
 }[k];
};
const NAMES={d10:"🏷 Знижка 10% на тату|🏷 10% tattoo discount",d20:"🏷 Знижка 20%|🏷 20% discount",d30:"🏷 Знижка 30%|🏷 30% discount",d40:"🏷 Знижка 40%|🏷 40% discount",mini:"🎁 Міні-тату (до 1500 грн)|🎁 Mini tattoo (up to 1500 UAH)",big:"👑 Велике тату (7000 грн)|👑 Big tattoo (7000 UAH)"};
const rows=r=>r.map(x=>`<div><div class="flex justify-between text-[11px]"><span class="text-gray-300">${t(x[0])}</span><span class="font-mono ${x[1]>=x[2]?"text-emerald-400":"text-neonGold"}">${fmt(Math.min(x[1],x[2]))}/${fmt(x[2])}</span></div><div class="h-1.5 bg-inkDark rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-neonGold to-crimsonRed" style="width:${Math.min(100,x[1]/x[2]*100)}%"></div></div></div>`).join("");
async function claim(id,code){
 if(code?S.cp.find(c=>c.code==code&&c.used):S.claimed.includes(id))return;
 if(!isReal()){alert(t("Щоб подати заявку, увійди через Google/Apple.|Sign in with Google/Apple to claim."));authMode("reg");go("auth");return}
 try{await FB.addDoc(FB.collection(db,"claims"),{uid:user.uid,email:user.email||"",nick:S.nick,tier:id,code:code||"",xp:S.xp,days:S.days,serverDays:SD,streak:S.streak,friends:S.friends,tasks:tasksOk(),ads:S.ads,kills:S.kills,blades:S.blades.length,bgs:S.bgs.length,ts:FB.serverTimestamp()});
  if(code){S.cp.find(c=>c.code==code).used=1}else S.claimed.push(id);save();rend();alert(t("Заявку надіслано в студію YYOKAI! Ми перевіримо умови й напишемо тобі.|Request sent to YYOKAI studio! We'll verify and contact you."))}catch(e){alert(e.message)}
}
function rRewards(){
 loadSD();
 const card=id=>{const r=need(id),all=r.every(x=>x[1]>=x[2]),cl=S.claimed.includes(id);return `<div class="card space-y-3"><h3 class="font-black text-sm">${t(NAMES[id])}</h3>${rows(r)}<button onclick="claim('${id}')" ${all&&!cl?"":"disabled"} class="btng w-full py-2.5 ${all&&!cl?"":"!from-gray-800 !to-gray-800 !text-gray-500"}">${cl?t("Заявку подано|Request sent"):all?t("Подати заявку|Claim"):t("Умови не виконано|Conditions not met")}</button></div>`};
 const cps=S.cp.filter(c=>!c.used);
 $("view-rewards").innerHTML=`<h2 class="text-xl font-black uppercase">${t("Нагороди студії YYOKAI|YYOKAI studio rewards")}</h2>
 <div class="card text-xs text-gray-300 space-y-1"><b class="text-neonGold">${t("Як отримати нагороду|How to get a reward")}</b>
  <div>1️⃣ ${t("Грай у різні дні — лічильник днів іде з сервера, його не обдурити.|Play on different days — the day counter comes from the server.")}</div>
  <div>2️⃣ ${t("Запрошуй друзів: кожен, хто дійшов до 3-го рівня, зараховується.|Invite friends: each one reaching level 3 counts.")}</div>
  <div>3️⃣ ${t("Перемагай босів, збирай клинки й фони, виконуй завдання партнерів.|Beat bosses, collect blades & backgrounds, do partner tasks.")}</div>
  <div>4️⃣ ${t("Коли всі смужки заповнені — «Подати заявку». Студія перевіряє й домовляється про сеанс.|When all bars are full — “Claim”. The studio verifies and books your session.")}</div>
  <div class="text-gray-500">${t("Монети й пасивний дохід не враховуються. Купони із сундуків теж проходять перевірку.|Coins and passive income don't count. Chest coupons are verified too.")}</div></div>`+
 (cps.length?`<h3 class="text-sm font-black uppercase">${t("Мої купони із сундуків|My chest coupons")}</h3>`+cps.map(c=>`<div class="card flex items-center justify-between"><div><b class="text-sm">${esc(c.lb)}</b><div class="text-[10px] text-gray-400">#${esc(c.code)}</div></div><button class="btng" onclick="claim('${esc(c.type)}','${esc(c.code)}')">${t("Забрати|Claim")}</button></div>`).join(""):"")+
 ["d10","d20","d30","d40","mini","big"].map(card).join("");
}

// ═══ ПРОФІЛЬ ═══
function rProfile(){
 $("view-profile").innerHTML=`
 <div class="card flex items-center gap-4"><div class="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-4xl" style="border:2px solid #ffb703">${avHTML(S.av)}</div><div><h3 class="font-bold text-sm">${esc(S.nick||t("Гість|Guest"))}</h3><span class="inline-block mt-1 px-2 py-0.5 bg-crimsonRed/20 border border-crimsonRed/40 text-crimsonRed text-[10px] font-bold rounded-full">Lv ${lvl(S.xp)} · ${fmt(S.xp)} XP</span></div></div>
 <div class="card space-y-2"><h4 class="text-xs font-bold text-neonGold uppercase">${t("Мій аватар (видно іншим у рейтингу)|My avatar (visible in the rating)")}</h4><div class="grid grid-cols-6 gap-2">${AVS.map(a=>`<button onclick="pickAv('${a[0]}')" class="aspect-square rounded-xl overflow-hidden flex items-center justify-center text-2xl ${S.av==a[0]?"ring-2 ring-neonGold":"opacity-70"}" style="background:#0a090d">${avHTML(a[0])}</button>`).join("")}</div></div>
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
 <div class="card space-y-2"><div class="flex gap-2"><input id="admQ" class="inp !py-2.5" placeholder="${t("Нік гравця (початок)|Player nick (prefix)")}"><button class="btn" onclick="admSearch()">🔍</button></div><button class="btn w-full !bg-inkDark border border-inkBorder" onclick="admClaims()">${t("Останні заявки|Latest claims")}</button></div><div id="admRes" class="space-y-2"></div>`;
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
