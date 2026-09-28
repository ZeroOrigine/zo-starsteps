/* Star Steps service worker: the site works offline. Only this site's own files are cached;
   account and payment calls (other origins) always go to the network. */
const V="starsteps-v8";
const ASSETS=["/","/play/","/play/grownups.js","/play/grownups.css","/play/account.js","/play/account-pre.js","/js/ss-account.js","/vendor/supabase-2.117.2.js","/parents/","/privacy/","/terms/","/manifest.webmanifest","/img/pip.webp","/img/app-path.webp","/img/app-lesson.webp","/icons/icon-192.png","/icons/icon-512.png","/icons/maskable-512.png","/icons/icon-180.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
/* pages ask which version is in control (the v7 worker cached other sites' replies, so pages wait it out) */
self.addEventListener("message",e=>{if(e.data==="ss-version"&&e.source)e.source.postMessage({ssVersion:V});});
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const u=new URL(e.request.url);
 if(u.origin!==location.origin||u.pathname.indexOf("/_")===0)return;
 /* An app open served from the cache still refreshes the page in the background.
    That refresh carries x-ss-open so the server-side counter can count the open.
    The header holds no data: it only says "this was an app open". */
 const nav=e.request.mode==="navigate";
 const netReq=nav?new Request(e.request.url,{headers:{"x-ss-open":"1"},credentials:"same-origin"}):e.request;
 e.respondWith(
  caches.match(e.request,{ignoreSearch:true}).then(hit=>{
   const net=fetch(netReq).then(r=>{
    if(r&&r.ok){const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp));}
    return r;
   }).catch(()=>hit);
   return hit||net;
  })
 );
});
