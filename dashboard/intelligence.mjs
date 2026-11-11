export const eventNames = new Set(['page_viewed','product_viewed','product_added_to_cart','product_removed_from_cart','cart_viewed','checkout_started','checkout_completed','search_submitted','collection_viewed']);
const identifier = value => typeof value==='string' && /^[a-zA-Z0-9_:/.-]{1,150}$/.test(value);
export function normalizeEvents(rows,now=Date.now()) {
  if(!Array.isArray(rows)||!rows.length||rows.length>50) throw new Error('Send 1–50 events per batch.');
  return rows.map((e,i)=>{
    if(!e||!identifier(e.id)||!identifier(e.visitorId)||!eventNames.has(e.name)) throw new Error(`Event ${i+1}: invalid id, visitor or event name.`);
    if(e.analyticsConsent!==true) throw new Error(`Event ${i+1}: analytics permission is required.`);
    const at=Date.parse(e.at);
    if(!Number.isFinite(at)||at>now+300000||at<now-7*86400000) throw new Error(`Event ${i+1}: timestamp must be within the last 7 days.`);
    // Construct a strict allowlist: no URLs, query strings, search text, email,
    // address, IP, checkout tokens or arbitrary properties are persisted.
    const out={id:e.id,visitorId:e.visitorId,name:e.name,at:new Date(at).toISOString(),analyticsConsent:true,source:'browser'};
    if(e.productId!==undefined){if(!identifier(e.productId))throw new Error('Invalid product id.');out.productId=e.productId;}
    return out;
  });
}
export function ingestEvents(state,rows,now=Date.now()) {
  const events=normalizeEvents(rows,now);
  const retained=(state.events||[]).filter(e=>Date.parse(e.at)>=now-30*86400000);
  const known=new Set(retained.map(e=>e.id));let accepted=0;
  for(const e of events)if(!known.has(e.id)){known.add(e.id);retained.push(e);accepted++;}
  if(retained.length>10000)throw new Error('Event capacity reached. Migrate to event tables before continuing collection.');
  return {data:{...state,events:retained,eventUpdatedAt:new Date(now).toISOString()},accepted};
}
export function intelligence(state,now=Date.now()) {
  const events=(state.events||[]).filter(e=>Date.parse(e.at)>=now-30*86400000);
  const count=name=>events.filter(e=>e.name===name).length;
  const visitors=new Set(events.map(e=>e.visitorId)).size;
  const productMap=new Map();
  for(const event of events){if(!event.productId)continue;const p=productMap.get(event.productId)||{id:event.productId,views:0,adds:0};if(event.name==='product_viewed')p.views++;if(event.name==='product_added_to_cart')p.adds++;productMap.set(p.id,p);}
  const products=[...productMap.values()].sort((a,b)=>b.views-a.views).map(p=>({...p,title:state.products.find(x=>x.id===p.id)?.title||p.id}));
  const daily=new Map();for(const e of events){const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(e.at));daily.set(day,(daily.get(day)||0)+1);}
  const alerts=[];
  if(!events.length) alerts.push({level:'setup',title:'Behavioral collection awaiting activation',detail:'No consented browser events have reached this database. Saved Shopify analytics remain a separate baseline.'});
  const missing=state.products.filter(p=>!state.costs.some(c=>c.id===p.id)).length;
  if(missing)alerts.push({level:'data',title:`${missing} products need cost data`,detail:'Complete product and packaging costs before interpreting margins.'});
  const unremitted=state.orders.filter(o=>o.payment==='COD'&&o.status==='delivered'&&o.collected<o.total);
  if(unremitted.length)alerts.push({level:'action',title:`${unremitted.length} delivered COD orders have outstanding cash`,detail:'Reconcile the courier statement. Delivery alone does not establish receipt of funds.'});
  const viewedNoCart=products.filter(p=>p.views>=20&&p.adds===0);
  if(viewedNoCart.length)alerts.push({level:'review',title:`${viewedNoCart.length} products have views without cart additions`,detail:'Observed at least 20 view events per product. Investigate fit, price and availability; repeated views and incomplete consent coverage can affect this signal.'});
  return {windowDays:30,eventCount:events.length,observedVisitors:visitors,productViews:count('product_viewed'),cartAdds:count('product_added_to_cart'),checkoutStarts:count('checkout_started'),checkoutCompletions:count('checkout_completed'),products,daily:[...daily].sort().map(([date,events])=>({date,events})),alerts,webhooks:{received:(state.webhookReceipts||[]).length,lastAt:state.webhookUpdatedAt||null,orderRecords:Object.keys(state.shopifyOrders||{}).length}};
}
