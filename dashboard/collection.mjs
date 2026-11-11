import {ingestEvents,normalizeEvents} from './intelligence.mjs';
const json=(data,status,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
export async function bodyText(request,limit=64000){
  if(Number(request.headers.get('content-length'))>limit)throw new Error('Payload too large.');
  const reader=request.body?.getReader();if(!reader)return '';
  const chunks=[];let length=0;
  while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>limit){await reader.cancel();throw new Error('Payload too large.');}chunks.push(value);}
  const data=new Uint8Array(length);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.length;}return new TextDecoder().decode(data);
}
export async function mutate(storage,fn){for(let attempt=0;attempt<3;attempt++){const current=await storage.read();const result=fn(current.data);try{await storage.write(result.data,current.revision);return result;}catch(e){if(e.message!=='CONFLICT'||attempt===2)throw e;}}}
export async function saveEvents(storage,events){
  const rows=normalizeEvents(events);
  if(storage.ingestEvents)return storage.ingestEvents(rows);
  return mutate(storage,data=>ingestEvents(data,rows));
}
export async function collect(request,storage,env){
  const origins=(env.COLLECT_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
  const origin=request.headers.get('origin');
  if(!origin||!origins.includes(origin)||origin==='null')return json({error:'Origin not permitted.'},403);
  const cors={'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'};
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST')return json({error:'POST required.'},405,cors);
  // Never expose an unmetered public endpoint. Cloudflare rate-limit binding
  // is required for activation; IP is used only as the limiter key, not saved.
  if(!env.EVENT_LIMITER)return json({error:'Collection is not activated.'},503,cors);
  const limited=await env.EVENT_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'});
  if(!limited.success)return json({error:'Rate limit reached.'},429,cors);
  try{const input=JSON.parse(await bodyText(request));const result=await saveEvents(storage,input.events);return json({accepted:result.accepted},202,cors);}catch(e){return json({error:e.message==='CONFLICT'?'Please retry.':e.message},e.message==='CONFLICT'?503:400,cors);}
}
export async function verifySignature(raw,signature,secret){
  try{if(!secret||!signature)return false;const bytes=Uint8Array.from(atob(signature),c=>c.charCodeAt(0));const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);return crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(raw));}catch{return false;}
}
const topics=new Set(['orders/create','orders/updated','orders/cancelled']);
export function applyWebhook(state,payload,topic,id,now=Date.now()){
  const receipts=(state.webhookReceipts||[]).filter(r=>Date.parse(r.at)>now-7*86400000);
  if(receipts.some(r=>r.id===id))return {data:state,duplicate:true};
  if(!payload||!/^\d+$/.test(String(payload.id))||!Number.isFinite(Date.parse(payload.updated_at)))throw new Error('Invalid order payload.');
  if(payload.currency!=='PKR')throw new Error('Only PKR order records are supported.');
  const orders={...state.shopifyOrders};const orderId=String(payload.id);const previous=orders[orderId];
  if(!previous||Date.parse(payload.updated_at)>Date.parse(previous.updatedAt))orders[orderId]={id:orderId,updatedAt:payload.updated_at,createdAt:payload.created_at||null,financialStatus:String(payload.financial_status||'unknown').slice(0,40),fulfillmentStatus:String(payload.fulfillment_status||'unfulfilled').slice(0,40),cancelled:Boolean(payload.cancelled_at),test:payload.test===true,total:String(payload.total_price||'0').slice(0,30),currency:'PKR',source:'webhook',needsReconciliation:true};
  if(Object.keys(orders).length>2000||receipts.length>=10000)throw new Error('Webhook capacity reached; migrate storage before continuing.');
  return {data:{...state,shopifyOrders:orders,webhookReceipts:[...receipts,{id,topic,at:new Date(now).toISOString()}],webhookUpdatedAt:new Date(now).toISOString()},duplicate:false};
}
export async function webhook(request,storage,env){
  if(request.method!=='POST')return json({error:'POST required.'},405);
  if(!env.SHOPIFY_WEBHOOK_SECRET||!env.SHOPIFY_SHOP_DOMAIN)return json({error:'Webhook connection is not configured.'},503);
  if(request.headers.get('X-Shopify-Shop-Domain')!==env.SHOPIFY_SHOP_DOMAIN)return json({error:'Wrong shop.'},401);
  let raw;try{raw=await bodyText(request,1000000);}catch{return json({error:'Payload too large.'},413);}
  if(!await verifySignature(raw,request.headers.get('X-Shopify-Hmac-Sha256'),env.SHOPIFY_WEBHOOK_SECRET))return json({error:'Invalid signature.'},401);
  const topic=request.headers.get('X-Shopify-Topic'),id=request.headers.get('X-Shopify-Webhook-Id');
  if(!topics.has(topic))return json({error:'Unsupported topic.'},400);
  if(!id||!/^[a-zA-Z0-9-]{1,100}$/.test(id))return json({error:'Missing delivery id.'},400);
  try{const payload=JSON.parse(raw);const result=await mutate(storage,state=>applyWebhook(state,payload,topic,id));return json({received:true,duplicate:result.duplicate},200);}catch{return json({error:'Delivery was not saved. Retry required.'},503);}
}
