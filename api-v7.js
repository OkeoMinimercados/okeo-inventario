
import {cacheGet,cacheSet} from './db-v7.js';
export const BASE='https://script.google.com/macros/s/AKfycbxFBV9P3t0t4FAX4y83yPhQpQnDmLJzNsp4afqoD6NKXMBROOO6Zm-00fuWgqjrcvgq/exec';
const inflight=new Map();
export function token(){return localStorage.getItem('okeo_v7_token')||''}
export async function get(action,params={},opts={}){
  const key='api:'+action+':'+JSON.stringify(params), ttl=opts.ttl??300000, cached=await cacheGet(key);
  if(opts.cache!==false && cached && Date.now()-cached.at<ttl) return {...cached.value,__cached:true};
  if(inflight.has(key)) return inflight.get(key);
  const p=(async()=>{
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),opts.timeout??8000);
    try{
      const u=new URL(BASE);u.searchParams.set('action',action);if(token())u.searchParams.set('token',token());
      Object.entries(params).forEach(([k,v])=>{if(v!==''&&v!==null&&v!==undefined)u.searchParams.set(k,String(v))});
      u.searchParams.set('_ts',Date.now());
      const r=await fetch(u.toString(),{cache:'no-store',signal:ctrl.signal});
      const j=await r.json();if(!j||!j.ok)throw new Error(j?.error||'Falha na Base Central');
      if(opts.cache!==false)await cacheSet(key,j);return j;
    }finally{clearTimeout(timer);inflight.delete(key)}
  })();
  inflight.set(key,p);
  if(opts.stale!==false && cached?.value){p.catch(()=>{});return {...cached.value,__cached:true,__stale:true}}
  return p;
}
export async function post(action,data,opts={}){
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),opts.timeout??10000);
  try{
    const r=await fetch(BASE,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,token:token(),data}),signal:ctrl.signal});
    const j=await r.json();if(!j||!j.ok)throw new Error(j?.error||'Falha na Base Central');return j;
  }finally{clearTimeout(timer)}
}
export async function status(){return get('status',{},{cache:false,timeout:5000,stale:false})}
