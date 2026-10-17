/* INKAI — Cloud Functions (потрібен тариф Blaze). Деплой: firebase deploy --only functions
   Секрет для Telegram: firebase functions:secrets:set TG_TOKEN  (токен бота, яким ти надсилаєш повідомлення майстрам) */
const {onSchedule}=require("firebase-functions/v2/scheduler");
const {onDocumentCreated}=require("firebase-functions/v2/firestore");
const admin=require("firebase-admin");admin.initializeApp();
const db=admin.firestore(),TZ="Europe/Kyiv",DAY=864e5;

async function sendMany(tokens,title,body){for(let i=0;i<tokens.length;i+=500){try{await admin.messaging().sendEachForMulticast({tokens:tokens.slice(i,i+500),notification:{title,body}})}catch(e){console.error(e)}}}
async function tg(chat,text){if(!chat||!process.env.TG_TOKEN)return;try{await fetch(`https://api.telegram.org/bot${process.env.TG_TOKEN}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:chat,text})})}catch(e){console.error(e)}}

// 1) «Ми сумуємо»: гравець багато грав, а потім час у грі впав або він зник (щодня о 18:00)
exports.winback=onSchedule({schedule:"0 18 * * *",timeZone:TZ},async()=>{
 const snap=await db.collection("users").where("fcm","!=","").get(),toks=[],upd=[];
 snap.forEach(d=>{const u=d.data(),seen=u.lastSeen&&u.lastSeen.toMillis?u.lastSeen.toMillis():0,pw=u.pw||[0,0],pushed=u.lastPush||0;
  const away=Date.now()-seen>2*DAY,dropped=pw[1]>3600&&pw[0]<pw[1]*.4;
  if((away||dropped)&&u.pt>3600&&Date.now()-pushed>5*DAY){toks.push(u.fcm);upd.push(d.ref)}});
 await sendMany(toks,"INKAI · Йокаї сумують 🥷","Ти давно не заходив — твій час у грі впав. Повертайся: чекають сундуки й нові боси!");
 await Promise.all(upd.map(r=>r.update({lastPush:Date.now()})));
});
// 2) «Ніч Сьогуна»: щосуботи о 19:55 (подія 20:00–23:00, монети ×2)
exports.shogunNight=onSchedule({schedule:"55 19 * * 6",timeZone:TZ},async()=>{
 const snap=await db.collection("users").where("fcm","!=","").get(),toks=[];snap.forEach(d=>toks.push(d.data().fcm));
 await sendMany(toks,"🌙 Ніч Сьогуна починається!","Сьогодні з 20:00 до 23:00 усі монети за раунд ×2. Заходь у INKAI!");
});
// 3) Гравець обрав майстра → повідомлення майстру в Telegram
exports.onClient=onDocumentCreated({document:"clients/{id}",secrets:["TG_TOKEN"]},async e=>{
 const c=e.data.data(),m=await db.collection("masters").doc(c.master).get();if(!m.exists)return;
 await tg(m.data().tg,`🥷 Гравець «${c.nick||"?"}» вирішив стати вашим клієнтом і зробити в тебе тату (INKAI). Знижки й купони цього гравця тепер діятимуть у вас.`)});
// 4) Нова заявка на знижку/тату → майстру в Telegram
exports.onClaim=onDocumentCreated({document:"claims/{id}",secrets:["TG_TOKEN"]},async e=>{
 const c=e.data.data(),m=await db.collection("masters").doc(c.master).get();if(!m.exists)return;
 await tg(m.data().tg,`🎟 Нова заявка INKAI: ${c.nick||"?"} → ${c.tier} (${c.kind==="tattoo"?"тату":"знижка"}). Днів у грі: ${c.serverDays??"—"}, босів: ${c.kills||0}. Студія YYOKAI перевірить умови й напише.`)});
