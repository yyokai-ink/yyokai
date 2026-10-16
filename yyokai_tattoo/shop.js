/* INKAI shop.js — каталоги (клинки, фони з рідкістю), покращення, бустери, магазин
   РІДКІСТЬ: 0 звичайний · 1 рідкісний · 2 епічний (монети 文) · 3 легендарний (💎 — боси, сундуки) · 4 міфічний (🏮 — реклама, сундуки) */

const YK=["🦊","👹","👺","🐸","💀","🐉"];
const YIMG={};[["🦊","fox"],["👹","oni"],["👺","tengu"],["🐸","kappa"],["💀","skull"],["🐉","dragon"],["📜","scroll"]].forEach(([e,n])=>{const i=new Image();i.src="img/yokai/"+n+".png";YIMG[e]=i});
const BGI={},bgImg=i=>BGI[i]||(BGI[i]=Object.assign(new Image(),{src:"img/bg/"+i+".png"})),rdy=i=>i&&i.complete&&i.naturalWidth;
const RN=[["Звичайний|Common","#9ca3af"],["Рідкісний|Rare","#3b82f6"],["Епічний|Epic","#a855f7"],["Легендарний|Legendary","#ffb703"],["Міфічний|Mythic","#ff2a5f"]];
const RC=["mon","mon","mon","jd","ln"],CI={mon:"文",jd:"💎",ln:"🏮"};
const rbadge=r=>`<span class="text-[9px] font-black uppercase tracking-wider" style="color:${RN[r][1]}">${t(RN[r][0])}</span>`;

/* КЛИНКИ (60): [назва, колір1, колір2, ефект]. Ефекти: n gold void rb fire ice bolt blood jade sakura neon star */
const BLD=[
["Сталь Асука|Asuka Steel","#cfd8e3","#8fa3b8","n"],["Бронза Нари|Nara Bronze","#cd7f32","#7a4a1c","n"],["Червона Хурма|Crimson Persimmon","#ff3b30","#7a0f0a","n"],
["Смарагд Бамбука|Bamboo Emerald","#2ecc71","#0b6b3a","n"],["Лазур Хвилі|Wave Azure","#1e90ff","#0a2f6b","n"],["Фіалка Тенгу|Tengu Violet","#9b5cff","#3b1a8a","n"],
["Золото Імператора|Emperor Gold","#ffd24a","#b8860b","gold"],["Чорна діра|Black Hole","#000000","#8b5cf6","void"],["Веселка Кіцуне|Kitsune Rainbow","#fff","#fff","rb"],
["Полум'я Они|Oni Flame","#ff7a00","#ff1a00","fire"],["Лід Юкі-онни|Yuki-onna Ice","#bff3ff","#3aa0ff","ice"],["Грім Райдзіна|Raijin Thunder","#fff176","#2979ff","bolt"],
["Кров Сьогуна|Shogun Blood","#b30000","#3a0000","blood"],["Нефрит Дракона|Dragon Jade","#00c9a7","#006b5a","jade"],["Сакура Едо|Edo Sakura","#ffb7d5","#ff5c99","sakura"],
["Неон Мейдзі|Meiji Neon","#00f0ff","#ff00e5","neon"],["Зоряний Шлях|Milky Way","#ffffff","#4b3fd1","star"],["Срібло Місяця|Moon Silver","#e8eef7","#9aa7ba","n"],
["Мідь Каппи|Kappa Copper","#e07b39","#3e2a14","n"],["Отрута Змії|Serpent Venom","#b6ff00","#3d6b00","n"],["Іржавий Ронін|Rusty Ronin","#8c4a2f","#3a1d10","n"],
["Пурпур Хейан|Heian Purple","#c026d3","#4a044e","n"],["Рожевий кварц|Rose Quartz","#ffc4d6","#f06292","n"],["Бірюза Моря|Sea Turquoise","#40e0d0","#0e6b6b","n"],
["Чорнильний туман|Ink Mist","#222233","#9a9ab8","void"],["Сонце Аматерасу|Amaterasu Sun","#fff3b0","#ff9f1c","gold"],["Тінь Цукуйомі|Tsukuyomi Shadow","#0b0b1a","#6a5acd","void"],
["Магма Асо|Aso Magma","#ff4500","#5a0f00","fire"],["Крижаний Дракон|Frost Dragon","#e0ffff","#00bfff","ice"],["Зелений Грім|Green Lightning","#b6ff6a","#00ff9d","bolt"],
["Червона Лілія|Red Spider Lily","#ff0044","#ffffff","n"],["Аметист|Amethyst Crystal","#d9b3ff","#7c3aed","n"],["Оніксова Ніч|Onyx Night","#111111","#ff2a5f","void"],
["Платина Сьогуна|Shogun Platinum","#f5f5ff","#b0b0d0","star"],["Бурштин Лиса|Fox Amber","#ffbf00","#a65c00","gold"],["Золота Мозаїка|Gold Mosaic","#ffd700","#fff3a0","gold"],
["Пекельний Вогонь|Hell Fire","#ff0000","#ffcc00","fire"],["Лазурний Грім|Azure Thunder","#7df9ff","#0033ff","bolt"],["Криваво-місячний|Blood Moon","#ff3355","#1a0010","blood"],
["Нефритовий Імператор|Jade Emperor","#7dffb2","#00a86b","jade"],["Лотос|Lotus Bloom","#ffd1f0","#ff7ac8","sakura"],["Кібер-Ронін|Cyber Ronin","#39ff14","#ff00aa","neon"],
["Галактика Они|Oni Galaxy","#8a2be2","#00ffff","star"],["Окис Міді|Verdigris","#43b3ae","#7a4f2a","n"],["Дим Вулкана|Volcano Smoke","#4a4a4a","#ff6a00","fire"],
["Райдужний Дракон|Rainbow Dragon","#fff","#fff","rb"],["Чорне Золото|Black Gold","#1a1a1a","#ffd700","void"],["Біла Лисиця|White Fox","#ffffff","#ffd9a8","star"],
["Синій Ронін|Blue Ronin","#3d5afe","#1a237e","n"],["Цитрус Каппи|Kappa Citrus","#c6ff00","#ff9100","n"],["Фіолетова Блискавка|Violet Lightning","#e040fb","#536dfe","bolt"],
["Червоний Нефрит|Red Jade","#ff5252","#7f0000","jade"],["Снігова Сакура|Snow Sakura","#ffffff","#ffc0e0","sakura"],["Чорний Дракон|Black Dragon","#000000","#00e5ff","void"],
["Дзеркало Безодні|Abyss Mirror","#0f2027","#5eead4","void"],["Золотий Дракон|Golden Dragon","#ffea00","#ff6d00","gold"],["Нічне Пекло|Night Inferno","#2b0057","#ff2d00","fire"],
["Космічна Сакура|Cosmic Sakura","#ff8ad8","#5b2cff","sakura"],["Бог Блискавок|Thunder God","#ffffff","#ffee00","bolt"],["Абсолют|The Absolute","#fff","#fff","rb"]
];
const FXI={n:"",gold:"✨",void:"🕳",rb:"🌈",fire:"🔥",ice:"❄️",bolt:"⚡",blood:"🩸",jade:"💠",sakura:"🌸",neon:"🔮",star:"⭐"};
const BT=[0,14,30,44,54];           // з якого номера починається кожна рідкість: 14 зв · 16 рід · 14 епіч · 10 легенд · 6 міф
const BL=BLD.map((d,i)=>{const r=i<14?0:i<30?1:i<44?2:i<54?3:4,k=i-BT[r];
 return{i,nm:d[0],c1:d[1],c2:d[2],fx:d[3],w:3+Math.min(i,40)*.07,sc:1+i*.04,r,cur:RC[r],price:Math.round([i?250*2**k:0,3e6*1.5**k,2e9*1.5**k,15+k*9,40+k*18][r])}});   // 🔧 ціни
const bname=b=>t(b.nm);
const bcss=b=>b.fx=="rb"?"linear-gradient(90deg,#f00,#fa0,#ff0,#0f0,#0ff,#00f,#f0f)":b.fx=="void"?`linear-gradient(90deg,#000 30%,${b.c2})`:`linear-gradient(90deg,${b.c1},${b.c2})`;
const bar=b=>`<div class="h-3 rounded-full" style="background:${bcss(b)};box-shadow:0 0 10px ${b.fx=="rb"?"#f0f":b.c2};${b.fx=="void"?"border:1px solid "+b.c2:""}"></div>`;

/* ФОНИ (100) = 20 локацій × 5 станів; рідкість = стан: Світанок зв · День рід · Захід епіч · Ніч легенд · Туман міф. PNG: img/bg/<номер>.png */
const LOC=[["Храм Асука|Asuka Temple","🏯"],["Ліс Нари|Nara Forest","🦌"],["Бамбуковий гай|Bamboo Grove","🎋"],["Гора Фудзі|Mount Fuji","🗻"],["Ісукусіма|Itsukushima","⛩️"],["Місто Едо|Edo City","🏮"],["Замок Хімедзі|Himeji Castle","🏰"],["Сад каміння|Rock Garden","🪨"],["Водоспад|Waterfall","🌊"],["Алея сакур|Sakura Alley","🌸"],["Цвинтар ёкаїв|Yokai Graveyard","💀"],["Лисячі врата|Fox Gates","🦊"],["Печера Они|Oni Cave","👹"],["Небо дракона|Dragon Sky","🐉"],["Острів Рюгу|Ryugu Isle","🐚"],["Пік Тенгу|Tengu Peak","👺"],["Нічний ринок|Night Market","🍜"],["Сніжне село|Snow Village","❄️"],["Вулкан Асо|Mount Aso","🌋"],["Місячний палац|Moon Palace","🌙"]];
const VAR=["Світанок|Dawn","День|Day","Захід|Sunset","Ніч|Night","Туман|Mist"];
const BG=Array.from({length:100},(_,i)=>{const l=i%20,v=i/20|0,h=(l*18+v*7)%360,P=[[h+20,70,38,60,12],[h,60,40,50,14],[(h+340)%360,80,42,55,10],[(h+220)%360,60,24,60,6],[h,15,34,25,12]][v],[a,b]=LOC[l][0].split("|"),[c,d]=VAR[v].split("|");
 return{i,nm:a+" · "+c+"|"+b+" · "+d,r:v,cur:RC[v],ic:LOC[l][1],g:[`hsl(${P[0]},${P[1]}%,${P[2]}%)`,`hsl(${(P[0]+25)%360},${P[3]}%,${P[4]}%)`],
  price:Math.round([i?1500*1.5**l:0,5e6*1.35**l,3e9*1.3**l,10+l*5,30+l*10][v])}});   // 🔧 ціни

/* ПОКРАЩЕННЯ: [id, іконка, назва, опис, база, —, макс. рівень, дохід/с]. Ціна рівня = база × 2^рівень */
const UP=[
 ["s1","👻","Дух-помічник|Helper spirit","+1 文/с, працює й офлайн|+1 coin/s, works offline",100,2,20,1],
 ["s2","🐸","Каппа-торговець|Kappa merchant","+5 文/с|+5 coins/s",1500,2,20,5],
 ["s3","🦊","Лисиця-касир|Fox cashier","+25 文/с|+25 coins/s",12000,2,20,25],
 ["s4","👹","Они-коваль|Oni smith","+120 文/с|+120 coins/s",90000,2,20,120],
 ["s5","🐉","Дракон-скарбник|Dragon treasurer","+700 文/с|+700 coins/s",600000,2,20,700],
 ["coin","💰","Золота кисть|Golden brush","+10% монет за розріз|+10% coins per cut",150,2,12],
 ["combo","🔗","Ланцюг комбо|Combo chain","+0.02 до множника комбо|+0.02 combo multiplier",200,2,12],
 ["cwin","⏳","Вікно комбо|Combo window","+40 мс на комбо|+40ms combo window",180,2,12],
 ["crit","💥","Критичний розріз|Critical slash","+3% шанс ×3|+3% chance of ×3 hit",300,2,12],
 ["critm","🔥","Сила крита|Crit power","+0.2 до множника крита|+0.2 crit multiplier",500,2,12],
 ["x2","🎲","Подвійна монета|Double coin","+2% шанс ×2 за розріз|+2% chance of ×2 per cut",400,2,12],
 ["time","🛡","Міцне серце|Tough heart","+1 життя кожні 5 рівнів|+1 life every 5 levels",800,2,10],
 ["frz","⚡","Тривале шаленство|Long frenzy","+0.5 с шаленства|+0.5s frenzy",350,2,12],
 ["frth","🌀","Швидке шаленство|Quick frenzy","−1 комбо до шаленства кожні 3 рівні|−1 combo to frenzy every 3 levels",600,2,9],
 ["boss","👑","Вбивця босів|Boss slayer","+5% подвійного удару по босу|+5% double hit on boss",450,2,12],
 ["bossr","🏆","Трофей боса|Boss trophy","+10% очок за боса|+10% boss points",500,2,12],
 ["soul","⛩️","Збирач душ|Soul collector","+1 душа за боса|+1 soul per boss",700,2,10],
 ["hit","🎯","Широке лезо|Wide blade","+3% радіус ураження|+3% hit radius",250,2,12],
 ["spawn","🌪","Потік ёкаїв|Yokai flow","+4% частіше з'являються|+4% faster spawn",300,2,12],
 ["slow","🕰","Час Тенгу|Tengu time","+2% повільніше падіння|+2% slower fall",350,2,12],
 ["start","🚀","Швидкий старт|Fast start","+30 очок на старті|+30 starting points",250,2,12],
 ["end","🎁","Фінальний бонус|End bonus","+3% монет за раунд|+3% round coins",300,2,12],
 ["chest","📦","Скарбничка|Treasury","+3% монет із сундуків|+3% chest coins",800,2,12],
 ["off","😴","Нічний дозор|Night watch","+15 хв офлайн-доходу|+15 min offline income",500,2,12]
];
const upCost=(u,l)=>Math.floor(u[4]*2**l);
const mile=l=>2**[5,10,15,20].filter(x=>l>=x).length;
const idleRate=()=>UP.filter(u=>u[7]).reduce((s,u)=>s+U(u[0])*u[7]*mile(U(u[0])),0);

/* БУСТЕРИ: [id, іконка, назва, ціна, кількість, ad]. Зберігаються в S.c, витрачаються на старті раунду. Ціна ×2 за кожну покупку за день. ad=1 — лише за рекламу */
const BS=[
 ["x2","✖️2","Подвоєння монет на 3 раунди|Double coins for 3 rounds",1200,3],
 ["x3","✖️3","Ярість Они: ×3 монет у наступному раунді|Oni rage: ×3 coins next round",4000,1],
 ["mb","💰","Золотий жук: ×1.5 монет у раунді|Golden beetle: ×1.5 coins this round",1500,1],
 ["plus","🛡","Додаткове життя: 4 промахи замість 3|Extra life: 4 misses instead of 3",800,1],
 ["shd","🧿","Щит: ще 2 промахи прощаються|Shield: 2 extra misses forgiven",1000,1],
 ["fz","⚡","Старт з 8 с шаленства|Start with 8s frenzy",1000,1],
 ["br","🌈","Райдужний міст: ёкаї злітають аркою|Rainbow bridge: yokai rise in an arc",1800,1],
 ["sl0","⏳","Старт зі сповільненням часу 8 с|Start with 8s slow time",1200,1],
 ["bh0","🕳","Старт з чорною дірою 6 с|Start with a black hole 6s",2200,1],
 ["st","🚀","+300 очок на старті|+300 points at start",900,1],
 ["cmb","🔗","Старт з комбо ×10|Start with ×10 combo",1100,1],
 ["bos","👑","Бос уже після 4 розрізів|Boss after just 4 cuts",1300,1],
 ["wide","🎯","Радіус леза ×1.5 на раунд|Blade radius ×1.5 for a round",1000,1],
 ["slw","🕰","Ёкаї падають на 30% повільніше|Yokai fall 30% slower",1200,1],
 ["lx","🏮","×2 ліхтарі за раунд|×2 lanterns this round",900,1],
 ["sx","⛩️","+1 душа в кінці раунду|+1 soul at round end",1500,1],
 ["chg","⏭","Скинути таймер срібного сундука|Reset silver chest timer",1500,1],
 ["m10","⏱","×2 монет перші 10 с раунду|×2 coins for first 10s",0,1,1],
 ["m30","⏱","×2 монет перші 30 с раунду|×2 coins for first 30s",0,1,1]
];
const bsCost=b=>b[3]*2**(S.bp[b[0]]||0);

// ═══ МАГАЗИН ═══
let shopT="b",shopR=-1,bm=1,bgN=20;
function eq(k,i){S[k]=i;bgC=null;save();rend()}
function buy(k,i){const it=k=="blade"?BL[i]:BG[i],arr=k=="blade"?"blades":"bgs";if(S[arr].includes(i)||S[it.cur]<it.price)return;S[it.cur]-=it.price;S[arr].push(i);S[k]=i;bgC=null;save();push();rend()}
function buyB(id){const b=BS.find(x=>x[0]==id),c=bsCost(b);if(b[5]||S.mon<c)return;S.mon-=c;S.bp[id]=(S.bp[id]||0)+1;if(id=="chg")S.ck.s=0;else S.c[id]+=b[4];save();rend()}
function buyUp(id){const u=UP.find(x=>x[0]==id);let n=bm=="max"?999:bm,done=0;while(n-->0&&U(id)<u[6]){const c=upCost(u,U(id));if(S.mon<c)break;S.mon-=c;S.up[id]=U(id)+1;done++}if(done){save();rend()}}
function setBm(){bm=bm==1?10:bm==10?"max":1;rend()}
function shopTab(x){shopT=x;shopR=-1;bgN=20;rShop()}
function shopRar(r){shopR=r;bgN=20;rShop()}
function moreBg(){bgN+=20;rShop()}
const buyBtn=(k,it,o,cls)=>o?"":`<button class="btng ${cls||"w-full"}" ${S[it.cur]>=it.price?"":"disabled"} onclick="buy('${k}',${it.i})">${it.price?fmt(it.price)+" "+CI[it.cur]:t("Безкоштовно|Free")}</button>`;
function rShop(){
 const tb=[["b",t("🗡 Клинки|🗡 Blades")],["g",t("🖼 Фони|🖼 Backgrounds")],["u",t("📈 Покращення|📈 Upgrades")],["c",t("⚡ Бустери|⚡ Boosts")]];
 let h=`<div class="grid grid-cols-4 gap-1.5 text-[11px] font-bold">${tb.map(([k,l])=>`<button onclick="shopTab('${k}')" class="py-2 rounded-xl ${shopT==k?"bg-crimsonRed":"bg-inkCard border border-inkBorder"}">${l}</button>`).join("")}</div>`;
 if(shopT=="b"||shopT=="g"){
  h+=`<div class="flex gap-1.5 overflow-x-auto pb-1"><button onclick="shopRar(-1)" class="chip shrink-0 ${shopR<0?"!border-white":""}">${t("Усі|All")}</button>${RN.map((r,i)=>`<button onclick="shopRar(${i})" class="chip shrink-0" style="color:${r[1]};${shopR==i?"border-color:"+r[1]:""}">${t(r[0])}</button>`).join("")}</div><div class="text-[10px] text-gray-500">${t("Легендарні — за 💎 (боси, сундуки). Міфічні — за 🏮 (реклама, сундуки).|Legendary — 💎 (bosses, chests). Mythic — 🏮 (ads, chests).")}</div>`}
 if(shopT=="b")h+=`<div class="grid grid-cols-2 gap-3">`+BL.filter(b=>shopR<0||b.r==shopR).map(b=>{const o=S.blades.includes(b.i),e=S.blade==b.i;return `<div class="card !p-3 space-y-2" style="border-color:${e?"#ffb703":RN[b.r][1]+"88"}">${bar(b)}${rbadge(b.r)}<b class="block text-[10px] leading-tight">${FXI[b.fx]} ${bname(b)}</b><div class="text-[10px] text-gray-400">×${b.sc.toFixed(2)} ${t("очок|score")}</div>${o?`<button class="btn w-full ${e?"!bg-emerald-600":""}" onclick="eq('blade',${b.i})">${e?"✓":t("Обрати|Equip")}</button>`:buyBtn("blade",b)}</div>`}).join("")+`</div>`;
 if(shopT=="g"){const L=BG.filter(g=>shopR<0||g.r==shopR);
  h+=L.slice(0,bgN).map(g=>{const o=S.bgs.includes(g.i),e=S.bg==g.i;return `<div class="card !p-0 overflow-hidden" style="border-color:${e?"#ffb703":RN[g.r][1]+"88"}"><div class="p-3 flex items-center gap-3" style="background:linear-gradient(135deg,${g.g[0]},${g.g[1]})"><span class="text-3xl">${g.ic}</span><div class="flex-1 min-w-0"><b class="text-xs block">${t(g.nm)}</b>${rbadge(g.r)}</div>${o?`<button class="btn ${e?"!bg-emerald-600":""}" onclick="eq('bg',${g.i})">${e?"✓":t("Обрати|Equip")}</button>`:buyBtn("bg",g,0,"shrink-0 whitespace-nowrap")}</div></div>`}).join("");
  if(bgN<L.length)h+=`<button class="btn w-full py-3" onclick="moreBg()">${t("Показати ще|Show more")} (${L.length-bgN})</button>`}
 if(shopT=="u"){
  h+=`<div class="card !p-3 flex items-center justify-between text-xs"><span>💤 ${t("Пасивний дохід|Passive income")}: <b class="text-emerald-400">${fmt(idleRate())} 文/${t("с|s")}</b></span><button class="btn" onclick="setBm()">${t("Купити|Buy")} ×${bm}</button></div>`;
  h+=[...UP].sort((a,b)=>!!b[7]-!!a[7]).map(u=>{const l=U(u[0]),mx=l>=u[6],c=upCost(u,l);return `<div class="card !p-3 space-y-1"><div class="flex items-center justify-between gap-2"><div class="flex items-center gap-2"><span class="text-2xl">${u[1]}</span><div><b class="text-xs">${t(u[2])}</b><div class="text-[10px] text-gray-400">${t(u[3])}</div></div></div><button class="btng shrink-0" ${mx||S.mon<c?"disabled":""} onclick="buyUp('${u[0]}')">${mx?"MAX":fmt(c)+" 文"}</button></div><div class="flex justify-between text-[10px]"><span class="text-neonGold">Lv ${l}/${u[6]}</span><span class="text-emerald-400">${u[7]?fmt(l*u[7]*mile(l))+" 文/"+t("с|s")+(mile(l)>1?" ×"+mile(l):""):""}</span></div><div class="h-1 bg-inkDark rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-neonGold to-crimsonRed" style="width:${l/u[6]*100}%"></div></div></div>`}).join("");
 }
 if(shopT=="c")h+=`<p class="text-[11px] text-gray-400">${t("Бустери зберігаються й витрачаються на старті раунду. Ціна подвоюється після кожної покупки (оновлюється щодня).|Boosts are kept and spent at round start. Price doubles after each purchase (resets daily).")}</p>`+BS.map(b=>{const c=bsCost(b);return `<div class="card flex items-center justify-between gap-2"><div class="flex items-center gap-3"><span class="text-2xl">${b[1]}</span><div><b class="text-xs">${t(b[2])}</b><div class="text-[11px] text-gray-400">${t("В запасі|Owned")}: ${b[0]=="chg"?"—":S.c[b[0]]||0}</div></div></div>${b[5]?`<span class="chip">📺 ${t("реклама|ads")}</span>`:`<button class="btng shrink-0" ${S.mon>=c?"":"disabled"} onclick="buyB('${b[0]}')">${fmt(c)} 文</button>`}</div>`}).join("");
 $("view-shop").innerHTML=h;
}
let idleTick=0;
setInterval(()=>{const r=idleRate();if(r){S.mon+=r;hdr();if(cur=="shop"&&shopT=="u"&&++idleTick%3==0)rShop()}},1000);
