const CACHE = 'wizmero-beta-0-8-v1';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './assets/icon-192.png', './assets/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{
  const r=event.request;
  if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
  event.respondWith(fetch(r).then(res=>{if(res.ok){const dup=res.clone();caches.open(CACHE).then(c=>c.put(r,dup))}return res}).catch(async()=>await caches.match(r)||await caches.match('./index.html')));
});
