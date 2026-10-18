/* INKAI game.js — головний екран, раунд (canvas), дуо зверху/знизу, боси, душі 1–3, бустери старту
   ДУО: екран ділиться ГОРИЗОНТАЛЬНО. Верхній гравець: йокаї летять від верхнього краю й падають угору, HUD вгорі.
   Нижній — як у соло. Усе моделюється в локальних координатах поля (flip = віддзеркалення по вертикалі). */

const cv=$("cv"),cx=cv.getContext("2d",{alpha:false});let W,H,D=1,SAT=0,G={on:0},ptr={},bgC=null,FLP=0;
function rs(){D=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*D;cv.height=H*D;cx.setTransform(D,0,0,D,0,0);SAT=$("sat").offsetHeight;bgC=null}
addEventListener("resize",()=>{if(!$("gm").classList.contains("hidden"))rs()});
const COIN_K=.6;   // 🔧 загальний множник заробітку монет (менше = повільніше)
const GR=f=>f.h*1.05*(1-.02*U("slow"))*(G.gs||1);                           // 🔧 гравітація

// ═══ ГОЛОВНИЙ ЕКРАН ═══
function rPlay(){
 const b=BL[S.blade],g=BG[S.bg],left=CFG.adEvery-S.rounds%CFG.adEvery,rate=idleRate();
 const chips=BS.filter(x=>x[0]!="chg"&&(S.c[x[0]]||0)>0).map(x=>`<span class="chip text-neonGold">${ico("b_"+x[0],x[1],"h-4 w-4 inline-block object-contain align-middle")} ×${S.c[x[0]]}</span>`).join("");
 $("view-play").innerHTML=`${shogunNight()?`<div class="card text-center !border-neonGold/60 glow"><b class="text-neonGold">🌙 ${t("Ніч Сьогуна! Усі монети за раунд ×2|Shogun's Night! All round coins ×2")}</b></div>`:""}
 <div class="relative card overflow-hidden !p-6 space-y-3 text-center border-crimsonRed/40" style="background:rgba(19,17,24,.82)">
  <div class="relative z-10 space-y-2">
   <div class="w-20 h-20 mx-auto rounded-2xl overflow-hidden flex items-center justify-center text-5xl glow" style="border:2px solid #ffb703">${avHTML(S.av)}</div>
   <div class="font-black">${esc(S.nick||t("Гість|Guest"))} · Lv ${lvl(S.xp)}</div>
   <div class="text-[11px] text-gray-200">${t(g.nm)} · ${FXI[b.fx]} ${bname(b)}</div>${bar(b)}
  </div>
  <div class="relative z-10 flex justify-center gap-2 flex-wrap">${chips}${rate?`<span class="chip text-emerald-400">💤 +${fmt(rate)} 文/${t("с|s")}</span>`:""}</div>
 </div>
 <div class="grid grid-cols-2 gap-3">
  <button onclick="startRound(1)" class="btng py-4 text-sm shadow-[0_0_24px_rgba(255,183,3,.3)]">⚔️ ${t("ГРАТИ|PLAY")}</button>
  <button onclick="startRound(2)" class="btn py-4 text-sm shadow-[0_0_24px_rgba(255,42,95,.3)]">👥 ${t("ГРАТИ ВДВОХ|PLAY DUO")}</button>
 </div>
 <div class="card text-xs text-gray-300 space-y-1" style="background:rgba(19,17,24,.82)">
  <div>❌ ${t("3 пропущені йокаї — кінець гри (життя відновлюється лише за рекламу)|3 missed yokai — game over (lives come back only via an ad)")}</div>
  <div>📜 ${t("Не ріж свитки! 3 свитки — кінець гри|Don't cut the scrolls! 3 scrolls — game over")}</div>
  <div>✂️ ${t("3 і більше йокаїв одним свайпом — бонус|Cut 3+ yokai in one swipe — bonus")}</div>
  <div>🌙 ${t("Ніч Сьогуна — щосуботи 20:00–23:00: монети ×2|Shogun's Night — every Saturday 20:00–23:00: coins ×2")}</div>
  <div>👥 ${t("Дуо: екран ділиться навпіл — один гравець зверху, другий знизу|Duo: screen splits in half — one player on top, one at the bottom")}</div>
  <div>📣 ${t("Раундів до реклами|Rounds until the next ad")}: <b>${left}</b></div>
 </div>`;
}

// ═══ ПОЛЕ ГРАВЦЯ ═══
const ambient=(w,h)=>Array.from({length:6},()=>({y:YK[R()*6|0],r:30+R()*40,x:R()*w,py:R()*h,vx:(R()-.5)*14,vy:-(6+R()*14),rot:R()*6,vr:(R()-.5)*.4}));
const mkF=(oy,h,fl)=>({oy,h,fl,w:W,fx:[],e:[],hv:[],p:[],x:[],trs:[],sq:[],bs:[],zm:1,sc:30*U("start"),ex:0,cb:0,cT:0,cuts:0,nb:12,bo:null,sp:1,fz:0,cr:[],fp:0,sl:0,st:0,fr:0,sh:0,fa:0,ts:1,kills:0,
 ms:0,sk:0,mx:3+(U("time")/5|0)+(S.c.plus>0?1:0),dead:0,why:"",bl:[],dr:[],bc:0,dbl:0});
function startRound(m){
 if(G.on)return;
 $("gm").classList.remove("hidden");$("res").classList.replace("flex","hidden");rs();
 const n=m||1;
 G={on:1,m:n,el:0,fin:0,mb:1,rv:0,f:n==2?[mkF(0,H/2,1),mkF(H/2,H/2,0)]:[mkF(0,H,0)],l:performance.now()};
 const nw=performance.now(),F=fn=>G.f.forEach(fn),c=S.c;
 // бустери старту (зберігаються в S.c до використання)
 if(c.plus>0)c.plus--;
 if(c.fz>0){c.fz--;F(f=>f.fr=nw+8000)}
 if(c.mb>0){c.mb--;G.mb=1.5}
 if(c.sl0>0){c.sl0--;F(f=>f.sl=nw+8000)}
 if(c.shd>0){c.shd--;F(f=>f.mx+=2)}
 if(c.st>0){c.st--;F(f=>f.sc+=300)}
 if(c.cmb>0){c.cmb--;F(f=>{f.cb=10;f.cT=nw+3000})}
 if(c.bos>0){c.bos--;F(f=>f.nb=4)}
 if(c.wide>0){c.wide--;G.wide=1.5}
 if(c.slw>0){c.slw--;G.gs=.7}
 if(c.lx>0){c.lx--;G.lx=1}
 if(c.sx>0){c.sx--;G.sx=1}
 if(c.mx5>0){c.mx5--;G.mb=Math.max(G.mb,5)}
 if(c.hrt>0){c.hrt--;F(f=>f.mx+=3)}
 if(c.fz15>0){c.fz15--;F(f=>f.fr=nw+15000)}
 if(c.nsc>0){c.nsc--;G.nsc=1}
 if(c.bhf>0){c.bhf--;G.bhf=1}
 if(c.sc2>0){c.sc2--;G.sc2=1}
 if(c.lck>0){c.lck--;G.lk=1}
 let dd=0;if(c.m30>0){c.m30--;dd=30000}else if(c.m10>0){c.m10--;dd=10000}
 if(dd)F(f=>f.dbl=nw+dd);
 if(c.bh0>0){c.bh0--;F(f=>{mkBoss(f,nw,"bh");f.bo.hp=f.bo.mh=6;setTimeout(()=>{if(f.bo&&f.bo.ty=="bh")f.bo=null},6000)})}
 if(c.br>0){c.br--;F(f=>{for(let i=0;i<8;i++)setTimeout(()=>{if(!G.on||f.dead)return;const x=f.w*(.1+.8*i/7),h=f.h*(.3+.25*Math.sin(Math.PI*i/7)),r=38;f.e.push({y:YK[i%6],sc:0,r,x,py:f.h+r,vx:0,vy:-Math.sqrt(2*GR(f)*h),rot:0,vr:0,cut:0})},i*180)})}
 Object.keys(BOSS).forEach(k=>bimg(k));track("round_start",{mode:n,blade:S.blade});save();snd(300,.2);setMusic("battle");adTick();requestAnimationFrame(frame);
}
function quitRound(){if(G.on){addPlay(G.el);track("quit_round",{sec:Math.round(G.el)})}G.on=0;ptr={};setMusic("menu");$("gm").classList.add("hidden");adTick();rend()}
function sp(c,y,r){
 const i=YIMG[y];if(FLP)c.scale(1,-1);
 if(rdy(i)){const k=Math.min(2*r/i.naturalWidth,2*r/i.naturalHeight)*1.15,w=i.naturalWidth*k,h=i.naturalHeight*k;c.drawImage(i,-w/2,-h/2,w,h)}
 else{c.fillStyle="#fff";c.font=r*1.7+"px serif";c.textAlign="center";c.textBaseline="middle";c.fillText(y,0,r*.08)}
 if(FLP)c.scale(1,-1);
}
function drawBG(w,h){
 const bi=bgImg(S.bg),k=S.bg+"_"+w+"_"+h+"_"+(rdy(bi)?1:0);
 if(!bgC||bgC.k!=k){
  const c=document.createElement("canvas");c.width=w*D;c.height=h*D;const x=c.getContext("2d");x.scale(D,D);
  if(rdy(bi)){const s=Math.max(w/bi.naturalWidth,h/bi.naturalHeight);x.drawImage(bi,(w-bi.naturalWidth*s)/2,(h-bi.naturalHeight*s)/2,bi.naturalWidth*s,bi.naturalHeight*s);x.fillStyle="rgba(0,0,0,.3)";x.fillRect(0,0,w,h)}
  else{const g=BG[S.bg],gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,g.g[0]);gr.addColorStop(1,g.g[1]);x.fillStyle=gr;x.fillRect(0,0,w,h);x.globalAlpha=.16;x.font=Math.min(w,h)*.5+"px serif";x.textAlign="center";x.fillStyle="#fff";x.fillText(g.ic,w*.7,h*.3)}
  c.k=k;bgC=c;
 }
 cx.drawImage(bgC,0,0,w,h);
}
const YC={"🦊":"#ff8a2b","👹":"#e11d48","👺":"#dc2626","🐸":"#4ade80","💀":"#e5e7eb","🐉":"#facc15"};
function splat(f,x,y,c,e,ang){if(f.p.length>200)return;const g=GR(f),ex=e?e.vx*.6:0,ey=e?e.vy*.5:0,RB=()=>["#b91c1c","#991b1b","#dc2626","#7f1d1d"][R()*4|0],perp=(ang||0)+Math.PI/2;
 for(let i=0;i<14;i++){const a=perp+(i%2?0:Math.PI)+(R()-.5)*.8,s=220+R()*320;                 // віяла довгих бризок у обидва боки від лінії розрізу
  f.p.push({x,y,vx:ex+Math.cos(a)*s,vy:ey+Math.sin(a)*s-30,l:1.3,c:RB(),s:1.4+R()*2.6,sh:"v",g:g*.8,rot:0,vr:0})}
 for(let i=0;i<7;i++){const a=R()*6.283,s=70+R()*210;                                           // великі краплі-«сльози»
  f.p.push({x,y,vx:ex+Math.cos(a)*s,vy:ey+Math.sin(a)*s-60,l:1.7,c:RB(),s:3.5+R()*4.5,sh:"b",g:g*1.1,rot:0,vr:0})}
 for(let i=0;i<16;i++){const a=R()*6.283,s=120+R()*380;                                         // кривавий туман
  f.p.push({x,y,vx:ex+Math.cos(a)*s,vy:ey+Math.sin(a)*s,l:.6,c:RB(),s:1+R()*1.2,sh:"o",g:0,rot:0,vr:0})}
 for(let i=0;i<5;i++)f.p.push({x:x+(R()-.5)*18,y:y+(R()-.5)*18,vx:ex*.95+(R()-.5)*40,vy:ey*.95+(R()-.5)*40,l:2.1,c:RB(),s:2.5+R()*3,sh:"b",g:g*.95,rot:0,vr:0})   // краплі падають разом із йокаєм
}
function burst(f,x,y,n,c){if(f.p.length>140)return;for(let i=0;i<n;i++){const a=R()*6.283,s=120+R()*380;f.p.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,c:c||(R()<.5?"#ffb703":"#ff2a5f")})}}
const pop=(f,x,y,s,big)=>f.x.push({x,y,s,l:1,big});
function spawn(f,st,fs){
 const bt=f.bo?f.bo.ty:"",sc=fs||(bt=="nos"||G.nsc?false:R()<Math.min(.2,.06+G.el/800)),sw=bt=="swm",r=sw?20+R()*10:34+R()*16,x=f.w*(.15+R()*.7),h=f.h*(.5+R()*.25),g=GR(f);
 const vx=(f.w/2-x)*(.15+R()*.3)*(sw?2:1),vy=-Math.sqrt(2*g*h)*(st?1.1:1),vr=(R()-.5)*4,y=sc?"📜":YK[R()*6|0],dg=YK[R()*6|0];
 f.e.push({y,dg,sc,r,x,py:f.h+r,vx,vy,rot:0,vr,cut:0});
 if(bt=="mir")f.e.push({y,dg,sc,r,x:f.w-x,py:f.h+r,vx:-vx,vy,rot:0,vr:-vr,cut:0});     // дзеркальна пара
}
function score(f,base,now){
 const b=BL[S.blade];let m=(1+f.cb*(.2+.02*U("combo")))*b.sc*(1+.1*U("coin"))*(now<f.fr?2:1)*(now<f.sl?2:1)*(now<f.st?1.5:1);
 if(R()<.03*U("crit"))m*=3+.2*U("critm");
 if(R()<.02*U("x2"))m*=2;
 const bt=f.bo?f.bo.ty:"";if(bt=="rch")m*=3;else if(bt=="nos")m*=1.5;if(G.sc2)m*=2;
 const p=Math.round(base*m);f.sc+=p;if(now<f.dbl)f.ex+=p;return p;     // ex = очки, подвоєні бустером ×2 монет
}
function die(f,why){
 f.dead=1;f.why=why;f.e=[];f.bo=null;f.fz=0;
 if(G.f.every(x=>x.dead)&&!G.fin){G.fin=1;setTimeout(overScreen,why=="sk"?1000:600)}
}
function missed(f,x){const bt=f.bo?f.bo.ty:"";if(bt=="hea"){f.bo.hp=Math.min(f.bo.mh,f.bo.hp+1);pop(f,f.bx,f.by,"💚 +1",1)}if(bt=="vmp"){f.sc=Math.max(0,f.sc-25);pop(f,f.w/2,f.h*.5,"🧛 −25",1)}f.ms++;f.cb=0;snd(160,.2,.15);pop(f,Math.max(40,Math.min(f.w-40,x)),f.h-70,"✖ "+f.ms+"/"+f.mx,1);f.sh=6;navigator.vibrate&&navigator.vibrate(30);if(f.ms>=f.mx)die(f,"ms")}
function bloodAdd(f,x,y){const s=f.sk,n=s==1?1:s==2?3:6;
 for(let k=0;k<n;k++){const bx=k?R()*f.w:x,by=k?R()*f.h:y,r=f.w*(s==1?.3:.26)*(.6+R()*.6);
  f.bl.push({x:bx,y:by,a:.34,q:Array.from({length:6},()=>[(R()-.5)*r*1.3,(R()-.5)*r*1.3,r*(.25+R()*.4)])});
  for(let d=0;d<3+s*2;d++)f.dr.push({x:bx+(R()-.5)*r,y:by+(R()-.5)*r*.4,l:0,m:30+R()*f.h*.18,w:3+R()*6,v:25+R()*45})}}
function hitScroll(f,e,ang){
 e.cut=1;f.cb=0;f.sk++;f.sh=14;f.fa=.3;burst(f,e.x,e.py,18,"#e8dcc0");f.fx.push({x:e.x,y:e.py,a:ang,l:1});
 bloodAdd(f,e.x,e.py);sfx("boss",()=>snd(110,.35,.25));navigator.vibrate&&navigator.vibrate([40,30,60]);
 pop(f,e.x,e.py,"📜 "+f.sk+"/3",1);
 if(f.sk>=3)die(f,"sk");
}
function multi(f,n,now,e){      // 3+ йокаїв одним свайпом — бонус і напис
 const nm=[,,,t("ТРІЙНИЙ!|TRIPLE!"),t("4× КОМБО!|4× COMBO!"),t("5× МЕГА!|5× MEGA!")][Math.min(n,5)]||n+"× "+t("ШАЛЕНСТВО!|FRENZY!"),bonus=[0,0,0,40,90,160][Math.min(n,5)]*(n>5?n-4:1),p=score(f,bonus,now);
 pop(f,e.x,e.py-34,nm+" +"+p,1);burst(f,e.x,e.py,14+n*3,"#ffd24a");f.cb+=1;f.sh=Math.max(f.sh,8+n);navigator.vibrate&&navigator.vibrate([20,20,40])}
function cut(f,e,ang,now){
 if(e.sc)return hitScroll(f,e,ang);
 e.cut=1;f.fx.push({x:e.x,y:e.py,a:ang,l:1});
 splat(f,e.x,e.py,YC[e.y]||"#ff2a5f",e,ang);
 if(f.bo&&f.bo.ty=="spl"&&!e.sp)for(const s of[-1,1])f.e.push({y:e.y,dg:e.y,sc:0,sp:1,r:e.r*.7,x:e.x,py:e.py,vx:e.vx+s*140,vy:Math.min(e.vy,0)-220,rot:0,vr:e.vr,cut:0});
 if(f.bo&&f.bo.ty=="rch")burst(f,e.x,e.py,6,"#ffd24a");
 for(const s of[1,-1])f.hv.push({y:e.y,r:e.r,x:e.x,py:e.py,vx:e.vx-Math.sin(ang)*s*190,vy:e.vy*.4+Math.cos(ang)*s*190,rot:e.rot,vr:e.vr+s*3,cl:ang-e.rot,s,l:1.4});
 f.cb=now-f.cT<700+40*U("cwin")?f.cb+1:1;f.cT=now;
 if(f.cb>=Math.max(3,8-(U("frth")/3|0))&&now>f.fr)f.fr=now+4000+500*U("frz");
 const p=score(f,10,now);pop(f,e.x,e.py,"+"+p);burst(f,e.x,e.py,10);f.sh=6;f.cuts++;
 navigator.vibrate&&navigator.vibrate(10);sfx("slash",()=>snd(500+f.cb*25));
 if(f.cuts>=f.nb&&!f.bo)mkBoss(f,now);
}
/* 20 БОСІВ: ty:[назва, колір, hp, опис]. Кожен має унікальну механіку (див. spawn/cut/missed/upd) */
const BOSS={
 frz:["❄️ Крижаний Цар|❄️ Ice Tsar","#7dd3fc",10,"Екран замерзає, йокаї повільно відлітають. Розбий лід свайпами|Screen freezes, yokai drift away. Swipe to shatter the ice"],
 slo:["⏳ Володар Часу|⏳ Time Lord","#c084fc",10,"Час сповільнюється, очки ×2|Time slows, score ×2"],
 sto:["🌪 Бог Шторму|🌪 Storm God","#fb923c",10,"Усе летить швидше, очки ×1.5|Everything faster, score ×1.5"],
 bh:["🕳 Чорна Діра|🕳 Black Hole","#8b5cf6",10,"Засмоктує йокаїв — очки за кожного|Sucks yokai in — points for each"],
 scr:["📜 Свиткопад|📜 Scroll Rain","#ef4444",8,"На екран сиплються свитки!|Scrolls rain down!"],
 gld:["🌟 Золотий Йокай|🌟 Golden Yokai","#facc15",10,"9 секунд шаленства ×2|9 seconds of ×2 frenzy"],
 nos:["🕊 Мирний Дух|🕊 Peace Spirit","#a7f3d0",8,"Свитків немає, очки ×1.5|No scrolls, score ×1.5"],
 mir:["🪞 Дзеркальний Оні|🪞 Mirror Oni","#e5e7eb",10,"Ёкаї летять дзеркальними парами|Yokai fly in mirrored pairs"],
 swm:["🐝 Рій Тенгу|🐝 Tengu Swarm","#fbbf24",10,"Купа дрібних швидких йокаїв|A swarm of tiny fast yokai"],
 inv:["👻 Невидимка|👻 Invisible","#94a3b8",10,"Ёкаї мерехтять і зникають|Yokai flicker and fade"],
 lgt:["🎈 Повітряний|🎈 Airborne","#f9a8d4",10,"Ёкаї ширяють довше|Yokai float for longer"],
 hvy:["🪨 Кам'яний Голем|🪨 Stone Golem","#a8a29e",10,"Ёкаї падають важко й швидко|Yokai fall heavy and fast"],
 spl:["🧬 Розщеплювач|🧬 Splitter","#34d399",10,"Розрізані йокаї діляться надвоє|Cut yokai split in two"],
 shd:["🥷 Тінь-ніндзя|🥷 Shadow Ninja","#6366f1",6,"Бос телепортується|The boss teleports"],
 hea:["💚 Цілитель|💚 Healer","#4ade80",8,"Лікується, коли ти пропускаєш ёкая|Heals when you miss a yokai"],
 rch:["🪙 Золотий Дощ|🪙 Gold Rain","#fcd34d",10,"Очки ×3, але йокаї летять густо|Score ×3, but dense waves"],
 wnd:["🍃 Володар Вітру|🍃 Wind Lord","#67e8f9",10,"Вітер зносить йокаїв убік|Wind blows yokai sideways"],
 cha:["🦎 Хамелеон|🦎 Chameleon","#a3e635",10,"Свитки маскуються під йокаїв!|Scrolls disguise as yokai!"],
 cmb:["🔗 Майстер Комбо|🔗 Combo Master","#fb7185",8,"Ранять лише удари з комбо ≥ 3 (торкайся боса — комбо росте)|Only hits with combo ≥ 3 hurt (touch the boss to build it)"],
 vmp:["🧛 Вампір|🧛 Vampire","#be123c",10,"За кожного пропущеного краде 25 очок|Steals 25 points per miss"]
};
const BCOL={},BNAME={};for(const k in BOSS){BCOL[k]=BOSS[k][1];BNAME[k]=BOSS[k][0]}
function mkBoss(f,now,force){
 const ks=Object.keys(BOSS),ty=force||ks[R()*ks.length|0],B=BOSS[ty];
 f.bo={y:YK[R()*6|0],ty,hp:G.bhf?Math.ceil(B[2]/2):B[2],mh:G.bhf?Math.ceil(B[2]/2):B[2],t:0,ap:0,rg:0,hist:[],hit:0,last:0,r0:Math.min(f.w,f.h)*.14,r:Math.min(f.w,f.h)*.14,z:1,tl:5,nf:now+9000,ab:0,ns:now+1500,tp:0,tx:f.w/2,ty2:f.h*.4};
 f.bx=f.w/2;f.by=f.h*.4;track("boss_spawn",{boss:ty});pop(f,f.w/2,f.h*.3,"BOSS!",1);f.ban={s:t(B[0]),d:t(B[3])+" · "+t("5 с на комбо!|5 s for the combo!"),l:1};f.fa=.4;snd(120,.4,.2);
 if(ty=="frz")frz(f);if(ty=="slo")f.sl=now+7000;if(ty=="sto")f.st=now+8000;if(ty=="gld")f.fr=Math.max(f.fr,now+9000);
}
/* Фонові ефекти кожного боса (малюються під босом). em(інтенсивність, частинка) — випромінювач у спільній системі частинок */
function bfx(f,b,now,dt,h){const w=f.w,t=b.t,ty=b.ty,bx=f.bx,by=f.by,r=b.r;
 const em=(rate,o)=>{if(f.p.length<260&&R()<rate*dt*60)f.p.push(Object.assign({l:1,sh:"o",s:3,rot:0,vr:0,vx:0,vy:0,g:0,c:"#fff"},o))};
 cx.save();
 if(ty=="slo"){cx.strokeStyle="rgba(192,132,252,.5)";cx.lineWidth=2;for(let i=0;i<3;i++){const q=(t*40+i*70)%210;cx.globalAlpha=1-q/210;cx.beginPath();cx.arc(bx,by,q,0,6.3);cx.stroke()}
  cx.globalAlpha=.55;cx.lineWidth=3;cx.beginPath();cx.arc(bx,by,r*1.9,0,6.3);cx.stroke();const a=t*.8;cx.beginPath();cx.moveTo(bx,by);cx.lineTo(bx+Math.cos(a)*r*1.9,by+Math.sin(a)*r*1.9);cx.stroke();em(.15,{x:R()*w,y:h,vy:-30,c:"#e9d5ff",s:2,l:2})}
 else if(ty=="sto"){cx.fillStyle="rgba(30,20,10,.28)";cx.fillRect(0,0,w,h);cx.strokeStyle="rgba(200,220,255,.4)";cx.lineWidth=1.2;for(let i=0;i<14;i++){const x=(i*91+t*420)%w,y=(i*53+t*600)%h;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x-8,y+22);cx.stroke()}
  if(now>(b.lb||0)&&R()<dt*.9){b.lb=now+140;b.lx=R()*w}
  if(now<(b.lb||0)){cx.strokeStyle="#fff";cx.shadowColor="#fb923c";cx.shadowBlur=18;cx.lineWidth=3;cx.beginPath();let x=b.lx,y=0;cx.moveTo(x,y);while(y<h*.7){x+=(R()-.5)*50;y+=h*.07;cx.lineTo(x,y)}cx.stroke();cx.shadowBlur=0;cx.fillStyle="rgba(255,255,255,.12)";cx.fillRect(0,0,w,h)}}
 else if(ty=="bh"){const g=cx.createRadialGradient(bx,by,r,bx,by,h*.9);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(20,0,50,.55)");cx.fillStyle=g;cx.fillRect(0,0,w,h);
  for(let i=0;i<4;i++){cx.save();cx.translate(bx,by);cx.rotate(t*(1.2+i*.3)+i);cx.scale(1,.38);cx.strokeStyle=`rgba(${160+i*20},120,255,${.5-i*.08})`;cx.lineWidth=3;cx.beginPath();cx.arc(0,0,r*(1.3+i*.45),0,6.3);cx.stroke();cx.restore()}
  const a=R()*6.28,d=r*3;em(.6,{x:bx+Math.cos(a)*d,y:by+Math.sin(a)*d,vx:-Math.cos(a)*90,vy:-Math.sin(a)*90,c:"#c4b5fd",s:2.5})}
 else if(ty=="scr"){cx.fillStyle="rgba(120,30,20,.18)";cx.fillRect(0,0,w,h);em(.5,{x:R()*w,y:-10,vx:(R()-.5)*30,vy:70+R()*50,sh:"q",c:"#f3e6c4",s:5+R()*4,vr:(R()-.5)*4,l:2.5});em(.2,{x:R()*w,y:-10,vy:150,c:"#7f1d1d",s:3,l:2,g:300})}
 else if(ty=="gld"){cx.translate(bx,by);cx.rotate(t*.4);for(let i=0;i<12;i++){cx.rotate(Math.PI/6);const g=cx.createLinearGradient(0,0,0,h);g.addColorStop(0,"rgba(255,220,80,.35)");g.addColorStop(1,"rgba(255,220,80,0)");cx.fillStyle=g;cx.beginPath();cx.moveTo(-10,0);cx.lineTo(10,0);cx.lineTo(60,h);cx.lineTo(-60,h);cx.fill()}
  em(.8,{x:R()*w,y:R()*h,sh:"s",c:"#fff3b0",s:3+R()*4,l:.8,vy:-20})}
 else if(ty=="nos"){const g=cx.createRadialGradient(bx,by,0,bx,by,h*.7);g.addColorStop(0,"rgba(220,255,235,.28)");g.addColorStop(1,"rgba(220,255,235,0)");cx.fillStyle=g;cx.fillRect(0,0,w,h);cx.strokeStyle="rgba(255,255,255,.6)";cx.lineWidth=3;cx.beginPath();cx.ellipse(bx,by-r*1.5,r*.7,r*.18,0,0,6.3);cx.stroke();em(.5,{x:R()*w,y:-10,vx:20,vy:40+R()*30,sh:"p",c:"#ffffff",s:5+R()*3,vr:2,l:3})}
 else if(ty=="mir"){const g=cx.createLinearGradient(w/2-20,0,w/2+20,0);g.addColorStop(0,"rgba(255,255,255,0)");g.addColorStop(.5,"rgba(255,255,255,.35)");g.addColorStop(1,"rgba(255,255,255,0)");cx.fillStyle=g;cx.fillRect(w/2-20,0,40,h);em(.5,{x:w/2+(R()-.5)*30,y:R()*h,sh:"d",c:"#e5e7eb",s:4,l:.8,vy:-40})}
 else if(ty=="swm"){cx.fillStyle="#fbbf24";for(let i=0;i<18;i++){const a=t*(2+i%3)+i*1.7,q=r*(1.2+.5*Math.sin(t*3+i));cx.beginPath();cx.arc(bx+Math.cos(a)*q,by+Math.sin(a*1.3)*q*.7,3,0,6.3);cx.fill()}}
 else if(ty=="inv"){cx.fillStyle=`rgba(15,23,42,${.22+.12*Math.sin(t*5)})`;cx.fillRect(0,0,w,h);em(.4,{x:R()*w,y:R()*h,c:"rgba(203,213,225,.35)",s:20+R()*20,l:1.6,vx:15})}
 else if(ty=="lgt"){const g=cx.createLinearGradient(0,0,0,h);g.addColorStop(0,"rgba(249,168,212,0)");g.addColorStop(1,"rgba(147,197,253,.22)");cx.fillStyle=g;cx.fillRect(0,0,w,h);em(.35,{x:R()*w,y:h+10,vy:-50-R()*40,c:["#f9a8d4","#93c5fd","#fde68a"][R()*3|0],s:8+R()*8,l:4})}
 else if(ty=="hvy"){cx.fillStyle="rgba(68,50,30,.22)";cx.fillRect(0,0,w,h);cx.strokeStyle="rgba(0,0,0,.5)";cx.lineWidth=3;for(let i=0;i<5;i++){let x=w*(.1+.2*i),y=h;cx.beginPath();cx.moveTo(x,y);for(let k=0;k<5;k++){x+=Math.sin(i*7+k)*18;y-=18+k*6;cx.lineTo(x,y)}cx.stroke()}
  if(R()<dt*1.2)f.sh=Math.max(f.sh,5);em(.6,{x:R()*w,y:-10,vy:200,sh:"q",c:"#a8a29e",s:4+R()*5,g:400,l:2})}
 else if(ty=="spl"){cx.strokeStyle="rgba(52,211,153,.5)";cx.lineWidth=3;for(const s of[0,Math.PI]){cx.beginPath();for(let y=0;y<=h;y+=12){const x=bx+Math.sin(y/40+t*3+s)*r*1.1;y?cx.lineTo(x,y):cx.moveTo(x,y)}cx.stroke()}em(.4,{x:bx+(R()-.5)*r*2,y:R()*h,c:"#6ee7b7",s:3,vy:-30})}
 else if(ty=="shd"){cx.fillStyle="rgba(10,5,30,.35)";cx.fillRect(0,0,w,h);em(.7,{x:bx+(R()-.5)*r,y:by+(R()-.5)*r,c:"rgba(99,102,241,.5)",s:10+R()*14,l:.9});em(.15,{x:R()*w,y:R()*h,sh:"s",c:"#cbd5e1",s:5,vr:12,vx:(R()-.5)*300,vy:(R()-.5)*300,l:.8})}
 else if(ty=="hea"){const g=cx.createRadialGradient(bx,by,r,bx,by,r*(2.5+Math.sin(t*3)*.4));g.addColorStop(0,"rgba(74,222,128,.35)");g.addColorStop(1,"rgba(74,222,128,0)");cx.fillStyle=g;cx.fillRect(0,0,w,h);em(.5,{x:bx+(R()-.5)*r*3,y:by+r,sh:"t",ch:"+",c:"#86efac",s:8+R()*5,vy:-60,l:1.2})}
 else if(ty=="rch"){cx.fillStyle="rgba(250,204,21,.1)";cx.fillRect(0,0,w,h);em(1.2,{x:R()*w,y:-10,vy:180+R()*120,c:"#fcd34d",s:4+R()*3,l:2.5,g:200})}
 else if(ty=="wnd"){const dir=Math.sin(t*1.4);cx.strokeStyle="rgba(165,243,252,.35)";cx.lineWidth=1.5;for(let i=0;i<12;i++){const y=(i*67+t*30)%h,x=((i*131+t*(300*dir+40))%w+w)%w;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x+dir*60,y);cx.stroke()}em(.5,{x:dir>0?-10:w+10,y:R()*h,vx:dir*260,vy:20,sh:"p",c:"#86efac",s:5,vr:5,l:2.5})}
 else if(ty=="cha"){cx.fillStyle=`hsla(${t*80%360},80%,55%,.14)`;cx.fillRect(0,0,w,h);cx.strokeStyle=`hsla(${t*80%360},90%,65%,.4)`;cx.lineWidth=3;const q=(t*80)%(r*3);cx.globalAlpha=1-q/(r*3);cx.beginPath();cx.arc(bx,by,q+r,0,6.3);cx.stroke()}
 else if(ty=="cmb"){const sh=f.cb<3;cx.strokeStyle=sh?"rgba(251,113,133,.8)":"rgba(255,255,255,.9)";cx.lineWidth=sh?5:3;cx.setLineDash([14,10]);cx.lineDashOffset=-t*40;cx.beginPath();cx.arc(bx,by,r*1.5,0,6.3);cx.stroke();cx.setLineDash([]);
  if(sh){cx.fillStyle="rgba(251,113,133,.14)";cx.beginPath();cx.arc(bx,by,r*1.5,0,6.3);cx.fill()}
  cx.fillStyle="#272235";cx.fillRect(bx-40,by+r*1.7,80,6);cx.fillStyle="#fb7185";cx.fillRect(bx-40,by+r*1.7,80*Math.min(1,f.cb/3),6)}
 else if(ty=="vmp"){cx.fillStyle="rgba(120,0,20,.22)";cx.fillRect(0,0,w,h);const g=cx.createRadialGradient(w*.8,h*.18,0,w*.8,h*.18,h*.2);g.addColorStop(0,"rgba(255,70,70,.55)");g.addColorStop(1,"rgba(255,70,70,0)");cx.fillStyle=g;cx.fillRect(0,0,w,h);em(.25,{x:-10,y:R()*h*.5,vx:140+R()*80,vy:(R()-.5)*60,sh:"t",ch:"🦇",c:"#000",s:9,l:3})}
 cx.restore()}
// Бос: поява з відскоком і кільцем, світіння, завжди поверх усіх ефектів. Свій PNG: img/boss/<id>.png
const BIM={};const bimg=ty=>BIM[ty]||(BIM[ty]=Object.assign(new Image(),{src:"img/boss/"+ty+".png"}));
function sprB(c,b,sc){const i=bimg(b.ty);if(rdy(i)){if(FLP)c.scale(1,-1);const k=Math.min(b.r*2.6*sc/i.naturalWidth,b.r*2.6*sc/i.naturalHeight);c.drawImage(i,-i.naturalWidth*k/2,-i.naturalHeight*k/2,i.naturalWidth*k,i.naturalHeight*k);if(FLP)c.scale(1,-1)}else{c.save();c.scale(sc,sc);sp(c,b.y,b.r);c.restore()}}
function drawBoss(f,b,dt,now){
 b.ap=Math.min(1,b.ap+dt*2.2);const e=b.ap-1,sc=(b.ap<1?Math.max(.6,1+2.7*e*e*e+1.7*e*e):1)*(1+Math.max(0,b.hit)*.1),C=BCOL[b.ty],pu=1+Math.sin(b.t*3)*.05;
 if(b.rg<1){b.rg+=dt*1.4;cx.save();cx.globalAlpha=Math.max(0,1-b.rg);cx.strokeStyle=C;cx.lineWidth=7;cx.beginPath();cx.arc(f.bx,f.by,b.r*(1+b.rg*5),0,6.3);cx.stroke();cx.restore()}
 if(b.ty=="shd")b.hist.forEach((q,i)=>{cx.save();cx.globalAlpha=.1+i*.05;cx.translate(q[0],q[1]);sprB(cx,b,sc*.95);cx.restore()});
 cx.save();cx.translate(f.bx,f.by);
 const ag=cx.createRadialGradient(0,0,b.r*.3,0,0,b.r*2.3*pu);ag.addColorStop(0,C+"55");ag.addColorStop(.5,C+"1f");ag.addColorStop(1,C+"00");cx.fillStyle=ag;cx.beginPath();cx.arc(0,0,b.r*2.3*pu,0,6.3);cx.fill();
 if(b.ty=="bh"){cx.fillStyle="#000";cx.beginPath();cx.arc(0,0,b.r*.8*sc,0,6.3);cx.fill();cx.strokeStyle=C;cx.lineWidth=3;cx.beginPath();cx.arc(0,0,b.r*.8*pu*sc,0,6.3);cx.stroke()}
 if(b.hit>0){b.hit-=dt*5;cx.globalAlpha=Math.max(0,b.hit)*.5;cx.fillStyle="#fff";cx.beginPath();cx.arc(0,0,b.r*1.15,0,6.3);cx.fill()}
 cx.globalAlpha=1;cx.shadowColor=C;cx.shadowBlur=14;sprB(cx,b,sc);cx.shadowBlur=0;
 cx.restore()}
function bossFlee(f,b){b.gone=1;pop(f,f.bx,f.by,t("Втік! 💨|Escaped! 💨"),1);burst(f,f.bx,f.by,16,"#9ca3af");f.bo=null;f.fz=0;f.nb=f.cuts+10;track("boss_flee",{boss:b.ty})}
function bossBurst(f,b){      // рівно 4 уламки в 4 діагональні боки, кривава смуга за кожним
 const n=Math.SQRT1_2;[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(d=>{const qd=(d[0]>0?1:0)|(d[1]>0?2:0),v=520;
  f.hv.push({y:b.y,bt:b.ty,r:b.r,x:f.bx,py:f.by,vx:d[0]*v*n,vy:d[1]*v*n-60,rot:0,vr:d[0]*d[1]*1.6,cl:0,qd,s:1,l:1.4});
  f.bs.push({x:f.bx,y:f.by,a:Math.atan2(d[1],d[0]),t:0});
  for(let k=0;k<10;k++)f.p.push({x:f.bx,y:f.by,vx:d[0]*(180+R()*380)*n+(R()-.5)*90,vy:d[1]*(180+R()*380)*n+(R()-.5)*90,l:1.5,c:["#b91c1c","#7f1d1d","#dc2626"][R()*3|0],s:2+R()*4,sh:"v",g:200,rot:0,vr:0})});
 f.sh=22;f.fa=.45;navigator.vibrate&&navigator.vibrate([40,30,80])}
function frz(f){f.fz=1;f.cr=[];f.fp=0;f.ice=Array.from({length:46},()=>({e:R()*4|0,p:R(),l:30+R()*90,w:10+R()*18}))}
// Заморозка: лід росте від країв, екран світліє до крижаного, при розбитті — тане
function frost(f,raw){f.fk=f.fz?Math.min(1,(f.fk||0)+raw*1.4):Math.max(0,(f.fk||0)-raw*2.2);const k=f.fk;if(k<=0||!f.ice)return;
 const w=f.w,h=f.h,g=cx.createRadialGradient(w/2,h/2,h*.15,w/2,h/2,h*.75);g.addColorStop(0,"rgba(190,235,255,"+.1*k+")");g.addColorStop(1,"rgba(120,200,255,"+.62*k+")");cx.fillStyle=g;cx.fillRect(0,0,w,h);
 cx.fillStyle="rgba(235,249,255,"+.85*k+")";cx.shadowColor="#9be3ff";cx.shadowBlur=10*k;
 for(const s of f.ice){const L=s.l*k;cx.beginPath();
  if(s.e==0){const x=s.p*w;cx.moveTo(x-s.w/2,0);cx.lineTo(x+s.w/2,0);cx.lineTo(x,L)}
  else if(s.e==1){const x=s.p*w;cx.moveTo(x-s.w/2,h);cx.lineTo(x+s.w/2,h);cx.lineTo(x,h-L)}
  else if(s.e==2){const y=s.p*h;cx.moveTo(0,y-s.w/2);cx.lineTo(0,y+s.w/2);cx.lineTo(L,y)}
  else{const y=s.p*h;cx.moveTo(w,y-s.w/2);cx.lineTo(w,y+s.w/2);cx.lineTo(w-L,y)}
  cx.fill()}
 cx.shadowBlur=0}

// ═══ ВВІД: екранні координати → локальні координати поля ═══
const fOf=y=>G.m==2?G.f[y<H/2?0:1]:G.f[0];
const lc=(f,e)=>{let x=e.clientX,y=f.fl?f.oy+f.h-e.clientY:e.clientY-f.oy;if(f.zm>1.001){x=f.w/2+(x-f.w/2)/f.zm;y=f.h*.5+(y-f.h*.5)/f.zm}return[x,y]};   // зворотне відображення дотику з урахуванням зуму
const dseg=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy||1;let u=((px-ax)*dx+(py-ay)*dy)/l;u=Math.max(0,Math.min(1,u));return Math.hypot(px-ax-u*dx,py-ay-u*dy)};
cv.addEventListener("pointerdown",e=>{if(!G.on)return;const f=fOf(e.clientY);if(f.dead)return;const[x,y]=lc(f,e);const tr=[{x,y,t:performance.now()}];ptr[e.pointerId]={f,x,y,tr};f.trs.push(tr)});
cv.addEventListener("pointermove",e=>{
 const p=ptr[e.pointerId];if(!p||!G.on)return;const f=p.f;if(f.dead)return;const[x,y]=lc(f,e),now=performance.now();if(x<0||x>f.w||y<0||y>f.h)return;
 p.tr.push({x,y,t:now});const d=Math.hypot(x-p.x,y-p.y);if(d<4)return;const ang=Math.atan2(y-p.y,x-p.x);
 if(f.fz){
  f.fp+=d;if(f.fp>180){f.fp=0;f.cr.push([R()*f.w,R()*f.h*.7]);f.sh=8;snd(700,.05,.1);if(f.cr.length>=5){f.fz=0;f.fa=.4;burst(f,x,y,30,"#7dd3fc");pop(f,f.w/2,f.h*.4,"💥",1);if(f.bo)f.bo.nf=now+9000}}
  p.x=x;p.y=y;return;
 }
 const hr=(1+.03*U("hit"))*(G.wide||1);
 for(const en of f.e)if(!en.cut&&dseg(en.x,en.py,p.x,p.y,x,y)<en.r*hr){cut(f,en,ang,now);if(!en.sc){if(now-(p.ct||0)>350)p.cc=0;p.ct=now;p.cc=(p.cc||0)+1;if(p.cc>=3)multi(f,p.cc,now,en)}}
 if(f.bo&&dseg(f.bx,f.by,p.x,p.y,x,y)<f.bo.r*1.3){
  const b=f.bo;
  if(now-b.last>=120){
   b.last=now;if(b.ty=="cmb"&&f.cb<3){f.cb++;f.cT=now;pop(f,f.bx,f.by,"COMBO "+f.cb+"/3");p.x=x;p.y=y;return}f.fx.push({x:f.bx,y:f.by,a:ang,l:1});b.hp-=R()<.05*U("boss")?2:1;b.hit=1;f.cb++;f.cT=now;f.sh=8;burst(f,f.bx,f.by,10,"#fff");sfx("boss",()=>snd(260,.12,.18));
   if(b.hp<=0){
    const pt=score(f,300*(1+.1*U("bossr"))+(b.ab||0)*50+Math.round(Math.max(0,b.tl)*40),now);pop(f,f.bx,f.by,"+"+pt+" 👑",1);burst(f,f.bx,f.by,50);bossBurst(f,b);track("boss_kill",{boss:b.ty,sec:Math.round(b.t)});
    f.kills++;S.kills++;S.bossWins++;S.souls+=5+U("soul");
    if(R()<.5){S.jd++;pop(f,f.bx,f.by-40,"+1 💎",1)}         // 💎 — головна нагорода за боса
    save();f.bo=null;f.fz=0;f.nb=f.cuts+14;
   }
  }
 }
 p.x=x;p.y=y;
});
["pointerup","pointercancel"].forEach(n=>cv.addEventListener(n,e=>{delete ptr[e.pointerId]}));

// ═══ СЛІД КАТАНИ ═══
const KIM={};const kimg=i=>KIM[i]||(KIM[i]=Object.assign(new Image(),{src:"img/katana/"+i+".png"}));
function drawBlade(f,bl,P,now){
 const nn=P.length,a=P[nn-1],b0=P[Math.max(0,nn-4)],dx=a.x-b0.x,dy=a.y-b0.y;if(dx*dx+dy*dy<9)return;
 const ang=Math.atan2(dy,dx),L=95+bl.r*12,age=Math.min(1,(now-a.t)/200);
 cx.save();cx.translate(a.x,a.y);cx.rotate(ang);cx.globalAlpha=1-age*.55;
 if(KATL.has(bl.i)&&rdy(kimg(bl.i))){const im=kimg(bl.i),k=L*1.9/im.naturalWidth,w=im.naturalWidth*k,h=im.naturalHeight*k;cx.drawImage(im,-w,-h/2,w,h)}
 else{
  const gr=cx.createLinearGradient(-L*1.2,0,0,0);
  if(bl.fx=="rb"){for(let i=0;i<=5;i++)gr.addColorStop(i/5,`hsl(${(now/4+i*60)%360|0},100%,60%)`)}else if(bl.fx=="void"){gr.addColorStop(0,"#000");gr.addColorStop(.7,"#07000f");gr.addColorStop(1,bl.c2)}else{gr.addColorStop(0,bl.c2);gr.addColorStop(.6,bl.c1);gr.addColorStop(1,"#fff")}
  cx.shadowColor=bl.fx=="rb"?"#f0f":bl.c2;cx.shadowBlur=10;
  cx.fillStyle=KHC[bl.r];cx.beginPath();cx.roundRect?cx.roundRect(-L*1.9,-5,L*.66,10,4):cx.rect(-L*1.9,-5,L*.66,10);cx.fill();                      // руків'я
  cx.strokeStyle="rgba(255,255,255,.3)";cx.lineWidth=1.3;cx.beginPath();for(let x=-L*1.85;x<-L*1.28;x+=9){cx.moveTo(x,-5);cx.lineTo(x+6,5);cx.moveTo(x+6,-5);cx.lineTo(x,5)}cx.stroke();
  cx.fillStyle=bl.r>2?"#ffd24a":"#c8ced8";cx.beginPath();cx.ellipse(-L*1.2,0,3.5,10,0,0,6.3);cx.fill();                                              // цуба
  cx.fillStyle=gr;cx.beginPath();cx.moveTo(-L*1.18,-4);cx.quadraticCurveTo(-L*.5,-9,5,-1);cx.quadraticCurveTo(-L*.5,3,-L*1.18,4);cx.closePath();cx.fill();    // вигнутий клинок
  cx.shadowBlur=0;cx.strokeStyle="rgba(255,255,255,.85)";cx.lineWidth=1;cx.stroke();
  cx.strokeStyle="rgba(255,255,255,.75)";cx.beginPath();cx.moveTo(-L*1.1,1.6);cx.quadraticCurveTo(-L*.5,-1.5,-L*.08,.4);cx.stroke()                                // хамон
 }
 cx.restore();cx.globalAlpha=1}
function fxPart(f,bl,q){if(f.p.length>220)return;const n=1+bl.r,fx=bl.fx;      // чим рідкісніша катана — тим більше частинок
 for(let k=0;k<n;k++){const a=R()*6.283,s=20+R()*50,o={x:q.x+(R()-.5)*8,y:q.y+(R()-.5)*8,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.9,c:bl.c1,s:3+R()*3,sh:0,rot:R()*6,vr:(R()-.5)*8,g:60};
  if(fx=="star"){o.sh="s";o.c=R()<.5?"#ffffff":R()<.5?bl.c1:"#ffe27a";o.s=4+R()*6;o.l=1.1;o.g=-10}
  else if(fx=="gold"){o.sh=R()<.6?"s":"d";o.c=R()<.5?"#fff2a0":"#ffc400";o.s=3+R()*5;o.g=30}
  else if(fx=="sakura"){o.sh="p";o.c=R()<.5?"#ffc0e0":"#ff8ab5";o.s=5+R()*4;o.vx=40+R()*40;o.g=40;o.l=1.2}
  else if(fx=="fire"){o.sh="f";o.c=R()<.5?"#ffb703":"#ff4500";o.s=5+R()*6;o.vy=-70-R()*60;o.g=-60}
  else if(fx=="ice"){o.sh="d";o.c=R()<.5?"#e8fbff":"#7dd3fc";o.s=3+R()*5;o.g=90}
  else if(fx=="bolt"){o.sh="z";o.c="#fff";o.s=8+R()*10;o.vx*=3;o.vy*=3;o.l=.35;o.g=0}
  else if(fx=="blood"){o.sh="o";o.c="#8b0000";o.s=2+R()*3;o.vy=60+R()*60;o.g=500}
  else if(fx=="jade"){o.sh="d";o.c=R()<.5?bl.c1:bl.c2;o.s=4+R()*4}
  else if(fx=="neon"){o.sh="o";o.c=R()<.5?bl.c1:bl.c2;o.s=3+R()*3;o.g=0}
  else if(fx=="void"){o.sh="o";o.c=R()<.5?"#c4b5fd":"#000";o.s=2+R()*4;o.vx*=-1;o.g=0}
  else if(fx=="rb"){o.sh="s";o.c="hsl("+(R()*360|0)+",100%,65%)";o.s=4+R()*4;o.g=0}
  else if(fx=="rain"){o.sh="l";o.rot=1.57;o.vr=0;o.c=R()<.5?"#bfe4ff":bl.c1;o.s=5+R()*6;o.vx=0;o.vy=200+R()*160;o.g=0;o.l=.5}
  else if(fx=="wind"){o.sh="l";o.rot=0;o.vr=0;o.c=R()<.5?"#ffffff":bl.c1;o.s=8+R()*12;o.vx=-120-R()*120;o.vy=(R()-.5)*20;o.g=0;o.l=.5}
  else if(fx=="paper"){o.sh="q";o.c=R()<.5?"#fff7e0":bl.c2;o.s=4+R()*4;o.g=70;o.l=1.1}
  else if(fx=="koi"){o.sh="p";o.c=R()<.5?"#ff9a3d":"#ffffff";o.s=5+R()*4;o.g=20;o.l=1.1}
  else if(fx=="music"){o.sh="t";o.ch=["♪","♫","♩","♬"][R()*4|0];o.c=R()<.5?bl.c1:bl.c2;o.s=7+R()*4;o.vy=-40-R()*30;o.g=-20;o.l=1.2}
  else if(fx=="rune"){o.sh="t";o.ch="ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃ"[R()*12|0];o.c=R()<.5?bl.c1:bl.c2;o.s=7+R()*4;o.vr=0;o.rot=0;o.g=-15;o.l=1.3}
  else if(fx=="glitch"){o.sh="q";o.c=["#00ffd5","#ff0066","#ffffff","#3355ff"][R()*4|0];o.s=3+R()*7;o.vr=0;o.rot=0;o.vx*=3;o.vy*=.3;o.g=0;o.l=.4}
  else if(fx=="moon"){o.sh="c";o.c=R()<.5?"#f0f0ff":bl.c2;o.s=5+R()*5;o.g=-10;o.l=1.1}
  else if(fx=="lava"){o.sh=R()<.5?"o":"f";o.c=R()<.5?"#ff6a00":"#ffd24a";o.s=3+R()*5;o.vy=-40-R()*80;o.g=-30}
  else if(fx=="aurora"){o.sh="o";o.c="hsl("+(130+R()*150|0)+",90%,65%)";o.s=5+R()*7;o.vy=-30-R()*30;o.g=-20;o.l=1.2}
  else if(fx=="toxic"){o.sh="o";o.c=R()<.5?"#9dff3a":"#4ade80";o.s=3+R()*5;o.vy=-30-R()*40;o.g=-30}
  else if(fx=="crystal"){o.sh="d";o.c=R()<.5?bl.c1:bl.c2;o.s=5+R()*6;o.g=50}
  else if(fx=="ghost"){o.sh="o";o.c="rgba(255,255,255,.7)";o.s=6+R()*8;o.vy=-40-R()*30;o.g=-20;o.l=1.1}
  else if(fx=="comet"){o.sh="o";o.c=R()<.3?"#ffffff":bl.c2;o.s=2+R()*5;o.vx*=.3;o.vy*=.3;o.g=0;o.l=.7}
  else if(fx=="sun"){o.sh="s";o.c=R()<.5?"#fff3b0":"#ffb300";o.s=5+R()*7;o.vr=3;o.g=0;o.l=.9}
  else if(fx=="galaxy"){o.sh=R()<.5?"s":"o";o.c=["#ffffff","#c6a3ff","#7b5cff","#ff7ad9"][R()*4|0];o.s=2+R()*6;o.g=0;o.l=1.2}
  else if(fx=="dragon"){o.sh=R()<.6?"f":"s";o.c=R()<.5?"#ff3b3b":"#ffd54a";o.s=5+R()*7;o.vy=-50-R()*50;o.g=-40}
  else{o.sh=bl.r>0?"d":0;o.c=bl.c2;o.s=2+R()*3}
  f.p.push(o)}}
function trailFill(f,bl,P,Lh,Rh,now){
 const nn=P.length;cx.beginPath();Lh.forEach((q,i)=>i?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1]));for(let i=nn-1;i>=0;i--)cx.lineTo(Rh[i][0],Rh[i][1]);cx.closePath();
 let fs,sc=bl.c2;
 if(bl.fx=="rb"){sc=fs=`hsl(${now/3%360|0},100%,60%)`}else if(bl.fx=="void")fs="#000";
 else if(bl.fx=="aurora"){sc=fs=`hsl(${140+Math.sin(now/260)*70|0},90%,62%)`}
 else{const g=cx.createLinearGradient(P[0].x,P[0].y,P[nn-1].x,P[nn-1].y);g.addColorStop(0,bl.c2);g.addColorStop(1,bl.c1);fs=g}
 cx.globalAlpha=bl.fx=="ghost"?.55:1;cx.fillStyle=fs;cx.shadowColor=sc;cx.shadowBlur=bl.fx=="void"?20:11+bl.r*4;cx.fill();
 if(bl.fx=="void"){cx.shadowBlur=0;cx.strokeStyle=bl.c2;cx.lineWidth=1.6;cx.stroke()}
 if(bl.fx=="bolt"||bl.fx=="glitch"){cx.shadowBlur=0;cx.strokeStyle="#fff";cx.lineWidth=1.4;cx.beginPath();P.forEach((q,i)=>{const jx=q.x+(R()-.5)*9,jy=q.y+(R()-.5)*9;i?cx.lineTo(jx,jy):cx.moveTo(jx,jy)});cx.stroke()}
 cx.shadowBlur=0;
}

// ═══ ОНОВЛЕННЯ І МАЛЮВАННЯ ПОЛЯ ═══
function upd(f,raw,now){
 const slow=now<f.sl,storm=now<f.st,fren=now<f.fr;f.ts+=((slow?.4:f.fz?.25:f.bo?.4:1)-f.ts)*.15;
 const dt=raw*f.ts,ed=dt*(storm?1.25:1),g=GR(f),pace=1+Math.min(.5,G.el/180),h=f.h;FLP=f.fl;const b=f.bo;if(f.ban)f.ban.l-=raw*.4;
 cx.save();cx.beginPath();cx.rect(0,f.oy,W,h);cx.clip();
 cx.translate(0,f.fl?f.oy+h:f.oy);if(f.fl)cx.scale(1,-1);          // верхній гравець: світ віддзеркалено по вертикалі
 cx.translate((R()-.5)*f.sh,(R()-.5)*f.sh);f.sh*=.85;
 f.zm+=((f.bo?1.12:1)-f.zm)*Math.min(1,raw*4);if(f.zm>1.001){cx.translate(f.w/2,h*.5);cx.scale(f.zm,f.zm);cx.translate(-f.w/2,-h*.5)}   // камера трохи «наближається» до боса
 if(f.fl){cx.save();cx.translate(0,h);cx.scale(1,-1);drawBG(f.w,h);cx.restore()}else drawBG(f.w,h);
 f.sq=f.sq.filter(q=>(q.l-=dt*.45)>0);for(const q of f.sq){cx.globalAlpha=Math.min(.55,q.l*.6);cx.fillStyle=q.c;cx.beginPath();cx.arc(q.x,q.y,q.r,0,6.3);cx.fill();for(const d of q.d){cx.beginPath();cx.arc(q.x+d[0],q.y+d[1],d[2],0,6.3);cx.fill()}}cx.globalAlpha=1;
 f.sp-=dt;
 if(f.sp<=0&&!f.dead&&!f.fz){const bt=b?b.ty:"",n=Math.min(3,1+(R()*(2+G.el/60)|0))+(bt=="swm"?3:bt=="rch"?1:0);for(let i=0;i<n;i++)setTimeout(()=>G.on&&!f.dead&&spawn(f,storm),i*240);f.sp=(1.5+R()*.9)/pace/(storm?1.6:1)/(slow?1.6:1)/(fren?1.3:1)/(1+.04*U("spawn"))}
 if(b&&b.ty=="frz"&&!f.fz&&now>b.nf)frz(f);
 if(b&&b.ty=="scr"&&now>b.ns){b.ns=now+1800;spawn(f,0,1)}
 if(b&&b.ty=="bh"&&f.bx!=null)for(const e of f.e){if(e.cut)continue;const dx=f.bx-e.x,dy=f.by-e.py,d=Math.hypot(dx,dy)||1;e.vx+=dx/d*1100*dt;e.vy+=dy/d*1100*dt;if(d<b.r*.8){e.cut=1;b.ab++;pop(f,f.bx,f.by-b.r,"🕳 ×"+b.ab);burst(f,f.bx,f.by,6,"#c4b5fd")}}
 const ne=[];
 for(const e of f.e){const gb=b?(b.ty=="lgt"?.45:b.ty=="hvy"?1.8:1):1;
  e.vy+=g*gb*ed;if(b&&b.ty=="wnd")e.vx+=Math.sin(b.t*1.4)*260*ed;e.x+=e.vx*ed;e.py+=e.vy*ed;e.rot+=e.vr*ed;
  if(f.fz){e.py-=70*raw;if(e.py<-140)continue}                                   // заморожені йокаї повільно відлітають
  if(!e.cut){cx.save();if(b&&b.ty=="inv")cx.globalAlpha=.12+.88*Math.abs(Math.sin(now/260+e.x*.02));if(f.fz)cx.globalAlpha=.8;cx.translate(e.x,e.py);cx.rotate(e.rot);sp(cx,b&&b.ty=="cha"&&e.sc?e.dg:e.y,e.r);cx.restore()}
  if(e.cut)continue;
  if(e.vy>0&&e.py>h+110){if(!e.sc&&!f.fz&&!f.dead)missed(f,e.x);continue}
  ne.push(e)}
 f.e=ne;
 f.hv=f.hv.filter(q=>{q.vy+=g*dt;q.x+=q.vx*dt;q.py+=q.vy*dt;q.rot+=q.vr*dt;q.l-=dt;if(q.l<=0||q.py>h+200)return false;cx.save();cx.globalAlpha=Math.min(1,q.l);cx.translate(q.x,q.py);cx.rotate(q.rot);cx.rotate(q.cl);cx.beginPath();if(q.qd!=null)cx.rect(q.qd&1?0:-q.r*2,q.qd&2?0:-q.r*2,q.r*2,q.r*2);else cx.rect(-q.r*2,q.s>0?0:-q.r*2,q.r*4,q.r*2);cx.clip();cx.rotate(-q.cl);q.bt?sprB(cx,{ty:q.bt,r:q.r,y:q.y},1):sp(cx,q.y,q.r);cx.restore();return true});
 f.bs=f.bs.filter(s=>{s.t+=dt*1.2;if(s.t>=1)return false;const pr=Math.min(1,s.t*4),len=420*pr,w=26*(1-s.t*.85);   // кривава смуга: росте, тоншає й зникає
  cx.save();cx.translate(s.x,s.y);cx.rotate(s.a);cx.globalAlpha=Math.max(0,1-s.t*1.1)*.9;cx.lineCap="round";
  cx.strokeStyle="#7f1d1d";cx.lineWidth=w;cx.beginPath();cx.moveTo(0,0);cx.lineTo(len,0);cx.stroke();
  cx.strokeStyle="#dc2626";cx.lineWidth=w*.45;cx.beginPath();cx.moveTo(0,0);cx.lineTo(len*.92,0);cx.stroke();
  for(const o of[-1,1]){cx.lineWidth=w*.18;cx.strokeStyle="#991b1b";cx.beginPath();cx.moveTo(len*.1,o*w*.7);cx.lineTo(len*.8,o*w*.9);cx.stroke()}
  cx.restore();return true});
 if(b){b.t+=dt;b.r=b.r0;if(!f.fz){b.tl-=raw;if(b.tl<=0&&!b.gone)bossFlee(f,b)}   // 5 секунд реального часу (під час льоду таймер стоїть)
 if(b.t>25&&!f.fz){b.dec=(b.dec||0)+dt;if(b.dec>5){b.dec=0;b.hp=Math.max(1,b.hp-1)}}
  if(b.ty=="shd"){b.tp-=dt;if(b.tp<=0){b.tp=1.1;b.tx=f.w*(.2+R()*.6);b.ty2=h*(.3+R()*.3);burst(f,f.bx,f.by,10,"#8b5cf6")}f.bx+=(b.tx-f.bx)*Math.min(1,dt*9);f.by+=(b.ty2-f.by)*Math.min(1,dt*9);
   b.hs=(b.hs||0)-dt;if(b.hs<=0){b.hs=.05;b.hist.push([f.bx,f.by]);if(b.hist.length>6)b.hist.shift()}}
  else{f.bx=f.w/2+Math.sin(b.t*1.3)*f.w*.2;f.by=(f.fl?h*.4:Math.max(h*.4,(f.oy?0:SAT)+200))+Math.sin(b.t*2)*10}
  bfx(f,b,now,dt,h)}
 for(const p of f.p){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g==null?400:p.g)*dt;p.rot=(p.rot||0)+(p.vr||0)*dt;p.l-=dt*1.6}
 f.p=f.p.filter(p=>p.l>0);
 for(const p of f.p){cx.globalAlpha=Math.max(0,Math.min(1,p.l));cx.fillStyle=p.c;
  if(!p.sh){cx.fillRect(p.x-1.5,p.y-1.5,3,3);continue}
  if(p.sh=="b"){const aa=Math.atan2(p.vy,p.vx);cx.fillStyle=p.c;cx.save();cx.translate(p.x,p.y);cx.rotate(aa);cx.beginPath();cx.arc(0,0,p.s,-Math.PI/2,Math.PI/2);cx.lineTo(-p.s*3,0);cx.closePath();cx.fill();cx.restore();continue}
  if(p.sh=="v"){cx.strokeStyle=p.c;cx.lineCap="round";cx.lineWidth=p.s;cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(p.x-p.vx*.05,p.y-p.vy*.05);cx.stroke();cx.fillStyle=p.c;cx.beginPath();cx.arc(p.x,p.y,p.s*.75,0,6.3);cx.fill();continue}
  const s=p.s||3;cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot||0);cx.beginPath();
  if(p.sh=="s"){for(let i=0;i<10;i++){const r=i%2?s*.45:s,a=i*Math.PI/5-Math.PI/2;cx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}cx.closePath();cx.fill()}
  else if(p.sh=="d"){cx.moveTo(0,-s);cx.lineTo(s*.6,0);cx.lineTo(0,s);cx.lineTo(-s*.6,0);cx.closePath();cx.fill()}
  else if(p.sh=="p"){cx.ellipse(0,0,s,s*.55,0,0,6.3);cx.fill()}
  else if(p.sh=="f"){cx.moveTo(0,-s*1.3);cx.quadraticCurveTo(s,0,0,s);cx.quadraticCurveTo(-s,0,0,-s*1.3);cx.fill()}
  else if(p.sh=="z"){cx.strokeStyle=p.c;cx.lineWidth=1.6;cx.moveTo(-s,0);cx.lineTo(-s/3,-s/3);cx.lineTo(s/3,s/3);cx.lineTo(s,0);cx.stroke()}
  else if(p.sh=="l"){cx.strokeStyle=p.c;cx.lineWidth=1.5;cx.moveTo(-s,0);cx.lineTo(s,0);cx.stroke()}
  else if(p.sh=="t"){cx.font=s*2+"px serif";cx.textAlign="center";cx.fillText(p.ch,0,s*.6)}
  else if(p.sh=="c"){cx.arc(0,0,s,Math.PI*.5,Math.PI*1.5);cx.arc(s*.45,0,s*.9,Math.PI*1.5,Math.PI*.5,true);cx.fill()}
  else if(p.sh=="q"){cx.fillRect(-s/2,-s/2,s,s)}
  else{cx.arc(0,0,s,0,6.3);cx.fill()}
  cx.restore()}cx.globalAlpha=1;
 f.x=f.x.filter(q=>{q.y-=50*dt;q.l-=dt*1.2;if(q.l<=0)return false;cx.save();cx.globalAlpha=Math.min(1,q.l);cx.translate(q.x,q.y);if(f.fl)cx.scale(1,-1);cx.fillStyle="#ffb703";cx.font=`800 ${q.big?30:19}px system-ui`;cx.textAlign="center";rich(cx,q.s,0,0,q.big?30:19);cx.restore();return true});
 const bl=BL[S.blade];f.fx.length=0;                          // лінію розрізу не малюємо
 f.trs.forEach(tr=>{while(tr.length&&now-tr[0].t>=200)tr.shift()});
 f.trs=f.trs.filter(tr=>tr.length||Object.values(ptr).some(p=>p.tr===tr));
 for(const P of f.trs){const nn=P.length;if(nn<3||f.dead)continue;const Lh=[],Rh=[];            // окремий слід для кожного пальця (1–10)
  for(let i=0;i<nn;i++){const a0=P[Math.max(0,i-1)],b0=P[Math.min(nn-1,i+1)];let dx=b0.x-a0.x,dy=b0.y-a0.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const wd=bl.w*2.2*Math.sin(Math.PI*i/(nn-1))*Math.max(0,1-(now-P[i].t)/200)+.4;Lh.push([P[i].x-dy*wd,P[i].y+dx*wd]);Rh.push([P[i].x+dy*wd,P[i].y-dx*wd])}
  trailFill(f,bl,P,Lh,Rh,now);cx.globalAlpha=1;if(R()<.6)fxPart(f,bl,P[nn-1]);
 }
 frost(f,raw);
 if(slow){const v=cx.createRadialGradient(f.w/2,h/2,h*.25,f.w/2,h/2,h*.8);v.addColorStop(0,"#0000");v.addColorStop(1,"rgba(120,60,220,.4)");cx.fillStyle=v;cx.fillRect(0,0,f.w,h)}
 if(f.fz){cx.strokeStyle="#fff";cx.lineWidth=3;f.cr.forEach(c=>{cx.beginPath();cx.moveTo(c[0],c[1]);cx.lineTo(c[0]+60,c[1]+90);cx.lineTo(c[0]-20,c[1]+160);cx.stroke()})}
 if(f.bl.length){cx.fillStyle="rgba(150,0,16,.34)";
  for(const o of f.bl)for(const q of o.q){cx.beginPath();cx.arc(o.x+q[0],o.y+q[1],q[2],0,6.3);cx.fill()}
  cx.strokeStyle="rgba(120,0,12,.5)";cx.lineCap="round";
  for(const d of f.dr){if(d.l<d.m)d.l+=d.v*dt;cx.lineWidth=d.w;cx.beginPath();cx.moveTo(d.x,d.y);cx.lineTo(d.x,d.y+d.l);cx.stroke()}
  if(f.sk>=3){f.bc=Math.min(.88,f.bc+dt*1.3);cx.fillStyle=`rgba(105,0,10,${f.bc})`;cx.fillRect(0,0,f.w,h)}}
 if(b&&!b.gone)drawBoss(f,b,dt,now);              // бос малюється ОСТАННІМ — жоден ефект його не перекриває
 if(f.fa>0){cx.fillStyle="rgba(255,255,255,"+f.fa*.4+")";cx.fillRect(-20,-20,f.w+40,h+40);f.fa-=raw*3}
 cx.restore();
 cx.save();cx.beginPath();cx.rect(0,f.oy,W,h);cx.clip();hud(f,now);cx.restore();   // HUD малюється поверх у екранних координатах
}
function hud(f,now){
 const duo=G.m==2;cx.save();if(duo&&f.fl){cx.translate(W/2,H/2);cx.rotate(Math.PI);cx.translate(-W/2,-H/2)}   // дуо: лічильники біля центру, у верхнього — догори ногами
 const T=duo?H/2+8:f.oy+SAT+10,w=f.w,b=f.bo,fs=f.h<420?27:38,ls=f.h<420?15:19,slow=now<f.sl,fren=now<f.fr,storm=now<f.st;
 cx.fillStyle="#fff";cx.textAlign="center";cx.font=`900 ${fs}px system-ui`;cx.fillText(fmt(f.sc),w/2,T+44);
 const ly=T+74;cx.font=`800 ${ls}px system-ui`;
 for(let i=0;i<f.mx;i++){cx.globalAlpha=i<f.ms?1:.3;cx.fillStyle=i<f.ms?"#ff2a5f":"#fff";rich(cx,"✖",w/2-14-(f.mx-1-i)*(ls+3),ly,ls)}
 for(let i=0;i<3;i++){cx.globalAlpha=i<f.sk?1:.3;rich(cx,"📜",w/2+16+i*(ls+5),ly,ls)}
 cx.globalAlpha=1;
 const st=[f.cb>2?"COMBO ×"+f.cb:"",slow?"⏳ SLOW ×2":"",fren?"⚡ FRENZY ×2":"",storm?"🌪 STORM":"",now<f.dbl?"💰 ×2":"",f.fz?"❄️ "+t("РОЗБИЙ ЛІД! Свайпай|BREAK THE ICE! Swipe")+" "+f.cr.length+"/5":""].filter(Boolean).join("  ");
 cx.fillStyle="#ff2a5f";cx.font="800 13px system-ui";rich(cx,st,w/2,T+98,13);
 if(f.ban&&f.ban.l>0){cx.globalAlpha=Math.min(1,f.ban.l*1.5);cx.fillStyle="#fff";cx.font="900 18px system-ui";rich(cx,f.ban.s,w/2,T+160,18);cx.font="600 12px system-ui";cx.fillStyle="#ffd27a";cx.fillText(f.ban.d,w/2,T+180);cx.globalAlpha=1}
 if(b){const bw=w*.6,bx=(w-bw)/2,by=T+112;cx.fillStyle="#272235";cx.fillRect(bx,by,bw,8);cx.fillStyle=BCOL[b.ty];cx.fillRect(bx,by,bw*Math.max(0,b.hp)/b.mh,8);
  cx.fillStyle="#fff";cx.font="bold 11px system-ui";rich(cx,t(BNAME[b.ty])+" "+Math.max(0,b.hp)+"/"+b.mh,w/2,by+24,11);cx.fillStyle="#272235";cx.fillRect(bx,by+32,bw,5);cx.fillStyle=b.tl<2?"#ff2a5f":"#ffb703";cx.fillRect(bx,by+32,bw*Math.max(0,b.tl)/5,5);cx.fillStyle="#fff";cx.font="bold 11px system-ui";cx.fillText(Math.max(0,b.tl).toFixed(1)+" "+t("с|s"),w/2,by+52)}

 cx.restore();
 if(f.dead&&duo){cx.fillStyle="rgba(0,0,0,.5)";cx.fillRect(0,f.oy,W,f.h);cx.fillStyle="#ff2a5f";cx.textAlign="center";cx.font="900 32px system-ui";cx.fillText("K.O.",W/2,f.oy+f.h/2)}
}
function frame(now){if(!G.on)return;const raw=Math.min(.033,(now-G.l)/1000);G.l=now;if(!G.fin)G.el+=raw;G.f.forEach(f=>upd(f,raw,now));
 if(G.m==2){cx.fillStyle="#ffb703";cx.shadowColor="#ff2a5f";cx.shadowBlur=10;cx.fillRect(0,H/2-1.5,W,3);cx.shadowBlur=0}
 requestAnimationFrame(frame)}

// ═══ КІНЕЦЬ РАУНДУ, ДУШІ 1–3, РЕКЛАМА ═══
function overScreen(){
 if(!G.on)return;track("game_over",{why:G.f[0].why,sec:Math.round(G.el),score:G.f[0].sc,mode:G.m});
 const sc=G.f.map(f=>f.sc),solo=G.m==1,why=G.f[0].why,rv=G.rv||0;
 const w=solo?t("Кінець гри|Game over"):sc[0]==sc[1]?t("Нічия!|Draw!"):`🏆 P${sc[0]>sc[1]?1:2} ${t("перемагає|wins")}`;
 $("res").innerHTML=`<h2 class="text-3xl font-black text-neonGold" style="animation:pop .4s">${w}</h2><div class="text-5xl font-black font-mono">${sc.map(fmt).join(" : ")}</div>${solo?`<div class="text-sm text-gray-200">${why=="sk"?"📜 "+t("3 свитки розрізано|3 scrolls cut"):"✖ "+t("Пропущено йокаїв|Yokai missed")}</div><div class="text-[11px] text-gray-300">${t("Життя відновлюється лише за рекламу. Очки й бустери збережуться.|Lives come back only via an ad. Score and boosts are kept.")}</div>
 <button onclick="adLife()" ${rv>=3?"disabled":""} class="btng w-full max-w-xs py-3 glow">📺 ${t("Продовжити: +1 життя|Continue: +1 life")} (${rv}/3)</button>`:""}
 <button onclick="fin(2)" class="btng w-full max-w-xs py-3">📺 ${t("Реклама: ×2 монет|Ad: ×2 coins")}</button>
 <button onclick="fin(1)" class="btn w-full max-w-xs py-3">${t("Завершити|Finish")}</button>`;
 $("res").classList.replace("hidden","flex");
}
function adLife(){if((G.rv||0)>=3||!G.on)return;ad("❤️ "+t("Реклама → +1 життя|Ad → +1 life"),()=>{G.rv=(G.rv||0)+1;revive(1)},"❤️",0)}
function revive(n){
 const f=G.f[0];f.ms=Math.max(0,f.mx-n);f.sk=Math.max(0,3-n);f.bl=[];f.dr=[];f.bc=0;       // очки й комбо лишаються
 f.dead=0;f.why="";f.e=[];f.sp=1.5;G.fin=0;save();hdr();$("res").classList.replace("flex","hidden");
}
function fin(m){if(m==2)ad(CFG.promo.text,()=>endRound(2),"×2 文");else endRound(1)}
function endRound(mult){
 G.on=0;addPlay(G.el);ptr={};setMusic("menu");$("res").classList.replace("flex","hidden");
 const sc=G.f.map(f=>f.sc),bi=sc.indexOf(Math.max(...sc)),best=sc[bi],ex=G.f[bi].ex;S.rounds++;
 let m=mult||1;if(S.c.x2>0){m*=2;S.c.x2--}if(S.c.x3>0){m*=3;S.c.x3--}
 const coins=Math.round((best+ex)*COIN_K*(1+.03*U("end"))*(G.mb||1)*(shogunNight()?2:1))*m;
 const ln=G.lx?2:R()<.03?1:0;                                               // 🏮 рідко; бустер «×2 ліхтарі» гарантує 2
 track("round_end",{score:best,sec:Math.round(G.el),mode:G.m,revives:G.rv||0,bosses:G.f.reduce((s,f)=>s+f.kills,0)});S.mon+=coins;S.xp+=best;S.ln+=ln;if(G.sx)S.souls++;save();push();
 G.res={sc,coins,m,ln,bc:R()<.05+.02*G.f.reduce((s,f)=>s+f.kills,0)+(G.lk?.2:0)};       // шанс сундука-знахідки
 if(S.rounds%CFG.adEvery==0)ad(CFG.promo.text,showRes,"",1);else showRes();
}
function showRes(){
 const{sc,coins,m,ln,bc}=G.res;
 $("res").innerHTML=`<h2 class="text-3xl font-black text-neonGold" style="animation:pop .4s">${t("Раунд завершено|Round over")}</h2><div class="text-5xl font-black font-mono">${sc.map(fmt).join(" : ")}</div><div class="text-xl">+${fmt(coins)} 文 ${m>1?"(×"+m+")":""}</div>${shogunNight()?`<div class="text-sm text-neonGold">🌙 ${t("Ніч Сьогуна: монети ×2|Shogun's Night: coins ×2")}</div>`:""}${ln?`<div class="text-sm text-gray-300">+${ln} 🏮</div>`:""}${G.sx?`<div class="text-sm text-gray-300">+1 ⛩️</div>`:""}${bc?`<button onclick="bonus()" class="btng w-full max-w-xs py-3 glow">🎁 ${t("Знайдено сундук! Відкрити|Chest found! Open")}</button>`:""}<button onclick="startRound(${G.m})" class="btng w-full max-w-xs py-3">${t("Ще раз|Again")}</button><button onclick="quitRound()" class="btn w-full max-w-xs py-3">${t("Закрити|Close")}</button>`;
 $("res").classList.replace("hidden","flex");hdr();
}
