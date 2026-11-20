/* LOWRI by KK & Felix · 1.0.1 SECURITY BETA · encrypted local-first */
(()=>{
'use strict';
const root=document.getElementById('app');
const DB='wizmero-mobile-beta', KEY='state', DB_VERSION=1;
const clone=x=>JSON.parse(JSON.stringify(x));
const defaults=()=>({
 schema:1, company:'Salon Anna', minimumBookingMinutes:10,
 hours:[{on:false,from:'08:00',to:'20:00'},{on:true,from:'08:00',to:'18:00'},{on:true,from:'09:30',to:'20:00'},{on:true,from:'08:00',to:'20:00'},{on:true,from:'08:00',to:'12:00'},{on:true,from:'09:00',to:'14:00'},{on:false,from:'08:00',to:'20:00'}],
 templates:{reminder:'{firma}: przypominamy o wizycie {data} o godz. {godzina}. Do zobaczenia!',change:'{firma}: zmiana wizyty z {stara_data}, godz. {stara_godzina} na {data}, godz. {godzina}.',cancel:'{firma}: wizyta {data} o godz. {godzina} została odwołana. Przepraszamy za zmianę.'},
 clients:[{id:1,name:'Jan Nowak',phone:'987654321'},{id:2,name:'Ola',phone:'741852963'},{id:3,name:'Anna Kowalska',phone:'600123456'},{id:4,name:'Piotr Wiśniewski',phone:'500456789'}],
 bookings:[{id:1,clientId:1,date:'2026-11-25',time:'12:30',duration:30,reminder:'ready',everSent:false},{id:2,clientId:2,date:'2026-11-25',time:'13:00',duration:60,reminder:'ready',everSent:false},{id:3,clientId:3,date:'2026-11-20',time:'09:00',duration:60,reminder:'ready',everSent:false},{id:4,clientId:4,date:'2026-11-20',time:'10:30',duration:30,reminder:'ready',everSent:false}],
 breaks:[],
 tasks:[]
});
const viewInitial=()=>({page:'home',date:'2026-11-25',week:'2026-11-23',smsDate:'2026-11-20',slot:null,moving:null,editBooking:null,prefillClientId:null,pickerOpen:false,pickerQuery:'',confirmCancel:null,form:{name:'',phone:'',duration:30,clientId:null,endTime:null},search:'',editId:null,editName:'',editPhone:'',addClient:false,allFrom:'08:00',allTo:'20:00',smsTab:'reminder',draftCompany:null,draftTemplates:null,compose:null,backupPass:'',restorePass:'',restoreFile:null,restoreVisible:false,notice:'',noticeBad:false,resetConfirm:false,modalDirty:false,breakOpen:false,breakEdit:null,breakStart:'',breakEnd:'',breakLabel:'',breakDirty:false,breakDelete:null});
let state=defaults(),v=viewInitial(),db=null,storageOK=false,saveQueue=Promise.resolve();
// Secure local storage. No password, PIN, or encryption key is stored on the server.
const SECURE_FORMAT='kfx-local-encrypted-v1', SECURE_ITERATIONS=430000;
let securityMode='loading'; // setup | migrate | unlock | ready | unavailable
let storageKey=null, encryptedRecord=null, securityError='',lastActivity=Date.now();
const txtToBytes=v=>new TextEncoder().encode(v);
async function passwordKey(pass,salt){
 const seed=await crypto.subtle.importKey('raw',txtToBytes(pass),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:SECURE_ITERATIONS},seed,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function sealState(data,key,salt){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const enc=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,txtToBytes(JSON.stringify(data)));
 return {format:SECURE_FORMAT,version:1,iterations:SECURE_ITERATIONS,salt:base64(salt),iv:base64(iv),ciphertext:base64(enc)};
}
async function openSealed(record,pass){
 const derived=await passwordKey(pass,unbase64(record.salt));
 const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:unbase64(record.iv)},derived,unbase64(record.ciphertext));
 const restored=JSON.parse(new TextDecoder().decode(bytes));
 if(!validData(restored))throw new Error('Niepoprawne dane w szyfrowanej bazie');
 return {data:normalizeState(restored),key:derived};
}
function securityView(){
 const setup=securityMode==='setup'||securityMode==='migrate';
 const locked=securityMode==='unlock';
 const title=securityMode==='migrate'?'Zabezpiecz dotychczasowe dane':setup?'Włącz szyfrowanie danych':locked?'Odblokuj LOWRI':'Magazyn danych niedostępny';
 root.innerHTML=`<div class="sec-shell"><div class="sec-header"><img class="sec-brand-logo" src="./assets/lowri-logo-transparent.png" alt="LOWRI · Twój czas. Twoi klienci. by KK & Felix"><div class="sec-kicker">LOWRI · SECURITY BETA 1.0.1</div></div><div class="sec-content"><div class="sec-lock">🔐</div><h2>${title}</h2>${securityError?`<div class="notice warn" role="alert">${escapeHTML(securityError)}</div>`:''}
 ${securityMode==='unavailable'?'<p>Nie można uruchomić bezpiecznego magazynu. Sprawdź HTTPS, uprawnienia przeglądarki i dostępne miejsce.</p>':`<form id="secure-form" autocomplete="off"><label class="label" for="sec-pass">${setup?'Ustal hasło do lokalnej bazy (min. 12 znaków)':'Hasło do lokalnej bazy'}</label><input class="field" type="password" id="sec-pass" name="password" minlength="${setup?12:1}" required autocomplete="off" placeholder="Hasło, którego nie zapomnisz" />${setup?'<label class="label" for="sec-confirm">Powtórz hasło</label><input class="field" type="password" id="sec-confirm" name="confirm" minlength="12" required autocomplete="off" />':''}<button class="btn full" type="submit">${setup?'Zaszyfruj i rozpocznij':'Odblokuj'}</button></form>`}
 ${setup?'<div class="sec-note">Hasło szyfruje wszystkie dane klientów i wizyt w tej przeglądarce. Nie przechowujemy go ani nie odzyskamy go za Ciebie. Zrób osobną zaszyfrowaną kopię.</div>':''}
 ${locked?'<div class="sec-note">Nie pamiętasz hasła? Dane można odzyskać wyłącznie z wcześniejszej kopii .wzm i jej hasła. Nie resetuj magazynu, jeśli nie masz sprawdzonej kopii.</div><button class="sec-reset" data-security="wipe">Usuń niedostępną bazę i rozpocznij od nowa</button>':''}
 <div class="sec-note">🔒 Dane pozostają na tym urządzeniu. Nie są synchronizowane między telefonami. Beta: na razie tylko dane testowe.</div></div></div>`;
 document.body.classList.remove('wz-modal-open');
}
async function unlockWithPassword(pass){
 const {data,key}=await openSealed(encryptedRecord,pass);
 state=data;storageKey=key;securityMode='ready';securityError='';v=viewInitial();lastActivity=Date.now();render();
}
async function setupWithPassword(pass){
 if(pass.length<12)throw new Error('Hasło musi mieć co najmniej 12 znaków.');
 const salt=crypto.getRandomValues(new Uint8Array(16));
 const key=await passwordKey(pass,salt);
 const sealed=await sealState(state,key,salt);
 await writeDB(sealed); // On migration overwrite plaintext only after successful encryption and storage.
 encryptedRecord=sealed;storageKey=key;securityMode='ready';securityError='';v=viewInitial();lastActivity=Date.now();render();
}
async function lockNow(){
 await saveQueue;
 if(!storageOK){securityError='Ostatni zapis mógł się nie udać. Nie zamykaj programu bez kopii.';render();return}
 state=defaults();v=viewInitial();storageKey=null;securityMode='unlock';securityError='';render();
}
// Avoid leaving an unlocked calendar unattended; 10 min inactivity.
['pointerdown','keydown','touchstart'].forEach(type=>document.addEventListener(type,()=>{if(securityMode==='ready')lastActivity=Date.now()},{passive:true}));
setInterval(()=>{if(securityMode==='ready'&&Date.now()-lastActivity>10*60*1000)lockNow().catch(console.warn)},30000);
root.addEventListener('submit',async e=>{
 if(e.target.id!=='secure-form')return;
 e.preventDefault();if(securityMode!=='setup'&&securityMode!=='migrate'&&securityMode!=='unlock')return;
 const pass=root.querySelector('#sec-pass')?.value||'';
 const confirm=root.querySelector('#sec-confirm')?.value||'';
 if(securityMode!=='unlock'&&pass!==confirm){securityError='Hasła nie są identyczne.';securityView();return}
 try{securityError='';if(securityMode==='unlock')await unlockWithPassword(pass);else await setupWithPassword(pass)}
 catch(e){securityError=securityMode==='unlock'?'Nie udało się odblokować. Sprawdź hasło.':'Nie udało się zaszyfrować bazy. Sprawdź wolne miejsce i spróbuj ponownie.';console.warn('Secure local storage',e);securityView()}
});
root.addEventListener('click',async e=>{
 const button=e.target.closest('[data-security]');if(!button)return;
 if(button.dataset.security==='lock'&&securityMode==='ready')await lockNow();
 else if(button.dataset.security==='wipe'&&securityMode==='unlock'){
  if(!window.confirm('UWAGA: utracisz CAŁĄ bazę na tym urządzeniu. Czy masz kopię danych?'))return;
  if(!window.confirm('Ostateczne potwierdzenie: usunąć nieodwracalnie zaszyfrowaną bazę lokalną?'))return;
  try{await writeDB(null);encryptedRecord=null;state=defaults();securityMode='setup';securityError='';securityView()}catch(e){securityError='Nie udało się wyczyścić bazy.';securityView()}
 }
});

const escapeHTML=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=p=>String(p??'').replace(/\D/g,'');
const minutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3,5));
const hhmm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const dateAdd=(iso,n)=>{const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const dayIndex=iso=>(new Date(iso+'T12:00:00Z').getUTCDay()+6)%7;
const plDate=d=>d.slice(8,10)+'.'+d.slice(5,7)+'.'+d.slice(0,4);
const names=['Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota','Niedziela'];
const abbr=['Pn','Wt','Śr','Cz','Pt','Sb','Nd'];
const findClient=id=>state.clients.find(c=>c.id===id);
const findBooking=id=>state.bookings.find(b=>b.id===id);
const findBreak=id=>state.breaks.find(b=>b.id===id);
const ends=b=>hhmm(minutes(b.time)+b.duration);
const span=b=>b.time+'–'+ends(b);
const onDay=iso=>state.bookings.filter(b=>b.date===iso).sort((a,b)=>minutes(a.time)-minutes(b.time));
const validWork=h=>h.on&&minutes(h.from)<minutes(h.to);
const minOptions=[10,15,20,30];
const minBooking=()=>minOptions.includes(Number(state.minimumBookingMinutes))?Number(state.minimumBookingMinutes):10;
// Backward-compatible optional field: keep schema 1, DB name and store unchanged.
function normalizeState(data){
 if(!minOptions.includes(Number(data.minimumBookingMinutes)))data.minimumBookingMinutes=10;
 // 0.8.1 backups and IndexedDB records have no 'breaks' field; preserve all older data.
 if(!Array.isArray(data.breaks))data.breaks=[];
 return data;
}
function available(iso,time,duration,exclude=null){
 const h=state.hours[dayIndex(iso)],start=minutes(time),end=start+duration;
 return Number.isFinite(start)&&Number.isFinite(duration)&&duration>=5&&duration%5===0&&start%5===0&&validWork(h)&&start>=minutes(h.from)&&end<=minutes(h.to)&&!state.bookings.some(b=>b.id!==exclude&&b.date===iso&&start<minutes(b.time)+b.duration&&end>minutes(b.time))&&!state.breaks.some(b=>b.date===iso&&start<minutes(b.end)&&end>minutes(b.start));
}
function availableBreak(iso,start,end,excludeId=null){
 const h=state.hours[dayIndex(iso)],a=minutes(start),z=minutes(end);
 return /^\d{2}:\d{2}$/.test(start)&&/^\d{2}:\d{2}$/.test(end)&&
  Number.isFinite(a)&&Number.isFinite(z)&&z>a&&a>=0&&z<=1440&&a%5===0&&z%5===0&&
  validWork(h)&&a>=minutes(h.from)&&z<=minutes(h.to)&&
  !state.bookings.some(b=>b.date===iso&&a<minutes(b.time)+b.duration&&z>minutes(b.time))&&
  !state.breaks.some(b=>b.id!==excludeId&&b.date===iso&&a<minutes(b.end)&&z>minutes(b.start));
}
function slots(iso){const h=state.hours[dayIndex(iso)];if(!validWork(h))return [];
 const out=[],start=minutes(h.from),end=minutes(h.to);
 if(start%30&&start+30<=end)out.push(hhmm(start));
 for(let m=Math.ceil(start/30)*30;m+30<=end;m+=30)out.push(hhmm(m));
 return [...new Set(out)];}
const dayHasFree=iso=>{const h=state.hours[dayIndex(iso)],min=minBooking();if(!validWork(h))return false;for(let t=minutes(h.from);t+min<=minutes(h.to);t+=5)if(available(iso,hhmm(t),min))return true;return false};
function notice(msg,bad=false){v.notice=msg;v.noticeBad=bad}
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB,DB_VERSION);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('records'))req.result.createObjectStore('records')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function readDB(){return new Promise((resolve,reject)=>{const t=db.transaction('records','readonly');const req=t.objectStore('records').get(KEY);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function writeDB(data){return new Promise((resolve,reject)=>{if(!db)return reject(new Error('Brak magazynu danych'));const t=db.transaction('records','readwrite');t.objectStore('records').put(data,KEY);t.oncomplete=resolve;t.onerror=()=>reject(t.error)})}
function save(){
 if(!storageOK||securityMode!=='ready'||!storageKey||!encryptedRecord)return;
 const snapshot=clone(state);
 saveQueue=saveQueue.then(async()=>{
  const record=await sealState(snapshot,storageKey,unbase64(encryptedRecord.salt));
  await writeDB(record);encryptedRecord=record;
 }).catch(err=>{
  console.error('LOWRI: błąd szyfrowanego zapisu',err);
  storageOK=false;notice('KRYTYCZNE: zapis szyfrowanej bazy nie powiódł się. Wykonaj kopię i nie zamykaj programu.',true);render();
 });
}
function validData(d){return d&&typeof d==='object'&&d.schema===1&&Array.isArray(d.clients)&&Array.isArray(d.bookings)&&Array.isArray(d.tasks)&&Array.isArray(d.hours)&&d.hours.length===7&&d.templates&&typeof d.company==='string'&&d.bookings.every(b=>typeof b.date==='string'&&typeof b.time==='string'&&Number.isFinite(b.duration))&&(d.breaks===undefined||(Array.isArray(d.breaks)&&d.breaks.every(b=>Number.isInteger(b.id)&&typeof b.date==='string'&&/^\d{2}:\d{2}$/.test(b.start)&&/^\d{2}:\d{2}$/.test(b.end)&&minutes(b.end)>minutes(b.start)&&typeof b.label==='string')));}
function iconSvg(name){const p={cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18M8 15l2 2 5-5"/>',users:'<circle cx="9" cy="7" r="4"/><path d="M2 20v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2M17 4a4 4 0 0 1 0 7M18 14a5 5 0 0 1 4 5v1"/>',sms:'<path d="M21 11a9 9 0 0 1-9 9c-1.4 0-2.7-.3-3.8-.8L3 21l1.8-5.3A9 9 0 1 1 21 11Z"/><path d="M8 10h9M8 14h6"/>',settings:'<circle cx="12" cy="12" r="4"/><path d="M10 2h4l.6 2.3 2.1.9 2.1-1.1 2.7 2.7-1.1 2.1.9 2.1L23 12l-1.7 1-.9 2.1 1.1 2.1-2.7 2.7-2.1-1.1-2.1.9L14 22h-4l-.6-2.3-2.1-.9-2.1 1.1-2.7-2.7 1.1-2.1-.9-2.1L1 12l1.7-1 .9-2.1-1.1-2.1 2.7-2.7 2.1 1.1 2.1-.9Z"/>',arrow:'<path d="m9 18 6-6-6-6"/>',home:'<path d="m15 18-6-6 6-6"/>'}[name]||'';return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`}
function header(){if(v.page==='home')return `<header class="hero"><div class="brand"><img class="brand-logo" src="./assets/lowri-logo-transparent.png" alt="LOWRI · Twój czas. Twoi klienci. by KK & Felix"></div></header>`;const t={calendar:['Mój terminarz','cal'],clients:['Moi klienci','users'],sms:['Przypomnienia','sms'],settings:['Opcje','settings']}[v.page];return `<header class="subhead"><button class="go-home" data-a="home" aria-label="Ekran główny">‹</button>${iconSvg(t[1])}<h2>${t[0]}</h2></header>`}
function bottomNav(){return `<nav class="bottom-nav" aria-label="Moduły terminarza">${[['calendar','▦','Terminarz'],['clients','♧','Klienci'],['sms','▤','SMS'],['settings','⚙','Opcje']].map(([key,ico,label])=>`<button class="navbtn ${key===v.page?'current':''}" data-a="page" data-page="${key}"><b>${ico}</b><span>${label}</span></button>`).join('')}</nav>`}
function visitView(b){return `<div class="visitrow"><div class="stripe"></div><div class="grow"><div class="strong">${escapeHTML(findClient(b.clientId)?.name||'Klient')}</div><div class="muted">${span(b)} · ${b.duration} min</div></div><div class="check-dot">✓</div></div>`}
function home(){const list=onDay(v.date);return `<section class="tiles">${[['calendar','cal','Mój terminarz','Wizyty i rezerwacje'],['clients','users','Moi klienci','Kontakty i historia'],['sms','sms','Przypomnienia','SMS-y do wysłania'],['settings','settings','Opcje','Godziny i ustawienia']].map(([key,ico,label,desc])=>`<button class="tile" data-a="page" data-page="${key}"><span class="tile-ico">${iconSvg(ico)}</span><span class="tile-title">${label}<span>›</span></span><span class="tile-desc">${desc}</span></button>`).join('')}</section><div class="row preview-title"><div class="row-start">${iconSvg('cal')}<h2 class="section-title">Podgląd terminarza</h2></div><button class="pill" data-a="preview">▣ ${plDate(v.date).slice(0,5)}</button></div><div class="card">${list.length?list.map(visitView).join(''):'<div class="empty">Na ten dzień nie ma jeszcze wizyt.</div>'}</div><button class="btn full" data-a="new-visit">＋ Dodaj wizytę</button><p class="test-tag">LOWRI 1.0.1 SECURITY BETA · Dane testowe</p>`}
function freeGapHTML(a,z,moving){
 if(z-a<5)return '';
 // A 5-minute gap is not automatically a bookable visit: we require one uninterrupted
 // interval at least as long as the user's minimum (or the moving visit's duration).
 const min=moving?moving.duration:minBooking();
 let rows='',t=a;
 while(t+5<=z){
  const nextHour=(Math.floor(t/60)+1)*60;
  const end=Math.min(z,nextHour);
  const can=available(v.date,hhmm(t),min,moving?.id??null);
  if(can){
   rows+=`<button class="timeline-hour" data-a="slot" data-time="${hhmm(t)}" aria-label="Wolny termin od ${hhmm(t)} do ${hhmm(z)}"><span class="hour-label">${hhmm(t)}</span><span class="hour-range">${hhmm(t)}–${hhmm(end)}</span><span class="hour-add" aria-hidden="true">＋</span></button>`;
   t=end;
  }else{
   // The end of this contiguous gap is too short for a new booking. Show it once,
   // including across a clock-hour boundary, without allowing selection.
   const remaining=z-t;
   rows+=`<div class="timeline-break" aria-label="Przerwa ${remaining} minut od ${hhmm(t)} do ${hhmm(z)}"><span class="hour-label">${hhmm(t)}–${hhmm(z)}</span><span class="break-info">Przerwa ${remaining} min</span></div>`;
   break;
  }
 }
 return rows;
}
function visitTimelineCard(b){
 return `<article class="timeline-visit"><div class="timeline-visit-head"><div class="grow"><div class="strong">${span(b)} · ${escapeHTML(findClient(b.clientId)?.name||'Klient')}</div><div class="muted">${b.duration} min · ${escapeHTML(findClient(b.clientId)?.phone||'')}</div></div></div><div class="actions visit-actions"><button class="btn outline small" data-a="edit-booking" data-id="${b.id}">Edytuj</button><button class="btn outline small" data-a="move" data-id="${b.id}">Przełóż</button><button class="btn outline small" data-a="ask-cancel" data-id="${b.id}">Odwołaj</button></div>${v.confirmCancel===b.id?`<div class="notice warn">Odwołać tę wizytę? ${b.everSent?'Klient dostał już SMS. Przygotujemy wiadomość o odwołaniu.':''}<div class="actions"><button class="btn outline small" data-a="cancel-no">Nie</button><button class="btn danger small" data-a="cancel-yes" data-id="${b.id}">Tak, odwołaj</button></div></div>`:''}</article>`;
}
function blockTimelineCard(b){
 return `<article class="timeline-block" aria-label="Zablokowany czas ${b.start} do ${b.end}"><div class="timeline-visit-head"><div class="grow"><div class="strong">${b.start}–${b.end} · Przerwa</div><div class="muted">${escapeHTML(b.label||'Czas prywatny')} · ${minutes(b.end)-minutes(b.start)} min</div></div><span class="block-lock" aria-hidden="true">☕</span></div><div class="actions visit-actions"><button class="btn outline small" data-a="edit-break" data-id="${b.id}">Edytuj</button><button class="btn outline small" data-a="ask-delete-break" data-id="${b.id}">Usuń przerwę</button></div>${v.breakDelete===b.id?`<div class="notice warn">Usunąć przerwę ${b.start}–${b.end} i udostępnić ten czas na wizyty?<div class="actions"><button class="btn outline small" data-a="cancel-delete-break">Nie</button><button class="btn danger small" data-a="delete-break" data-id="${b.id}">Tak, usuń</button></div></div>`:''}</article>`;
}
function timeline(){
 const h=state.hours[dayIndex(v.date)],moving=findBooking(v.moving);
 if(!validWork(h))return `<div class="notice">W tym dniu nie przyjmujesz klientów. Godziny zmienisz w Opcjach.</div>`;
 const entries=[...onDay(v.date).filter(b=>b.id!==v.moving).map(b=>({kind:'visit',start:minutes(b.time),end:minutes(b.time)+b.duration,record:b})),...state.breaks.filter(b=>b.date===v.date).map(b=>({kind:'break',start:minutes(b.start),end:minutes(b.end),record:b}))].sort((a,b)=>a.start-b.start||a.end-b.end);
 const workStart=minutes(h.from),workEnd=minutes(h.to);
 let cursor=workStart,out='';
 for(const entry of entries){
  if(entry.start>cursor&&cursor<workEnd)out+=freeGapHTML(cursor,Math.min(entry.start,workEnd),moving);
  out+=entry.kind==='visit'?visitTimelineCard(entry.record):blockTimelineCard(entry.record);
  cursor=Math.max(cursor,entry.end);
 }
 if(cursor<workEnd)out+=freeGapHTML(Math.max(cursor,workStart),workEnd,moving);
 return out||'<div class="empty">Brak wolnych terminów.</div>';
}
function calendar(){
 const ds=Array.from({length:7},(_,i)=>dateAdd(v.week,i)),h=state.hours[dayIndex(v.date)],moving=findBooking(v.moving);
 return `<div class="week-tools"><button class="btn outline small" data-a="prev-week">❮</button><span>${plDate(ds[0])} – ${plDate(ds[6])}</span><button class="btn outline small" data-a="next-week">❯</button></div>
 <div class="weekdays">${ds.map((d,i)=>`<button data-a="day" data-date="${d}" class="day ${!state.hours[dayIndex(d)].on?'off':dayHasFree(d)?'free':'full'} ${d===v.date?'active':''}"><small>${abbr[i]}</small><b>${d.slice(8)}</b><small>${!state.hours[dayIndex(d)].on?'−':dayHasFree(d)?'✓':'×'}</small></button>`).join('')}</div>
 <div class="legend"><span><i style="background:#def4e6"></i>Wolne</span><span><i style="background:#f9dddf"></i>Pełne</span><span><i style="background:#e7ebf0"></i>Nie pracuję</span></div>
 <div class="divider"></div><div class="row calendar-heading"><div><h3 class="section-title">${plDate(v.date)}</h3><div class="muted">${validWork(h)?`Godziny pracy: ${h.from}–${h.to}`:'Dzień wolny'}</div></div><div class="calendar-actions"><button class="btn outline small" data-a="new-break" ${validWork(h)?'':'disabled'}>＋ Zablokuj czas</button><button class="btn outline small" data-a="today">Dzisiaj</button></div></div>
 ${v.prefillClientId!==null&&!v.slot?`<div class="notice good">Umawiasz: <b>${escapeHTML(findClient(v.prefillClientId)?.name||'Klient')}</b>. Wybierz wolny początek wizyty.</div>`:''}
 ${moving?`<div class="notice">Przenosisz: <b>${escapeHTML(findClient(moving.clientId)?.name||'Klient')}</b> (${moving.duration} min). Wybierz nowy początek wizyty.<div class="actions"><button class="btn outline small" data-a="stop-move">Anuluj zmianę</button></div></div>`:''}
 <h4 style="font-size:14px;margin:18px 0 4px">Wizyty i dostępne godziny</h4>
 <p class="note">Dotknij wolnej godziny, aby umówić wizytę (minimum ${minBooking()} min). Przerwy prywatne blokują rezerwacje i nie wysyłają SMS-ów.</p>
 <div class="day-timeline">${timeline()}</div>`;
}
function bookingForm(){
 if(v.pickerOpen)return clientPicker();
 const f=v.form,start=v.slot,finish=f.endTime||hhmm(minutes(start)+f.duration);
 const duration=minutes(finish)-minutes(start),edit=findBooking(v.editBooking);
 const tooShort=!edit&&duration<minBooking();
 const ok=!tooShort&&available(v.date,start,duration,edit?.id??null);
 return `<div class="sheet-backdrop" data-a="backdrop-close"><section class="booking-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" tabindex="-1"><div class="sheet-handle"></div>
 <header class="sheet-header"><div><div class="tiny">${plDate(v.date)}</div><h2 id="sheet-title">${edit?'Edytuj wizytę':'Nowa wizyta'}</h2></div><button type="button" class="sheet-close" data-a="close-form" aria-label="Zamknij okno">×</button></header>
 <div class="sheet-scroll">${v.noticeBad?`<div class="notice warn" role="alert">${escapeHTML(v.notice)}</div>`:''}<div class="time-edit-grid"><div><label class="label" for="book-start">Rozpoczęcie</label><div class="stepper"><button data-a="adjust-time" data-side="start" data-delta="-5" aria-label="Początek 5 minut wcześniej">−</button><input class="time-direct" type="text" id="book-start" inputmode="numeric" maxlength="5" autocomplete="off" value="${start}" aria-label="Godzina rozpoczęcia"><button data-a="adjust-time" data-side="start" data-delta="5" aria-label="Początek 5 minut później">+</button></div></div>
 <div><label class="label" for="book-end">Zakończenie</label><div class="stepper"><button data-a="adjust-time" data-side="end" data-delta="-5" aria-label="Koniec 5 minut wcześniej">−</button><input class="time-direct" type="text" id="book-end" inputmode="numeric" maxlength="5" autocomplete="off" value="${finish}" aria-label="Godzina zakończenia"><button data-a="adjust-time" data-side="end" data-delta="5" aria-label="Koniec 5 minut później">+</button></div></div></div>
 <p class="tiny sheet-explain">Koryguj godzinę co 5 minut lub dotknij jej, aby wybrać czas. Przesuwając początek, zachowujesz długość wizyty.</p>
 <label class="label">Czas trwania · ${duration>0?duration+' min':'nieprawidłowy'}</label><div class="durations">${[30,60,90,120,150,180].map(n=>`<button class="dur ${duration===n?'active':''}" data-a="duration" data-n="${n}">${n} min</button>`).join('')}</div>
 <div class="notice ${ok?'good':'warn'}" role="status">${ok?`✓ Wolny termin: <b>${start}–${finish}</b>`:tooShort?`Minimalny czas nowej wizyty to ${minBooking()} minut (zmienisz go w Opcjach).`:'Nie można zapisać: przedział nie mieści się w godzinach pracy lub nachodzi na inną wizytę.'}</div>
 <label class="label" for="book-name">Imię, nazwisko lub nazwa klienta</label><input class="field" id="book-name" autocomplete="off" value="${escapeHTML(f.name)}" placeholder="Np. Ola, Jan Nowak">
 <label class="label" for="book-phone">Numer telefonu</label><input class="field" id="book-phone" type="tel" autocomplete="off" inputmode="tel" value="${escapeHTML(f.phone)}" placeholder="Np. 987654321"><div id="suggestions"></div>
 ${f.clientId!==null?'<div class="notice good">✓ Klient wybrany z bazy</div>':''}
 <button class="btn outline full clients-picker-button" data-a="show-clients">♧ Moi klienci · wybierz z bazy</button>
 </div><footer class="sheet-footer"><button class="btn outline" data-a="close-form">Anuluj</button><button class="btn" data-a="save-booking" ${ok?'':'disabled'}>${edit?'Zapisz zmiany':'Zapisz wizytę'}</button></footer></section></div>`;
}
function breakForm(){
 const edit=findBreak(v.breakEdit),start=v.breakStart,end=v.breakEnd;
 const ok=availableBreak(v.date,start,end,edit?.id??null);
 return `<div class="sheet-backdrop" data-a="backdrop-close"><section class="booking-sheet" role="dialog" aria-modal="true" aria-labelledby="break-title" tabindex="-1"><div class="sheet-handle"></div>
 <header class="sheet-header"><div><div class="tiny">${plDate(v.date)}</div><h2 id="break-title">${edit?'Edytuj przerwę':'Zablokuj czas'}</h2></div><button type="button" class="sheet-close" data-a="break-close" aria-label="Zamknij">×</button></header>
 <div class="sheet-scroll">${v.noticeBad?`<div class="notice warn" role="alert">${escapeHTML(v.notice)}</div>`:''}<p class="note">Tylko blokada w kalendarzu. Nie utworzymy klienta ani wiadomości SMS.</p>
 <div class="time-edit-grid"><div><label class="label" for="break-start">Od godziny</label><div class="stepper"><button data-a="break-step" data-side="start" data-delta="-5" aria-label="Przesuń początek o 5 minut wcześniej">−</button><input class="time-direct" type="text" id="break-start" inputmode="numeric" maxlength="5" autocomplete="off" value="${start}" aria-label="Początek blokady"><button data-a="break-step" data-side="start" data-delta="5" aria-label="Przesuń początek o 5 minut później">+</button></div></div>
 <div><label class="label" for="break-end">Do godziny</label><div class="stepper"><button data-a="break-step" data-side="end" data-delta="-5" aria-label="Zakończ przerwę 5 minut wcześniej">−</button><input class="time-direct" type="text" id="break-end" inputmode="numeric" maxlength="5" autocomplete="off" value="${end}" aria-label="Koniec blokady"><button data-a="break-step" data-side="end" data-delta="5" aria-label="Zakończ przerwę 5 minut później">+</button></div></div></div>
 <p class="tiny sheet-explain">Początek przesuwa cały blok, a zmiana zakończenia wydłuża lub skraca przerwę. Godzinę można też wpisać w formacie GG:MM.</p>
 <label class="label" for="break-label">Opis (opcjonalnie)</label><input class="field" id="break-label" maxlength="100" autocomplete="off" value="${escapeHTML(v.breakLabel)}" placeholder="Np. obiad, spacer, sprawy prywatne">
 <div class="notice ${ok?'good':'warn'}" role="status">${ok?`✓ Zablokujesz czas <b>${start}–${end}</b> (${minutes(end)-minutes(start)} min).`:'W tych godzinach jest już wizyta lub inna przerwa albo czas wykracza poza godziny pracy.'}</div></div>
 <footer class="sheet-footer"><button class="btn outline" data-a="break-close">Anuluj</button><button class="btn" data-a="break-save" ${ok?'':'disabled'}>${edit?'Zapisz zmiany':'Zapisz przerwę'}</button></footer></section></div>`;
}
function openBreak(id=null){
 const old=id!==null?findBreak(id):null,h=state.hours[dayIndex(v.date)];
 if(!validWork(h)){notice('Najpierw ustaw godziny pracy dla wybranego dnia.',true);return}
 let start=old?.start||h.from,end=old?.end||hhmm(Math.min(minutes(h.to),minutes(h.from)+60));
 if(!old){for(let t=minutes(h.from);t+5<=minutes(h.to);t+=5){const endCandidate=Math.min(minutes(h.to),t+60);if(availableBreak(v.date,hhmm(t),hhmm(endCandidate))){start=hhmm(t);end=hhmm(endCandidate);break}}}
 v.slot=null;v.editBooking=null;v.breakEdit=old?.id??null;v.breakStart=start;v.breakEnd=end;v.breakLabel=old?.label||'';v.breakDirty=false;v.breakOpen=true;v.notice='';v.noticeBad=false;
}
function closeBreak(force=false){
 if(!force&&v.breakDirty&&!window.confirm('Masz niezapisane zmiany przerwy. Zamknąć bez zapisywania?'))return false;
 v.breakOpen=false;v.breakEdit=null;v.breakDirty=false;v.breakLabel='';v.breakStart='';v.breakEnd='';return true;
}
function saveBreak(){
 const edit=findBreak(v.breakEdit),start=v.breakStart,end=v.breakEnd;
 if(!availableBreak(v.date,start,end,edit?.id??null)){notice('Przerwa koliduje z wizytą, inną blokadą lub godzinami pracy.',true);return}
 if(edit){edit.start=start;edit.end=end;edit.label=v.breakLabel.trim();notice('Zmieniono blokadę: '+start+'–'+end+'.')}
 else{const id=Math.max(0,...state.breaks.map(b=>b.id))+1;state.breaks.push({id,date:v.date,start,end,label:v.breakLabel.trim()});notice('Zablokowano czas: '+start+'–'+end+'.')}
 closeBreak(true);save();
}
function clientPicker(){
 return `<div class="sheet-backdrop" data-a="backdrop-close"><section class="booking-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" tabindex="-1"><div class="sheet-handle"></div><header class="sheet-header"><div><div class="tiny">Wizyta ${v.slot||''} · ${plDate(v.date)}</div><h2 id="sheet-title">Moi klienci</h2></div><button type="button" class="sheet-close" data-a="hide-clients" aria-label="Wróć do wizyty">×</button></header><div class="sheet-scroll"><p class="note">Wyszukaj imię, nazwisko lub fragment numeru telefonu.</p><label class="label" for="picker-search">Znajdź klienta</label><input class="field" id="picker-search" autocomplete="off" placeholder="Szukaj klienta lub numeru" value="${escapeHTML(v.pickerQuery)}"><div id="picker-results">${clientPickerRows()}</div></div><footer class="sheet-footer"><button class="btn outline full" data-a="hide-clients">← Wróć do wizyty</button></footer></section></div>`;
}
function clientPickerRows(){
 const q=v.pickerQuery.trim().toLowerCase();
 const list=state.clients.filter(c=>(c.name+' '+c.phone).toLowerCase().includes(q));
 return list.length?list.map(c=>`<button class="picker-row" data-a="choose-client" data-id="${c.id}"><span><b>${escapeHTML(c.name)}</b><br><small>${escapeHTML(c.phone)}</small></span><span>Wybierz ›</span></button>`).join(''):'<div class="empty">Nie znaleziono klienta.</div>';
}
function updateSuggestions(){const box=root.querySelector('#suggestions');if(!box)return;const ph=number(v.form.phone),nm=v.form.name.toLowerCase().trim();const xs=state.clients.filter(c=>(ph.length>=3&&number(c.phone).includes(ph))||(nm.length>=3&&c.name.toLowerCase().includes(nm))).slice(0,6);box.innerHTML=xs.length?`<div class="suggestions"><div class="tiny">Wybierz klienta z bazy:</div>${xs.map(c=>`<button class="suggest" data-a="choose-client" data-id="${c.id}"><b>${escapeHTML(c.name)}</b><span class="muted">${escapeHTML(c.phone)}</span></button>`).join('')}</div>`:''}
function clientList(){const q=v.search.toLowerCase().trim(),xs=state.clients.filter(c=>(c.name+' '+c.phone).toLowerCase().includes(q));return `<div class="muted" style="margin:11px 0">${xs.length} klientów</div>${xs.map(c=>`<article class="client-card"><div class="row"><div><div class="strong">${escapeHTML(c.name)}</div><div class="muted">${escapeHTML(c.phone)}</div><div class="tiny">Wizyty: ${state.bookings.filter(b=>b.clientId===c.id).length}</div></div></div><div class="actions"><button class="btn small" data-a="book-client" data-id="${c.id}">Umów wizytę</button><button class="btn outline small" data-a="edit-client" data-id="${c.id}">Edytuj</button></div>${state.bookings.filter(b=>b.clientId===c.id).slice(0,5).map(b=>`<div class="tiny" style="margin-top:7px">▣ ${plDate(b.date)} · ${span(b)}</div>`).join('')}${v.editId===c.id?clientForm():''}</article>`).join('')}`}
function clientForm(){return `<div class="divider"></div><label class="label">Nazwa klienta</label><input class="field" id="client-name" value="${escapeHTML(v.editName)}"><label class="label">Telefon</label><input class="field" id="client-phone" type="tel" value="${escapeHTML(v.editPhone)}"><div class="actions"><button class="btn outline small" data-a="close-client">Anuluj</button><button class="btn small" data-a="save-client">Zapisz</button></div>`}
function clients(){return `<label class="label">Szukaj klienta</label><input class="field" id="search-client" placeholder="Imię lub fragment numeru telefonu" value="${escapeHTML(v.search)}"><div id="client-list">${clientList()}</div><button class="btn full" data-a="add-client" style="margin-top:12px">＋ Dodaj klienta</button>${v.addClient?`<div class="card"><h3 class="section-title">Nowy klient</h3>${clientForm()}</div>`:''}`}
const allowedTags=['firma','klient','data','godzina','stara_data','stara_godzina'];
function textTemplate(template,data){return String(template).replace(/\{([a-z_]+)\}/g,(full,k)=>Object.prototype.hasOwnProperty.call(data,k)?String(data[k]):full)}
function messageValues(b){return {firma:state.company||'Zakład',klient:findClient(b.clientId)?.name||'Klient',data:plDate(b.date),godzina:b.time,stara_data:'',stara_godzina:''}}
function reminderMessage(b){return textTemplate(state.templates.reminder,messageValues(b))}
function taskMessage(t){return textTemplate(state.templates[t.type],{firma:state.company||'Zakład',klient:t.name,data:plDate(t.date),godzina:t.time,stara_data:plDate(t.oldDate||t.date),stara_godzina:t.oldTime||t.time})}
function smsDraftBox(text,phone,id,type){const uri='sms:'+encodeURIComponent(phone.startsWith('+')?phone:'+48'+number(phone))+'?body='+encodeURIComponent(text);return `<div class="notice"><b>Przygotowany SMS</b><div class="sample" style="margin:9px 0;background:white">${escapeHTML(text)}</div><div class="tiny">Numer: ${escapeHTML(phone)} · ${text.length} znaków</div><div class="actions"><button class="btn outline small" data-a="copy-sms" data-type="${type}" data-id="${id}">Kopiuj</button><a class="btn small" style="display:inline-flex;align-items:center;text-decoration:none" href="${escapeHTML(uri)}">Otwórz Wiadomości</a></div><div class="notice warn"><b>Uwaga:</b> otwarcie Wiadomości nie oznacza wysłania. Po powrocie potwierdź ręcznie tylko wtedy, gdy SMS rzeczywiście został wysłany.</div><div class="actions"><button class="btn outline small" data-a="close-draft">Nie wysłano</button><button class="btn small" data-a="confirm-${type}" data-id="${id}">Potwierdź wysłanie</button></div></div>`}
function sms(){const xs=onDay(v.smsDate),tasks=state.tasks.filter(t=>t.status!=='discarded');return `<div class="notice">Lista wiadomości na wybrany dzień. Testuj wysyłanie wyłącznie na własnym numerze telefonu! W razie potrzeby najpierw zmień numer w bazie testowej.</div><label class="label">Data wizyt</label><input class="field" type="date" id="sms-date" value="${v.smsDate}"><div class="card" style="background:#e9f3fd"><div class="cols2"><div><div class="muted">Do wysłania</div><strong style="font-size:28px">${xs.filter(b=>b.reminder!=='sent').length}</strong></div><div><div class="muted">Potwierdzone</div><strong style="font-size:28px">${xs.filter(b=>b.reminder==='sent').length}</strong></div></div></div>${xs.length?xs.map(b=>`<div class="card"><div class="row"><div class="grow"><div class="strong">${escapeHTML(findClient(b.clientId)?.name)}</div><div class="muted">${span(b)} · ${escapeHTML(findClient(b.clientId)?.phone)}</div></div>${b.reminder==='sent'?'<span class="status">✓ Wysłany</span>':`<button class="btn small" data-a="draft" data-type="reminder" data-id="${b.id}">Wyślij</button>`}</div>${v.compose?.type==='reminder'&&v.compose.id===b.id?smsDraftBox(reminderMessage(b),findClient(b.clientId).phone,b.id,'reminder'):''}</div>`).join(''):'<div class="empty">Brak rezerwacji w wybranym dniu.</div>'}<h3 class="section-title" style="margin-top:22px">Zmiany i odwołania (${tasks.filter(t=>t.status==='ready').length})</h3>${tasks.length?tasks.map(t=>`<div class="card"><div class="row"><div class="grow"><div class="strong">${t.type==='change'?'Zmiana terminu':'Odwołanie wizyty'}</div><div class="muted">${escapeHTML(t.name)} · ${escapeHTML(t.phone)}</div><div class="tiny">${plDate(t.date)} · ${t.time}</div></div>${t.status==='sent'?'<span class="status">✓ Wysłany</span>':`<button class="btn small" data-a="draft" data-type="task" data-id="${t.id}">Wyślij</button>`}</div>${v.compose?.type==='task'&&v.compose.id===t.id?smsDraftBox(taskMessage(t),t.phone,t.id,'task'):''}</div>`).join(''):'<div class="empty">Brak wiadomości o zmianach i odwołaniach.</div>'}<div class="notice">LOWRI nie wysyła SMS-ów automatycznie. PWA otwiera aplikację SMS, a status oznaczasz ręcznie. Nie jest to potwierdzenie doręczenia.</div>`}
function timeSelect(value,key,index){let options='';for(let i=360;i<=1320;i+=15){const t=hhmm(i);options+=`<option value="${t}" ${t===value?'selected':''}>${t}</option>`}return `<select class="field" data-c="${key}" ${index===null?'':`data-i="${index}"`}>${options}</select>`}
function smsSample(){const values={firma:v.draftCompany.trim()||'Twój zakład',klient:'Anna Kowalska',data:'20.11.2026',godzina:'09:00',stara_data:'19.11.2026',stara_godzina:'10:00'};return textTemplate(v.draftTemplates[v.smsTab],values)}
function settings(){const invalid=state.bookings.filter(b=>{const h=state.hours[dayIndex(b.date)];return !validWork(h)||minutes(b.time)<minutes(h.from)||minutes(b.time)+b.duration>minutes(h.to)}).length;
return `<h3 class="section-title">Godziny pracy</h3><div class="card" style="background:#eaf4fd"><div class="strong">Jednakowe godziny dla całego tygodnia</div><div class="cols2"><div><label class="label">Od</label>${timeSelect(v.allFrom,'all-from',null)}</div><div><label class="label">Do</label>${timeSelect(v.allTo,'all-to',null)}</div></div><button class="btn full" style="margin-top:11px" data-a="apply-all" ${v.allFrom>=v.allTo?'disabled':''}>Ustaw na wszystkie dni</button></div><h4 style="font-size:14px;margin:20px 0 6px">Lub ustaw każdy dzień osobno</h4><div class="card">${state.hours.map((h,i)=>`<div class="hours-row"><label class="hours-label"><input type="checkbox" data-c="toggle-day" data-i="${i}" ${h.on?'checked':''}>${names[i]}</label>${h.on?`<div class="hours-fields">${timeSelect(h.from,'from',i)}<span>–</span>${timeSelect(h.to,'to',i)}</div>`:'<span class="muted">Dzień wolny</span>'}</div>${h.on&&h.from>=h.to?'<div class="tiny danger-text">Nieprawidłowe godziny pracy.</div>':''}`).join('')}</div>${invalid?`<div class="notice warn">${invalid} zapisanych wizyt wypada poza godzinami pracy. Nie usuwamy ich automatycznie.</div>`:''}<div class="divider"></div><h3 class="section-title">Minimalny czas wizyty</h3><p class="note">Najkrótszy nieprzerwany wolny przedział, który aplikacja zaproponuje do nowej rezerwacji.</p><div class="card min-card"><div class="min-choices" role="group" aria-label="Minimalny czas nowej wizyty">${minOptions.map(n=>`<button type="button" class="min-option ${minBooking()===n?'active':''}" data-a="min-booking" data-n="${n}" aria-pressed="${minBooking()===n}">${n} min</button>`).join('')}</div><div class="min-description">Teraz: <b>${minBooking()} minut</b>. Krótsze przerwy pozostaną widoczne w terminarzu, ale nie będą oznaczane jako dostępne. Nie zmieniamy już zapisanych wizyt.</div><div class="min-preview"><span>08:00–08:05 · Przerwa 5 min</span><span>08:05–08:25 · Wizyta 20 min</span><span>08:25–08:30 · Przerwa 5 min</span><b>Ten dzień będzie czerwony, jeśli nie ma innych wolnych przedziałów co najmniej ${minBooking()} min.</b></div></div><div class="divider"></div><h3 class="section-title">Moje wiadomości SMS</h3><p class="note">Wpisz nazwę zakładu i dostosuj wiadomości do klientów.</p><div class="card"><label class="label">Nazwa zakładu / podpis</label><input class="field" id="company" value="${escapeHTML(v.draftCompany)}" placeholder="Np. Salon Anna"><div class="sms-tabs">${[['reminder','Przypomnienie'],['change','Zmiana'],['cancel','Odwołanie']].map(([key,label])=>`<button class="sms-tab ${v.smsTab===key?'active':''}" data-a="sms-tab" data-tab="${key}">${label}</button>`).join('')}</div><label class="label">Treść wiadomości</label><textarea class="field textarea" id="template">${escapeHTML(v.draftTemplates[v.smsTab])}</textarea><div class="tags">${allowedTags.map(t=>`<button class="tag" data-a="tag" data-tag="{${t}}">{${t}}</button>`).join('')}</div><label class="label">Podgląd wiadomości</label><div id="sms-preview" class="sample"></div><p id="sms-length" class="tiny"></p><div class="actions"><button class="btn outline small" data-a="restore-template">Przywróć wzór</button><button class="btn" data-a="save-templates">Zapisz SMS-y</button></div></div><div class="divider"></div><h3 class="section-title">Kopia zapasowa</h3><p class="note">Dane zapisują się na tym urządzeniu. Aby ich nie utracić, wykonaj szyfrowaną kopię i przechowuj ją bezpiecznie.</p><div class="card"><label class="label">Hasło kopii (min. 8 znaków)</label><input class="field" type="password" id="backup-pass" value="${escapeHTML(v.backupPass)}" placeholder="Hasło do szyfrowania"><button class="btn full" data-a="backup" style="margin-top:11px">Pobierz szyfrowaną kopię</button><div class="divider"></div><button class="btn full outline" data-a="restore-toggle">Przywróć kopię z pliku</button>${v.restoreVisible?`<label class="label">Plik kopii .wzm</label><input class="field file-input" type="file" id="restore-file" accept=".wzm,application/json"><label class="label">Hasło kopii</label><input class="field" type="password" id="restore-pass" value="${escapeHTML(v.restorePass)}" placeholder="Hasło zapisanej kopii"><button class="btn full" data-a="restore-backup" style="margin-top:12px">Przywróć dane z kopii</button>`:''}</div><div class="notice warn">BETA: używaj wyłącznie przykładowych danych. Zanim wprowadzimy prawdziwych klientów, sprawdzimy ochronę danych, kopie, zgodność z RODO i niezawodność w dłuższych testach.</div><div class="divider"></div><button class="btn outline full" data-a="ask-reset">Przywróć dane demonstracyjne</button>${v.resetConfirm?`<div class="notice warn">To skasuje aktualne dane testowe z tego urządzenia. Kontynuować?<div class="actions"><button class="btn outline small" data-a="reset-no">Nie</button><button class="btn danger small" data-a="reset-yes">Tak, wyczyść</button></div></div>`:''}`}
function smsPreviewUpdate(){const el=root.querySelector('#sms-preview'),length=root.querySelector('#sms-length');if(el){const t=smsSample();el.textContent=t;if(length)length.textContent=`${t.length} znaków (podgląd; faktyczny podział SMS zależy od kodowania)`}}
function render(){if(securityMode!=='ready'){securityView();return}root.innerHTML=header()+`<div class="security-toolbar"><span>🔐 Baza szyfrowana</span><button type="button" data-security="lock">Zablokuj</button></div><main class="main">${v.notice?`<div class="notice ${v.noticeBad?'warn':'good'}" role="status">${escapeHTML(v.notice)}</div>`:''}${v.page==='home'?home():v.page==='calendar'?calendar():v.page==='clients'?clients():v.page==='sms'?sms():settings()}${v.page!=='home'?'<div class="footer">LOWRI · SECURITY BETA 1.0.1</div>':''}<div class="offline-status">${storageOK?'Dane zapisywane lokalnie na tym telefonie':'Uwaga: trwały zapis danych niedostępny'}</div></main>${v.page==='home'?'':bottomNav()}${v.page==='calendar'&&v.slot?bookingForm():''}${v.page==='calendar'&&v.breakOpen?breakForm():''}`;document.body.classList.toggle('wz-modal-open',v.page==='calendar'&&(!!v.slot||v.breakOpen));if(v.page==='calendar'&&v.slot&&!v.pickerOpen)updateSuggestions();if(v.page==='settings')smsPreviewUpdate()}
function parseClock(raw){
 const s=String(raw??'').trim();
 const match=/^(\d{1,2}):(\d{2})$/.exec(s)||/^(\d{1,2})(\d{2})$/.exec(s);
 if(!match)return null;
 const h=Number(match[1]),m=Number(match[2]);
 if(!Number.isInteger(h)||!Number.isInteger(m)||h>24||m>59||(h===24&&m!==0))return null;
 return hhmm(h*60+m);
}
function closeSheet(force=false){
 if(!force&&v.modalDirty&&!window.confirm('Masz niezapisane zmiany wizyty. Zamknąć bez zapisywania?'))return false;
 v.slot=null;v.editBooking=null;v.pickerOpen=false;v.pickerQuery='';v.prefillClientId=null;v.modalDirty=false;return true;
}
function navigate(page){v.page=page;v.notice='';v.slot=null;v.moving=null;v.editBooking=null;v.breakOpen=false;v.breakEdit=null;v.breakDirty=false;v.pickerOpen=false;v.compose=null;v.confirmCancel=null;if(page==='settings'){v.draftCompany=state.company;v.draftTemplates={...state.templates}}render();window.scrollTo({top:0,behavior:'instant'})}
function newTask(type,b,oldDate,oldTime){const c=findClient(b.clientId);const existing=state.tasks.find(t=>t.bookingId===b.id&&t.status==='ready');if(existing&&type==='change'){existing.date=b.date;existing.time=b.time;existing.name=c?.name||'';existing.phone=c?.phone||'';return}if(existing&&type==='cancel')state.tasks=state.tasks.filter(t=>t.id!==existing.id);state.tasks.push({id:Math.max(0,...state.tasks.map(x=>x.id))+1,bookingId:b.id,type,status:'ready',name:c?.name||'',phone:c?.phone||'',date:type==='cancel'?oldDate:b.date,time:type==='cancel'?oldTime:b.time,oldDate,oldTime})}
function saveBooking(){
 const f=v.form,nm=f.name.trim(),ph=number(f.phone),endTime=f.endTime||hhmm(minutes(v.slot)+f.duration);
 const dur=minutes(endTime)-minutes(v.slot),editing=findBooking(v.editBooking);
 if(!nm||ph.length<7||ph.length>15){notice('Wprowadź nazwę i numer telefonu od 7 do 15 cyfr.',true);return}
 if((!editing&&dur<minBooking())||!available(v.date,v.slot,dur,editing?.id??null)){notice('Ten przedział nie jest dostępny. Minimalny czas nowej wizyty: '+minBooking()+' min. Sprawdź kolizje i godziny pracy.',true);return}
 let c=f.clientId!==null?findClient(f.clientId):null;
 if(c&&(c.name!==nm||number(c.phone)!==ph))c=null;
 if(!c)c=state.clients.find(x=>x.name.toLowerCase()===nm.toLowerCase()&&number(x.phone)===ph);
 if(!c){c={id:Math.max(0,...state.clients.map(x=>x.id))+1,name:nm,phone:ph};state.clients.push(c)}
 if(editing){
  const changedTime=editing.date!==v.date||editing.time!==v.slot||editing.duration!==dur;
  const changedClient=editing.clientId!==c.id;
  const oldDate=editing.date,oldTime=editing.time;
  if(changedClient&&editing.everSent){
   // The old recipient must be notified. Snapshot their contact before changing the booking.
   newTask('cancel',editing,oldDate,oldTime);
  }
  editing.clientId=c.id;editing.date=v.date;editing.time=v.slot;editing.duration=dur;
  if(changedTime||changedClient){if(editing.everSent&&!changedClient)newTask('change',editing,oldDate,oldTime);editing.reminder='ready';if(changedClient)editing.everSent=false}
  notice('Zmieniono wizytę: '+span(editing)+' · '+c.name+'.'+(editing.everSent&&changedTime?' Przygotowano SMS o zmianie.':''));
 }else{
  const b={id:Math.max(0,...state.bookings.map(x=>x.id))+1,clientId:c.id,date:v.date,time:v.slot,duration:dur,reminder:'ready',everSent:false};state.bookings.push(b);notice('Zapisano: '+span(b)+' · '+c.name);
 }
 v.slot=null;v.editBooking=null;v.prefillClientId=null;v.modalDirty=false;save();
}
function base64(arr){const bytes=new Uint8Array(arr);let out='';for(let i=0;i<bytes.length;i+=0x8000)out+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(out)}
function unbase64(data){return Uint8Array.from(atob(data),c=>c.charCodeAt(0))}
async function deriveKey(pass,salt,usage){const raw=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:210000},raw,{name:'AES-GCM',length:256},false,[usage])}
async function makeBackup(){if(!crypto?.subtle){notice('Szyfrowanie wymaga HTTPS.',true);render();return}if(v.backupPass.length<8){notice('Hasło kopii musi mieć przynajmniej 8 znaków.',true);render();return}try{await saveQueue;const salt=crypto.getRandomValues(new Uint8Array(16));const iv=crypto.getRandomValues(new Uint8Array(12));const key=await deriveKey(v.backupPass,salt,'encrypt');const data=new TextEncoder().encode(JSON.stringify(state));const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,data);const content={format:'wizmero-encrypted-backup',version:1,kdf:'PBKDF2-SHA256-210000',salt:base64(salt),iv:base64(iv),ciphertext:base64(cipher)};const blob=new Blob([JSON.stringify(content)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='LOWRI_kopia_'+new Date().toISOString().slice(0,10)+'.wzm';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);notice('Zapisano szyfrowaną kopię. Nie zapomnij hasła.')}catch(err){console.error(err);notice('Nie udało się utworzyć kopii.',true)}render()}
async function restoreBackup(){if(!v.restoreFile){notice('Wybierz plik .wzm.',true);render();return}if(!v.restorePass){notice('Podaj hasło kopii.',true);render();return}try{const data=JSON.parse(await v.restoreFile.text());if(data.format!=='wizmero-encrypted-backup'||data.version!==1)throw Error('Nieprawidłowy plik');const key=await deriveKey(v.restorePass,unbase64(data.salt),'decrypt');const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unbase64(data.iv)},key,unbase64(data.ciphertext));const restored=JSON.parse(new TextDecoder().decode(plain));if(!validData(restored))throw Error('Niezgodny format danych');normalizeState(restored);if(!window.confirm('Przywrócenie kopii zastąpi WSZYSTKIE aktualne dane na tym urządzeniu. Kontynuować?'))return;state=restored;save();v=viewInitial();notice('Przywrócono dane z zaszyfrowanej kopii.');render()}catch(err){console.warn('Wizmero backup restore',err);notice('Przywracanie nie powiodło się. Sprawdź plik i hasło.',true);render()}}
root.addEventListener('input',e=>{const id=e.target.id;if(id==='book-name'){v.form.name=e.target.value;v.form.clientId=null;v.modalDirty=true;updateSuggestions()}else if(id==='book-phone'){v.form.phone=e.target.value;v.form.clientId=null;v.modalDirty=true;updateSuggestions()}else if(id==='search-client'){v.search=e.target.value;const el=root.querySelector('#client-list');if(el)el.innerHTML=clientList()}else if(id==='picker-search'){v.pickerQuery=e.target.value;const el=root.querySelector('#picker-results');if(el)el.innerHTML=clientPickerRows()}else if(id==='client-name')v.editName=e.target.value;else if(id==='client-phone')v.editPhone=e.target.value;else if(id==='company'){v.draftCompany=e.target.value;smsPreviewUpdate()}else if(id==='template'){v.draftTemplates[v.smsTab]=e.target.value;smsPreviewUpdate()}else if(id==='backup-pass')v.backupPass=e.target.value;else if(id==='restore-pass')v.restorePass=e.target.value;else if(id==='break-label'){v.breakLabel=e.target.value;v.breakDirty=true}});
root.addEventListener('change',e=>{
 const el=e.target;
 if((el.id==='book-start'||el.id==='book-end')&&v.slot){
  const x=parseClock(el.value);
  if(x!==null&&minutes(x)%5===0){
   const start=minutes(v.slot),end=minutes(v.form.endTime||hhmm(start+v.form.duration));
   if(el.id==='book-start'&&minutes(x)<1440&&minutes(x)+(end-start)<=1440){v.slot=x;v.form.endTime=hhmm(minutes(x)+(end-start));v.modalDirty=true}
   else if(el.id==='book-end'&&minutes(x)>start){v.form.endTime=x;v.form.duration=minutes(x)-start;v.modalDirty=true}
   else notice('Nieprawidłowy zakres godzin.',true);
  }else notice('Wpisz godzinę w formacie GG:MM, co 5 minut, np. 09:25.',true);
  render();return;
 }
 if((el.id==='break-start'||el.id==='break-end')&&v.breakOpen){
  const parsed=parseClock(el.value);
  if(parsed!==null&&minutes(parsed)%5===0){
   const a=minutes(v.breakStart),z=minutes(v.breakEnd);
   if(el.id==='break-start'&&minutes(parsed)+(z-a)<=1440){v.breakStart=parsed;v.breakEnd=hhmm(minutes(parsed)+(z-a));v.breakDirty=true}
   else if(el.id==='break-end'&&minutes(parsed)>a){v.breakEnd=parsed;v.breakDirty=true}
   else notice('Nieprawidłowy przedział czasu.',true);
  }else notice('Wpisz godzinę GG:MM co 5 minut, np. 12:35.',true);
  render();return;
 }
 const k=el.dataset.c;if(el.id==='restore-file' ){v.restoreFile=el.files?.[0]||null;return}if(el.id==='sms-date'){v.smsDate=el.value;v.compose=null;render();return}if(!k)return;const i=Number(el.dataset.i);if(k==='all-from')v.allFrom=el.value;else if(k==='all-to')v.allTo=el.value;else if(k==='toggle-day')state.hours[i].on=el.checked;else if(k==='from')state.hours[i].from=el.value;else if(k==='to')state.hours[i].to=el.value;if(k==='toggle-day'||k==='from'||k==='to')save();render()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&v.page==='calendar'&&(v.slot||v.breakOpen)){e.preventDefault();if(v.breakOpen){if(!closeBreak())return}else if(v.pickerOpen)v.pickerOpen=false;else if(!closeSheet())return;render()}});
root.addEventListener('click',async e=>{const b=e.target.closest('[data-a]');if(!b)return;if(b.dataset.a==='backdrop-close'&&b!==e.target)return;const a=b.dataset.a,id=Number(b.dataset.id);v.notice='';v.noticeBad=false;
if(a==='home'||a==='page'){navigate(a==='home'?'home':b.dataset.page);return}
else if(a==='new-visit'){navigate('calendar');return}
else if(a==='preview'){navigate('calendar');return}
else if(a==='prev-week'||a==='next-week'){const n=a==='prev-week'?-7:7;v.week=dateAdd(v.week,n);v.date=dateAdd(v.date,n);v.slot=null;v.editBooking=null}
else if(a==='day'){v.date=b.dataset.date;v.slot=null;v.editBooking=null}
else if(a==='new-break'){openBreak();}
else if(a==='edit-break'){openBreak(id);}
else if(a==='ask-delete-break'){v.breakDelete=id;}
else if(a==='cancel-delete-break'){v.breakDelete=null;}
else if(a==='delete-break'){const old=findBreak(id);if(old){state.breaks=state.breaks.filter(b=>b.id!==id);v.breakDelete=null;notice('Usunięto przerwę '+old.start+'–'+old.end+'. Czas znów jest dostępny.');save()}}
else if(a==='today'){const now=new Date();const d=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');v.date=d;v.week=dateAdd(d,-dayIndex(d));v.slot=null;v.editBooking=null}
else if(a==='slot'){const t=b.dataset.time;
 if(v.moving!==null){
  const old=findBooking(v.moving);
  if(old&&available(v.date,t,old.duration,old.id)){
   const c=findClient(old.clientId);v.slot=t;v.editBooking=old.id;v.moving=null;
   v.form={name:c?.name||'',phone:c?.phone||'',duration:old.duration,clientId:old.clientId,endTime:hhmm(minutes(t)+old.duration)};
   v.modalDirty=true;
  }else notice('Nie ma tu miejsca na przenoszoną wizytę.',true);
 }else{v.slot=t;v.editBooking=null;v.modalDirty=false;const c=findClient(v.prefillClientId);let defaultDuration=30;while(defaultDuration>minBooking()&&!available(v.date,t,defaultDuration))defaultDuration-=5;v.form={name:c?.name||'',phone:c?.phone||'',duration:defaultDuration,clientId:c?.id??null,endTime:hhmm(minutes(t)+defaultDuration)}}
}
else if(a==='duration'){v.form.duration=Number(b.dataset.n);v.form.endTime=hhmm(minutes(v.slot)+v.form.duration);v.modalDirty=true}
else if(a==='book-client'){const c=findClient(id);if(c){v.prefillClientId=c.id;navigate('calendar');notice('Wybierz wolny początek wizyty dla '+c.name+'.');render();return}}
else if(a==='edit-booking'){const x=findBooking(id);if(x){v.date=x.date;v.slot=x.time;v.editBooking=x.id;v.moving=null;v.prefillClientId=null;const c=findClient(x.clientId);v.form={name:c?.name||'',phone:c?.phone||'',duration:x.duration,clientId:x.clientId,endTime:ends(x)};v.modalDirty=false;}}
else if(a==='break-step'){
 const side=b.dataset.side,delta=Number(b.dataset.delta),start=minutes(v.breakStart),end=minutes(v.breakEnd);
 if(side==='start'){const next=start+delta;if(next>=0&&next+(end-start)<=1440){v.breakStart=hhmm(next);v.breakEnd=hhmm(next+(end-start));v.breakDirty=true}}
 else{const next=end+delta;if(next>start&&next<=1440){v.breakEnd=hhmm(next);v.breakDirty=true}}
}
else if(a==='break-save'){saveBreak()}
else if(a==='break-close'){if(!closeBreak())return}
else if(a==='adjust-time'){
 const side=b.dataset.side,delta=Number(b.dataset.delta),start=minutes(v.slot),end=minutes(v.form.endTime||hhmm(start+v.form.duration));
 if(side==='start'){
  const next=start+delta;if(next>=0&&next+(end-start)<=1440){v.slot=hhmm(next);v.form.endTime=hhmm(next+(end-start));v.modalDirty=true}
 }else{const next=end+delta;if(next>start&&next<=1440){v.form.endTime=hhmm(next);v.form.duration=next-start;v.modalDirty=true}}
}
else if(a==='show-clients'){v.pickerOpen=true;v.pickerQuery=''}
else if(a==='hide-clients'){v.pickerOpen=false}
else if(a==='choose-client'){const c=findClient(id);if(c){v.form.name=c.name;v.form.phone=c.phone;v.form.clientId=c.id;v.pickerOpen=false;v.modalDirty=true}}
else if(a==='close-form'||a==='backdrop-close'){if(v.breakOpen){if(!closeBreak())return}else if(!closeSheet())return}
else if(a==='save-booking')saveBooking();
else if(a==='move'){v.moving=id;v.slot=null;v.editBooking=null;notice('Wybierz nowy dzień i godzinę.');}
else if(a==='stop-move')v.moving=null;
else if(a==='ask-cancel')v.confirmCancel=id;
else if(a==='cancel-no')v.confirmCancel=null;
else if(a==='cancel-yes'){const x=findBooking(id);if(x){if(x.everSent)newTask('cancel',x,x.date,x.time);else state.tasks=state.tasks.filter(t=>!(t.bookingId===x.id&&t.status==='ready'));state.bookings=state.bookings.filter(bb=>bb.id!==id);v.confirmCancel=null;v.moving=null;notice(x.everSent?'Odwołano wizytę. Przygotowano SMS do klienta.':'Odwołano wizytę i niewysłane przypomnienie.');save()}}
else if(a==='add-client'){v.addClient=true;v.editId=null;v.editName='';v.editPhone=''}
else if(a==='edit-client'){const c=findClient(id);v.editId=id;v.addClient=false;v.editName=c.name;v.editPhone=c.phone}
else if(a==='close-client'){v.addClient=false;v.editId=null}
else if(a==='save-client'){const name=v.editName.trim(),phone=number(v.editPhone);if(!name||phone.length<7||phone.length>15)notice('Podaj nazwę klienta i telefon (7–15 cyfr).',true);else if(v.editId!==null){const c=findClient(v.editId);c.name=name;c.phone=phone;v.editId=null;notice('Zmieniono dane klienta.');save()}else{state.clients.push({id:Math.max(0,...state.clients.map(c=>c.id))+1,name,phone});v.addClient=false;notice('Dodano klienta.');save()}}
else if(a==='draft'){v.compose={type:b.dataset.type,id}}
else if(a==='close-draft')v.compose=null;
else if(a==='copy-sms'){const type=b.dataset.type,t=type==='reminder'?reminderMessage(findBooking(id)):taskMessage(state.tasks.find(x=>x.id===id));try{await navigator.clipboard.writeText(t);notice('Skopiowano treść wiadomości.')}catch{notice('Nie udało się skopiować automatycznie.',true)}}
else if(a==='confirm-reminder'){const bb=findBooking(id);if(bb){bb.reminder='sent';bb.everSent=true;save()}v.compose=null;notice('Ręcznie potwierdzono wysłanie. To nie jest raport doręczenia.')}
else if(a==='confirm-task'){const tt=state.tasks.find(x=>x.id===id);if(tt){tt.status='sent';save()}v.compose=null;notice('Potwierdzono wysłanie wiadomości o zmianie lub odwołaniu.')}
else if(a==='min-booking'){const n=Number(b.dataset.n);if(minOptions.includes(n)){state.minimumBookingMinutes=n;save();notice('Minimalny czas nowej wizyty: '+n+' min. Kalendarz został przeliczony.')}}
else if(a==='apply-all'){if(v.allFrom>=v.allTo)notice('Godzina końca musi być późniejsza od początku.',true);else{state.hours.forEach(h=>{h.on=true;h.from=v.allFrom;h.to=v.allTo});notice('Ustawiono godziny na cały tydzień.');save()}}
else if(a==='sms-tab'){v.smsTab=b.dataset.tab}
else if(a==='tag'){const ta=root.querySelector('#template');if(ta){const start=ta.selectionStart,end=ta.selectionEnd,tag=b.dataset.tag;v.draftTemplates[v.smsTab]=ta.value.slice(0,start)+tag+ta.value.slice(end);ta.value=v.draftTemplates[v.smsTab];ta.focus();ta.setSelectionRange(start+tag.length,start+tag.length);smsPreviewUpdate();return}}
else if(a==='restore-template'){v.draftTemplates[v.smsTab]=defaults().templates[v.smsTab]}
else if(a==='save-templates'){let err='';for(const key of ['reminder','change','cancel']){const t=v.draftTemplates[key]?.trim();if(!t){err='Każda z trzech wiadomości musi mieć treść.';break}const unknown=[...t.matchAll(/\{([^{}]+)\}/g)].map(x=>x[1]).filter(k=>!allowedTags.includes(k));if(unknown.length){err='Nieznany znacznik: { '+unknown[0]+' }.';break}if(!t.includes('{data}')||!t.includes('{godzina}')){err='Każdy SMS musi zawierać znaczniki {data} i {godzina}.';break}}if(err)notice(err,true);else{state.company=v.draftCompany.trim();state.templates={...v.draftTemplates};notice('Zapisano podpis i treść trzech rodzajów SMS-ów.');save()}}
else if(a==='backup'){await makeBackup();return}
else if(a==='restore-toggle')v.restoreVisible=!v.restoreVisible;
else if(a==='restore-backup'){await restoreBackup();return}
else if(a==='ask-reset')v.resetConfirm=true;
else if(a==='reset-no')v.resetConfirm=false;
else if(a==='reset-yes'){state=defaults();v=viewInitial();save();notice('Przywrócono dane testowe.');}
render();
});
(async()=>{
 try{
  if(!globalThis.crypto?.subtle||!globalThis.indexedDB)throw new Error('Brak WebCrypto lub IndexedDB');
  db=await openDB();const saved=await readDB();
  if(saved?.format===SECURE_FORMAT&&saved?.version===1){encryptedRecord=saved;securityMode='unlock'}
  else if(saved&&validData(saved)){state=normalizeState(saved);securityMode='migrate'}
  else if(saved){throw new Error('Nieznany format danych - nie nadpisujemy go!')}
  else securityMode='setup';
  storageOK=true;
 }catch(err){console.error('Secure IndexedDB init',err);storageOK=false;securityMode='unavailable';securityError='Nie można bezpiecznie otworzyć danych. Niczego nie usunięto.'}
 render();
 if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
  navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('Offline cache',e))
 }
})();
})();
