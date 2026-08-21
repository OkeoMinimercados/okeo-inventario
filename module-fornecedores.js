
import {get,esc,errorBox} from './module-common.js';
export async function mount(root){try{const r=await get('v7_catalog_search',{q:'',limit:5000},{ttl:600000});const m={};(r.products||[]).forEach(x=>{const s=x.fornecedor||'SEM FORNECEDOR';m[s]=(m[s]||0)+1});root.innerHTML=`<div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Fornecedor</th><th>SKUs</th></tr></thead><tbody>${Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([s,n])=>`<tr><td>${esc(s)}</td><td>${n}</td></tr>`).join('')}</tbody></table></div></div>`}catch(e){root.innerHTML=errorBox(e)}}
