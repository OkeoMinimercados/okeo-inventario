
const DB='okeo-v7-cache', VER=1;
function openDb(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,VER);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('cache'))d.createObjectStore('cache',{keyPath:'key'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
export async function cacheGet(key){try{const d=await openDb();return await new Promise((res,rej)=>{const t=d.transaction('cache','readonly'),r=t.objectStore('cache').get(key);r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)})}catch(e){return null}}
export async function cacheSet(key,value){try{const d=await openDb();return await new Promise((res,rej)=>{const t=d.transaction('cache','readwrite');t.objectStore('cache').put({key,value,at:Date.now()});t.oncomplete=()=>res(true);t.onerror=()=>rej(t.error)})}catch(e){return false}}
export async function cacheDelete(key){try{const d=await openDb();const t=d.transaction('cache','readwrite');t.objectStore('cache').delete(key)}catch(e){}}
