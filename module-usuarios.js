
import {get,errorBox,esc} from './module-common.js';
export async function mount(root){try{const r=await get('users',{}, {ttl:300000});root.innerHTML=`<div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>Usuário</th><th>Nome</th><th>Perfil</th><th>Ativo</th></tr></thead><tbody>${(r.users||[]).map(x=>`<tr><td>${esc(x.username)}</td><td>${esc(x.name)}</td><td>${esc(x.role)}</td><td>${x.active?'Sim':'Não'}</td></tr>`).join('')}</tbody></table></div></div>`}catch(e){root.innerHTML=errorBox(e)}}
