const pkDate=now=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export function audiences(state,now=new Date()){
  const today=pkDate(now),groups=new Map();
  const customers=new Map((state.customers||[]).map(c=>[c.id,c]));
  const get=id=>{if(!groups.has(id))groups.set(id,{id,orders:0,completedPurchases:0,netCollected:0,lastPurchase:null,returns:0});return groups.get(id);};
  customers.forEach(c=>get(c.id));
  let unidentifiedOrders=0,futureOrders=0;
  for(const order of state.orders){
    if(order.date>today){futureOrders++;continue;}
    if(!order.customerId){unidentifiedOrders++;continue;}
    const c=get(order.customerId);c.orders++;c.netCollected+=order.collected-order.refunded;
    if(order.status==='returned')c.returns++;
    if(order.status==='delivered'&&order.collected-order.refunded>0){c.completedPurchases++;if(!c.lastPurchase||order.date>c.lastPurchase)c.lastPurchase=order.date;}
  }
  const rows=[...groups.values()].map(c=>{
    const days=c.lastPurchase?Math.floor((Date.parse(today)-Date.parse(c.lastPurchase))/86400000):null;
    const segment=!c.completedPurchases?'No completed purchase':days>=90?'Lapsed':c.completedPurchases>=2?'Repeat':'First purchase';
    return {...c,daysSincePurchase:days,segment,emailConsent:customers.get(c.id)?.emailConsent||'unknown'};
  }).sort((a,b)=>b.netCollected-a.netCollected);
  const segments=['First purchase','Repeat','Lapsed','No completed purchase'].map(name=>({name,count:rows.filter(c=>c.segment===name).length}));
  return {asOf:today,rows,segments,identifiedCustomers:rows.length,unidentifiedOrders,futureOrders,repeatBuyers:rows.filter(c=>c.completedPurchases>=2).length,subscribed:rows.filter(c=>c.emailConsent==='subscribed').length};
}
export function marketing(state,from,to){
  const valid=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
  if((from&&!valid(from))||(to&&!valid(to))||(from&&to&&from>to))throw new Error('Choose a valid date range.');
  const within=date=>(!from||date>=from)&&(!to||date<=to);
  const spend=(state.adSpend||[]).filter(r=>within(r.date));
  const orders=state.orders.filter(o=>within(o.date));
  const groups=new Map();
  const get=(platform,id)=>{const key=JSON.stringify([platform,id]);if(!groups.has(key))groups.set(key,{platform,campaignId:id,campaignName:id,spend:0,impressions:0,clicks:0,orders:0,delivered:0,netCollected:0,spendDays:0});return groups.get(key);};
  for(const row of spend){const c=get(row.platform,row.campaignId);c.campaignName=row.campaignName;c.spend+=row.spend;c.impressions+=row.impressions;c.clicks+=row.clicks;c.spendDays++;}
  let unattributedOrders=0;
  for(const order of orders){if(!order.campaignId||!order.platform){unattributedOrders++;continue;}const c=get(order.platform,order.campaignId);c.orders++;if(order.status==='delivered')c.delivered++;c.netCollected+=order.collected-order.refunded;}
  const rows=[...groups.values()].map(c=>({...c,ctr:c.impressions?c.clicks/c.impressions:null,cpc:c.clicks?c.spend/c.clicks:null,collectedToSpend:c.spend?c.netCollected/c.spend:null,spendCoverage:c.spendDays?'Imported daily spend':'Missing spend'}));
  return {from:from||null,to:to||null,rows,spend:spend.reduce((s,r)=>s+r.spend,0),importedDays:new Set(spend.map(r=>r.date)).size,orders:orders.length,unattributedOrders,attributedOrders:orders.length-unattributedOrders};
}
