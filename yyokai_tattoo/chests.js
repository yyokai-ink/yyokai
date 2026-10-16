/* INKAI chests.js — 3 таймерні сундуки + 12 сундуків епох + сундук-знахідка після раунду
   Сила сундука p: 0 срібний · 1 золотий · 2 діамантовий · 3-5 сундуки епох (дорожчий = краще).
   Картинки: img/chest/silver|gold|diamond|bonus.png і img/chest/e_<ключ>.png (до PNG показується емодзі). */

const CHF=["silver","gold","diamond"];
const CUR={ln:"🏮",jd:"💎"},ECUR={mon:"文",ln:"🏮",jd:"💎"};
/* Таймерні: [ключ, іконка, назва, перезарядка мс, колір, ціна пропуску, валюта пропуску] 🔧 */
const CK=[["s","🥈","Срібний|Silver",600000,"#9ca3af",5,"ln"],["g","🥇","Золотий|Gold",259200000,"#ffb703",12,"jd"],["d","💎","Діамантовий|Diamond",604800000,"#22d3ee",30,"jd"]];
/* Епох: [ключ, іконка, назва, валюта, ціна, колір, сила p] 🔧 */
const EC=[
["jomon","🏺","Дзьомон|Jomon","mon",4000,"#a16207",3],["heian","🪭","Хейан|Heian","mon",15000,"#c084fc",3],
["kamakura","🏯","Камакура|Kamakura","mon",60000,"#94a3b8",3],["sengoku","⚔️","Сенгоку|Sengoku","ln",15,"#ef4444",3],
["edo","🏮","Едо|Edo","ln",30,"#f97316",4],["meiji","🌸","Мейдзі|Meiji","mon",400000,"#f472b6",4],
["taisho","🎎","Тайсьо|Taisho","ln",50,"#14b8a6",4],["showa","🚂","Сьова|Showa","jd",12,"#3b82f6",4],
["neon","🌃","Неон-Токіо|Neon Tokyo","jd",25,"#00f0ff",5],["dragon","🐉","Драконів|Dragon","jd",40,"#22c55e",5],
["cosmic","🌌","Космічний|Cosmic","jd",80,"#8b5cf6",5],["imperial","👑","Імператорський|Imperial","jd",150,"#ffb703",5]];

// Ваги: [монети, бустер, душі, ліхтарі, нефрит, знижка, тату, клинок/фон]
const LOOT=[[52,34,6,8,0,0,0,0],[38,24,10,10,6,6,0,6],[24,18,12,12,14,8,1,11],[30,20,12,12,8,6,0,12],[18,16,12,14,14,10,1,15],[10,12,12,14,22,12,2,16]];
// Рідкість клинка/фона [зв, рід, епіч, легенд, міф] — легендарні (💎) і міфічні (🏮) випадають лише з дорогих сундуків
const RW=[[0,0,0,0,0],[60,30,9,1,0],[30,35,25,9,1],[40,35,20,4,1],[15,30,35,17,3],[0,15,35,35,15]];
const CB=[350,2800,14000,5000,40000,300000];
const SR=[[1,2],[1,3],[2,5],[2,4],[3,6],[5,10]],LR=[[1,2],[2,4],[4,8],[3,6],[6,12],[10,20]],JR=[[1,1],[1,1],[1,3],[1,2],[2,5],[5,12]];
const DISC=[[],[10],[10,20],[10,20,30],[20,30,40],[30,40]];
const RAR=["#6b7280","#3b82f6","#a855f7","#ffb703","#ff2a5f"];
const IMG=(s,e,c)=>`<img src="${s}" data-e="${e}" onerror="this.outerHTML=this.dataset.e" class="${c}">`;

function rollGear(p){      // клинок або фон за рідкістю; якщо все вже куплено — нижча рідкість
 let r=wp(RW[p]);
 for(;r>=0;r--){const cats=R()<.5?[0,1]:[1,0];
  for(const c of cats){const pool=c?BG.filter(g=>g.r==r&&!S.bgs.includes(g.i)):BL.filter(b=>b.r==r&&!S.blades.includes(b.i));
   if(pool.length){const x=pool[R()*pool.length|0];return c?{ty:"bg",i:x.i,ic:x.ic,lb:t(x.nm),r:x.r}:{ty:"bl",i:x.i,ic:"🗡",lb:bname(x),r:x.r}}}}
 return null}
function rollItem(p){
 const ty=wp(LOOT[p]),sc=1+S.blade*.05;
 if(ty==1){const pl=BS.filter(b=>!b[5]&&b[0]!="chg"),b=pl[R()*pl.length|0];return{ty:"u",id:b[0],ic:b[1],lb:t(b[2]).split(":")[0].slice(0,24),r:p>3?2:1}}
 if(ty==2)return{ty:"s",a:rr(...SR[p]),ic:"⛩️",r:2}
 if(ty==3)return{ty:"l",a:rr(...LR[p]),ic:"🏮",r:2}
 if(ty==4)return{ty:"j",a:rr(...JR[p]),ic:"💎",r:3}
 if(ty==5){const v=DISC[p][R()*DISC[p].length|0];return{ty:"d",v,ic:"🏷",lb:t("Знижка|Discount")+" "+v+"%",r:v>=30?4:3}}
 if(ty==6){const big=R()<.15;return{ty:"t",v:big?"tat2":"tat1",ic:"🎟",lb:big?t("Тату до 3500 грн|Tattoo up to 3500 UAH"):t("Міні-тату до 1500 грн|Mini tattoo up to 1500 UAH"),r:4}}
 if(ty==7){const g=rollGear(p);if(g)return g}
 return{ty:"c",a:Math.round(CB[p]*(.6+R()*.8)*sc*(1+.03*U("chest"))),ic:"🪙",r:[0,1,2,1,2,3][p]}
}
const lab=it=>it.ty=="c"?fmt(it.a)+" 文":it.ty=="s"?"+"+it.a+" ⛩️":it.ty=="l"?"+"+it.a+" 🏮":it.ty=="j"?"+"+it.a+" 💎":it.lb;
function apply(it){
 if(it.ty=="c")S.mon+=it.a;else if(it.ty=="u")S.c[it.id]=(S.c[it.id]||0)+BS.find(b=>b[0]==it.id)[4];
 else if(it.ty=="bl"){if(!S.blades.includes(it.i))S.blades.push(it.i)}else if(it.ty=="bg"){if(!S.bgs.includes(it.i))S.bgs.push(it.i)}
 else if(it.ty=="s")S.souls+=it.a;else if(it.ty=="l")S.ln+=it.a;else if(it.ty=="j")S.jd+=it.a;
 else S.cp.push({code:Date.now().toString(36)+R().toString(36).slice(2,6),type:it.ty=="d"?"d"+it.v:it.v,lb:it.lb,used:0});
 save();push();
}

// ═══ ЕКРАН СУНДУКІВ ═══
function chSt(k){const n=Date.now(),c=S.ck;
 if(k==0){if(c.sd!==today()){c.sn=0;c.sd=today()}const left=Math.max(0,c.s+CK[0][3]-n),lim=c.sn>=3;return{ok:!lim&&!left,left,lim,info:t("Сьогодні|Today")+" "+c.sn+"/3"}}
 const left=Math.max(0,c[CK[k][0]]+CK[k][3]-n);return{ok:!left,left,lim:0,info:""}}
function rChests(){
 $("view-chests").innerHTML=`<h2 class="text-xl font-black uppercase">${t("Сундуки INKAI|INKAI chests")}</h2><p class="text-[11px] text-gray-400">${t("Чим дорожчий сундук — тим кращі нагороди: монети, душі, нефрит, бустери, клинки, фони, купони на тату. Легендарні речі — з 💎-сундуків, міфічні — з найдорожчих.|The pricier the chest, the better the loot. Legendary gear comes from 💎 chests, mythic from the priciest.")}</p><div class="grid grid-cols-3 gap-2">`+
 CK.map((c,k)=>`<div class="card !p-2 text-center space-y-1" style="border-color:${c[4]}"><div class="relative h-20 flex items-center justify-center text-5xl"><div class="absolute inset-0 rounded-full" style="background:radial-gradient(circle,${c[4]}55,transparent 70%);filter:blur(8px)"></div><div class="relative" style="animation:floatY 3.2s ease-in-out ${k*.4}s infinite">${IMG("img/chest/"+CHF[k]+".png",c[1],"h-20 w-auto")}</div></div><b class="text-[11px] block">${t(c[2])} ${t("сундук|chest")}</b><div id="ct${k}" class="font-mono text-[10px] text-neonGold min-h-[28px] leading-tight"></div><button id="co${k}" class="btng w-full !px-1" onclick="openChest(${k},0)">${t("Відкрити|Open")}</button><button id="cs${k}" class="btn w-full !px-1 !bg-deepPurple" onclick="openChest(${k},1)">⏭ ${c[5]} ${CUR[c[6]]}</button></div>`).join("")+
 `</div><h3 class="text-sm font-black uppercase pt-2">${t("Сундуки епох|Era chests")}</h3><div class="grid grid-cols-3 gap-2">`+
 EC.map((e,i)=>`<div class="card !p-2 text-center space-y-1" style="border-color:${e[5]};box-shadow:0 0 10px ${e[5]}44"><div class="relative h-16 flex items-center justify-center text-4xl"><div class="absolute inset-0 rounded-full" style="background:radial-gradient(circle,${e[5]}55,transparent 70%);filter:blur(8px)"></div><div class="relative" style="animation:floatY 3.4s ease-in-out ${i*.25}s infinite">${IMG("img/chest/e_"+e[0]+".png",e[1],"h-16 w-auto")}</div></div><b class="text-[11px] block">${t(e[2])}</b><button class="btng w-full !px-1" ${S[e[3]]>=e[4]?"":"disabled"} onclick="openEpoch(${i})">${fmt(e[4])} ${ECUR[e[3]]}</button></div>`).join("")+`</div>`;
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
 save();runChest(c,k,"img/chest/"+CHF[k]+".png");
}
function openEpoch(i){if(opening)return;const e=EC[i];if(S[e[3]]<e[4])return;S[e[3]]-=e[4];save();runChest([0,e[1],e[2],0,e[5]],e[6],"img/chest/e_"+e[0]+".png")}
let afterRev=null;
function bonus(){G.res.bc=0;$("res").classList.replace("flex","hidden");afterRev=showRes;runChest([0,"🎁","Сундук-знахідка|Found chest",0,"#ffb703"],R()<.25?2:1,"img/chest/bonus.png")}
async function runChest(c,p,im){
 opening=1;hdr();
 const it=rollItem(p),N=46,X=40,strip=[...Array(N)].map((_,i)=>i==X?it:rollItem(p)),ro=$("ro"),col=c[4];
 // фон плавно переходить у твоє фото: img/chest/open_bg.png
 ro.innerHTML=`<div id="robg" class="absolute inset-0" style="opacity:0;transition:opacity 1.8s ease;background:linear-gradient(180deg,rgba(5,4,10,.5),rgba(5,4,10,.78)),url(img/chest/open_bg.png) center/cover no-repeat"></div><div id="rcont" class="relative w-full max-w-md flex justify-center"></div>`;
 $("rcont").innerHTML=`<div class="text-center space-y-3"><div class="relative mx-auto" style="width:210px;height:210px"><div style="position:absolute;inset:-40px;border-radius:50%;background:radial-gradient(circle,${col}88,${col}00 68%);filter:blur(10px);animation:pulse-glow 1.2s infinite"></div><div class="relative h-full flex items-center justify-center text-8xl shk" style="filter:drop-shadow(0 0 25px ${col})">${IMG(im,c[1],"h-44 w-auto")}</div></div><b class="text-neonGold tracking-[.3em] text-xs uppercase">${t("Відкриваємо…|Opening…")}</b></div>`;
 ro.classList.replace("hidden","flex");
 requestAnimationFrame(()=>requestAnimationFrame(()=>{const b=$("robg");if(b)b.style.opacity=1}));
 for(let i=0;i<8;i++){tone(80+i*20,.12,"sine",.2);await sleep(130)}
 $("rcont").innerHTML=`<div class="w-full space-y-4"><h2 class="text-center font-black text-neonGold tracking-[.25em] uppercase text-sm">${c[1]} ${t(c[2])}</h2>
 <div id="rbox" class="relative rounded-3xl py-3" style="background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(8px);-webkit-mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent);mask-image:linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent)">
 <div id="rmark" class="absolute left-1/2 top-1 bottom-1 w-[3px] -ml-[1.5px] z-10 rounded-full transition-transform" style="background:linear-gradient(180deg,transparent,#ffd27a,transparent);box-shadow:0 0 18px #ffb703"></div>
 <div id="rstrip" class="flex gap-1 px-2" style="width:max-content">${strip.map(q=>`<div class="w-20 h-28 shrink-0 rounded-2xl flex flex-col items-center justify-center text-center text-[9px]" style="background:radial-gradient(circle at 50% 30%,${RAR[q.r]}38,rgba(19,17,24,.72));border:1px solid ${RAR[q.r]}88;box-shadow:0 0 14px ${RAR[q.r]}33"><span class="text-3xl" style="filter:drop-shadow(0 0 8px ${RAR[q.r]})">${q.ic}</span><span class="px-1 mt-1 leading-tight">${esc(lab(q))}</span></div>`).join("")}</div></div></div>`;
 const st=$("rstrip"),mk=$("rmark"),bw=$("rbox").clientWidth,target=X*84+8+40-bw/2+(R()-.5)*40;
 st.style.transition="none";st.style.transform="translateX(0)";st.offsetHeight;st.style.transition="transform 5.2s cubic-bezier(.1,.75,.12,1)";st.style.transform=`translateX(-${target}px)`;
 await new Promise(res=>{let last=-1;const t0=performance.now(),lp=()=>{const m=new DOMMatrix(getComputedStyle(st).transform),idx=Math.floor((-m.m41+bw/2-8)/84);
  if(idx!=last){last=idx;sfx("tick",()=>tone(1300,.04,"square",.07));mk.style.transform="scaleY(1.15)";setTimeout(()=>mk.style.transform="",60)}
  if(performance.now()-t0<5400)requestAnimationFrame(lp);else res()};requestAnimationFrame(lp)});
 apply(it);reveal(it);
}
// Нагорода: м'яке сяйво (opacity + blur), без різких країв; фон-фото лишається видимим під скляним шаром
function reveal(it){
 const c=RAR[it.r],ov=$("rev"),isC=it.ty=="d"||it.ty=="t",rn=it.ty=="bl"||it.ty=="bg"?RN[it.r][0]:["ЗВИЧАЙНИЙ|COMMON","РІДКІСНИЙ|RARE","ЕПІЧНИЙ|EPIC","ЛЕГЕНДАРНИЙ|LEGENDARY","МІФІЧНИЙ|MYTHIC"][it.r];
 ov.style.background="rgba(5,4,10,.5)";ov.style.backdropFilter="blur(6px)";ov.style.webkitBackdropFilter="blur(6px)";
 ov.innerHTML=`<div class="absolute inset-0 flex items-center justify-center pointer-events-none"><div style="width:140vmin;height:140vmin;border-radius:50%;background:radial-gradient(circle,${c}55 0%,${c}22 35%,${c}00 68%);filter:blur(18px);animation:glowIn 1.2s ease-out both,pulse-glow 3s 1.2s infinite"></div></div>
 <div class="relative px-6 space-y-3" style="animation:cardIn .9s cubic-bezier(.2,.8,.2,1) both">
  <div class="text-[11px] font-black tracking-[.35em] uppercase" style="color:${c}">${t(rn)}</div>
  <div class="mx-auto flex items-center justify-center" style="width:150px;height:150px;border-radius:2rem;background:radial-gradient(circle at 50% 35%,${c}44,rgba(10,9,14,.55));border:1px solid ${c}88;box-shadow:0 0 50px ${c}66,inset 0 0 30px ${c}22;backdrop-filter:blur(6px)"><span class="text-7xl" style="filter:drop-shadow(0 0 22px ${c})">${it.ic}</span></div>
  <div class="text-2xl font-black" style="color:${c};text-shadow:0 0 22px ${c}88">${esc(lab(it))}</div>
  ${isC?`<div class="text-xs text-gray-300">${t("Купон збережено у вкладці «Нагороди»|Coupon saved in the Rewards tab")}</div>`:""}${it.ty=="bl"||it.ty=="bg"?`<div class="text-xs text-gray-300">${t("Додано — обери в «Магазин»|Added — equip it in the Shop")}</div>`:""}
  <button class="btng px-12 py-3 mt-2" onclick="closeRev()">OK</button></div>`;
 ov.classList.replace("hidden","flex");sfx("reveal",()=>[0,4,7,12].slice(0,2+Math.min(2,it.r)).forEach((s,i)=>setTimeout(()=>tone(330*2**(s/12),.7,"triangle",.14),i*140)));
 for(let i=0;i<14+it.r*8;i++){const e=document.createElement("span"),z=8+R()*14;e.style.cssText=`position:fixed;bottom:-20px;left:${R()*100}%;width:${z}px;height:${z}px;border-radius:50%;background:radial-gradient(circle,${c},${c}00 70%);--dx:${(R()-.5)*80}px;animation:rise ${2.4+R()*2}s ${R()*1.2}s ease-out forwards;pointer-events:none;opacity:0`;ov.appendChild(e);setTimeout(()=>e.remove(),6500)}
}
function closeRev(){$("rev").classList.replace("flex","hidden");$("ro").classList.replace("flex","hidden");$("ro").innerHTML="";opening=0;if(afterRev){const f=afterRev;afterRev=null;f()}else rend()}
