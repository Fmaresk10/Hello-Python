const CAFASSO_CACHE='cafasso-shell-20260924-9';
const SCOPE=self.registration.scope;
const url=path=>new URL(path,SCOPE).href;
const OFFLINE=url('./offline.html');
const PRECACHE=[
  './',
  './index.html',
  './login.html',
  './world.html',
  './offline.html',
  './manifest.webmanifest',
  './cafasso-mark.svg',
  './cafasso-logo.svg',
  './cafasso-icon-192.png',
  './cafasso-app-icon.svg',
  './cafasso-app-icon-maskable.svg',
  './pwa-register.js'
].map(url);

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CAFASSO_CACHE).then(cache=>cache.addAll(PRECACHE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('cafasso-shell-')&&key!==CAFASSO_CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const requestUrl=new URL(request.url);
  if(requestUrl.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(response&&response.ok){
          const cache=await caches.open(CAFASSO_CACHE);
          cache.put(request,response.clone()).catch(()=>{});
        }
        return response;
      }catch(error){
        return (await caches.match(request))||(await caches.match(OFFLINE))||Response.error();
      }
    })());
    return;
  }

  const staticAsset=/\.(?:css|js|svg|png|jpg|jpeg|webp|gif|ico|webmanifest|json|woff2?)$/i.test(requestUrl.pathname);
  if(!staticAsset)return;

  event.respondWith((async()=>{
    const cache=await caches.open(CAFASSO_CACHE);
    const cached=await caches.match(request);

    if(requestUrl.pathname.endsWith('.webmanifest')){
      try{
        const response=await fetch(request,{cache:'no-store'});
        if(response&&response.ok)cache.put(request,response.clone()).catch(()=>{});
        return response;
      }catch(error){
        return cached||Response.error();
      }
    }

    const fresh=fetch(request).then(async response=>{
      if(response&&response.ok)cache.put(request,response.clone()).catch(()=>{});
      return response;
    }).catch(()=>null);
    return cached||(await fresh)||Response.error();
  })());
});
