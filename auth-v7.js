
import {BASE,status} from './api-v7.js';
function hex(buf){return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function sha(s){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(s))))}
async function rawGet(action,params={}){
 const u=new URL(BASE);u.searchParams.set('action',action);Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));u.searchParams.set('_ts',Date.now());
 const c=new AbortController(),t=setTimeout(()=>c.abort(),7000);try{const r=await fetch(u,{cache:'no-store',signal:c.signal});return await r.json()}finally{clearTimeout(t)}
}
export async function login(username,password){
 const c=await rawGet('login_challenge',{username});if(!c?.ok)throw new Error(c?.error||'Falha no desafio');
 const ph=await sha(`${c.salt}|${password}`),proof=await sha(`${c.nonce}|${ph}`);
 const v=await rawGet('login_verify',{username,nonce:c.nonce,proof});if(!v?.ok)throw new Error(v?.error||'Usuário ou senha inválidos');
 localStorage.setItem('okeo_v7_token',v.token);localStorage.setItem('okeo_v7_user',JSON.stringify(v.user||{}));return v.user||{};
}
export async function restore(){
 const token=localStorage.getItem('okeo_v7_token');if(!token)return null;
 try{const u=new URL(BASE);u.searchParams.set('action','session');u.searchParams.set('token',token);const r=await fetch(u,{cache:'no-store'});const j=await r.json();if(j?.ok){localStorage.setItem('okeo_v7_user',JSON.stringify(j.user));return j.user}}catch(e){}
 logout();return null;
}
export function currentUser(){try{return JSON.parse(localStorage.getItem('okeo_v7_user')||'null')}catch(e){return null}}
export function logout(){localStorage.removeItem('okeo_v7_token');localStorage.removeItem('okeo_v7_user')}
export async function health(){try{const s=await status();return s?.ok}catch(e){return false}}
