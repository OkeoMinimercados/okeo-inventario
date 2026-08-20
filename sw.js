const CACHE='okeo-gestao-v4-1-8';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.png','./okeo-logo.png'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;

  const url=new URL(req.url);

  // APIs, Google Apps Script and any cross-origin request always go directly to network.
  if(url.origin!==self.location.origin){
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=>{
      const network=fetch(req).then(resp=>{
        if(resp && resp.ok){
          const copy=resp.clone();
          caches.open(CACHE).then(cache=>cache.put(req,copy));
        }
        return resp;
      });

      // HTML navigation prefers network so deployments become visible immediately.
      if(req.mode==='navigate'){
        return network.catch(()=>cached||caches.match('./index.html'));
      }

      return cached||network;
    })
  );
});
