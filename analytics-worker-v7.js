
self.onmessage=e=>{
 const {id,type,payload}=e.data;
 try{
  let result;
  if(type==='abc')result=abc(payload.rows||[]);
  else if(type==='replenishment')result=replenishment(payload||{});
  else if(type==='kpis')result=kpis(payload||{});
  else throw new Error('Cálculo desconhecido');
  self.postMessage({id,ok:true,result});
 }catch(err){self.postMessage({id,ok:false,error:err.message||String(err)})}
};
function abc(rows){
 const map={};for(const x of rows){const k=x.ean||x.code||x.product;if(!map[k])map[k]={key:k,product:x.product||k,ean:x.ean||'',qty:0,revenue:0,cmv:0};map[k].qty+=+x.qty||0;map[k].revenue+=+x.revenue||0;map[k].cmv+=+x.cmv||0}
 const a=Object.values(map).sort((x,y)=>y.revenue-x.revenue),total=a.reduce((s,x)=>s+x.revenue,0);let acc=0;
 for(const x of a){x.pct=total?x.revenue/total*100:0;const before=acc;acc+=x.pct;x.acc=acc;x.abc=before<80?'A':before<95?'B':'C';x.margin=x.revenue-x.cmv}
 return {rows:a,total};
}
function avg(a){return a.length?a.reduce((s,x)=>s+x,0)/a.length:0}
function sd(a){if(a.length<2)return 0;const m=avg(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))}
function replenishment({weekly=[],stock=[]}){
 const sm={};stock.forEach(x=>sm[(x.unit||'')+'|'+(x.ean||'')]={qty:+x.qty||0,cost:+x.avgCost||0,product:x.product});
 const wm={};weekly.forEach(x=>{const k=(x.unit||'')+'|'+(x.ean||x.code||'');if(!wm[k])wm[k]={unit:x.unit,ean:x.ean||x.code,product:x.product,weeks:{}};wm[k].weeks[x.week]=(wm[k].weeks[x.week]||0)+(+x.qty||0)});
 return Object.values(wm).map(x=>{const vals=Object.values(x.weeks),m=avg(vals),peak=Math.max(0,...vals),current=sm[x.unit+'|'+x.ean]?.qty||0,ideal=Math.ceil(Math.max(m*2,peak*1.2)),status=m<=0?'SEM_GIRO':current<=m?'REPOR':current<ideal?'ATENCAO':'OK';return {...x,avgWeekly:m,peak,current,ideal,suggested:status==='REPOR'?Math.max(0,ideal-current):0,status,coverage:m?current/m:null}}).sort((a,b)=>({REPOR:0,ATENCAO:1,OK:2,SEM_GIRO:3}[a.status]-({REPOR:0,ATENCAO:1,OK:2,SEM_GIRO:3}[b.status])));
}
function kpis({monthly=[],stock=[]}){const revenue=monthly.reduce((s,x)=>s+(+x.revenue||0),0),cmv=monthly.reduce((s,x)=>s+(+x.cmv||0),0),tickets=monthly.reduce((s,x)=>s+(+x.tickets||0),0),stockValue=stock.reduce((s,x)=>s+(+x.qty||0)*(+x.avgCost||0),0);return{revenue,cmv,margin:revenue-cmv,tickets,avgTicket:tickets?revenue/tickets:0,stockValue,turnover:stockValue?cmv/stockValue:0,gmroi:stockValue?(revenue-cmv)/stockValue:0}}
