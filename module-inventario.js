
import {get,post,esc,setLoading,table} from './module-common.js';
export async function mount(root){
 root.innerHTML=`<div class="card"><div class="grid"><div class="field"><label>Unidade</label><select id="u"><option>Carregando…</option></select></div><div class="field"><label>Pesquisar produto</label><input id="q" placeholder="EAN ou nome"></div><div class="field"><label>Quantidade contada</label><input id="qty" type="number" min="0" step="1"></div><div class="field"><label>&nbsp;</label><button class="primary" id="add">Adicionar contagem</button></div></div><div id="msg" class="status"></div></div><div class="card"><b>Itens contados</b><div id="list"></div><div class="actions"><button class="secondary" id="save">Salvar inventário</button></div></div>`;
 const items=[];const u=root.querySelector('#u'),q=root.querySelector('#q'),qty=root.querySelector('#qty'),list=root.querySelector('#list'),msg=root.querySelector('#msg');
 try{const r=await get('v7_units',{}, {ttl:1800000});u.innerHTML=(r.units||[]).map(x=>`<option>${esc(x)}</option>`).join('')}catch(e){u.innerHTML='<option>Unidade</option>'}
 root.querySelector('#add').onclick=async()=>{
  if(!q.value.trim()||!qty.value)return;msg.textContent='Buscando produto…';
  try{const r=await get('v7_catalog_search',{q:q.value.trim(),limit:10},{ttl:300000});const p=(r.products||[])[0];if(!p)throw new Error('Produto não encontrado');items.push({ean:p.ean,product:p.produto,qty:Number(qty.value)});q.value='';qty.value='';render();msg.textContent=''}catch(e){msg.textContent=e.message}
 };
 function render(){list.innerHTML=items.length?table(['EAN','Produto','Qtd'],items.map((x,i)=>`<tr><td>${esc(x.ean)}</td><td>${esc(x.product)}</td><td>${x.qty}</td></tr>`)):'<div class="empty">Nenhum item contado.</div>'}
 root.querySelector('#save').onclick=async()=>{if(!items.length)return;msg.textContent='Salvando…';try{await post('inventory',{unit:u.value,date:new Date().toISOString(),items});items.length=0;render();msg.className='status ok';msg.textContent='Inventário salvo.'}catch(e){msg.className='status error';msg.textContent=e.message}};
 render();
}
