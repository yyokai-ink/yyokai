/* INKAI game.js — головний екран, раунд (canvas), дуо зверху/знизу, боси, душі 1–3, бустери старту
   ДУО: екран ділиться ГОРИЗОНТАЛЬНО. Верхній гравець: ёкаї летять від верхнього краю й падають угору, HUD вгорі.
   Нижній — як у соло. Усе моделюється в локальних координатах поля (flip = віддзеркалення по вертикалі). */

const cv=$("cv"),cx=cv.getContext("2d",{alpha:false});let W,H,D=1,SAT=0,G={on:0},ptr={},bgC=null,FLP=0;
function rs(){D=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*D;cv.height=H*D;cx.setTransform(D,0,0,D,0,0);SAT=$("sat").offsetHeight;bgC=null}
addEventListener("resize",()=>{if(!$("gm").classList.contains("hidden"))rs()});
const GR=f=>f.h*1.05*(1-.02*U("slow"))*(G.gs||1);                           // 🔧 гравітація

// ═══ ГОЛОВНИЙ ЕКРАН ═══
function rPlay(){
 const b=BL[S.blade],g=BG[S.bg],left=CFG.adEvery-S.rounds%CFG.adEvery,rate=idleRate();
 const chips=BS.filter(x=>x[0]!="chg"&&(S.c[x[0]]||0)>0).map(x=>`<span class="chip text-neonGold">${x[1]} ×${S.c[x[0]]}</span>`).join("");
 $("view-play").innerHTML=`
 <div class="grid grid-cols-2 gap-3">
  <button onclick="startRound(1)" class="btng py-4 text-sm shadow-[0_0_24px_rgba(255,183,3,.3)]">⚔️ ${t("ГРАТИ|PLAY")}</button>
  <button onclick="startRound(2)" class="btn py-4 text-sm shadow-[0_0_24px_rgba(255,42,95,.3)]">👥 ${t("ГРАТИ ВДВОХ|PLAY DUO")}</button>
 </div>
 <div class="relative card overflow-hidden !p-6 space-y-3 text-center border-crimsonRed/40" style="background:rgba(19,17,24,.82)">
  <div class="relative z-10 space-y-2">
   <div class="w-20 h-20 mx-auto rounded-2xl overflow-hidden flex items-center justify-center text-5xl glow" style="border:2px solid #ffb703">${avHTML(S.av)}</div>
   <div class="font-black">${esc(S.nick||t("Гість|Guest"))} · Lv ${lvl(S.xp)}</div>
   <div class="text-[11px] text-gray-200">${t(g.nm)} · ${FXI[b.fx]} ${bname(b)}</div>${bar(b)}
  </div>
  <div class="relative z-10 flex justify-center gap-2 flex-wrap">${chips}${rate?`<span class="chip text-emerald-400">💤 +${fmt(rate)} 文/${t("с|s")}</span>`:""}</div>
 </div>
 <div class="card text-xs text-gray-300 space-y-1" style="background:rgba(19,17,24,.82)">
  <div>❌ ${t("3 пропущені ёкаї — кінець гри (життя відновлюється лише за рекламу)|3 missed yokai — game over (lives come back only via an ad)")}</div>
  <div>📜 ${t("Не ріж свитки! 3 свитки — кінець гри|Don't cut the scrolls! 3 scrolls — game over")}</div>
  <div>👥 ${t("Дуо: екран ділиться навпіл — один гравець зверху, другий знизу|Duo: screen splits in half — one player on top, one at the bottom")}</div>
  <div>📣 ${t("Реклама через раундів|Ad in rounds")}: <b>${left}</b></div>
 </div>`;
}

// ═══ ПОЛЕ ГРАВЦЯ ═══
const ambient=(w,h)=>Array.from({length:6},()=>({y:YK[R()*6|0],r:30+R()*40,x:R()*w,py:R()*h,vx:(R()-.5)*14,vy:-(6+R()*14),rot:R()*6,vr:(R()-.5)*.4}));
const mkF=(oy,h,fl)=>({oy,h,fl,w:W,fx:[],e:[],hv:[],p:[],x:[],trs:[],sc:30*U("start"),ex:0,cb:0,cT:0,cuts:0,nb:12,bo:null,sp:1,fz:0,cr:[],fp:0,sl:0,st:0,fr:0,sh:0,fa:0,ts:1,kills:0,
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
 let dd=0;if(c.m30>0){c.m30--;dd=30000}else if(c.m10>0){c.m10--;dd=10000}
 if(dd)F(f=>f.dbl=nw+dd);
 if(c.bh0>0){c.bh0--;F(f=>{mkBoss(f,nw,"bh");f.bo.hp=f.bo.mh=6;setTimeout(()=>{if(f.bo&&f.bo.ty=="bh")f.bo=null},6000)})}
 if(c.br>0){c.br--;F(f=>{for(let i=0;i<8;i++)setTimeout(()=>{if(!G.on||f.dead)return;const x=f.w*(.1+.8*i/7),h=f.h*(.3+.25*Math.sin(Math.PI*i/7)),r=38;f.e.push({y:YK[i%6],sc:0,r,x,py:f.h+r,vx:0,vy:-Math.sqrt(2*GR(f)*h),rot:0,vr:0,cut:0})},i*180)})}
 save();snd(300,.2);setMusic("battle");adTick();requestAnimationFrame(frame);
}
function quitRound(){G.on=0;ptr={};setMusic("menu");$("gm").classList.add("hidden");adTick();rend()}
function sp(c,y,r){
 const i=YIMG[y];if(FLP)c.scale(1,-1);
 if(rdy(i)){const k=Math.min(2*r/i.naturalWidth,2*r/i.naturalHeight)*1.15,w=i.naturalWidth*k,h=i.naturalHeight*k;c.drawImage(i,-w/2,-h/2,w,h)}
 else{c.font=r*1.7+"px serif";c.textAlign="center";c.textBaseline="middle";c.fillText(y,0,r*.08)}
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
function burst(f,x,y,n,c){if(f.p.length>140)return;for(let i=0;i<n;i++){const a=R()*6.283,s=120+R()*380;f.p.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,c:c||(R()<.5?"#ffb703":"#ff2a5f")})}}
const pop=(f,x,y,s,big)=>f.x.push({x,y,s,l:1,big});
function spawn(f,st,fs){
 const bt=f.bo?f.bo.ty:"",sc=fs||(bt=="nos"?false:R()<Math.min(.2,.06+G.el/800)),sw=bt=="swm",r=sw?20+R()*10:34+R()*16,x=f.w*(.15+R()*.7),h=f.h*(.5+R()*.25),g=GR(f);
 const vx=(f.w/2-x)*(.15+R()*.3)*(sw?2:1),vy=-Math.sqrt(2*g*h)*(st?1.1:1),vr=(R()-.5)*4,y=sc?"📜":YK[R()*6|0],dg=YK[R()*6|0];
 f.e.push({y,dg,sc,r,x,py:f.h+r,vx,vy,rot:0,vr,cut:0});
 if(bt=="mir")f.e.push({y,dg,sc,r,x:f.w-x,py:f.h+r,vx:-vx,vy,rot:0,vr:-vr,cut:0});     // дзеркальна пара
}
function score(f,base,now){
 const b=BL[S.blade];let m=(1+f.cb*(.2+.02*U("combo")))*b.sc*(1+.1*U("coin"))*(now<f.fr?2:1)*(now<f.sl?2:1)*(now<f.st?1.5:1);
 if(R()<.03*U("crit"))m*=3+.2*U("critm");
 if(R()<.02*U("x2"))m*=2;
 const bt=f.bo?f.bo.ty:"";if(bt=="rch")m*=3;else if(bt=="nos")m*=1.5;
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
function cut(f,e,ang,now){
 if(e.sc)return hitScroll(f,e,ang);
 e.cut=1;f.fx.push({x:e.x,y:e.py,a:ang,l:1});
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
 frz:["❄️ Крижаний Цар|❄️ Ice Tsar","#7dd3fc",10,"Екран замерзає, ёкаї повільно відлітають. Розбий лід свайпами|Screen freezes, yokai drift away. Swipe to shatter the ice"],
 slo:["⏳ Володар Часу|⏳ Time Lord","#c084fc",10,"Час сповільнюється, очки ×2|Time slows, score ×2"],
 sto:["🌪 Бог Шторму|🌪 Storm God","#fb923c",10,"Усе летить швидше, очки ×1.5|Everything faster, score ×1.5"],
 bh:["🕳 Чорна Діра|🕳 Black Hole","#8b5cf6",10,"Засмоктує ёкаїв — очки за кожного|Sucks yokai in — points for each"],
 scr:["📜 Свиткопад|📜 Scroll Rain","#ef4444",8,"На екран сиплються свитки!|Scrolls rain down!"],
 gld:["🌟 Золотий Ёкай|🌟 Golden Yokai","#facc15",10,"9 секунд шаленства ×2|9 seconds of ×2 frenzy"],
 nos:["🕊 Мирний Дух|🕊 Peace Spirit","#a7f3d0",8,"Свитків немає, очки ×1.5|No scrolls, score ×1.5"],
 mir:["🪞 Дзеркальний Они|🪞 Mirror Oni","#e5e7eb",10,"Ёкаї летять дзеркальними парами|Yokai fly in mirrored pairs"],
 swm:["🐝 Рій Тенгу|🐝 Tengu Swarm","#fbbf24",10,"Купа дрібних швидких ёкаїв|A swarm of tiny fast yokai"],
 inv:["👻 Невидимка|👻 Invisible","#94a3b8",10,"Ёкаї мерехтять і зникають|Yokai flicker and fade"],
 lgt:["🎈 Повітряний|🎈 Airborne","#f9a8d4",10,"Ёкаї ширяють довше|Yokai float for longer"],
 hvy:["🪨 Кам'яний Голем|🪨 Stone Golem","#a8a29e",10,"Ёкаї падають важко й швидко|Yokai fall heavy and fast"],
 spl:["🧬 Розщеплювач|🧬 Splitter","#34d399",10,"Розрізані ёкаї діляться надвоє|Cut yokai split in two"],
 shd:["🥷 Тінь-ніндзя|🥷 Shadow Ninja","#6366f1",6,"Бос телепортується|The boss teleports"],
 hea:["💚 Цілитель|💚 Healer","#4ade80",8,"Лікується, коли ти пропускаєш ёкая|Heals when you miss a yokai"],
 rch:["🪙 Золотий Дощ|🪙 Gold Rain","#fcd34d",10,"Очки ×3, але ёкаї летять густо|Score ×3, but dense waves"],
 wnd:["🍃 Володар Вітру|🍃 Wind Lord","#67e8f9",10,"Вітер зносить ёкаїв убік|Wind blows yokai sideways"],
 cha:["🦎 Хамелеон|🦎 Chameleon","#a3e635",10,"Свитки маскуються під ёкаїв!|Scrolls disguise as yokai!"],
 cmb:["🔗 Майстер Комбо|🔗 Combo Master","#fb7185",8,"Ранять лише удари з комбо ≥ 5|Only hits with combo ≥ 5 hurt"],
 vmp:["🧛 Вампір|🧛 Vampire","#be123c",10,"За кожного пропущеного краде 25 очок|Steals 25 points per miss"]
};
const BCOL={},BNAME={};for(const k in BOSS){BCOL[k]=BOSS[k][1];BNAME[k]=BOSS[k][0]}
function mkBoss(f,now,force){
 const ks=Object.keys(BOSS),ty=force||ks[R()*ks.length|0],B=BOSS[ty];
 f.bo={y:YK[R()*6|0],ty,hp:B[2],mh:B[2],t:0,hit:0,last:0,r:Math.min(f.w,f.h)*.14,nf:now+9000,ab:0,ns:now+1500,tp:0,tx:f.w/2,ty2:f.h*.4};
 f.bx=f.w/2;f.by=f.h*.4;pop(f,f.w/2,f.h*.3,"BOSS!",1);f.ban={s:t(B[0]),d:t(B[3]),l:1};f.fa=.4;snd(120,.4,.2);
 if(ty=="frz")frz(f);if(ty=="slo")f.sl=now+7000;if(ty=="sto")f.st=now+8000;if(ty=="gld")f.fr=Math.max(f.fr,now+9000);
}
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
const lc=(f,e)=>[e.clientX,f.fl?f.oy+f.h-e.clientY:e.clientY-f.oy];
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
 for(const en of f.e)if(!en.cut&&dseg(en.x,en.py,p.x,p.y,x,y)<en.r*hr)cut(f,en,ang,now);
 if(f.bo&&dseg(f.bx,f.by,p.x,p.y,x,y)<f.bo.r){
  const b=f.bo;
  if(now-b.last>=120){
   b.last=now;if(b.ty=="cmb"&&f.cb<5){pop(f,f.bx,f.by,"COMBO ×5!");p.x=x;p.y=y;return}f.fx.push({x:f.bx,y:f.by,a:ang,l:1});b.hp-=R()<.05*U("boss")?2:1;b.hit=1;f.sh=8;burst(f,f.bx,f.by,10,"#fff");sfx("boss",()=>snd(260,.12,.18));
   if(b.hp<=0){
    const pt=score(f,300*(1+.1*U("bossr"))+(b.ab||0)*50,now);pop(f,f.bx,f.by,"+"+pt+" 👑",1);burst(f,f.bx,f.by,50);
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
 const slow=now<f.sl,storm=now<f.st,fren=now<f.fr;f.ts+=((slow?.4:f.fz?.25:1)-f.ts)*.15;
 const dt=raw*f.ts,ed=dt*(storm?1.25:1),g=GR(f),pace=1+Math.min(.5,G.el/180),h=f.h;FLP=f.fl;const b=f.bo;if(f.ban)f.ban.l-=raw*.4;
 cx.save();cx.beginPath();cx.rect(0,f.oy,W,h);cx.clip();
 cx.translate(0,f.fl?f.oy+h:f.oy);if(f.fl)cx.scale(1,-1);          // верхній гравець: світ віддзеркалено по вертикалі
 cx.translate((R()-.5)*f.sh,(R()-.5)*f.sh);f.sh*=.85;
 if(f.fl){cx.save();cx.translate(0,h);cx.scale(1,-1);drawBG(f.w,h);cx.restore()}else drawBG(f.w,h);
 f.sp-=dt;
 if(f.sp<=0&&!f.dead&&!f.fz){const bt=b?b.ty:"",n=Math.min(3,1+(R()*(2+G.el/60)|0))+(bt=="swm"?3:bt=="rch"?1:0);for(let i=0;i<n;i++)setTimeout(()=>G.on&&!f.dead&&spawn(f,storm),i*240);f.sp=(1.5+R()*.9)/pace/(storm?1.6:1)/(slow?1.6:1)/(fren?1.3:1)/(1+.04*U("spawn"))}
 if(b&&b.ty=="frz"&&!f.fz&&now>b.nf)frz(f);
 if(b&&b.ty=="scr"&&now>b.ns){b.ns=now+1800;spawn(f,0,1)}
 if(b&&b.ty=="bh"&&f.bx!=null)for(const e of f.e){if(e.cut)continue;const dx=f.bx-e.x,dy=f.by-e.py,d=Math.hypot(dx,dy)||1;e.vx+=dx/d*1100*dt;e.vy+=dy/d*1100*dt;if(d<b.r*.8){e.cut=1;b.ab++;pop(f,f.bx,f.by-b.r,"🕳 ×"+b.ab);burst(f,f.bx,f.by,6,"#c4b5fd")}}
 const ne=[];
 for(const e of f.e){const gb=b?(b.ty=="lgt"?.45:b.ty=="hvy"?1.8:1):1;
  e.vy+=g*gb*ed;if(b&&b.ty=="wnd")e.vx+=Math.sin(b.t*1.4)*260*ed;e.x+=e.vx*ed;e.py+=e.vy*ed;e.rot+=e.vr*ed;
  if(f.fz){e.py-=70*raw;if(e.py<-140)continue}                                   // заморожені ёкаї повільно відлітають
  if(!e.cut){cx.save();if(b&&b.ty=="inv")cx.globalAlpha=.12+.88*Math.abs(Math.sin(now/260+e.x*.02));if(f.fz)cx.globalAlpha=.8;cx.translate(e.x,e.py);cx.rotate(e.rot);sp(cx,b&&b.ty=="cha"&&e.sc?e.dg:e.y,e.r);cx.restore()}
  if(e.cut)continue;
  if(e.vy>0&&e.py>h+110){if(!e.sc&&!f.fz&&!f.dead)missed(f,e.x);continue}
  ne.push(e)}
 f.e=ne;
 f.hv=f.hv.filter(q=>{q.vy+=g*dt;q.x+=q.vx*dt;q.py+=q.vy*dt;q.rot+=q.vr*dt;q.l-=dt;if(q.l<=0||q.py>h+200)return false;cx.save();cx.globalAlpha=Math.min(1,q.l);cx.translate(q.x,q.py);cx.rotate(q.rot);cx.rotate(q.cl);cx.beginPath();cx.rect(-q.r*2,q.s>0?0:-q.r*2,q.r*4,q.r*2);cx.clip();cx.rotate(-q.cl);sp(cx,q.y,q.r);cx.restore();return true});
 if(b){
  b.t+=dt;
  if(b.ty=="shd"){b.tp-=dt;if(b.tp<=0){b.tp=1.1;b.tx=f.w*(.2+R()*.6);b.ty2=h*(.3+R()*.3);burst(f,f.bx,f.by,10,"#8b5cf6")}f.bx+=(b.tx-f.bx)*Math.min(1,dt*9);f.by+=(b.ty2-f.by)*Math.min(1,dt*9)}
  else{f.bx=f.w/2+Math.sin(b.t*1.3)*f.w*.2;f.by=(f.fl?h*.4:Math.max(h*.4,(f.oy?0:SAT)+200))+Math.sin(b.t*2)*10}
  const C=BCOL[b.ty],pu=1+Math.sin(b.t*3)*.06;
  cx.save();cx.translate(f.bx,f.by);const ag=cx.createRadialGradient(0,0,b.r*.3,0,0,b.r*2.3*pu);ag.addColorStop(0,C+"66");ag.addColorStop(.5,C+"26");ag.addColorStop(1,C+"00");cx.fillStyle=ag;cx.beginPath();cx.arc(0,0,b.r*2.3*pu,0,6.3);cx.fill();
  if(b.ty=="bh"){cx.fillStyle="#000";cx.beginPath();cx.arc(0,0,b.r*.8,0,6.3);cx.fill();cx.strokeStyle=C;cx.lineWidth=3;cx.beginPath();cx.arc(0,0,b.r*.8*pu,0,6.3);cx.stroke()}
  if(b.hit>0){b.hit-=dt*5;cx.globalAlpha=Math.max(0,b.hit)*.5;cx.fillStyle="#fff";cx.beginPath();cx.arc(0,0,b.r*1.15,0,6.3);cx.fill();cx.globalAlpha=1}
  sp(cx,b.y,b.r);cx.restore();
 }
 for(const p of f.p){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g==null?400:p.g)*dt;p.rot=(p.rot||0)+(p.vr||0)*dt;p.l-=dt*1.6}
 f.p=f.p.filter(p=>p.l>0);
 for(const p of f.p){cx.globalAlpha=Math.max(0,Math.min(1,p.l));cx.fillStyle=p.c;
  if(!p.sh){cx.fillRect(p.x-1.5,p.y-1.5,3,3);continue}
  const s=p.s||3;cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot||0);cx.shadowColor=p.c;cx.shadowBlur=p.sh=="o"||p.sh=="s"?8:0;cx.beginPath();
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
 f.x=f.x.filter(q=>{q.y-=50*dt;q.l-=dt*1.2;if(q.l<=0)return false;cx.save();cx.globalAlpha=Math.min(1,q.l);cx.translate(q.x,q.y);if(f.fl)cx.scale(1,-1);cx.fillStyle="#ffb703";cx.font=`800 ${q.big?30:19}px system-ui`;cx.textAlign="center";cx.fillText(q.s,0,0);cx.restore();return true});
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
 if(f.fa>0){cx.fillStyle="rgba(255,255,255,"+f.fa*.4+")";cx.fillRect(-20,-20,f.w+40,h+40);f.fa-=raw*3}
 cx.restore();
 cx.save();cx.beginPath();cx.rect(0,f.oy,W,h);cx.clip();hud(f,now);cx.restore();   // HUD малюється поверх у екранних координатах
}
function hud(f,now){
 const duo=G.m==2;cx.save();if(duo&&f.fl){cx.translate(W/2,H/2);cx.rotate(Math.PI);cx.translate(-W/2,-H/2)}   // дуо: лічильники біля центру, у верхнього — догори ногами
 const T=duo?H/2+8:f.oy+SAT+10,w=f.w,b=f.bo,fs=f.h<420?27:38,ls=f.h<420?15:19,slow=now<f.sl,fren=now<f.fr,storm=now<f.st;
 cx.fillStyle="#fff";cx.textAlign="center";cx.font=`900 ${fs}px system-ui`;cx.fillText(fmt(f.sc),w/2,T+44);
 const ly=T+74;cx.font=`800 ${ls}px system-ui`;
 for(let i=0;i<f.mx;i++){cx.globalAlpha=i<f.ms?1:.3;cx.fillStyle=i<f.ms?"#ff2a5f":"#fff";cx.fillText("✖",w/2-14-(f.mx-1-i)*(ls+3),ly)}
 for(let i=0;i<3;i++){cx.globalAlpha=i<f.sk?1:.3;cx.fillText("📜",w/2+16+i*(ls+5),ly)}
 cx.globalAlpha=1;
 const st=[f.cb>2?"COMBO ×"+f.cb:"",slow?"⏳ SLOW ×2":"",fren?"⚡ FRENZY ×2":"",storm?"🌪 STORM":"",now<f.dbl?"💰 ×2":"",f.fz?"❄️ "+t("РОЗБИЙ ЛІД! Свайпай|BREAK THE ICE! Swipe")+" "+f.cr.length+"/5":""].filter(Boolean).join("  ");
 cx.fillStyle="#ff2a5f";cx.font="800 13px system-ui";cx.fillText(st,w/2,T+98);
 if(f.ban&&f.ban.l>0){cx.globalAlpha=Math.min(1,f.ban.l*1.5);cx.fillStyle="#fff";cx.font="900 18px system-ui";cx.fillText(f.ban.s,w/2,T+160);cx.font="600 12px system-ui";cx.fillStyle="#ffd27a";cx.fillText(f.ban.d,w/2,T+180);cx.globalAlpha=1}
 if(b){const bw=w*.6,bx=(w-bw)/2,by=T+112;cx.fillStyle="#272235";cx.fillRect(bx,by,bw,8);cx.fillStyle=BCOL[b.ty];cx.fillRect(bx,by,bw*Math.max(0,b.hp)/b.mh,8);
  cx.fillStyle="#fff";cx.font="bold 11px system-ui";cx.fillText(t(BNAME[b.ty])+" "+Math.max(0,b.hp)+"/"+b.mh,w/2,by+24)}

 cx.restore();
 if(f.dead&&duo){cx.fillStyle="rgba(0,0,0,.5)";cx.fillRect(0,f.oy,W,f.h);cx.fillStyle="#ff2a5f";cx.textAlign="center";cx.font="900 32px system-ui";cx.fillText("K.O.",W/2,f.oy+f.h/2)}
}
function frame(now){if(!G.on)return;const raw=Math.min(.033,(now-G.l)/1000);G.l=now;if(!G.fin)G.el+=raw;G.f.forEach(f=>upd(f,raw,now));
 if(G.m==2){cx.fillStyle="#ffb703";cx.shadowColor="#ff2a5f";cx.shadowBlur=10;cx.fillRect(0,H/2-1.5,W,3);cx.shadowBlur=0}
 requestAnimationFrame(frame)}

// ═══ КІНЕЦЬ РАУНДУ, ДУШІ 1–3, РЕКЛАМА ═══
function overScreen(){
 if(!G.on)return;
 const sc=G.f.map(f=>f.sc),solo=G.m==1,why=G.f[0].why,rv=G.rv||0;
 const w=solo?t("Кінець гри|Game over"):sc[0]==sc[1]?t("Нічия!|Draw!"):`🏆 P${sc[0]>sc[1]?1:2} ${t("перемагає|wins")}`;
 $("res").innerHTML=`<h2 class="text-3xl font-black text-neonGold" style="animation:pop .4s">${w}</h2><div class="text-5xl font-black font-mono">${sc.map(fmt).join(" : ")}</div>${solo?`<div class="text-sm text-gray-200">${why=="sk"?"📜 "+t("3 свитки розрізано|3 scrolls cut"):"✖ "+t("Пропущено ёкаїв|Yokai missed")}</div><div class="text-[11px] text-gray-300">${t("Життя відновлюється лише за рекламу. Очки й бустери збережуться.|Lives come back only via an ad. Score and boosts are kept.")}</div>
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
 G.on=0;ptr={};setMusic("menu");$("res").classList.replace("flex","hidden");
 const sc=G.f.map(f=>f.sc),bi=sc.indexOf(Math.max(...sc)),best=sc[bi],ex=G.f[bi].ex;S.rounds++;
 let m=mult||1;if(S.c.x2>0){m*=2;S.c.x2--}if(S.c.x3>0){m*=3;S.c.x3--}
 const coins=Math.round((best+ex)*(1+.03*U("end"))*(G.mb||1))*m;
 const ln=G.lx?2:R()<.12?1:0;                                               // 🏮 рідко; бустер «×2 ліхтарі» гарантує 2
 S.mon+=coins;S.xp+=best;S.ln+=ln;if(G.sx)S.souls++;save();push();
 G.res={sc,coins,m,ln,bc:R()<.05+.02*G.f.reduce((s,f)=>s+f.kills,0)};       // шанс сундука-знахідки
 if(S.rounds%CFG.adEvery==0)ad(CFG.promo.text,showRes,"",1);else showRes();
}
function showRes(){
 const{sc,coins,m,ln,bc}=G.res;
 $("res").innerHTML=`<h2 class="text-3xl font-black text-neonGold" style="animation:pop .4s">${t("Раунд завершено|Round over")}</h2><div class="text-5xl font-black font-mono">${sc.map(fmt).join(" : ")}</div><div class="text-xl">+${fmt(coins)} 文 ${m>1?"(×"+m+")":""}</div>${ln?`<div class="text-sm text-gray-300">+${ln} 🏮</div>`:""}${G.sx?`<div class="text-sm text-gray-300">+1 ⛩️</div>`:""}${bc?`<button onclick="bonus()" class="btng w-full max-w-xs py-3 glow">🎁 ${t("Знайдено сундук! Відкрити|Chest found! Open")}</button>`:""}<button onclick="startRound(${G.m})" class="btng w-full max-w-xs py-3">${t("Ще раз|Again")}</button><button onclick="quitRound()" class="btn w-full max-w-xs py-3">${t("Закрити|Close")}</button>`;
 $("res").classList.replace("hidden","flex");hdr();
}
