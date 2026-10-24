window.INKV=window.INKV||{};INKV.duel="20261023c";
/* INKAI duel.js — ОНЛАЙН-ДУЕЛЬ «ПЕЧАТКА САМУРАЯ» (фірмова механіка YYOKAI). Підключається ПІСЛЯ meta.js.
   Як це працює:
   1. Гравець тисне «Викликати друга» → створюється кімната duels/КОД, друг отримує посилання ?duel=КОД.
   2. Друг приймає → обом іде відлік → ОДНАКОВІ йокаї (спільне seed), 60 с, БЕЗ прокачки й катан в рахунку (рахунок = «чисті очки», дивись f.dp) — вирішує лише вміння.
   3. Під час раунду видно живий рахунок суперника. Переможець отримує бустер ×2; за перемогу над НОВИМ суперником — «печатку».
   4. 10 печаток = знижка 15% у майстра YYOKAI (заявка йде майстру, він перевіряє). Щоб зібрати 10 печаток, треба 10 різних друзів — це і є вірусність.
   Захист від фарму: нагороди лише за перемогу над суперником, який дограв; не більше DUEL_DAILY нагороджуваних дуелей на добу; один суперник дає печатку лише раз. */
const DUEL_SEC=60,SEAL_NEED=10,SEAL_PCT=15,DUEL_DAILY=5;   // 🔧 тривалість раунду, печаток для призу, знижка %, ліміт нагороджуваних дуелей на добу
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const RS=()=>(typeof G!=="undefined"&&G.rs)?G.rs():R();   // «спільний» генератор: у дуелі однаковий для обох гравців; у звичайній грі — звичайний випадковий
let DL={code:null,role:null,room:null,unsub:null};
{const q=new URLSearchParams(location.search).get("duel");if(q)localStorage.ink_duelroom=q.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8)}
const dlRef=c=>FB.doc(db,"duels",c),dlMe=()=>({uid:user.uid,nick:S.nick||"Player",av:S.av||"fox"});
function dlModal(h){const p=$("pc");p.onclick=null;p.innerHTML=`<div class="card rounded-3xl w-full max-w-sm space-y-3 text-center" onclick="event.stopPropagation()">${h}</div>`;p.classList.replace("hidden","flex")}
function dlClose(){const p=$("pc");p.classList.replace("flex","hidden")}

// ═══ КАРТКА НА ГОЛОВНОМУ ЕКРАНІ ═══
function duelCard(){const n=S.seal||0;
 return `<div class="card space-y-2 !border-crimsonRed/50"><div class="flex justify-between items-center"><b class="text-xs text-crimsonRed uppercase">⚔️ ${t("Дуель самураїв|Samurai duel")}</b><span class="text-[11px] text-neonGold font-bold">🪪 ${n}/${SEAL_NEED}</span></div>
 <p class="text-[11px] text-gray-300">${t("Виклич друга: однакові йокаї, 60 с, без прокачки — вирішує лише вміння. Перемога над новим суперником = печатка. 10 печаток = знижка 15% у майстра YYOKAI.|Challenge a friend: identical yokai, 60 s, no upgrades — skill only. Beating a new rival = a seal. 10 seals = 15% off with master YYOKAI.")}</p>
 <div class="flex gap-1">${Array.from({length:SEAL_NEED},(_,i)=>`<i class="flex-1 h-1.5 rounded ${i<n?"bg-neonGold":"bg-inkBorder"}"></i>`).join("")}</div>
 <button class="btng w-full py-2.5" onclick="duelMenu()">⚔️ ${t("Викликати друга|Challenge a friend")}</button></div>`}
function duelMenu(){
 if(!isReal()){alert(t("Щоб грати дуелі, увійди через Google/Apple.|Sign in with Google/Apple to duel."));return}
 dlModal(`<h3 class="font-black">⚔️ ${t("Дуель самураїв|Samurai duel")}</h3>
 <div class="grid grid-cols-3 gap-2 text-center text-[11px]"><div class="card !p-2"><b class="text-lg text-neonGold">${S.dw||0}</b><br>${t("перемог|wins")}</div><div class="card !p-2"><b class="text-lg text-neonGold">${S.seal||0}</b><br>${t("печаток|seals")}</div><div class="card !p-2"><b class="text-lg text-neonGold">${(S.dopp||[]).length}</b><br>${t("суперників|rivals")}</div></div>
 <button class="btng w-full py-3" onclick="duelCreate()">⚔️ ${t("Створити дуель|Create duel")}</button>
 ${(S.seal||0)>=SEAL_NEED&&!S.sealClaimed?`<button class="btng w-full py-2.5" onclick="claimSeals()">🪪 ${t("Забрати знижку 15% у майстра YYOKAI|Claim 15% off with master YYOKAI")}</button>`:""}
 <button class="btn w-full" onclick="dlClose()">${t("Закрити|Close")}</button>`)}

// ═══ СТВОРЕННЯ / ЗАПРОШЕННЯ ═══
async function duelCreate(){
 try{const code=Array.from({length:6},()=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[R()*32|0]).join(""),seed=(R()*4294967296)>>>0;
  await FB.setDoc(dlRef(code),{host:dlMe(),seed,status:"open",hs:0,hd:false,gs:0,gd:false,created:FB.serverTimestamp()});
  DL={code,role:"host",room:null};duelWatch();track("duel_create");duelWaitUI()}
 catch(e){alert(e.code=="permission-denied"?t("Дуелі ще не ввімкнені (оновіть правила Firestore).|Duels are not enabled yet (update Firestore rules)."):e.message)}}
const duelLink=()=>location.origin+location.pathname+"?duel="+DL.code;
function duelWaitUI(){dlModal(`<h3 class="font-black">⚔️ ${t("Чекаємо суперника…|Waiting for a rival…")}</h3><div class="text-3xl font-black tracking-widest text-neonGold">${DL.code}</div><p class="text-[11px] text-gray-400 break-all">${esc(duelLink())}</p>
 <button class="btng w-full py-3" onclick="duelShare()">📤 ${t("Надіслати другу|Send to a friend")}</button><button class="btn w-full" onclick="duelCancel()">${t("Скасувати|Cancel")}</button>`)}
async function duelShare(){const url=duelLink(),txt=t("Викликаю тебе на дуель в INKAI! 60 секунд, однакові йокаї, без прокачки. Приймаєш? ⚔️🥷|I challenge you to an INKAI duel! 60 seconds, identical yokai, no upgrades. Accept? ⚔️🥷");
 try{if(navigator.share){await navigator.share({title:"INKAI",text:txt,url});return}}catch(e){if(e&&e.name=="AbortError")return}
 try{await navigator.clipboard.writeText(txt+" "+url)}catch(e){}toast(t("Скопійовано!|Copied!"))}
function duelCancel(){if(DL.unsub)DL.unsub();try{if(DL.role=="host"&&DL.room&&DL.room.status=="open")FB.updateDoc(dlRef(DL.code),{status:"cancelled"}).catch(()=>{})}catch(e){}DL={code:null};dlClose()}
function duelWatch(){if(DL.unsub)DL.unsub();DL.unsub=FB.onSnapshot(dlRef(DL.code),s=>{if(!s.exists())return;DL.room=s.data();duelTick()},()=>{})}

// друг відкрив посилання ?duel=КОД: щойно він увійшов і на головному екрані — пропонуємо прийняти
async function duelInviteCheck(){const c=localStorage.ink_duelroom;
 if(!c||DL.code||(typeof G!=="undefined"&&G.on)||cur!="play"||!FBOK||!isReal()||!S.tut)return;
 localStorage.removeItem("ink_duelroom");
 try{const s=await FB.getDoc(dlRef(c));if(!s.exists()){toast(t("Дуель не знайдено|Duel not found"));return}const r=s.data();
  if(r.host.uid==user.uid){toast(t("Це твоя власна дуель|This is your own duel"));return}
  if(r.status!="open"||r.guest){toast(t("Дуель уже зайнята або завершена|The duel is taken or finished"));return}
  dlModal(`<div class="text-4xl">⚔️</div><h3 class="font-black">${esc(r.host.nick)} ${t("викликає тебе!|challenges you!")}</h3><p class="text-xs text-gray-300">${t("60 секунд, однакові йокаї, без прокачки — вирішує лише вміння.|60 seconds, identical yokai, no upgrades — skill only.")}</p>
  <button class="btng w-full py-3" onclick="duelAccept('${c}')">⚔️ ${t("Прийняти|Accept")}</button><button class="btn w-full" onclick="dlClose()">${t("Відмовитись|Decline")}</button>`)}catch(e){}}
async function duelAccept(c){try{DL={code:c,role:"guest",room:null};duelWatch();await FB.updateDoc(dlRef(c),{guest:dlMe(),status:"ready",startAt:Date.now()+8000});track("duel_accept")}
 catch(e){if(DL.unsub)DL.unsub();DL={code:null};alert(t("Не вдалося прийняти дуель.|Could not accept the duel."))}}
setInterval(duelInviteCheck,2500);

// ═══ ВІДЛІК І СТАРТ ═══
function duelTick(){const r=DL.room;if(!r)return;
 if(r.status=="ready"&&r.guest&&r.startAt&&!DL.started){DL.started=1;duelCountdown()}
 if(DL.ended&&!DL.shown){const od=DL.role=="host"?r.gd:r.hd;if(od||Date.now()-DL.ended>20000){DL.shown=1;duelResult()}}}   // чекаємо суперника максимум 20 с
setInterval(()=>{if(DL.ended&&!DL.shown)duelTick()},1000);
function duelCountdown(){const r=DL.room;
 dlModal(`<div class="text-xs text-gray-400">${esc(r.host.nick)} ⚔️ ${esc(r.guest.nick)}</div><div id="dlc" class="text-7xl font-black text-neonGold">…</div><div class="text-xs text-gray-300">${t("Приготуйся! Однакові йокаї, без прокачки.|Get ready! Identical yokai, no upgrades.")}</div>`);
 const iv=setInterval(()=>{const left=Math.ceil((r.startAt-Date.now())/1000),e=$("dlc");if(e)e.textContent=left>0?left:"⚔️";if(Date.now()>=r.startAt){clearInterval(iv);duelGo()}},100)}
function duelGo(){dlClose();DL.opp=DL.role=="host"?DL.room.guest:DL.room.host;G.on=0;startRound(1,{duel:{seed:DL.room.seed,code:DL.code}});
 G.dliv=setInterval(()=>{if(!G.duel||!G.on)return;try{FB.updateDoc(dlRef(DL.code),DL.role=="host"?{hs:G.f[0].dp||0}:{gs:G.f[0].dp||0}).catch(()=>{})}catch(e){}},1000)}

// ═══ ЖИВИЙ РАХУНОК У РАУНДІ ═══
function duelHud(f,w,T){const r=DL.room||{},os=DL.role=="host"?(r.gs||0):(r.hs||0),mine=f.dp||0,left=Math.max(0,DUEL_SEC-G.el),nick=(DL.opp&&DL.opp.nick)||"?";
 cx.textAlign="left";cx.fillStyle=left<10?"#ff2a5f":"#ffb703";cx.font="900 22px system-ui";cx.fillText("⏱ "+Math.ceil(left),14,T+30);
 cx.textAlign="center";cx.font="800 14px system-ui";cx.fillStyle=mine>=os?"#4ade80":"#ff6b6b";cx.fillText("⚔ "+nick+": "+fmt(os),w/2,T+96);
 const tot=Math.max(1,mine+os),bw=w*.5,bx=(w-bw)/2;cx.fillStyle="rgba(255,255,255,.14)";cx.fillRect(bx,T+101,bw,4);cx.fillStyle="#4ade80";cx.fillRect(bx,T+101,bw*mine/tot,4);cx.textAlign="left"}

// ═══ КІНЕЦЬ І РЕЗУЛЬТАТ ═══
function duelEnd(){const f=G.f[0],mine=f.dp||0;clearInterval(G.dliv);G.on=0;addPlay(G.el);ptr={};setMusic("menu");$("gm").classList.add("hidden");adTick();
 try{FB.updateDoc(dlRef(DL.code),DL.role=="host"?{hs:mine,hd:true}:{gs:mine,gd:true}).catch(()=>{})}catch(e){}
 DL.mine=mine;DL.ended=Date.now();DL.shown=0;
 dlModal(`<h3 class="font-black">⏱ ${t("Час вийшов!|Time is up!")}</h3><div class="text-4xl font-black text-neonGold">${fmt(mine)}</div><div class="text-xs text-gray-400">${t("Чекаємо результат суперника…|Waiting for the rival…")}</div>`);
 duelTick()}
function duelResult(){const r=DL.room,mine=DL.mine,os=DL.role=="host"?(r.gs||0):(r.hs||0),od=DL.role=="host"?r.gd:r.hd,opp=DL.opp,win=mine>os,draw=mine==os;let rew="";
 if(S.dday!==today()){S.dday=today();S.dcnt=0}
 if(win&&od&&S.dcnt<DUEL_DAILY){S.dw=(S.dw||0)+1;S.dcnt++;S.dopp=S.dopp||[];
  if(!S.dopp.includes(opp.uid)&&S.dopp.length<60){S.dopp.push(opp.uid);S.seal=(S.seal||0)+1;rew="🪪 "+t("Печатка самурая +1|Samurai seal +1")+" · "}
  S.c.x2=(S.c.x2||0)+1;rew+="⚡ "+t("бустер ×2|×2 boost")}
 else if(!win){S.souls+=1;rew="⛩️ +1"}
 save();push();track("duel_end",{win,draw});if(DL.unsub)DL.unsub();
 dlModal(`<div class="text-4xl">${win?"🏆":draw?"🤝":"💀"}</div><h3 class="font-black">${win?t("Перемога!|Victory!"):draw?t("Нічия|Draw"):t("Поразка|Defeat")}</h3>
 <div class="flex justify-around items-center"><div><div class="text-xs text-gray-400">${t("Ти|You")}</div><b class="text-2xl text-neonGold">${fmt(mine)}</b></div><b>vs</b><div><div class="text-xs text-gray-400">${esc(opp.nick)}</div><b class="text-2xl">${fmt(os)}</b></div></div>
 ${od?"":`<div class="text-[10px] text-gray-500">${t("Суперник не дограв — показано його останній рахунок.|Rival did not finish — last score shown.")}</div>`}
 <div class="text-xs text-neonGold">${rew}</div><div class="text-[11px] text-gray-400">🪪 ${S.seal||0}/${SEAL_NEED}</div>
 <button class="btng w-full py-3" onclick="duelRematch()">⚔️ ${t("Реванш|Rematch")}</button><button class="btn w-full" onclick="duelClose()">${t("Закрити|Close")}</button>`)}
function duelRematch(){DL={code:null};duelCreate()}
function duelClose(){DL={code:null};dlClose();rend()}
async function claimSeals(){if(S.sealClaimed||(S.seal||0)<SEAL_NEED)return;const m=masterOf(OWN);
 if(!m){alert(t("Майстер YYOKAI тимчасово недоступний.|Master YYOKAI is temporarily unavailable."));return}
 try{await FB.setDoc(FB.doc(db,"claims",user.uid+"_seals"),{uid:user.uid,master:m.id,masterName:m.nm,email:user.email||"",nick:S.nick,tier:"duel_seals",pct:SEAL_PCT,code:"",kind:"discount",ts:FB.serverTimestamp(),status:"new"});
  S.sealClaimed=1;save();alert(t("Заявку надіслано майстру YYOKAI. Він напише тобі.|Request sent to master YYOKAI. He will contact you."));dlClose()}
 catch(e){alert(e.code=="permission-denied"?t("Така заявка вже подавалась.|Such a claim was already sent."):e.message)}}
