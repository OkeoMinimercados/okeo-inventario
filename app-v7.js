
import {login,restore,currentUser,logout,health} from './auth-v7.js';
import {MODULES} from './registry-v7.js';
import {cancel as cancelWorker} from './worker-client-v7.js';

const $=s=>document.querySelector(s);
const state={user:null,module:null,navGeneration:0,moduleInstances:new Map()};
function allowed(m){return state.user?.role==='ADMIN'||m.role==='OPERATIONAL'&&state.user?.role==='OPERATIONAL'}
function buildNav(){
 $('#nav').innerHTML=MODULES.filter(allowed).map(m=>`<button class="nav-btn" data-id="${m.id}"><span class="ico">${m.icon}</span><span><b>${m.title}</b><small>${m.desc}</small></span></button>`).join('');
 $('#nav').onclick=e=>{const b=e.target.closest('.nav-btn');if(b)navigate(b.dataset.id)};
}
const LEGACY_MAP={"inventario": "inventario", "nf": "nf", "vendas": "faturamento", "dashboard": "dashboard", "abc": "produtos", "reposicao": "reposicao", "dre": "dre", "gestao": "gestao", "estoque": "movimentos", "movimentos": "movimentos", "produtos": "fiscal", "fornecedores": "fornecedores", "grupos": "grupos", "mensal": "mensal", "horarios": "horarios", "dados": "dados", "usuarios": "acessos", "saude": "diagnostico"};
let legacyReady=false;
function openLegacy(id){
 const target=LEGACY_MAP[id];if(!target)return false;
 const root=document.querySelector('#moduleRoot'),box=document.querySelector('#legacyContainer'),frame=document.querySelector('#legacyFrame');
 root.classList.add('hidden');box.classList.remove('hidden');
 if(!legacyReady){
   legacyReady=true;
   frame.src='./legacy-v6.html#'+target;
 }else{
   try{frame.contentWindow.postMessage({type:'OKEO_V7_ROUTE',module:target},'*')}catch(e){frame.src='./legacy-v6.html#'+target}
 }
 return true;
}
function closeLegacy(){
 document.querySelector('#legacyContainer').classList.add('hidden');
 document.querySelector('#moduleRoot').classList.remove('hidden');
}
async function navigate(id){
 const m=MODULES.find(x=>x.id===id);if(!m||!allowed(m))return;
 state.navGeneration++;const gen=state.navGeneration;state.module=id;cancelWorker();
 document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.id===id));
 if(LEGACY_MAP[id]){
   openLegacy(id);$('#moduleStatus').textContent='';$('#sidebar').classList.remove('open');history.replaceState(null,'','#'+id);return;
 }
 closeLegacy();
 $('#moduleRoot').innerHTML=`<div class="module-head"><div><h2>${m.title}</h2><p>${m.desc}</p></div></div><div id="moduleBody"></div>`;
 $('#moduleStatus').textContent='';
 $('#sidebar').classList.remove('open');
 history.replaceState(null,'','#'+id);
 // UI has now changed. Only after paint do we import module code.
 requestAnimationFrame(()=>requestAnimationFrame(async()=>{
   if(gen!==state.navGeneration)return;
   try{
     $('#moduleStatus').textContent='carregando…';
     const mod=await import(`./module-${id}.js?v=701`);
     if(gen!==state.navGeneration)return;
     const body=$('#moduleBody');body.innerHTML='';
     await mod.mount(body,{user:state.user,generation:gen,isCurrent:()=>gen===state.navGeneration,navigate});
     if(gen===state.navGeneration)$('#moduleStatus').textContent='';
   }catch(e){
     if(gen===state.navGeneration){$('#moduleBody').innerHTML=`<div class="errorbox">${String(e.message||e)}</div>`;$('#moduleStatus').textContent='falha'}
   }
 }));
}
async function enter(user){
 state.user=user;$('#loginScreen').classList.add('hidden');$('#app').classList.remove('hidden');$('#userName').textContent=user.name||user.username||'';buildNav();
 const target=location.hash.slice(1);const first=MODULES.find(m=>allowed(m))?.id;
 navigate(MODULES.some(m=>m.id===target&&allowed(m))?target:first);
}
$('#loginForm').addEventListener('submit',async e=>{
 e.preventDefault();const msg=$('#loginMsg'),btn=$('#loginBtn');btn.disabled=true;msg.className='status';msg.textContent='Entrando…';
 try{await enter(await login($('#loginUser').value.trim(),$('#loginPass').value));msg.textContent=''}catch(err){msg.className='status error';msg.textContent=err.message||String(err);btn.disabled=false}
});
$('#logoutBtn').onclick=()=>{logout();location.reload()};
$('#menuToggle').onclick=()=>$('#sidebar').classList.toggle('open');
window.addEventListener('online',()=>{$('#onlineBadge').textContent='Online'});window.addEventListener('offline',()=>{$('#onlineBadge').textContent='Offline'});
(async()=>{$('#apiHealth').textContent=(await health())?'Base: online':'Base: indisponível';const u=await restore();if(u)enter(u)})();
if('serviceWorker' in navigator)window.addEventListener('load',()=>setTimeout(()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}),1500));
