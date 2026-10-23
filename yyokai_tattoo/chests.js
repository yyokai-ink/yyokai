/* INKAI chests.js — 3 таймерні сундуки + 12 сундуків епох + сундук-знахідка після раунду
   Сила сундука p: 0 срібний · 1 золотий · 2 діамантовий · 3-5 сундуки епох (дорожчий = краще).
   Картинки: img/chest/silver|gold|diamond|bonus.png і img/chest/e_<ключ>.png (до PNG показується емодзі). */

const CHF=["silver","gold","emerald"];
const CUR=CI,ECUR=CI;     // іконки валют беруться з shop.js (свої PNG в img/ico)
/* Таймерні: [ключ, іконка, назва, перезарядка мс, колір, ціна пропуску, валюта пропуску] 🔧 */
const CK=[["s","🥈","Срібний|Silver",600000,"#9ca3af",2,"ln"],["g","🥇","Золотий|Gold",86400000,"#ffb703",12,"jd"],["d","💚","Смарагдовий|Emerald",259200000,"#10b981",30,"jd"]];   // срібний: кожні 10 хв, до 3 на день · золотий: раз на добу · смарагдовий: раз на 3 дні
/* Епох: [ключ, іконка, назва, валюта, ціна, колір, сила p] 🔧 */
/* 37 сундуків епох + 3 таймерні = 40. [ключ, іконка, назва, валюта, ціна, колір, сила p]. PNG: img/chest/e_<ключ>.png, фон відкриття: img/chest/bg_<ключ>.png 🔧 */
const _C=[["jomon","🏺","Дзьомон|Jomon"],["yayoi","🌾","Яйой|Yayoi"],["kofun","⛰️","Кофун|Kofun"],["asuka","🏯","Асука|Asuka"],["nara","🦌","Нара|Nara"],["heian","🪭","Хейан|Heian"],["kamakura","⚔️","Камакура|Kamakura"],["muromachi","🍵","Муромачі|Muromachi"],["sengoku","🔥","Сенгоку|Sengoku"],["azuchi","🏰","Адзуті-Момояма|Azuchi-Momoyama"],["edo","🏮","Едо|Edo"],["meiji","🌸","Мейдзі|Meiji"],["taisho","🎎","Тайсьо|Taisho"]];
const _L=[["tengu","👺","Тенгу|Tengu"],["kitsune","🦊","Кіцуне|Kitsune"],["oni","👹","Оні|Oni"],["kappa","🐸","Каппа|Kappa"],["yukionna","❄️","Юкі-онна|Yuki-onna"],["ryujin","🐉","Рюдзін|Ryujin"],["sakura","🌺","Сакура|Sakura"],["ninja","🥷","Ніндзя|Ninja"],["samurai","🗡️","Самурай|Samurai"],["shogun","🎌","Сьогун|Shogun"],["geisha","🎭","Гейша|Geisha"],["torii","⛩️","Торії|Torii"]];
const _J=[["showa","🚂","Сьова|Showa"],["heisei","📼","Хейсей|Heisei"],["reiwa","🪷","Рейва|Reiwa"],["neon","🌃","Неон-Токіо|Neon Tokyo"],["cyber","🤖","Кібер-Едо|Cyber Edo"],["cosmic","🌌","Космічний|Cosmic"],["dragon","🐲","Драконів|Dragon"],["phoenix","🦅","Фенікс|Phoenix"],["heaven","☁️","Небесний|Heavenly"],["thunder","⚡","Громовий|Thunder"],["abyss","🌀","Безодня|Abyss"],["imperial","👑","Імператорський|Imperial"]];
const EC=[..._C.map((x,i)=>[x[0],x[1],x[2],"mon",Math.round(500*1.8**i),`hsl(${i*27},70%,60%)`,i<5?3:i<10?4:5]),
 ..._L.map((x,i)=>[x[0],x[1],x[2],"ln",3+i*3,`hsl(${200+i*13},75%,62%)`,i<4?3:i<8?4:5]),
 ..._J.map((x,i)=>[x[0],x[1],x[2],"jd",8+i*10,`hsl(${280+i*8},80%,64%)`,i<3?4:5])];

/* ЕКСКЛЮЗИВИ: кожен сундук епохи має свій клинок і свій фон, які випадають ТІЛЬКИ з нього (в магазині їх нема);
   ще 7 бустерів-ексклюзивів прив'язані до конкретних сундуків (поле 7 у BS у shop.js). Підбір — за силою сундука */
(function assignEx(){const pref={3:[1,2],4:[2,3],5:[4,3]};
 EC.forEach(e=>{for(const r of pref[e[6]]){const b=BL.find(x=>x.i>=10&&x.r==r&&!x.ex);if(b){b.ex=e[0];break}}
  for(const r of pref[e[6]]){const g=BG.find(x=>x.i>=6&&x.r==r&&!x.ex);if(g){g.ex=e[0];break}}})})();
// Ваги: [монети, бустер, душі, ліхтарі, нефрит, знижка, тату, клинок/фон]
const LOOT=[[52,34,6,.2,0,.4,0,0],[38,24,10,.3,.3,.8,0,6],[24,18,12,.4,.8,1.2,0,11],[30,20,12,.4,.5,1.6,0,12],[18,16,12,.5,.9,2.5,0,15],[10,12,12,.6,1.6,4,0,16]];   // 6-й елемент — шанс знижки 5–50% (≈0.4%…4% за відкриття)   // 4-й елемент — 🏮 (≈0.2–0.6%), 5-й — 💎 (≈0.3–1.6%), 6-й — знижки (0.1–3%): рідкісні валюти справді рідкісні   // 4-й елемент — ліхтарі (дуже рідко), 6-й — знижки   // 6-й елемент = шанс знижки у %, зростає з ціною сундука: срібний 0.1% … найдорожчі 3%   // знижки — лише в найдорожчих (легендарних) сундуках і дуже рідко (≈0.4%); тату-купонів із сундуків більше нема
// Рідкість клинка/фона [зв, рід, епіч, легенд, міф] — легендарні (💎) і міфічні (🏮) випадають лише з дорогих сундуків
const RW=[[0,0,0,0,0],[60,30,9,1,0],[30,35,25,9,1],[40,35,20,4,1],[15,30,35,17,3],[0,15,35,35,15]];
const CB=[50,400,2000,800,6000,40000];
const SR=[[1,2],[1,3],[2,5],[2,4],[3,6],[5,10]],LR=[[1,1],[1,1],[1,2],[1,1],[1,2],[1,3]],JR=[[1,1],[1,1],[1,2],[1,1],[1,2],[1,3]];
const DW=[[[5],[1]],[[5,10],[70,30]],[[5,10,20],[50,30,20]],[[5,10,20,30],[40,30,20,10]],[[5,10,20,30,40],[30,30,25,10,5]],[[10,20,30,40,50],[20,30,25,15,10]]];   // які знижки й з якою вагою для кожної сили сундука
const pickDisc=p=>DW[p][0][wp(DW[p][1])];
const RAR=["#6b7280","#3b82f6","#a855f7","#ffb703","#ff2a5f"];
const IMG=(s,e,c)=>`<img src="${s}" data-e="${e}" onerror="this.outerHTML=this.dataset.e" class="${c}">`;

function rollGear(p,key){      // клинок, фон або аватар; ексклюзиви — лише зі свого сундука
 if(key&&R()<.3){const ex=[...BL.filter(b=>b.ex==key&&!S.blades.includes(b.i)).map(x=>({ty:"bl",i:x.i,ic:katI(x),lb:bname(x),r:x.r})),...BG.filter(g=>g.ex==key&&!S.bgs.includes(g.i)).map(x=>({ty:"bg",i:x.i,ic:x.ic,lb:t(x.nm),r:x.r}))];if(ex.length)return ex[R()*ex.length|0]}
 let r=wp(RW[p]);
 for(;r>=0;r--){const cats=[0,1,2].sort(()=>R()-.5);
  for(const c of cats){
   if(c==2){const pl=AV.filter(a=>a.r==r&&a.src!="free"&&!ownAv(a.id));if(pl.length){const x=pl[R()*pl.length|0];return{ty:"av",id:x.id,ic:`<span class="inline-block w-16 h-16 rounded-2xl overflow-hidden align-middle">${avHTML(x.id)}</span>`,lb:t(x.nm),r:x.r}}continue}
   const pool=c?BG.filter(g=>g.r==r&&!g.ex&&!S.bgs.includes(g.i)):BL.filter(b=>b.r==r&&!b.ex&&!S.blades.includes(b.i));
   if(pool.length){const x=pool[R()*pool.length|0];return c?{ty:"bg",i:x.i,ic:x.ic,lb:t(x.nm),r:x.r}:{ty:"bl",i:x.i,ic:katI(x),lb:bname(x),r:x.r}}}}
 return null}
function rollItem(p,key){
 const exb=key?BS.filter(b=>b[6]==key):[];if(exb.length&&R()<.12){const b=exb[0];return{ty:"u",id:b[0],ic:b[1],lb:t(b[2]).split(":")[0].slice(0,28),r:4}}
 let ty=wp(LOOT[p]);const sc=1+S.blade*.02;
 if((ty==5||ty==6)&&!S.master)ty=0;          // знижки прив'язані до майстра
 if(ty==6&&S.tatGot)ty=0;                       // тату-купон із сундука — лише один за весь час
 if(ty==1){const pl=BS.filter(b=>!b[5]&&!b[6]&&b[0]!="chg"),b=pl[R()*pl.length|0];return{ty:"u",id:b[0],ic:b[1],lb:t(b[2]).split(":")[0].slice(0,24),r:p>3?2:1}}
 if(ty==2)return{ty:"s",a:rr(...SR[p]),ic:"⛩️",r:2}
 if(ty==3)return{ty:"l",a:rr(...LR[p]),ic:"🏮",r:2}
 if(ty==4)return{ty:"j",a:rr(...JR[p]),ic:"💎",r:3}
 if(ty==5){const v=pickDisc(p);return{ty:"d",v,ic:"🏷",lb:t("Знижка|Discount")+" "+v+"%",r:v>=30?4:v>=20?3:2}}
 if(ty==6)return{ty:"t",v:"tat1",ic:"🎟",lb:t("Міні-тату до 1500 грн|Mini tattoo up to 1500 UAH"),r:4}
 if(ty==7){const g=rollGear(p,key);if(g)return g}
 return{ty:"c",a:Math.round(CB[p]*(.6+R()*.8)*sc*(1+.03*U("chest"))),ic:"🪙",r:[0,1,2,1,2,3][p]}
}
const lab=it=>it.ty=="c"?fmt(it.a)+" 文":it.ty=="s"?"+"+it.a+" ⛩️":it.ty=="l"?"+"+it.a+" 🏮":it.ty=="j"?"+"+it.a+" 💎":it.lb;
function apply(it){
 if(it.ty=="c")S.mon+=it.a;else if(it.ty=="u")S.c[it.id]=(S.c[it.id]||0)+BS.find(b=>b[0]==it.id)[4];
 else if(it.ty=="bl"){if(!S.blades.includes(it.i))S.blades.push(it.i)}else if(it.ty=="bg"){if(!S.bgs.includes(it.i))S.bgs.push(it.i)}
 else if(it.ty=="av"){if(!S.avs.includes(it.id))S.avs.push(it.id)}else if(it.ty=="s")S.souls+=it.a;else if(it.ty=="l")S.ln+=it.a;else if(it.ty=="j")S.jd+=it.a;
 else{if(it.ty=="t")S.tatGot=1;S.cp.push({code:Date.now().toString(36)+R().toString(36).slice(2,6),type:it.ty=="d"?"d"+it.v:it.v,lb:it.lb+(S.master?" · "+S.master.nm:""),m:S.master?S.master.id:"",mn:S.master?S.master.nm:"",mi:S.master?S.master.ig||"":"",used:0})}
 save();push();
}

// ═══ ЕКРАН СУНДУКІВ ═══
function chSt(k){const n=Date.now(),c=S.ck;
 if(k==0){if(c.sd!==today()){c.sn=0;c.sd=today()}const left=Math.max(0,c.s+CK[0][3]-n),lim=c.sn>=3;return{ok:!lim&&!left,left,lim,info:t("Сьогодні|Today")+" "+c.sn+"/3"}}
 const left=Math.max(0,c[CK[k][0]]+CK[k][3]-n);return{ok:!left,left,lim:0,info:""}}
const EG=[["mon","За монети|For coins"],["ln","За ліхтарі|For lanterns"],["jd","За нефрит|For jade"]];
const chestCard=(e,i)=>`<div class="card !p-2 text-center space-y-1" style="border-color:${e[5]};box-shadow:0 0 12px ${e[5]}44"><div class="relative h-16 flex items-center justify-center text-4xl"><div class="absolute inset-0 rounded-full" style="background:radial-gradient(circle,${e[5]}55,transparent 70%);filter:blur(8px)"></div><div class="relative" style="animation:floatY 3.4s ease-in-out ${(i%7)*.25}s infinite">${IMG("img/chest/e_"+e[0]+".png",e[1],"h-16 w-auto")}</div></div><b class="text-[11px] block leading-tight">${t(e[2])}</b><button class="btng w-full !px-1" ${S[e[3]]>=e[4]?"":"disabled"} onclick="openEpoch(${i})">${fmt(e[4])} ${CI[e[3]]}</button></div>`;
function rChests(){
 $("view-chests").innerHTML=`<h2 class="text-xl font-black uppercase text-center">${t("Сундуки INKAI|INKAI chests")} · ${CK.length+EC.length}</h2><button onclick="econInfo()" class="w-full py-2 rounded-xl border border-neonGold/40 bg-neonGold/10 text-neonGold text-xs font-bold">ℹ️ ${t("Чому 💎 і 🏮 такі рідкісні й що за них купити|Why 💎 and 🏮 are so rare and what they buy")}</button><p class="text-[11px] text-gray-400 text-center">${t("Чим дорожчий сундук — тим кращі нагороди: монети, душі, нефрит, бустери, клинки, фони, аватари, купони на тату.|The pricier the chest, the better the loot: coins, souls, jade, boosts, blades, backgrounds, avatars, tattoo coupons.")}</p>${S.master?"":`<button onclick="openMasterList()" class="w-full py-2 rounded-xl border border-crimsonRed/50 bg-crimsonRed/10 text-xs font-bold text-crimsonRed">🥷 ${t("Обери майстра — тоді зі скринь можуть випасти знижки 5–50%|Pick a master — then chests can drop 5–50% discounts")}</button>`}<div class="grid grid-cols-3 gap-2">`+
 CK.map((c,k)=>`<div class="card !p-2 text-center flex flex-col gap-1" style="border-color:${c[4]}"><div class="relative h-20 flex items-center justify-center text-5xl"><div class="absolute inset-0 rounded-full" style="background:radial-gradient(circle,${c[4]}55,transparent 70%);filter:blur(8px)"></div><div class="relative" style="animation:floatY 3.2s ease-in-out ${k*.4}s infinite">${IMG("img/chest/"+CHF[k]+".png",c[1],"h-20 w-auto")}</div></div><b class="text-[11px] leading-tight min-h-[2.4em] flex items-center justify-center">${t(c[2])} ${t("сундук|chest")}</b><div id="ct${k}" class="font-mono text-[10px] text-neonGold min-h-[28px] leading-tight"></div><div class="mt-auto space-y-1"><button id="co${k}" class="btng w-full !px-1" onclick="openChest(${k},0)">${t("Відкрити|Open")}</button><button id="cs${k}" class="btn w-full !px-1 !bg-deepPurple" onclick="openChest(${k},1)">⏭ ${c[5]} ${CUR[c[6]]}</button></div></div>`).join("")+`</div>`+
 EG.map(g=>`<h3 class="text-sm font-black uppercase pt-3">${t(g[1])}</h3><div class="grid grid-cols-3 gap-2">${EC.map((e,i)=>e[3]==g[0]?chestCard(e,i):"").join("")}</div>`).join("");
 tickCh();
}
function tickCh(){if(cur!="chests"||opening)return;CK.forEach((c,k)=>{const s=chSt(k),a=$("ct"+k);if(!a)return;a.textContent=s.ok?t("Готовий!|Ready!"):s.lim?t("Ліміт — до завтра|Limit — tomorrow"):"⏳ "+tm(s.left);if(k==0&&!s.lim)a.textContent+=" · "+s.info;$("co"+k).disabled=!s.ok;$("cs"+k).disabled=s.ok||s.lim||S[c[6]]<c[5]});
 EC.forEach((e,i)=>{})}
setInterval(tickCh,1000);

// ═══ ВІДКРИТТЯ ═══
function openChest(k,skip){
 if(opening)return;const s=chSt(k),c=CK[k];
 if(skip){if(s.ok||s.lim||S[c[6]]<c[5])return;S[c[6]]-=c[5]}else if(!s.ok)return;
 if(k==0){S.ck.s=Date.now();S.ck.sn++}else S.ck[c[0]]=Date.now();
 save();runChest([CHF[k],c[1],c[2],c[3],c[4]],k,"img/chest/"+CHF[k]+".png");
}
function openEpoch(i){if(opening)return;sync();const e=EC[i];if(S[e[3]]<e[4])return;S[e[3]]-=e[4];save();runChest([e[0],e[1],e[2],0,e[5]],e[6],"img/chest/e_"+e[0]+".png")}
let afterRev=null;
function bonus(){G.res.bc=0;$("res").classList.replace("flex","hidden");afterRev=showRes;runChest(["bonus","🎁","Сундук-знахідка|Found chest",0,"#ffb703"],R()<.25?2:1,"img/chest/bonus.png")}
function fxShoot(par,n,cols){for(let i=0;i<n;i++){const e=document.createElement("span"),a=R()*6.283,d=90+R()*190,z=7+R()*12;
 e.style.cssText=`position:absolute;left:50%;top:50%;width:${z}px;height:${z}px;margin:-${z/2}px;border-radius:2px;background:${cols[R()*cols.length|0]};--dx:${Math.cos(a)*d}px;--ux:${Math.cos(a)*d*.6}px;--uy:${Math.sin(a)*d*.6-60-R()*60}px;--dy:${Math.sin(a)*d+160+R()*80}px;--rt:${(R()-.5)*720}deg;animation:shoot ${1.1+R()*.8}s ${R()*.15}s cubic-bezier(.2,.7,.4,1) forwards;pointer-events:none;opacity:0`;par.appendChild(e);setTimeout(()=>e.remove(),2400)}}
function fxSplat(par,col,n){for(let i=0;i<n;i++){const e=document.createElement("span"),a=R()*6.283,d=70+R()*140,z=10+R()*26;     // бризки соку, як у Fruit Ninja
 e.style.cssText=`position:absolute;left:50%;top:50%;width:${z}px;height:${z*(.7+R()*.5)}px;margin:-${z/2}px;border-radius:50% 40% 55% 45%;background:${R()<.7?col:"#fff"};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;animation:splatOut ${.7+R()*.6}s ease-out forwards;pointer-events:none;opacity:0`;par.appendChild(e);setTimeout(()=>e.remove(),1600)}}
/* Відкриття: чистий і атмосферний екран. Удар катаною — сундук лише здригається; розріз — розпадається на дві половини. Без рун, ореолів і смуг. */
const BFX={fire:["#ffb703","#ff4500","#fff"],ice:["#e8fbff","#7dd3fc","#fff"],bolt:["#fff","#7dd3fc","#fde047"],sakura:["#ffc0e0","#ff8ab5","#fff"],gold:["#fff2a0","#ffc400","#fff"],star:["#fff","#ffe27a","#c6a3ff"],jade:["#6ee7b7","#34d399","#fff"],void:["#c4b5fd","#7c3aed","#fff"],rb:["#f00","#ff0","#0f0","#0ff","#f0f"],neon:["#00f0ff","#ff00e5","#fff"],galaxy:["#fff","#c6a3ff","#7b5cff","#ff7ad9"],aurora:["#6dffb0","#7c3aed","#fff"],ghost:["#fff","#c4b5fd"],sun:["#fff3b0","#ffb300","#fff"]};
const bcols=bl=>BFX[bl.fx]||[bl.c1,bl.c2,"#fff"];
const MA="#a78bfa",MY="#ffd24a";
function slashOpen(rc,im,c){return new Promise(res=>{
 let n=0,done=0,sl=0;const strokes=[],act={},chw=$("chw"),chi=$("chi");rc.style.touchAction="none";
 rc.insertAdjacentHTML("beforeend",`<canvas id="chc" class="absolute inset-0 pointer-events-none" style="width:100%;height:100%"></canvas><div id="chp" class="absolute left-0 right-0 bottom-8 text-center pointer-events-none"><div class="text-sm font-black tracking-[.2em] uppercase" style="color:${MY}">${t("Розріж сундук катаною — 5 ударів!|Slash the chest with your katana — 5 cuts!")}</div><div class="flex justify-center mt-1">${kat(BL[S.blade],"inline-block","width:120px;height:21px;transform:none")}</div><div class="text-[11px] text-gray-300">${t("Рубай рухом із боку в бік — просте утримання пальця не рахується|Slash side to side — just holding your finger does not count")}</div><div class="flex gap-2 justify-center mt-2">${[0,1,2,3,4].map(i=>`<span id="pp${i}" class="w-3.5 h-3.5 rounded-full" style="background:rgba(255,255,255,.25);transition:all .3s"></span>`).join("")}</div><button id="chskip" class="hidden pointer-events-auto btn mt-3 !bg-inkDark border border-inkBorder">${t("Пропустити|Skip")}</button></div>`);
 const cvs=$("chc"),W2=rc.clientWidth,H2=rc.clientHeight,k2=cvs.getContext("2d");cvs.width=W2*2;cvs.height=H2*2;k2.scale(2,2);
 const bl=BL[S.blade],cols=bcols(bl);   // розрізаєш саме обраною катаною: її колір, слід і іскри
 const pos=e=>{const r=rc.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top,t:performance.now()}};
 const ribbon=(P,now)=>{const nn=P.length;if(nn<3)return;const L=[],Rr=[];
  for(let i=0;i<nn;i++){const a0=P[Math.max(0,i-1)],b0=P[Math.min(nn-1,i+1)];let dx=b0.x-a0.x,dy=b0.y-a0.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const wd=bl.w*3*Math.sin(Math.PI*i/(nn-1))*Math.max(0,1-(now-P[i].t)/240)+.5;L.push([P[i].x-dy*wd,P[i].y+dx*wd]);Rr.push([P[i].x+dy*wd,P[i].y-dx*wd])}
  k2.beginPath();L.forEach((q,i)=>i?k2.lineTo(q[0],q[1]):k2.moveTo(q[0],q[1]));for(let i=nn-1;i>=0;i--)k2.lineTo(Rr[i][0],Rr[i][1]);k2.closePath();
  let fs,sc=bl.c2;if(bl.fx=="rb"){sc=fs=`hsl(${now/3%360|0},100%,60%)`}else if(bl.fx=="void")fs="#000";else{const g=k2.createLinearGradient(P[0].x,P[0].y,P[nn-1].x,P[nn-1].y);g.addColorStop(0,bl.c2);g.addColorStop(1,bl.c1);fs=g}
  k2.globalAlpha=bl.fx=="ghost"?.6:1;k2.fillStyle=fs;k2.shadowColor=sc;k2.shadowBlur=14+bl.r*3;k2.fill();if(bl.fx=="void"){k2.shadowBlur=0;k2.strokeStyle=bl.c2;k2.lineWidth=1.6;k2.stroke()}
  k2.shadowBlur=0;k2.globalAlpha=1;k2.strokeStyle="rgba(255,255,255,.85)";k2.lineWidth=1.3;k2.beginPath();P.forEach((q,i)=>i?k2.lineTo(q.x,q.y):k2.moveTo(q.x,q.y));k2.stroke()};
 const cf={p:[]};let lt=performance.now();      // слід катани малюється ТИМИ Ж функціями, що й у грі: стрічка + частинки твоєї катани, окремо для кожного пальця (до 10)
 const loop=()=>{if(!cvs.isConnected)return;k2.clearRect(0,0,W2,H2);const now=performance.now(),dt=Math.min(.05,(now-lt)/1000);lt=now;
  for(const s of strokes){while(s.p.length&&now-s.p[0].t>200)s.p.shift();const P=s.p,nn=P.length;
   if(nn>=3){const Lh=[],Rh=[];for(let i=0;i<nn;i++){const a0=P[Math.max(0,i-1)],b0=P[Math.min(nn-1,i+1)];let dx=b0.x-a0.x,dy=b0.y-a0.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const wd=bl.w*2.2*Math.sin(Math.PI*i/(nn-1))*Math.max(0,1-(now-P[i].t)/200)+.4;Lh.push([P[i].x-dy*wd,P[i].y+dx*wd]);Rh.push([P[i].x+dy*wd,P[i].y-dx*wd])}
    trailFill(cf,bl,P,Lh,Rh,now,k2);k2.globalAlpha=1;if(R()<.6)fxPart(cf,bl,P[nn-1])}}
  for(const p of cf.p){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g==null?400:p.g)*dt;p.rot=(p.rot||0)+(p.vr||0)*dt;p.l-=dt*1.6}
  cf.p=cf.p.filter(p=>p.l>0);drawParts(k2,cf.p);k2.globalAlpha=1;
  for(let i=strokes.length-1;i>=0;i--)if(!strokes[i].p.length&&!strokes[i].on)strokes.splice(i,1);
  requestAnimationFrame(loop)};requestAnimationFrame(loop);
 const finish=()=>{if(done)return;done=1;for(const ev of[["pointerdown",dn],["pointermove",mv],["pointerup",up],["pointercancel",up]])rc.removeEventListener(ev[0],ev[1]);
  const p=$("chp");if(p)p.remove();sfx("chestcrack");
  const sN=Math.max(-.8,Math.min(.8,sl)),yl=50-sN*50,yr=50+sN*50,nr=Math.sqrt(1+sN*sN),nx=-sN/nr*150,ny=1/nr*150;
  chi.style.visibility="hidden";
  const half=(poly,cl)=>`<div class="${cl} text-8xl" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;--nx:${nx}px;--ny:${ny}px;clip-path:polygon(${poly});filter:drop-shadow(0 10px 16px #000a)">${IMG(im,c[1],"h-52 w-auto")}</div>`;
  chw.insertAdjacentHTML("beforeend",half(`0 0,100% 0,100% ${yr}%,0 ${yl}%`,"hfa")+half(`0 ${yl}%,100% ${yr}%,100% 100%,0 100%`,"hfb"));   // саме цей сундук розпадається навпіл уздовж розрізу
  fxShoot(chw,16,[...cols,"#fff"]);setTimeout(()=>{cvs.remove();res()},800)};
 const hit=s=>{if(done)return;n++;sl=s;const pp=$("pp"+(n-1));if(pp){pp.style.background=MY;pp.style.transform="scale(1.3)"}
  chi.style.setProperty("--sc",1+.03*n);chi.style.animation="none";void chi.offsetWidth;chi.style.animation="chestHit .35s ease-out forwards";     // лише рух сундука при ударі
  sfx("chesthit",null,n);navigator.vibrate&&navigator.vibrate(18+n*8);if(n>=5)finish()};
 const dn=e=>{if(done)return;const p=pos(e),s={p:[p],on:1,acc:0,th:0};act[e.pointerId]=s;strokes.push(s)};
 // ОДИН безперервний свайп = кілька ударів: кожні ~70 px руху по сундуку (туди-сюди, не відриваючи пальця) — удар
 const mv=e=>{const s=act[e.pointerId];if(!s||done)return;const p=pos(e),l=s.p[s.p.length-1],d=Math.hypot(p.x-l.x,p.y-l.y);s.p.push(p);const vx=p.x-l.x,vy=p.y-l.y,rev=s.ux!=null&&(vx*s.ux+vy*s.uy)<0;if(Math.abs(vx)+Math.abs(vy)>2){s.ux=vx;s.uy=vy}
  const r=chi.getBoundingClientRect(),rr=rc.getBoundingClientRect(),x=p.x+rr.left,y=p.y+rr.top;
  if(x>r.left-10&&x<r.right+10&&y>r.top-10&&y<r.bottom+10){if(rev)s.acc=0;s.acc+=d;
   if(s.acc>=70&&performance.now()-s.th>100){s.acc-=70;s.th=performance.now();const q=s.p[Math.max(0,s.p.length-6)],dx=p.x-q.x;hit((p.y-q.y)/(Math.abs(dx)<4?(dx>=0?4:-4):dx))}}else s.acc=0};
 const up=e=>{const s=act[e.pointerId];if(s)s.on=0;delete act[e.pointerId]};
 rc.addEventListener("pointerdown",dn);rc.addEventListener("pointermove",mv);rc.addEventListener("pointerup",up);rc.addEventListener("pointercancel",up);
 setTimeout(()=>{const b=$("chskip");if(b&&!done){b.classList.remove("hidden");b.onclick=()=>{sl=.3;finish()}}},5000)})}
async function runChest(c,p,im){
 opening=1;hdr();track("chest_open",{key:c[0]});
 let it=rollItem(p,c[0]);
 if(p>=4&&c[0]!=="bonus"){const need=p>=5?3:2;for(let i=0;i<12&&it.r<need;i++)it=rollItem(p,c[0])}     // дорогі сундуки гарантують щонайменше епічну (p4) / легендарну (p5) нагороду
 const N=46,X=40,strip=[...Array(N)].map((_,i)=>i==X?it:rollItem(p,c[0])),ro=$("ro");
 ro.innerHTML=`<div id="robg" class="absolute inset-0" style="opacity:0;transition:opacity 1.8s ease;background:linear-gradient(180deg,rgba(18,10,44,.5),rgba(5,3,18,.88)),url(img/chest/bg_${c[0]}.png) center/cover no-repeat,url(img/chest/open_bg.png) center/cover no-repeat"></div><div id="rcont" class="relative w-full max-w-md h-full flex items-center justify-center overflow-hidden"></div>`;
 const rc=$("rcont");
 rc.innerHTML=`<div id="chw" class="relative" style="width:230px;height:230px"><div id="chi" class="relative h-full flex items-center justify-center text-8xl" style="--sc:1;animation:floatY 2s ease-in-out infinite;filter:drop-shadow(0 10px 16px #000a)">${IMG(im,c[1],"h-52 w-auto")}</div></div>
  <div class="absolute top-6 left-0 right-0 text-center pointer-events-none"><span class="font-black tracking-[.25em] uppercase text-xs" style="color:${MY}">${c[1]} ${t(c[2])}</span></div>`;
 ro.classList.replace("hidden","flex");
 requestAnimationFrame(()=>requestAnimationFrame(()=>{const b=$("robg");if(b)b.style.opacity=1}));
 await slashOpen(rc,im,c);                         // 1) розрізаєш сундук катаною: 5 ударів, можна одним безперервним свайпом
 
 navigator.vibrate&&navigator.vibrate([30,20,60]);
 await sleep(600);
 // 2) рядок із нагородами красиво біжить і зупиняється на призі
 rc.innerHTML=`<div class="w-full space-y-4 px-2" style="animation:stripIn .6s ease-out both"><h2 class="text-center font-black tracking-[.25em] uppercase text-sm" style="color:${MY}">${c[1]} ${t(c[2])}</h2>
 <div id="rbox" class="relative rounded-3xl py-3" style="background:linear-gradient(180deg,${MA}22,rgba(255,255,255,.02));border:1px solid ${MA}66;backdrop-filter:blur(8px);-webkit-mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent);mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent)">
 <div id="rmark" class="absolute left-1/2 top-1 bottom-1 w-[3px] -ml-[1.5px] z-10 rounded-full transition-transform" style="background:linear-gradient(180deg,transparent,${MY},transparent);box-shadow:0 0 18px ${MY}"></div>
 <div id="rstrip" class="flex gap-1 px-2" style="width:max-content">${strip.map(q=>`<div class="w-20 h-28 shrink-0 rounded-2xl flex flex-col items-center justify-center text-center text-[9px]" style="background:radial-gradient(circle at 50% 30%,${RAR[q.r]}38,rgba(14,8,34,.78));border:1px solid ${RAR[q.r]}66;box-shadow:0 0 14px ${RAR[q.r]}33"><span class="text-3xl" style="filter:drop-shadow(0 0 8px ${RAR[q.r]})">${q.ic}</span><span class="px-1 mt-1 leading-tight">${esc(lab(q))}</span></div>`).join("")}</div></div></div>`;
 const st=$("rstrip"),mk=$("rmark"),bw=$("rbox").clientWidth,target=X*84+8+40-bw/2+(R()-.5)*40;
 st.style.transition="none";st.style.transform="translateX(0)";st.offsetHeight;st.style.transition="transform 5.2s cubic-bezier(.1,.75,.12,1)";st.style.transform=`translateX(-${target}px)`;
 await new Promise(res=>{let last=-1;const t0=performance.now(),lp=()=>{const m=new DOMMatrix(getComputedStyle(st).transform),idx=Math.floor((-m.m41+bw/2-8)/84);
  if(idx!=last){last=idx;sfx("tick",()=>tone(1300,.04,"square",.07));mk.style.transform="scaleY(1.15)";setTimeout(()=>mk.style.transform="",60)}
  if(performance.now()-t0<5400)requestAnimationFrame(lp);else res()};requestAnimationFrame(lp)});
 apply(it);reveal(it);
}
/* ЧАСТИНКИ НАГОРОДИ: canvas, адитивне змішування. Вибух іскор із центру + хвиля світла + повільні вогники знизу догори.
   Усе — м'які світні точки (градієнти), без квадратів і чітких країв. Кількість росте з рідкістю. */
function revFX(ov,col,rar){
 if(!ov||ov.classList.contains("hidden")||!$("rcard"))return;
 const W=ov.clientWidth||innerWidth,H=ov.clientHeight||innerHeight,dp=Math.min(2,devicePixelRatio||1),cv=document.createElement("canvas");
 cv.width=W*dp;cv.height=H*dp;cv.style.cssText="position:absolute;inset:0;width:100%;height:100%;pointer-events:none";ov.insertBefore(cv,$("rcard"));
 const g=cv.getContext("2d");g.scale(dp,dp);
 const hx=c=>/^#[0-9a-f]{6}$/i.test(c)?c:/^#[0-9a-f]{3}$/i.test(c)?"#"+c[1]+c[1]+c[2]+c[2]+c[3]+c[3]:"#ffffff",h0=hx(col),pal=[h0,h0,"#ffffff",hx(MA)],P=[],cx0=W/2,cy0=H*.46;
 const burst=n=>{for(let i=0;i<n;i++){const a=R()*6.283,s=80+R()*(240+rar*50);P.push({x:cx0,y:cy0,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,age:0,l:1.5+R()*1.5,z:2+R()*3.4,c:pal[R()*4|0],tw:R()*6,st:R()<.22,dr:.93+R()*.04,up:20})}};
 const mote=()=>P.push({x:R()*W,y:H+8,vx:(R()-.5)*16,vy:-(22+R()*38),age:0,l:6+R()*4,z:1.2+R()*2.4,c:pal[R()*4|0],tw:R()*6,st:0,dr:1,up:0});
 const t0=performance.now();let last=t0,fired=0;
 const loop=now=>{if(!cv.isConnected||ov.classList.contains("hidden"))return;
  const dt=Math.min(.05,(now-last)/1000),age=(now-t0)/1000;last=now;g.clearRect(0,0,W,H);g.globalCompositeOperation="lighter";
  if(!fired){fired=1;burst(46+rar*22)}
  if(age<9&&R()<dt*(10+rar*3))mote();
  if(age<1.3){const k=age/1.3,rr=k*Math.max(W,H)*.6,gr=g.createRadialGradient(cx0,cy0,Math.max(0,rr-50),cx0,cy0,rr+50);   // хвиля світла: м'яке кільце без меж
   gr.addColorStop(0,h0+"00");gr.addColorStop(.5,h0+Math.round((1-k)*80).toString(16).padStart(2,"0"));gr.addColorStop(1,h0+"00");g.fillStyle=gr;g.fillRect(0,0,W,H)}
  const keep=[];
  for(const p of P){p.age+=dt;const f=p.age/p.l;if(f>=1||p.y<-30)continue;
   const k=Math.pow(p.dr,dt*60);p.vx*=k;p.vy=p.vy*k-p.up*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
   const al=Math.min(1,f*8)*(1-f)*(.65+.35*Math.sin(now/110+p.tw)),r=p.z*(p.st?5:4.5),gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,r);
   gr.addColorStop(0,p.c+"ff");gr.addColorStop(.25,p.c+"aa");gr.addColorStop(1,p.c+"00");g.globalAlpha=Math.max(0,al);g.fillStyle=gr;g.beginPath();g.arc(p.x,p.y,r,0,6.283);g.fill();
   if(p.st){const L=p.z*7*(1-f);g.strokeStyle=p.c;g.lineWidth=1;g.beginPath();g.moveTo(p.x-L,p.y);g.lineTo(p.x+L,p.y);g.moveTo(p.x,p.y-L);g.lineTo(p.x,p.y+L);g.stroke()}   // 4-променева іскра
   keep.push(p)}
  P.length=0;P.push(...keep);g.globalAlpha=1;requestAnimationFrame(loop)};
 requestAnimationFrame(loop)}
// Нагорода: м'яке розмите коло світла (без променів і чітких меж), картка падає з відскоком
function reveal(it){
 const c=RAR[it.r],ov=$("rev"),isC=it.ty=="d"||it.ty=="t",rn=["bl","bg","av"].includes(it.ty)?RN[it.r][0]:["ЗВИЧАЙНИЙ|COMMON","РІДКІСНИЙ|RARE","ЕПІЧНИЙ|EPIC","ЛЕГЕНДАРНИЙ|LEGENDARY","МІФІЧНИЙ|MYTHIC"][it.r];
 ov.style.background="rgba(8,4,24,.55)";ov.style.backdropFilter="blur(6px)";ov.style.webkitBackdropFilter="blur(6px)";
 ov.innerHTML=`<div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(circle 75vmax at 50% 46%,${c}55 0%,${c}1a 38%,${MA}0d 62%,rgba(0,0,0,0) 100%);animation:fadeBg 1.4s ease-out both,pulse-glow 5s 1.4s ease-in-out infinite"></div>
 <div id="rcard" class="relative px-6 space-y-3"><div class="text-[11px] font-black tracking-[.35em] uppercase" style="color:${c};animation:cardIn .6s .5s both">${t(rn)}</div>
  <div class="relative mx-auto flex items-center justify-center" style="width:160px;height:160px;animation:dropBounce .95s cubic-bezier(.3,1.2,.4,1) both"><span class="text-7xl" style="filter:drop-shadow(0 0 22px ${c})">${it.ic}</span></div>
  <div class="text-2xl font-black" style="color:${c};text-shadow:0 0 22px ${c}88;animation:cardIn .6s .7s both">${esc(lab(it))}</div>
  ${isC?`<div class="text-xs text-gray-300">${t("Купон збережено у вкладці «Нагороди»|Coupon saved in the Rewards tab")}</div>`:""}${["bl","bg","av"].includes(it.ty)?`<div class="text-xs text-gray-300">${t("Додано й уже доступне в магазині/профілі|Added — already available in the Shop/Profile")}</div>`:""}
  <div style="animation:cardIn .6s 1s both">${["bl","bg","av"].includes(it.ty)?`<button class="btn px-8 py-3 mt-2 mr-2" onclick="wearDrop('${it.ty}','${it.i??it.id}')">${t("Одягнути зараз|Equip now")}</button>`:""}<button class="btng px-10 py-3 mt-2" onclick="closeRev()">OK</button></div></div>`;
 ov.classList.replace("hidden","flex");sfx("reveal",null,it.r);setTimeout(()=>sfx("land"),620);
 const cc=$("rcard");setTimeout(()=>revFX(ov,c,it.r),450);navigator.vibrate&&setTimeout(()=>navigator.vibrate([20,30,40]),700);
}
/* ЕКОНОМІКА 💎 І 🏮 — вікно-пояснення для гравців: чому вони рідкісні, звідки беруться й що за них купити. Числа беруться з коду (RATE, LOOT). */
function econInfo(){
 const pc=(x)=>(x<1?x.toFixed(1):Math.round(x))+"%",jd=LOOT.map(r=>r[4]),ln=LOOT.map(r=>r[3]);
 const p=$("pc");p.onclick=()=>p.classList.replace("flex","hidden");
 p.innerHTML=`<div class="card rounded-3xl w-full max-w-sm max-h-[85vh] overflow-y-auto space-y-3 text-sm" onclick="event.stopPropagation()">
  <h3 class="font-black text-center">${CI.jd} ${CI.ln} ${t("Чому вони такі рідкісні?|Why are they so rare?")}</h3>
  <p class="text-xs text-gray-300">${t("Монети легко заробити — тому за них купується звичайне. 💎 і 🏮 — це «золото й ліхтарі самураїв»: їх не можна нафармити швидко, і саме тому речі за них — найцінніші в грі. Правила однакові для всіх, джерела нижче.|Coins are easy to earn, so they buy ordinary things. 💎 and 🏮 are the samurai’s gold and lanterns: they cannot be farmed fast, which is exactly why items bought with them are the most valuable. Same rules for everyone; sources below.")}</p>
  <div class="rounded-xl bg-black/30 p-3 space-y-1"><b>${CI.jd} ${t("Нефрит|Jade")}</b>
   <div class="text-xs text-gray-300">• ${t("бос повержений|boss defeated")}: ${pc(RATE.bossJd*100)}<br>• ${t("реклама-нагорода (до 3 на день)|ad reward (up to 3 a day)")}: ${pc(RATE.adJd*100)}<br>• ${t("сундуки за відкриття|chests per opening")}: ${pc(Math.min(...jd.slice(1)))} … ${pc(Math.max(...jd))}<br>• ${t("квести: 100, 500, 1000 босів та інші|quests: 100, 500, 1000 bosses and more")}<br>≈ <b>${t("8–9 за тиждень активної гри|8–9 per week of active play")}</b></div>
   <div class="text-xs text-neonGold">${t("Що купити: легендарні клинки, фони й аватари (15–150 💎), найкращі сундуки (8–118 💎) з гарантованою легендарною нагородою.|What to buy: legendary blades, backgrounds and avatars (15–150 💎), the best chests (8–118 💎) with a guaranteed legendary reward.")}</div></div>
  <div class="rounded-xl bg-black/30 p-3 space-y-1"><b>${CI.ln} ${t("Ліхтарі|Lanterns")}</b>
   <div class="text-xs text-gray-300">• ${t("раунд|round")}: ${pc(RATE.roundLn*100)}<br>• ${t("реклама-нагорода|ad reward")}: ${pc(RATE.adLn*100)}<br>• ${t("сундуки за відкриття|chests per opening")}: ${pc(Math.min(...ln))} … ${pc(Math.max(...ln))}<br>• ${t("головне джерело — квести: підписки, 50/100/200/500/1000 босів, дні в грі, друзі|main source — quests: subscriptions, 50/100/200/500/1000 bosses, days played, friends")}<br>≈ <b>${t("1–2 за тиждень активної гри|1–2 per week of active play")}</b></div>
   <div class="text-xs text-neonGold">${t("Що купити: міфічні клинки, фони й аватари (6–39 🏮), сундуки за 🏮 (3–36 🏮) із гарантованою епічною нагородою, пропуск таймерів.|What to buy: mythic blades, backgrounds and avatars (6–39 🏮), lantern chests (3–36 🏮) with a guaranteed epic reward, timer skips.")}</div></div>
  <button class="btn w-full" onclick="$('pc').classList.replace('flex','hidden')">${t("Зрозуміло|Got it")}</button></div>`;
 p.classList.replace("hidden","flex")}
function wearDrop(ty,id){if(ty=="bl"){S.blade=+id}else if(ty=="bg"){S.bg=+id;bgC=null}else S.av=id;save();push();closeRev()}
function closeRev(){$("rev").classList.replace("flex","hidden");$("ro").classList.replace("flex","hidden");$("ro").innerHTML="";opening=0;if(afterRev){const f=afterRev;afterRev=null;f()}else rend()}
