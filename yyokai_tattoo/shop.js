/* INKAI shop.js — каталоги (клинки, фони з рідкістю), покращення, бустери, магазин
   РІДКІСТЬ: 0 звичайний · 1 рідкісний · 2 епічний (монети 文) · 3 легендарний (💎 — боси, сундуки) · 4 міфічний (🏮 — реклама, сундуки) */

const YK=["🦊","👹","👺","🐸","💀","🐉"];
const RATE={bossJd:.05,adJd:.09,roundLn:.03,adLn:.07};   // 🔧 шанси рідких валют (показуються гравцям у вікні «Чому вони рідкісні»)
const YIMG={};[["🦊","fox"],["👹","oni"],["👺","tengu"],["🐸","kappa"],["💀","skull"],["🐉","dragon"],["📜","scroll"]].forEach(([e,n])=>{const i=new Image();i.src="img/yokai/"+n+".png";YIMG[e]=i});
const BGI={},bgImg=i=>BGI[i]||(BGI[i]=Object.assign(new Image(),{src:"img/bg/"+i+".png"})),rdy=i=>i&&i.complete&&i.naturalWidth;
const RN=[["Звичайний|Common","#9ca3af"],["Рідкісний|Rare","#3b82f6"],["Епічний|Epic","#a855f7"],["Легендарний|Legendary","#ffb703"],["Міфічний|Mythic","#ff2a5f"]];
const RC=["mon","mon","mon","jd","ln"],CI={mon:ico("coin","文"),jd:ico("jade","💎"),ln:ico("lantern","🏮")};   // свої PNG: img/ico/coin|jade|lantern.png
const rbadge=r=>`<span class="text-[9px] font-black uppercase tracking-wider" style="color:${RN[r][1]}">${t(RN[r][0])}</span>`;

/* КЛИНКИ (60): [назва, колір1, колір2, ефект]. Ефекти: n gold void rb fire ice bolt blood jade sakura neon star */
const BLD=[
["Сталь Асука|Asuka Steel","#cfd8e3","#8fa3b8","n"],["Бронза Нари|Nara Bronze","#cd7f32","#7a4a1c","n"],["Червона Хурма|Crimson Persimmon","#ff3b30","#7a0f0a","n"],
["Смарагд Бамбука|Bamboo Emerald","#2ecc71","#0b6b3a","n"],["Лазур Хвилі|Wave Azure","#1e90ff","#0a2f6b","n"],["Фіалка Тенгу|Tengu Violet","#9b5cff","#3b1a8a","n"],
["Золото Імператора|Emperor Gold","#ffd24a","#b8860b","gold"],["Чорна діра|Black Hole","#000000","#8b5cf6","void"],["Веселка Кіцуне|Kitsune Rainbow","#fff","#fff","rb"],
["Полум'я Оні|Oni Flame","#ff7a00","#ff1a00","fire"],["Лід Юкі-онни|Yuki-onna Ice","#bff3ff","#3aa0ff","ice"],["Грім Райдзіна|Raijin Thunder","#fff176","#2979ff","bolt"],
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
["Галактика Оні|Oni Galaxy","#8a2be2","#00ffff","star"],["Окис Міді|Verdigris","#43b3ae","#7a4f2a","n"],["Дим Вулкана|Volcano Smoke","#4a4a4a","#ff6a00","fire"],
["Райдужний Дракон|Rainbow Dragon","#fff","#fff","rb"],["Чорне Золото|Black Gold","#1a1a1a","#ffd700","void"],["Біла Лисиця|White Fox","#ffffff","#ffd9a8","star"],
["Синій Ронін|Blue Ronin","#3d5afe","#1a237e","n"],["Цитрус Каппи|Kappa Citrus","#c6ff00","#ff9100","n"],["Фіолетова Блискавка|Violet Lightning","#e040fb","#536dfe","bolt"],
["Червоний Нефрит|Red Jade","#ff5252","#7f0000","jade"],["Снігова Сакура|Snow Sakura","#ffffff","#ffc0e0","sakura"],["Чорний Дракон|Black Dragon","#000000","#00e5ff","void"],
["Дзеркало Безодні|Abyss Mirror","#0f2027","#5eead4","void"],["Золотий Дракон|Golden Dragon","#ffea00","#ff6d00","gold"],["Нічне Пекло|Night Inferno","#2b0057","#ff2d00","fire"],
["Космічна Сакура|Cosmic Sakura","#ff8ad8","#5b2cff","sakura"],["Бог Блискавок|Thunder God","#ffffff","#ffee00","bolt"],["Абсолют|The Absolute","#fff","#fff","rb"],
["Дощ Кіото|Kyoto Rain","#9ad0ff","#2b5a99","rain",0],
["Вітер Хоккайдо|Hokkaido Wind","#e0f7ff","#7fb2c9","wind",0],
["Папір Орігамі|Origami Paper","#fff7e0","#e0c9a0","paper",0],
["Лис Інарі|Inari Fox","#ffb067","#c4561c","koi",0],
["Нота Сямісена|Shamisen Note","#e6d3ff","#7a5cc2","music",0],
["Руна Айну|Ainu Rune","#cdb892","#6e5a3a","rune",0],
["Пікселі Ретро|Retro Pixels","#7dff7d","#1a6b1a","glitch",0],
["Місячний серп|Crescent","#f0f0ff","#8a8ab8","moon",0],
["Лава Саку|Sakura Lava","#ff6a2b","#8a1100","lava",1],
["Аврора Едо|Edo Aurora","#6dffb0","#7c3aed","aurora",1],
["Короп Кої|Koi Carp","#ff9a3d","#ffffff","koi",1],
["Токсин Дзюбей|Toxic Jubei","#9dff3a","#2f7a00","toxic",1],
["Кристал Лотоса|Lotus Crystal","#bff4ff","#6a7cff","crystal",1],
["Привид Туману|Mist Ghost","#e8f0ff","#6c7aa8","ghost",1],
["Комета Хоші|Hoshi Comet","#fff3c2","#ffb36b","comet",1],
["Бурі Райко|Raiko Storm","#d0e4ff","#3366ff","rain",1],
["Сонячний Дракон|Sun Dragon","#ffe27a","#ff6a00","sun",2],
["Рунічний Сьогун|Runic Shogun","#9be7ff","#2a4fff","rune",2],
["Галактика Кіцуне|Kitsune Galaxy","#c6a3ff","#ff7ad9","galaxy",2],
["Глюк Мейдзі|Meiji Glitch","#00ffd5","#ff0066","glitch",2],
["Вогняний Фенікс|Fire Phoenix","#ffd36b","#ff2a00","lava",2],
["Шторм Цунамі|Tsunami Storm","#7fd6ff","#0a4cff","wind",2],
["Золоте Кої|Golden Koi","#ffe066","#ff8a00","koi",2],
["Пісня Сакури|Sakura Song","#ffc2dd","#d6338a","music",2],
["Місяць Яо|Yao Moon","#e0e6ff","#5b6cff","moon",2],
["Кристал Оні|Oni Crystal","#ff9ad5","#5b2cff","crystal",2],
["Небесний Грім|Heavenly Thunder","#ffffff","#5aa7ff","bolt",3],
["Орлан Тенгу|Tengu Raptor","#ffd8a8","#ff5c2a","comet",3],
["Лотос Нірвани|Nirvana Lotus","#ffd1f0","#9b5cff","sakura",3],
["Імператор Місяця|Moon Emperor","#fffbe0","#7a8cff","moon",3],
["Дракон Бурі|Storm Dragon","#7dffee","#006dff","wind",3],
["Золото Безодні|Abyss Gold","#ffd700","#1a0033","gold",3],
["Аврора Богів|Gods Aurora","#7dffc8","#ff5cf0","aurora",3],
["Сяйво Аматерасу|Amaterasu Radiance","#fffbe6","#ffb300","sun",3],
["Космічна Кагуя|Cosmic Kaguya","#ffffff","#7b5cff","galaxy",4],
["Серце Дракона|Dragon Heart","#ff3b3b","#ffd54a","dragon",4],
["Король Привидів|Ghost King","#ffffff","#6c00ff","ghost",4],
["Райдужний Фенікс|Rainbow Phoenix","#fff","#fff","rb",4],
["Руна Вічності|Eternity Rune","#ffe9a8","#ff2a5f","rune",4],
["INKAI Абсолют II|INKAI Absolute II","#fff","#fff","galaxy",4]
];   // 100 катан: перші 60 + 40 нових (5-й елемент = рідкість)
const FXI={n:"",gold:"✨",void:"🕳",rb:"🌈",fire:"🔥",ice:"❄️",bolt:"⚡",blood:"🩸",jade:"💠",sakura:"🌸",neon:"🔮",star:"⭐",rain:"🌧",wind:"🌬",paper:"📄",koi:"🐟",music:"🎵",rune:"ᚠ",glitch:"👾",moon:"🌙",lava:"🌋",aurora:"🌌",toxic:"☣️",crystal:"💎",ghost:"👻",comet:"☄️",sun:"☀️",galaxy:"🌠",dragon:"🐲"};
const _k=[0,0,0,0,0];       // 22 зв · 24 рід · 24 епіч · 18 легенд · 12 міф. Ціна росте за номером усередині рідкості. ch=1 → лише з сундуків
const BL=BLD.map((d,i)=>{const r=d[4]!=null?d[4]:i<14?0:i<30?1:i<44?2:i<54?3:4,k=_k[r]++;
 return{i,nm:d[0],c1:d[1],c2:d[2],fx:d[3],w:3+Math.min(i,60)*.05,sc:1+i*.055,cm:1+i*.035,r,cur:RC[r],price:Math.round([i?150*1.4**k:0,4e5*1.2**k,1e7*1.15**k,15+k*8,10+k*5][r]*(r<3?1.3:1))}});   // 🔧 ціни
const bname=b=>t(b.nm);
const bcss=b=>b.fx=="rb"?"linear-gradient(90deg,#f00,#fa0,#ff0,#0f0,#0ff,#00f,#f0f)":b.fx=="void"?`linear-gradient(90deg,#000 30%,${b.c2})`:`linear-gradient(90deg,${b.c1},${b.c2})`;
/* КАТАНА. Своя картинка: img/katana/<номер>.png (горизонтально, руків'я ліворуч, вістря праворуч, 512×128) + номер у data/katana.json.
   Без PNG малюється SVG-катана: руків'я з обмоткою, золота цуба, вигнутий клинок із хамоном; колір і прикраси залежать від ефекту й рідкості */
const KHC=["#3a3a44","#1f3b6b","#5b2a86","#8a6a00","#9b1030"],KGL={star:"✦",gold:"✧",sakura:"✿",fire:"♨",ice:"❄",bolt:"ϟ",blood:"●",jade:"◆",neon:"✺",rain:"╎",wind:"≋",paper:"▭",koi:"◖",music:"♪",rune:"ᚠ",glitch:"▚",moon:"☾",lava:"●",aurora:"✧",toxic:"◍",crystal:"◆",ghost:"○",comet:"✦",sun:"☀",galaxy:"✦",dragon:"❖"};
let _kg=0;
function katSVG(b,cls,style){const id="kg"+(_kg++),rc=RN[b.r][1],gold=b.r>2?"#ffd24a":"#c8ced8";
 const stops=b.fx=="rb"?'<stop offset="0" stop-color="#f00"/><stop offset=".25" stop-color="#fa0"/><stop offset=".45" stop-color="#ff0"/><stop offset=".65" stop-color="#0f0"/><stop offset=".85" stop-color="#0ff"/><stop offset="1" stop-color="#f0f"/>':b.fx=="void"?`<stop offset="0" stop-color="#000"/><stop offset=".65" stop-color="#07000f"/><stop offset="1" stop-color="${b.c2}"/>`:`<stop offset="0" stop-color="${b.c2}"/><stop offset=".55" stop-color="${b.c1}"/><stop offset="1" stop-color="#fff"/>`;
 const gl=KGL[b.fx],deco=gl?[170,225,280,335].slice(0,2+(b.r>>1)).map((x,i)=>`<text x="${x}" y="${63-i*3}" font-size="${10+b.r*2}" fill="${b.fx=="blood"?"#8b0000":b.c1=="#fff"||b.c1=="#ffffff"?"#ffe9a8":b.c1}" text-anchor="middle" opacity=".9">${gl}</text>`).join(""):"";
 const wrap=[...Array(8)].map((_,i)=>`M${12+i*10} 28l10 14M${22+i*10} 28l-10 14`).join("");
 const blade="M120 29 Q265 21 392 4 L396 9 Q262 34 120 40 Z";
 return `<svg viewBox="0 0 400 70" xmlns="http://www.w3.org/2000/svg" class="${cls||"w-full h-auto"}" style="filter:drop-shadow(0 0 ${3+b.r*2}px ${b.fx=="rb"?"#f0f":rc});transform:rotate(-8deg);${style||""}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">${stops}</linearGradient><linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".4"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".45"/></linearGradient></defs>
 <rect x="12" y="27" width="80" height="16" rx="7" fill="${KHC[b.r]}"/><path d="${wrap}" stroke="rgba(255,255,255,.34)" stroke-width="1.5" fill="none"/>
 <rect x="6" y="25" width="11" height="20" rx="4" fill="${gold}"/><ellipse cx="42" cy="35" rx="3.2" ry="2.2" fill="${gold}"/><ellipse cx="68" cy="35" rx="3.2" ry="2.2" fill="${gold}"/>
 <rect x="90" y="26" width="9" height="18" rx="2.5" fill="${gold}"/>
 <ellipse cx="105" cy="35" rx="5" ry="17" fill="#2b2b33" stroke="${gold}" stroke-width="2"/><circle cx="105" cy="26" r="1.8" fill="${gold}"/><circle cx="105" cy="44" r="1.8" fill="${gold}"/>
 <rect x="110" y="29" width="11" height="12" rx="2" fill="#d9a441"/><rect x="112" y="30" width="2" height="10" fill="rgba(255,255,255,.5)"/>
 <path d="${blade}" fill="url(#${id})"/><path d="${blade}" fill="url(#${id}v)"/>
 <path d="M396 9 Q262 34 120 40" fill="none" stroke="#fff" stroke-width="1.3" opacity=".95"/><path d="M120 29 Q265 21 392 4" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1"/>${deco}</svg>`}
const katI=b=>kat(b,"inline-block align-middle","width:2.4em;height:.42em");
function kat(b,cls,style){const svg=katSVG(b,cls,style);return KATL.has(b.i)?`<img src="img/katana/${b.i}.png" data-h="${svg.replace(/"/g,"&quot;")}" onerror="this.outerHTML=this.dataset.h" class="${cls||"w-full h-auto"}" style="${style||""}">`:svg}
const bar=b=>`<div class="py-3 px-1">${kat(b,"w-full h-auto")}</div>`;

/* ФОНИ (100) = 20 локацій × 5 станів; рідкість = стан: Світанок зв · День рід · Захід епіч · Ніч легенд · Туман міф. PNG: img/bg/<номер>.png */
const LOC=[["Храм Асука|Asuka Temple","🏯"],["Ліс Нари|Nara Forest","🦌"],["Бамбуковий гай|Bamboo Grove","🎋"],["Гора Фудзі|Mount Fuji","🗻"],["Ісукусіма|Itsukushima","⛩️"],["Місто Едо|Edo City","🏮"],["Замок Хімедзі|Himeji Castle","🏰"],["Сад каміння|Rock Garden","🪨"],["Водоспад|Waterfall","🌊"],["Алея сакур|Sakura Alley","🌸"],["Цвинтар йокаїв|Yokai Graveyard","💀"],["Лисячі врата|Fox Gates","🦊"],["Печера Оні|Oni Cave","👹"],["Небо дракона|Dragon Sky","🐉"],["Острів Рюгу|Ryugu Isle","🐚"],["Пік Тенгу|Tengu Peak","👺"],["Нічний ринок|Night Market","🍜"],["Сніжне село|Snow Village","❄️"],["Вулкан Асо|Mount Aso","🌋"],["Місячний палац|Moon Palace","🌙"]];
const VAR=["Світанок|Dawn","День|Day","Захід|Sunset","Ніч|Night","Туман|Mist"];
const BG=Array.from({length:100},(_,i)=>{const l=i%20,v=i/20|0,h=(l*18+v*7)%360,P=[[h+20,70,38,60,12],[h,60,40,50,14],[(h+340)%360,80,42,55,10],[(h+220)%360,60,24,60,6],[h,15,34,25,12]][v],[a,b]=LOC[l][0].split("|"),[c,d]=VAR[v].split("|");
 return{i,nm:a+" · "+c+"|"+b+" · "+d,r:v,cur:RC[v],ic:LOC[l][1],g:[`hsl(${P[0]},${P[1]}%,${P[2]}%)`,`hsl(${(P[0]+25)%360},${P[3]}%,${P[4]}%)`],
  price:Math.round([i?800*1.35**l:0,6e5*1.22**l,2e7*1.2**l,10+l*5,10+l*4][v]*(v<3?1.3:1))}});   // 🔧 ціни

/* ПОКРАЩЕННЯ: [id, іконка, назва, опис, база, —, макс. рівень, дохід/с]. Ціна рівня = база × 2^рівень */
const UP=[
 // пасивний дохід (дрібний, не більше 4 год/добу): [id, іконка, назва, опис, база, —, макс. рівень, 文/с на рівень]
 ["s1","👻","Дух-помічник|Helper spirit","+0.05 文/с, працює й офлайн|+0.05 coin/s, works offline",400,2,20,.05],
 ["s2","🐸","Каппа-торговець|Kappa merchant","+0.25 文/с|+0.25 coins/s",3000,2,20,.25],
 ["s3","🦊","Лисиця-касир|Fox cashier","+1 文/с|+1 coin/s",20000,2,20,1],
 ["s4","👹","Оні-коваль|Oni smith","+4 文/с|+4 coins/s",120000,2,20,4],
 ["s5","🐉","Дракон-скарбник|Dragon treasurer","+16 文/с|+16 coins/s",800000,2,20,16],
 ["coin","💰","Золота кисть|Golden brush","+10% монет за йокая|+10% coins per yokai",600,2,12],
 ["combo","🔗","Ланцюг комбо|Combo chain","+0.3% монет за кожен пункт комбо|+0.3% coins per combo point",800,2,12],
 ["cwin","⏳","Вікно комбо|Combo window","+40 мс на комбо|+40ms combo window",700,2,12],
 ["crit","💥","Критичний розріз|Critical slash","+3% шанс ×3|+3% chance of ×3 hit",1200,2,12],
 ["critm","🔥","Сила крита|Crit power","+0.2 до множника крита|+0.2 crit multiplier",2000,2,12],
 ["x2","🎲","Подвійна монета|Double coin","+2% шанс ×2 за розріз|+2% chance of ×2 per cut",1600,2,12],
 ["gt","✨","Золотий дотик|Golden touch","+1% шанс ×5 монет за розріз|+1% chance of ×5 coins per cut",5000,2,10],
 ["time","🛡","Міцне серце|Tough heart","+1 життя кожні 5 рівнів|+1 life every 5 levels",3000,2,10],
 ["keep","🧷","Стійке комбо|Steady combo","+5% шанс не втратити комбо при промаху|+5% chance to keep combo on a miss",3000,2,10],
 ["frz","⚡","Тривале шаленство|Long frenzy","+0.5 с шаленства|+0.5s frenzy",1400,2,12],
 ["frth","🌀","Швидке шаленство|Quick frenzy","−1 комбо до шаленства кожні 3 рівні|−1 combo to frenzy every 3 levels",2400,2,9],
 ["boss","👑","Вбивця босів|Boss slayer","+5% подвійного удару по босу|+5% double hit on boss",1800,2,12],
 ["bossr","🏆","Трофей боса|Boss trophy","+10% монет і очок за боса|+10% boss coins and points",2000,2,12],
 ["bcoin","💴","Скарб боса|Boss treasure","+8% монет із босів|+8% coins from bosses",2500,2,12],
 ["bt","⏱","Час на боса|Boss time","+0.3 с на розправу з босом|+0.3s to defeat a boss",2600,2,10],
 ["bfast","📯","Поклик боса|Boss call","Бос з'являється на 1 розріз раніше кожні 2 рівні|Boss appears 1 cut sooner every 2 levels",3500,2,8],
 ["ice","🧊","Тонкий лід|Thin ice","−1 свайп для розбиття льоду кожні 4 рівні|−1 swipe to break ice every 4 levels",3500,2,8],
 ["mcb","✂️","Майстер мульти-свайпу|Multi-swipe master","+10% монет за 3+ йокаїв одним свайпом|+10% coins for 3+ yokai in one swipe",1800,2,10],
 ["scrl","📜","Обережність|Caution","−4% свитків у потоці|−4% scrolls in the flow",2200,2,10],
 ["soul","⛩️","Збирач душ|Soul collector","+1 душа за боса|+1 soul per boss",2800,2,10],
 ["lan","🏮","Нюх на ліхтарі|Lantern nose","+0.2% шанс 🏮 за раунд|+0.2% chance of 🏮 per round",6000,2,8],
 ["hit","🎯","Широке лезо|Wide blade","+3% радіус ураження|+3% hit radius",1000,2,12],
 ["kmul","🗡","Гартування катани|Blade tempering","+5% до коефіцієнта катани|+5% blade multiplier",4000,2,10],
 ["spawn","🌪","Потік йокаїв|Yokai flow","+4% частіше з'являються|+4% faster spawn",1200,2,12],
 ["slow","🕰","Час Тенгу|Tengu time","+2% повільніше падіння|+2% slower fall",1400,2,12],
 ["start","🚀","Швидкий старт|Fast start","+30 очок на старті|+30 starting points",1000,2,12],
 ["end","🎁","Фінальний бонус|End bonus","+3% монет за раунд|+3% round coins",1200,2,12],
 ["duo","👥","Бойове братерство|Brotherhood","+10% монет у дуо-режимі|+10% coins in duo mode",2500,2,10],
 ["xpb","🎓","Досвід самурая|Samurai experience","+4% XP за раунд|+4% XP per round",2000,2,12],
 ["chest","📦","Скарбничка|Treasury","+3% монет із сундуків|+3% chest coins",3000,2,12],
 ["off","😴","Нічний дозор|Night watch","+15 хв офлайн-доходу|+15 min offline income",2000,2,12]
];
const UPM=3;      // 🔧 множник цін покращень: ×3 до бази (ціна завжди «з запасом» відносно того, що реально нафармити)
const UPG=1.6;    // 🔧 зростання ціни за рівень
const upCost=(u,l)=>Math.floor(u[4]*UPM*UPG**l);
const mile=l=>1+.25*[5,10,15,20].filter(x=>l>=x).length;   // віхи рівнів дають +25% (раніше ×2 за віху — звідси й «250 млн»)
const IDLE_CAP=4*3600;     // пасивний дохід — не більше 4 годин на добу (зокрема й офлайн)
function idleCredit(sec){const d=today();if(!S.idl||S.idl.d!==d)S.idl={d,s:0};const use=Math.max(0,Math.min(sec,IDLE_CAP-S.idl.s));S.idl.s+=use;return use}
function idleLeft(){const l=Math.max(0,IDLE_CAP-(S.idl&&S.idl.d===today()?S.idl.s:0));return Math.floor(l/3600)+":"+String(Math.floor(l%3600/60)).padStart(2,"0")}
const idleRate=()=>UP.filter(u=>u[7]).reduce((s,u)=>s+U(u[0])*u[7]*mile(U(u[0])),0);

/* БУСТЕРИ: [id, іконка, назва, ціна, кількість, ad]. Зберігаються в S.c, витрачаються на старті раунду. Ціна ×2 за кожну покупку за день. ad=1 — лише за рекламу */
const BS=[
 ["x2","✖️2","Подвоєння монет на 3 раунди|Double coins for 3 rounds",1200,3],
 ["x3","✖️3","Ярість Оні: ×3 монет у наступному раунді|Oni rage: ×3 coins next round",4000,1],
 ["mb","💰","Золотий жук: ×1.5 монет у раунді|Golden beetle: ×1.5 coins this round",1500,1],
 ["plus","🛡","Додаткове життя: 4 промахи замість 3|Extra life: 4 misses instead of 3",800,1],
 ["shd","🧿","Щит: ще 2 промахи прощаються|Shield: 2 extra misses forgiven",1000,1],
 ["fz","⚡","Старт з 8 с шаленства|Start with 8s frenzy",1000,1],
 ["br","🌈","Райдужний міст: йокаї злітають аркою|Rainbow bridge: yokai rise in an arc",1800,1],
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
 ["m30","⏱","×2 монет перші 30 с раунду|×2 coins for first 30s",0,1,1],
 // ЕКСКЛЮЗИВИ: [id, іконка, назва, 0, к-сть, 0, ключ сундука] — випадають ЛИШЕ з цього сундука
 ["mx5","💫","×5 монет у раунді|×5 coins this round",0,1,0,"edo"],
 ["hrt","💗","+3 життя в раунді|+3 lives this round",0,1,0,"sengoku"],
 ["fz15","🔥","Старт з 15 с шаленства|Start with 15s frenzy",0,1,0,"showa"],
 ["nsc","🚫","Раунд без свитків|A round without scrolls",0,1,0,"kitsune"],
 ["bhf","🗡","Усі боси мають удвічі менше HP|All bosses have half HP",0,1,0,"ryujin"],
 ["sc2","✨","Усі очки ×2 на раунд|All score ×2 this round",0,1,0,"cosmic"],
 ["lck","🍀","Удача: +20% до сундука-знахідки|Luck: +20% bonus chest chance",0,1,0,"imperial"]
];
/* Ціна бустера «живе» разом з тобою: грошові (×2, ×3, ×1.5) коштують частку від твого середнього заробітку за раунд, решта дорожчає зі зростанням доходу */
const rcAvg=()=>Math.max(600,S.rc||0),BSP={x2:2.1,x3:1.4,mb:.35};
const bsBase=b=>BSP[b[0]]?Math.max(b[3],Math.round(BSP[b[0]]*rcAvg())):Math.round(b[3]*Math.max(1,Math.pow(rcAvg()/600,.7)));
const bsCost=b=>bsBase(b)*2**(S.bp[b[0]]||0);

// ═══ МАГАЗИН ═══
let shopT="b",shopR=-1,bm=1,bgN=20;
function eq(k,i){S[k]=i;bgC=null;save();rend()}
function buy(k,i){sync();track("purchase",{kind:k,item:i});const it=k=="blade"?BL[i]:BG[i],arr=k=="blade"?"blades":"bgs";if(it.ex||S[arr].includes(i)||S[it.cur]<it.price)return;S[it.cur]-=it.price;S[arr].push(i);S[k]=i;bgC=null;save();push();rend()}
function buyB(id){sync();track("purchase",{kind:"boost",item:id});const b=BS.find(x=>x[0]==id),c=bsCost(b);if(b[5]||b[6]||S.mon<c)return;S.mon-=c;S.bp[id]=(S.bp[id]||0)+1;if(id=="chg")S.ck.s=0;else S.c[id]+=b[4];save();rend()}
function buyUp(id){sync();track("purchase",{kind:"upgrade",item:id});const u=UP.find(x=>x[0]==id);let n=bm=="max"?999:bm,done=0;while(n-->0&&U(id)<u[6]){const c=upCost(u,U(id));if(S.mon<c)break;S.mon-=c;S.up[id]=U(id)+1;done++}if(done){save();rend()}}
function setBm(){bm=bm==1?10:bm==10?"max":1;rend()}
function shopTab(x){track("shop_tab",{tab:x});shopT=x;shopR=-1;bgN=20;rShop()}
function shopRar(r){shopR=r;bgN=20;rShop()}
function moreBg(){bgN+=20;rShop()}
const exName=k=>{const e=EC.find(x=>x[0]==k);return e?t(e[2]):k};     // ex = лише з цього сундука
const buyBtn=(k,it,o,cls)=>o?"":it.ex?`<div class="${cls||"w-full"} flex flex-col items-center justify-center text-center rounded-xl border border-neonGold/40 bg-black/30 px-2 py-1.5 text-[10px] leading-tight text-neonGold"><span>🎁 ${t("лише з сундука|chest only")}</span><b class="text-[11px] text-white">«${exName(it.ex)}»</b></div>`:`<button class="btng ${cls||"w-full"} min-w-[88px] text-center" data-c="${it.price}" data-cur="${it.cur}" ${S[it.cur]>=it.price?"":"disabled"} onclick="buy('${k}',${it.i})">${it.price?fmt(it.price)+" "+CI[it.cur]:t("Безкоштовно|Free")}</button>`;
function rShop(){
 const tb=[["b",t("🗡 Клинки|🗡 Blades")],["g",t("🖼 Фони|🖼 Backgrounds")],["u",t("📈 Покращення|📈 Upgrades")],["c",t("⚡ Бустери|⚡ Boosts")]];
 let h=`<div class="grid grid-cols-4 gap-1.5 text-[11px] font-bold">${tb.map(([k,l])=>`<button onclick="shopTab('${k}')" class="py-2 rounded-xl ${shopT==k?"bg-crimsonRed":"bg-inkCard border border-inkBorder"}">${l}</button>`).join("")}</div>`;
 if(shopT=="b"||shopT=="g"){
  h+=`<div class="flex gap-1.5 overflow-x-auto pb-1"><button onclick="shopRar(-1)" class="chip shrink-0 ${shopR<0?"!border-white":""}">${t("Усі|All")}</button>${RN.map((r,i)=>`<button onclick="shopRar(${i})" class="chip shrink-0" style="color:${r[1]};${shopR==i?"border-color:"+r[1]:""}">${t(r[0])}</button>`).join("")}</div><div class="text-[10px] text-gray-500">${t("Легендарні — за 💎 (боси, сундуки). Міфічні — за 🏮 (реклама, сундуки).|Legendary — 💎 (bosses, chests). Mythic — 🏮 (ads, chests).")}</div>`}
 if(shopT=="b")h+=`<div class="grid grid-cols-2 gap-3">`+BL.filter(b=>shopR<0||b.r==shopR).map(b=>{const o=S.blades.includes(b.i),e=S.blade==b.i;return `<div class="card !p-3 space-y-2" style="border-color:${e?"#ffb703":RN[b.r][1]+"88"}">${bar(b)}${rbadge(b.r)}<b class="block text-[10px] leading-tight">${FXI[b.fx]} ${bname(b)}</b><div class="text-[10px] text-gray-400">×${(b.cm*(1+.05*U("kmul"))).toFixed(2)} ${t("монет|coins")}</div>${o?`<button class="btn w-full ${e?"!bg-emerald-600":""}" onclick="eq('blade',${b.i})">${e?"✓":t("Обрати|Equip")}</button>`:buyBtn("blade",b)}</div>`}).join("")+`</div>`;
 if(shopT=="g"){const L=BG.filter(g=>shopR<0||g.r==shopR);
  h+=L.slice(0,bgN).map(g=>{const o=S.bgs.includes(g.i),e=S.bg==g.i;return `<div class="card !p-0 overflow-hidden" style="border-color:${e?"#ffb703":RN[g.r][1]+"88"}"><div class="p-3 flex items-center gap-3" style="background:linear-gradient(135deg,${g.g[0]},${g.g[1]})"><span class="text-3xl">${g.ic}</span><div class="flex-1 min-w-0"><b class="text-xs block">${t(g.nm)}</b>${rbadge(g.r)}</div>${o?`<button class="btn ${e?"!bg-emerald-600":""}" onclick="eq('bg',${g.i})">${e?"✓":t("Обрати|Equip")}</button>`:buyBtn("bg",g,0,"shrink-0 w-[42%]")}</div></div>`}).join("");
  if(bgN<L.length)h+=`<button class="btn w-full py-3" onclick="moreBg()">${t("Показати ще|Show more")} (${L.length-bgN})</button>`}
 if(shopT=="u"){
  h+=`<div class="card !p-3 flex items-center justify-between text-xs"><span>💤 ${t("Пасивний дохід|Passive income")}: <b id="pInc" class="text-emerald-400">${fr(idleRate())} 文/${t("с|s")}</b><span class="block text-[10px] text-gray-400">${t("Ліміт 4 год на добу, залишилось|Cap 4 h per day, left")} ${idleLeft()}</span></span><button class="btn" onclick="setBm()">${t("Купити|Buy")} ×${bm}</button></div>`;
  h+=[...UP].sort((a,b)=>!!b[7]-!!a[7]).map(u=>{const l=U(u[0]),mx=l>=u[6],c=upCost(u,l);return `<div class="card !p-3 space-y-1 min-h-[88px]"><div class="flex items-center justify-between gap-2"><div class="flex items-center gap-2"><span class="w-9 h-9 shrink-0 inline-flex items-center justify-center text-2xl">${ico("u_"+u[0],u[1],"h-9 w-9 object-contain")}</span><div><b class="text-xs">${t(u[2])}</b><div class="text-[10px] text-gray-400">${t(u[3])}</div></div></div><button class="btng shrink-0 min-w-[96px] text-center" data-c="${c}" data-mx="${mx?1:0}" ${mx||S.mon<c?"disabled":""} onclick="buyUp('${u[0]}')">${mx?"MAX":fmt(c)+" "+CI.mon}</button></div><div class="flex justify-between text-[10px]"><span class="text-neonGold">Lv ${l}/${u[6]}</span><span class="text-emerald-400">${u[7]?fr(l*u[7]*mile(l))+" 文/"+t("с|s")+(mile(l)>1?" ×"+mile(l):""):""}</span></div><div class="h-1 bg-inkDark rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-neonGold to-crimsonRed" style="width:${l/u[6]*100}%"></div></div></div>`}).join("");
 }
 if(shopT=="c")h+=`<p class="text-[11px] text-gray-400">${t("Бустери зберігаються й витрачаються на старті раунду. Ціна подвоюється після кожної покупки (оновлюється щодня).|Boosts are kept and spent at round start. Price doubles after each purchase (resets daily).")}</p>`+BS.map(b=>{const c=bsCost(b);return `<div class="card flex items-center justify-between gap-2 min-h-[72px]"><div class="flex items-center gap-3"><span class="w-9 h-9 shrink-0 inline-flex items-center justify-center text-2xl">${ico("b_"+b[0],b[1],"h-9 w-9 object-contain")}</span><div><b class="text-xs">${t(b[2])}</b><div class="text-[11px] text-gray-400">${t("В запасі|Owned")}: ${b[0]=="chg"?"—":S.c[b[0]]||0}</div></div></div>${b[5]?`<span class="chip">📺 ${t("реклама|ads")}</span>`:b[6]?`<span class="chip !border-neonGold/50 text-neonGold">🎁 ${exName(b[6])}</span>`:`<button class="btng shrink-0 min-w-[96px] text-center" data-c="${c}" ${S.mon>=c?"":"disabled"} onclick="buyB('${b[0]}')">${fmt(c)} ${CI.mon}</button>`}</div>`}).join("");
 const v=$("view-shop"),y=window.scrollY;v.style.minHeight=v.offsetHeight+"px";v.innerHTML=h;window.scrollTo(0,y);requestAnimationFrame(()=>{v.style.minHeight=""})
}
// оновлює лише стан кнопок і дохід, не перемальовуючи список (немає стрибків щосекунди)
function shopLive(){document.querySelectorAll("#view-shop [data-c]").forEach(b=>{b.disabled=b.dataset.mx=="1"||S[b.dataset.cur||"mon"]<+b.dataset.c});const p=$("pInc");if(p)p.textContent=fr(idleRate())+" 文/"+t("с|s")}
let idleTick=0;
setInterval(()=>{const r=idleRate();if(r&&!document.hidden){const u=idleCredit(1);if(u){S.mon+=r*u;hdr();if(cur=="shop")shopLive()}}},1000);
