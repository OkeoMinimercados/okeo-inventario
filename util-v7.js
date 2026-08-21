
export const brl=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export const num=v=>Number(v||0).toLocaleString('pt-BR',{maximumFractionDigits:2});
export function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
export function moduleHead(title,desc){return `<div class="module-head"><div><h2>${esc(title)}</h2><p>${esc(desc)}</p></div></div>`}
export function skeleton(n=5){return `<div class="card">${Array.from({length:n},()=>'<div class="skeleton"></div>').join('')}</div>`}
export function errorBox(e){return `<div class="errorbox">${esc(e?.message||e||'Erro')}</div>`}
export function isoLocal(d){const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`}
export function debounce(fn,ms=200){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}
