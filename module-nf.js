
import {get,post,esc,table} from './module-common.js';
export async function mount(root){
 root.innerHTML=`<div class="card"><div class="grid"><div class="field"><label>Unidade / destino</label><select id="unit"></select></div><div class="field"><label>Nº NF</label><input id="nf"></div><div class="field"><label>EAN</label><input id="ean"></div><div class="field"><label>Quantidade</label><input id="qty" type="number" min="1"></div></div><div class="actions"><button class="primary" id="add">Adicionar item</button><button class="secondary" id="save">Registrar entrada</button></div><div id="msg" class="status"></div></div><div class="card"><b>Itens da nota</b><div id="rows"></div></div>`;
 const items=[];const unit=root.querySelector('#unit'),msg=root.querySelector('#msg');
 try{const r=await get('v7_units',{}, {ttl:1800000});unit.innerHTML=(r.units||[]).map(x=>`<option>${esc(x)}</option>`).join('')}catch(e){}
 function render(){root.querySelector('#rows').innerHTML=items.length?table(['EAN','Produto','Qtd'],items.map(x=>`<tr><td>${esc(x.ean)}</td><td>${esc(x.product)}</td><td>${x.qty}</td></tr>`)):'<div class="empty">Nenhum item.</div>'}
 root.querySelector('#add').onclick=async()=>{const ean=root.querySelector('#ean').value.trim(),qty=Number(root.querySelector('#qty').value);if(!ean||!qty)return;try{const r=await get('v7_catalog_search',{q:ean,limit:5},{ttl:300000});const p=(r.products||[])[0];if(!p)throw new Error('Produto não encontrado');items.push({ean:p.ean,product:p.produto,qty});root.querySelector('#ean').value='';root.querySelector('#qty').value='';render()}catch(e){msg.textContent=e.message}};
 root.querySelector('#save').onclick=async()=>{if(!items.length)return;msg.textContent='Registrando…';try{for(const x of items)await post('movement',{type:'ENTRADA_NF',to:unit.value,ean:x.ean,product:x.product,qty:x.qty,date:new Date().toISOString(),note:root.querySelector('#nf').value});items.length=0;render();msg.className='status ok';msg.textContent='Entrada registrada.'}catch(e){msg.className='status error';msg.textContent=e.message}};
 render();
}
