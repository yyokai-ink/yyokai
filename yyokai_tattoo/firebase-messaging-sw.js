/* INKAI — сервіс-воркер для push-сповіщень (кладеться в корінь поруч із game1.html). Встав ТІ САМІ ключі, що в core.js (firebaseConfig) */
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js","https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");
firebase.initializeApp({apiKey:"PASTE_API_KEY",authDomain:"PASTE_PROJECT_ID.firebaseapp.com",projectId:"PASTE_PROJECT_ID",storageBucket:"PASTE_PROJECT_ID.appspot.com",messagingSenderId:"PASTE_SENDER_ID",appId:"PASTE_APP_ID"});
const m=firebase.messaging();
m.onBackgroundMessage(p=>{const n=p.notification||{};self.registration.showNotification(n.title||"INKAI",{body:n.body||"",icon:"Иконка1.PNG",badge:"Иконка1.PNG",data:{url:"game1.html"}})});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.matchAll({type:"window"}).then(l=>{for(const c of l)if("focus"in c)return c.focus();return clients.openWindow("game1.html")}))});
