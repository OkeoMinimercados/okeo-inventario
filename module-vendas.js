
import {get,brl,esc,isoLocal} from './module-common.js';
let page=1;
export async function mount(root){
 root.innerHTML=`<div class="card"><div class="grid">
 <div class="field"><label>Período rápido</label><select id="preset"><option value="ALL">Todo período</option><option value="TODAY">Hoje</option><option value="30">30 dias</option><option value="90">90 dias</option><option value="365">1 ano</option><option value="CUSTOM">Personalizado</option></select></div>
 <div class="field"><label>De</label><input id="from" type="datetime-local"></div><div class="field"><label>Até</label><input id="to" type="datetime-local"></div>
 <div class="field"><label>Local</label><select id="local"><option value="">Todos</option></select></div>
 <div class="field"><label>Cliente</label><select id="client"><option value="">Todos</option></select></div>
 <div class="field"><label>Máquina</label><select id="machine"><option value="">Todas</option></select></div>
 <div class="field"><label>Categoria</label><select id="category"><option value="">Todas</option></select></div>
 <div class="field"><label>Produto</label><select id="product"><option value="">Todos</option></select></div>
 <div class="field"><label>Rota</label><select id="route"><option value="">Todas</option></select></div>
 <div class="field"><label>Tags</label><select id="tags"><option value="">Todas</option></select></div>
 <div class="field"><label>EAN/código</label><input id="code"></div>
 <div class="field"><label>Agrupar por</label><select id="group"><option value="">Sem agrupamento</option><option value="DAY">Dia</option><option value="WEEK">Semana</option><option value="MONTH">Mês</option><option value="LOCAL">Local</option><option value="PRODUCT">Produto</option></select></div>
 </div><div class="actions"><button id="search" class="primary">Pesquisar</button></div><div id="msg" class="status"></div></div>
 <div class="kpis" id="kpis"></div><div class="card"><div id="result"><div class="empty">Defina os filtros e clique em Pesquisar.</div></div><div class="pager"><button class="ghost" id="prev">Anterior</button><span id="pg">Página 1</span><button class="ghost" id="next">Próxima</button></div></div>`;
 const optsPromise=get('sales_filter_options',{}, {ttl:1800000}).then(r=>r.options||{}).catch(()=>({}));
 optsPromise.then(o=>{for(const [id,k] of [['local','local'],['client','client'],['machine','machine'],['category','category'],['product','product'],['route','route'],['tags','tags']]){const e=root.querySelector('#'+id);e.innerHTML='<option value="">Todos</option>'+(o[k]||[]).map(v=>`<option>${esc(v)}</option>`).join('')}})
 function preset(v){const to=new Date(),from=new Date();if(v==='ALL'){root.querySelector('#from').value='';root.querySelector('#to').value='';return}if(v==='TODAY')from.setHours(0,0,0,0);else if(/^\d+$/.test(v)){from.setDate(from.getDate()-Number(v)+1);from.setHours(0,0,0,0)}else return;to.setHours(23,59);root.querySelector('#from').value=isoLocal(from);root.querySelector('#to').value=isoLocal(to)}
 root.querySelector('#preset').onchange=e=>preset(e.target.value);
 async function run(){
  const msg=root.querySelector('#msg');msg.textContent='Consultando…';
  const p={page,pageSize:100,from:root.querySelector('#from').value,to:root.querySelector('#to').value,local:root.querySelector('#local').value,client:root.querySelector('#client').value,machine:root.querySelector('#machine').value,category:root.querySelector('#category').value,product:root.querySelector('#product').value,route:root.querySelector('#route').value,tags:root.querySelector('#tags').value,code:root.querySelector('#code').value,groupBy:root.querySelector('#group').value};
  try{const r=await get('sales_report',p,{ttl:30000,timeout:10000,stale:true});const s=r.summary||{};root.querySelector('#kpis').innerHTML=[['Faturamento',brl(s.revenue)],['Tickets',s.tickets||0],['Ticket médio',brl(s.avgTicket)],['Itens',s.qty||0],['Registros',r.total||0]].map(x=>`<div class="kpi"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('');
   const grouped=r.grouped||[];if(p.groupBy&&grouped.length)root.querySelector('#result').innerHTML=`<div class="table-wrap"><table class="table"><thead><tr><th>Grupo</th><th>Faturamento</th><th>Qtd.</th><th>Tickets</th><th>Ticket médio</th></tr></thead><tbody>${grouped.map(x=>`<tr><td>${esc(x.group)}</td><td>${brl(x.revenue)}</td><td>${x.qty}</td><td>${x.tickets}</td><td>${brl(x.avgTicket)}</td></tr>`).join('')}</tbody></table></div>`;
   else root.querySelector('#result').innerHTML=`<div class="table-wrap"><table class="table"><thead><tr><th>Data</th><th>Local</th><th>Máquina</th><th>Produto</th><th>Qtd.</th><th>Valor</th></tr></thead><tbody>${(r.rows||[]).map(x=>`<tr><td>${esc(x.datetime)}</td><td>${esc(x.local||x.unit)}</td><td>${esc(x.machine)}</td><td>${esc(x.product)}</td><td>${x.qty}</td><td>${brl(x.value)}</td></tr>`).join('')}</tbody></table></div>`;root.querySelector('#pg').textContent=`Página ${page} de ${Math.max(1,Math.ceil((r.total||0)/100))}`;msg.textContent=r.__cached?'Exibido do cache; atualizando em segundo plano.':'Consulta concluída.'}catch(e){msg.textContent=e.message}}
 root.querySelector('#search').onclick=()=>{page=1;run()};root.querySelector('#prev').onclick=()=>{if(page>1){page--;run()}};root.querySelector('#next').onclick=()=>{page++;run()};
}
