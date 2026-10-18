/* INKAI — фонові задачі (безкоштовно: GitHub Actions + Firebase Spark + FCM + Telegram-бот).
   Секрети репозиторію: FIREBASE_SA (JSON сервісного акаунта), TG_TOKEN (токен Telegram-бота). Кожен запуск ідемпотентний (мітки в колекції meta). */
const admin=require("firebase-admin"),crypto=require("crypto");
admin.initializeApp({credential:admin.credential.cert(JSON.parse(process.env.FIREBASE_SA))});
const db=admin.firestore(),meta=db.collection("meta"),TS=admin.firestore.FieldValue.serverTimestamp;
function kyiv(off=0){const d=new Date(Date.now()+off*864e5),p=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Kyiv",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",weekday:"short",hourCycle:"h23"}).formatToParts(d).map(x=>[x.type,x.value]));
 return{d:+p.day,h:+p.hour,mi:+p.minute,wd:p.weekday,ds:`${p.year}-${p.month}-${p.day}`,ms:`${p.year}-${p.month}`}}
async function once(k){const r=meta.doc(k);if((await r.get()).exists)return false;await r.set({ts:Date.now()});return true}
async function push(tokens,title,body){tokens=[...new Set(tokens.filter(Boolean))];for(let i=0;i<tokens.length;i+=500){try{await admin.messaging().sendEachForMulticast({tokens:tokens.slice(i,i+500),notification:{title,body}})}catch(e){console.error(e.message)}}}
async function tg(chat,text){if(!chat||!process.env.TG_TOKEN)return;try{await fetch(`https://api.telegram.org/bot${process.env.TG_TOKEN}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:chat,text})})}catch(e){console.error(e.message)}}
const allTokens=async()=>(await db.collection("users").where("fcm","!=","").get()).docs.map(d=>d.data().fcm);

// 1) Сповіщення майстрам у Telegram: новий клієнт і нова заявка (опитування кожні 15 хв, без платних тригерів)
async function notifyMasters(){
 const cur=meta.doc("cursor"),s=await cur.get(),c=s.exists?s.data():{clients:0,claims:0},now=Date.now();
 for(const [col,key] of [["clients","clients"],["claims","claims"]]){
  const q=await db.collection(col).where("ts",">",admin.firestore.Timestamp.fromMillis(c[key]||now)).orderBy("ts").limit(50).get();
  for(const d of q.docs){const x=d.data(),m=await db.collection("masters").doc(x.master).get();if(!m.exists)continue;
   await tg(m.data().tg,col=="clients"?`🥷 Гравець «${x.nick||"?"}» вирішив стати вашим клієнтом і зробити в тебе тату (INKAI).`:`🎟 Нова заявка INKAI: ${x.nick||"?"} → ${x.tier} (${x.kind=="tattoo"?"тату":"знижка"}). Днів у грі: ${x.serverDays??"—"}. Студія YYOKAI перевірить умови.`);
   c[key]=Math.max(c[key]||0,x.ts.toMillis())}}
 c.clients=c.clients||now;c.claims=c.claims||now;await cur.set(c)}
// 2) «Ніч Сьогуна»: субота 19:45–20:10 за Києвом
async function shogun(k){if(k.wd!="Sat"||!((k.h==19&&k.mi>=45)||(k.h==20&&k.mi<10)))return;if(await once("shogun_"+k.ds))await push(await allTokens(),"🌙 Ніч Сьогуна починається!","З 20:00 до 23:00 усі монети за раунд ×2. Заходь у INKAI!")}
// 3) «Ми сумуємо»: щодня о 18:00; гравці, чий час у грі впав або які зникли на 2+ дні
async function winback(k){if(k.h!=18||k.mi>=30||!(await once("winback_"+k.ds)))return;const toks=[],ups=[];
 (await db.collection("users").where("fcm","!=","").get()).forEach(d=>{const u=d.data(),seen=u.lastSeen&&u.lastSeen.toMillis?u.lastSeen.toMillis():0,pw=u.pw||[0,0];
  if((Date.now()-seen>2*864e5||(pw[1]>3600&&pw[0]<pw[1]*.4))&&u.pt>3600&&Date.now()-(u.lastPush||0)>5*864e5){toks.push(u.fcm);ups.push(d.ref)}});
 await push(toks,"INKAI · Йокаї сумують 🥷","Ти давно не заходив — твій час у грі впав. Повертайся: чекають сундуки й нові боси!");await Promise.all(ups.map(r=>r.update({lastPush:Date.now()})))}
const top10=async()=>(await db.collection("public").orderBy("xp","desc").limit(10).get()).docs.map(d=>({uid:d.id,nick:d.data().nick||"?",av:d.data().av||"fox"}));
// 4) Нагадування напередодні розіграшу тату (20:00 за день до 1-го числа)
async function reminder(k){if(k.h!=20||k.mi>=30||kyiv(1).d!=1||!(await once("raf_rem_"+k.ds)))return;
 const ids=(await top10()).map(x=>x.uid),toks=[];for(const id of ids){const u=await db.collection("users").doc(id).get();if(u.exists)toks.push(u.data().fcm)}
 await push(toks,"🎰 Завтра розіграш тату!","Ти в ТОП-10 INKAI. Завтра о 20:00 — розіграш: 1 безкоштовний сеанс і 9 знижок.")}
// 5) Розіграш: 1-го числа о 20:00 (за Києвом) — серед ТОП-10 обирається 1 переможець; решта 9 — знижки
async function draw(k){if(k.d!=1||k.h!=20||k.mi>=45||!(await once("raffle_"+k.ms)))return;const ten=await top10();if(!ten.length)return;
 const w=ten[crypto.randomInt(ten.length)],pct=[40,35,30,30,25,25,20,20,15],prizes={};let i=0;
 for(const p of ten)prizes[p.uid]=p.uid==w.uid?{kind:"free",pct:0}:{kind:"disc",pct:pct[i++]||15};
 await db.collection("events").doc("raffle").set({month:k.ms,ts:TS(),ten,winner:w,prizes});
 for(const p of ten)await db.collection("prizes").doc(p.uid+"_"+k.ms).set({uid:p.uid,month:k.ms,...prizes[p.uid],ts:TS()});
 await push(await allTokens(),"🎰 Розіграш тату відбувся!",`Переможець: ${w.nick}. Заходь у INKAI — перевір свій приз у вкладці «Нагороди».`)}
(async()=>{const k=kyiv();try{await notifyMasters();await shogun(k);await winback(k);await reminder(k);await draw(k)}catch(e){console.error(e);process.exitCode=1}})();
