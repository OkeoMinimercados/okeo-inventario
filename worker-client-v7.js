
let w=null,seq=0,pending=new Map();
function getW(){if(w)return w;w=new Worker('./analytics-worker-v7.js');w.onmessage=e=>{const p=pending.get(e.data.id);if(!p)return;pending.delete(e.data.id);e.data.ok?p.resolve(e.data.result):p.reject(new Error(e.data.error))};return w}
export function calc(type,payload){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});getW().postMessage({id,type,payload})})}
export function cancel(){if(w){w.terminate();w=null}pending.forEach(p=>p.reject(new Error('CANCELLED')));pending.clear()}
