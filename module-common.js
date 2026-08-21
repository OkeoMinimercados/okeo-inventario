
import {get,post} from './api-v7.js';
import {brl,num,esc,skeleton,errorBox,isoLocal,debounce} from './util-v7.js';
export {get,post,brl,num,esc,skeleton,errorBox,isoLocal,debounce};
export function setLoading(root,msg='Carregando dados…'){root.innerHTML=`<div class="notice">${msg}</div>${skeleton(5)}`}
export function table(headers,rows){return `<div class="table-wrap"><table class="table"><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`}
