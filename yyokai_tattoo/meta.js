window.INKV=window.INKV||{};INKV.meta="20261023b";
/* INKAI meta.js — рейтинг тиждень/місяць/міста, щоденна серія, бестіарій, переродження, івенти, дуель, навчання.
   Підключається ПІСЛЯ game.js. Використовує глобальні змінні решти файлів. */

// ═══ ЧАС І XP: тиждень (пн–нд) і місяць. Ключі числові, щоб сортувати без складених індексів Firestore ═══
const XP_K=3;   // 🔧 скільки XP дає 1 монета раунду (очки = монети; від цього залежать рівні й рейтинг)
const wkNum=()=>Math.floor((Date.now()-4*864e5)/(7*864e5)),monNum=()=>{const d=new Date();return d.getFullYear()*12+d.getMonth()};
function addXP(n){const w=wkNum(),m=monNum();if(S.xwk!==w){S.xwk=w;S.xw=0}if(S.xmk!==m){S.xmk=m;S.xm=0}S.xw+=n;S.xm+=n;S.xp+=n}

// ═══ ІВЕНТИ: [від MM-DD, до MM-DD, id, іконка, назва, опис, ×монет]. Нагороди за діапазон дат; додавай свої ═══
const EVENTS=[
 ["03-25","04-05","hanami","🌸","Ханамі|Hanami","Цвітіння сакури: монети ×1.5, нефрит із босів ×2|Sakura bloom: coins ×1.5, jade from bosses ×2",1.5],
 ["07-06","07-08","tanabata","🎋","Танабата|Tanabata","Свято зірок: монети ×1.5, нефрит із босів ×2|Star festival: coins ×1.5, jade from bosses ×2",1.5],
 ["08-12","08-16","obon","🏮","Обон|Obon","Ніч ліхтарів: монети ×1.5, нефрит із босів ×2|Lantern nights: coins ×1.5, jade from bosses ×2",1.5],
 ["10-25","11-01","hyakki","👹","Ніч сотні демонів|Night of 100 Demons","Парад йокаїв: монети ×1.5, нефрит із босів ×2|Yokai parade: coins ×1.5, jade from bosses ×2",1.5],
 ["12-30","01-03","oshogatsu","🎍","Осьогацу|Oshogatsu","Японський Новий рік: монети ×1.5, нефрит із босів ×2|Japanese New Year: coins ×1.5, jade from bosses ×2",1.5]
];
function curEvent(){const d=new Date(),k=String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
 return EVENTS.find(e=>e[0]<=e[1]?(k>=e[0]&&k<=e[1]):(k>=e[0]||k<=e[1]))||null}

// ═══ ЩОДЕННА СЕРІЯ: 7 днів, на 7-й — сундук. Пропустив день — серія з 1-го дня ═══
const DAILY=[{mon:300},{b:{mb:1}},{souls:3},{mon:800,b:{st:1}},{jd:1},{mon:1200,b:{x2:1}},{jd:2,ln:1,chest:1}];
const dayIdx=()=>((S.streak||1)-1)%7,dailyReady=()=>S.sr!==today();
function claimDaily(){if(!dailyReady())return;const r=DAILY[dayIdx()];S.sr=today();
 S.mon+=r.mon||0;S.souls+=r.souls||0;S.jd+=r.jd||0;S.ln+=r.ln||0;for(const k in(r.b||{}))S.c[k]=(S.c[k]||0)+r.b[k];
 save();push();hdr();track("daily_claim",{day:dayIdx()+1});
 if(r.chest){afterRev=rend;runChest(["bonus","🎁","Сундук-знахідка|Found chest",0,"#ffb703"],2,"img/chest/bonus.png")}
 else{toast("🎁 "+t("Нагороду отримано!|Reward received!"));rend()}}
function dailyCard(){const i=dayIdx(),ok=dailyReady();
 return `<div class="card space-y-2" style="background:rgba(19,17,24,.82)"><div class="flex justify-between items-center"><b class="text-xs text-neonGold uppercase">📅 ${t("Щоденна серія|Daily streak")} · ${S.streak||1} ${t("дн.|d")}</b><button class="${ok?"btng":"btn"} !px-3" ${ok?"":"disabled"} onclick="claimDaily()">${ok?t("Забрати|Claim"):"✓"}</button></div>
 <div class="grid grid-cols-7 gap-1 text-center">${DAILY.map((r,k)=>`<div class="rounded-lg py-1.5 text-[10px] ${k==i?"bg-neonGold/20 border border-neonGold":"bg-inkDark border border-inkBorder"} ${k<i||(k==i&&!ok)?"opacity-50":""}"><div class="text-base">${r.chest?"🎁":r.jd?"💎":r.souls?"⛩️":r.b?"⚡":"文"}</div>${k+1}</div>`).join("")}</div></div>`}

// ═══ ГОЛОВНИЙ ЕКРАН: івент, дуель, навчання, серія ═══
function playExtras(){let h="";const ev=curEvent();
 if(ev)h+=`<div class="card text-center !border-crimsonRed/60 glow"><b class="text-crimsonRed">${ev[3]} ${t(ev[4])}</b><div class="text-[11px] text-gray-300">${t(ev[5])}</div></div>`;
 if(DUEL&&DUEL.sc>0)h+=`<div class="card text-center !border-neonGold/60"><b class="text-neonGold">⚔️ ${t("Дуель|Duel")}: ${esc(DUEL.n)} ${t("набрав|scored")} ${fmt(DUEL.sc)}</b><div class="text-[11px] text-gray-300">${t("Побий цей рахунок в одному соло-раунді — отримаєш бустер ×2 монет.|Beat this score in one solo round to win a ×2 coins boost.")}</div></div>`;
 if(!S.tut)h+=`<div class="card text-center !border-neonGold/60 glow"><b>🥷 ${t("Навчання за 1 хвилину — і перший сундук у подарунок|1-minute tutorial — and a free first chest")}</b></div>`;
 else h+=dailyCard();
 return h}

// ═══ НАВЧАННЯ: перший соло-раунд — без програшу: йокаї → свиток → бос → сундук ═══
function bstHit(f,ty){S.bst=S.bst||{};const first=!S.bst[ty];S.bst[ty]=(S.bst[ty]||0)+1;if(first){S.souls+=3;pop(f,f.bx,f.by-70,"📖 +3 ⛩️",1)}
 if(G.tut){G.tut=0;S.tut=1;save();setTimeout(tutEnd,1400)}}
function tutEnd(){if(!G.on)return;G.on=0;addPlay(G.el);ptr={};setMusic("menu");$("gm").classList.add("hidden");adTick();track("tutorial_done");
 toast("🎉 "+t("Навчання пройдено! Тримай перший сундук|Tutorial complete! Here is your first chest"));
 afterRev=()=>go("play");runChest(["bonus","🎁","Сундук-знахідка|Found chest",0,"#ffb703"],1,"img/chest/bonus.png")}

// ═══ ДУЕЛЬ: виграш = бустер ×2 ═══
function duelCheck(best){if(!DUEL||!(DUEL.sc>0)||G.m!=1||best<DUEL.sc)return;const nn=DUEL.n;DUEL=null;localStorage.removeItem("ink_duel");
 S.c.x2=(S.c.x2||0)+1;track("duel_won");setTimeout(()=>toast("⚔️ "+t("Дуель виграно проти |Duel won against ")+nn+t("! +1 бустер ×2|! +1 ×2 boost")),1200)}

// ═══ БЕСТІАРІЙ: 20 босів; повна колекція = знижка 30% на flash-ескіз у майстра YYOKAI ═══
function bestiary(){const ks=Object.keys(BOSS),got=ks.filter(k=>(S.bst||{})[k]>0).length,p=$("pc");p.onclick=()=>p.classList.replace("flex","hidden");
 p.innerHTML=`<div class="card rounded-3xl w-full max-w-sm max-h-[85vh] overflow-y-auto space-y-3" onclick="event.stopPropagation()"><h3 class="font-black text-center">📖 ${t("Бестіарій йокаїв|Yokai bestiary")} ${got}/${ks.length}</h3>
 <p class="text-[11px] text-gray-400 text-center">${t("Перша перемога над босом — +3 ⛩️. Збери всіх — отримаєш знижку 30% на flash-ескіз у майстра YYOKAI.|First win over a boss: +3 ⛩️. Collect them all for 30% off a flash sketch with master YYOKAI.")}</p>
 <div class="grid grid-cols-2 gap-2">${ks.map(k=>{const n=(S.bst||{})[k]||0,B=BOSS[k];return `<div class="rounded-xl p-2 text-center ${n?"":"opacity-40"}" style="background:#0a090d;border:1px solid ${n?B[1]:"#272235"}"><div class="h-14 flex items-center justify-center text-3xl">${IMG("img/boss/"+k+".png",n?B[0].split("|")[0].split(" ")[0]:"❔","h-14 w-auto")}</div><b class="text-[10px] block leading-tight">${n?t(B[0]):"???"}</b><div class="text-[9px] text-gray-400 leading-tight">${n?t(B[3]):""}</div><div class="text-[10px] text-neonGold">×${n}</div></div>`}).join("")}</div>
 ${got>=ks.length?`<button class="btng w-full py-2.5" ${S.flash?"disabled":""} onclick="claimFlash()">${S.flash?"✓":t("Забрати знижку 30%|Claim 30% off")}</button>`:""}
 <button class="btn w-full" onclick="$('pc').classList.replace('flex','hidden')">${t("Закрити|Close")}</button></div>`;p.classList.replace("hidden","flex")}
async function claimFlash(){if(S.flash)return;
 if(!isReal()){alert(t("Щоб подати заявку, увійди через Google/Apple.|Sign in with Google/Apple to claim."));return}
 const m=masterOf(OWN);if(!m){alert(t("Майстер YYOKAI тимчасово недоступний.|Master YYOKAI is temporarily unavailable."));return}
 try{await FB.setDoc(FB.doc(db,"claims",user.uid+"_flash"),{uid:user.uid,master:m.id,masterName:m.nm,email:user.email||"",nick:S.nick,tier:"bestiary_flash",pct:30,code:"",kind:"discount",ts:FB.serverTimestamp(),status:"new"});
  S.flash=1;save();alert(t("Заявку надіслано майстру YYOKAI. Він напише тобі.|Request sent to master YYOKAI. He will contact you."));bestiary()}
 catch(e){alert(e.code=="permission-denied"?t("Така заявка вже подавалась.|Such a claim was already sent."):e.message)}}

// ═══ ПЕРЕРОДЖЕННЯ: скидає монети й покращення, дає постійні +25% монет ═══
const PR_MIN=1.5e6;
function prestigeCard(){const ok=(S.ptot||0)>=PR_MIN;
 return `<div class="card space-y-2 text-center"><h4 class="text-xs font-bold text-neonGold uppercase">🔄 ${t("Переродження|Rebirth")} ${S.pr?"· ×"+(1+.25*S.pr).toFixed(2):""}</h4><p class="text-[11px] text-gray-300">${t("Скидає монети й покращення, але лишає катани, фони, аватари, 💎, 🏮, ⛩️ і XP. За кожне переродження: +25% монет назавжди і +10 ⛩️.|Resets coins and upgrades but keeps blades, backgrounds, avatars, 💎, 🏮, ⛩️ and XP. Each rebirth: +25% coins forever and +10 ⛩️.")}</p><div class="text-[10px] text-gray-400">${t("Зароблено з минулого переродження|Earned since last rebirth")}: ${fmt(Math.min(S.ptot||0,PR_MIN))}/${fmt(PR_MIN)}</div><button class="btng w-full py-2.5" ${ok?"":"disabled"} onclick="doPrestige()">${t("Переродитись|Rebirth")}</button></div>`}
function doPrestige(){if((S.ptot||0)<PR_MIN||!confirm(t("Скинути монети й покращення заради +25% монет назавжди?|Reset coins and upgrades for +25% coins forever?")))return;
 S.pr=(S.pr||0)+1;S.souls+=10;S.mon=500;S.lm=500;S.up={};S.rc=0;S.ptot=0;save();push();track("prestige",{n:S.pr});toast("🔄 ×"+(1+.25*S.pr).toFixed(2));rend()}
function profExtras(){const n=Object.keys(BOSS).filter(k=>(S.bst||{})[k]>0).length;
 return `<button onclick="bestiary()" class="w-full py-3 rounded-xl bg-inkCard border border-inkBorder font-bold text-sm">📖 ${t("Бестіарій йокаїв|Yokai bestiary")} · ${n}/${Object.keys(BOSS).length}</button>${prestigeCard()}`}

// ═══ РЕЙТИНГ: тиждень · місяць · міста · весь час (розіграш тату — за XP місяця) ═══
let ratT="w";
async function rRatingX(){
 const el=$("view-rating"),W=wkNum(),M=monNum(),me=isReal()?user.uid:"me",tabs=[["w","Тиждень|Week"],["m","Місяць|Month"],["c","Міста|Cities"],["a","Весь час|All time"]];
 const head=`<h2 class="text-xl font-black uppercase text-neonGold mb-3 text-center">⛩️ ${t("Книга Самураїв|Samurai Book")}</h2>${raffleCard()}<div class="grid grid-cols-4 gap-1.5 text-[11px] font-bold my-3">${tabs.map(([k,l])=>`<button onclick="ratT='${k}';rRatingX()" class="py-2 rounded-xl ${ratT==k?"bg-crimsonRed":"bg-inkCard border border-inkBorder"}">${t(l)}</button>`).join("")}</div>`;
 el.innerHTML=head+`<div class="text-xs text-gray-400 text-center py-6">…</div>`;
 let L=[];
 if(FBOK&&db){try{const f=ratT=="m"?"msc":ratT=="a"?"xp":"wsc",q=await FB.getDocs(FB.query(FB.collection(db,"public"),FB.orderBy(f,"desc"),FB.limit(ratT=="c"?300:100)));q.forEach(d=>L.push({id:d.id,...d.data()}))}catch(e){}}
 if(cur!="rating")return;
 const val=u=>ratT=="m"?(u.mk===M?u.mx||0:0):ratT=="a"?u.xp||0:(u.wk===W?u.wx||0:0);
 if(ratT=="c"){const g={};L.filter(u=>u.wk===W&&u.city).forEach(u=>{const c=g[u.city]=g[u.city]||{n:u.city,v:0,p:0};c.v+=u.wx||0;c.p++});
  const C=Object.values(g).sort((a,b)=>b.v-a.v).slice(0,15),mc=S.master&&S.master.city;
  el.innerHTML=head+`<p class="text-[11px] text-gray-400 text-center">${t("Місто береться з обраного майстра. XP усіх гравців міста за тиждень складаються.|City comes from your chosen master. All players' weekly XP adds up.")}</p>`+(mc?"":`<button class="btn w-full" onclick="go('rewards')">🥷 ${t("Обери майстра, щоб грати за своє місто|Pick a master to play for your city")}</button>`)+
  (C.length?C.map((c,i)=>`<div class="card !p-3 flex items-center justify-between ${c.n==mc?"!border-crimsonRed":i<3?"!border-neonGold/50":""}"><div class="flex items-center gap-3"><span class="font-black font-mono text-sm w-8 ${i==0?"text-neonGold":""}">#${i+1}</span><div><b class="text-xs">${i==0?"👑 ":""}${esc(c.n)}</b><div class="text-[10px] text-gray-400">${c.p} ${t("гравців|players")}</div></div></div><span class="font-mono text-xs text-neonGold">${fmt(c.v)} XP</span></div>`).join(""):`<p class="text-xs text-gray-500 text-center">—</p>`);return}
 L=L.map(u=>({...u,v:val(u)})).filter(u=>u.v>0).sort((a,b)=>b.v-a.v).map(u=>u.id==me?{...u,av:S.av}:u);
 if(!isReal()&&ratT=="a")L.push({id:me,nick:S.nick||t("Ти|You"),av:S.av,xp:S.xp,v:S.xp,days:S.days});
 PL=L.slice(0,100);const mi=PL.findIndex(u=>u.id==me),mine=ratT=="m"?S.xm:ratT=="a"?S.xp:S.xw;
 el.innerHTML=head+`<div class="text-[11px] text-center text-gray-400 mb-2">${mi>=0?t("Твоє місце|Your place")+": #"+(mi+1):t("Твій результат|Your result")+": "+fmt(mine||0)+" XP · "+t("грай, щоб потрапити в ТОП|play to enter the TOP")}</div><div class="space-y-2">`+
 PL.map((u,i)=>`<button onclick="showPl(${i})" class="card !p-3 w-full flex items-center justify-between text-left ${i<5?"!border-neonGold/50":""} ${u.id==me?"!border-crimsonRed":""}"><div class="flex items-center gap-3"><span class="font-black font-mono text-sm w-8 ${i==0?"text-neonGold":i==1?"text-gray-300":i==2?"text-amber-600":""}">#${i+1}</span><div class="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-xl">${avHTML(u.av||"fox")}</div><div><b class="text-xs">${esc(u.nick||"?")}</b><div class="text-[10px] text-gray-400">Lv ${lvl(u.xp||0)}${u.city?" · "+esc(u.city):""}</div></div></div><span class="font-mono text-xs text-neonGold">${fmt(u.v)} XP</span></button>`).join("")+`</div>`}
RV.rating=()=>rRatingX();
