import {money} from './domain.mjs';
import {mutate} from './collection.mjs';
export const ordersQuery=`query EdnaOrders($after: String, $query: String!) {
  orders(first: 50, after: $after, query: $query, sortKey: UPDATED_AT) {
    nodes {
      id createdAt updatedAt cancelledAt test displayFinancialStatus displayFulfillmentStatus
      currentTotalPriceSet { shopMoney { amount currencyCode } }
      totalRefundedSet { shopMoney { amount currencyCode } }
      totalReceivedSet { shopMoney { amount currencyCode } }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;
export function normalizeOrder(node){
  if(!/^gid:\/\/shopify\/Order\/\d+$/.test(node.id)||!Number.isFinite(Date.parse(node.updatedAt)))throw new Error('Invalid Shopify order response.');
  const amount=field=>{const m=node[field]?.shopMoney;if(m?.currencyCode!=='PKR')throw new Error('Non-PKR order requires currency support before reconciliation.');return money(m.amount);};
  return {id:node.id.split('/').pop(),createdAt:node.createdAt,updatedAt:node.updatedAt,cancelled:Boolean(node.cancelledAt),test:node.test===true,financialStatus:String(node.displayFinancialStatus||'unknown').toLowerCase(),fulfillmentStatus:String(node.displayFulfillmentStatus||'unknown').toLowerCase(),currentTotal:amount('currentTotalPriceSet'),refunded:amount('totalRefundedSet'),shopifyReceived:amount('totalReceivedSet'),currency:'PKR',source:'admin_api'};
}
export async function graphql(env,query,variables,fetcher=fetch){
  if(!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(env.SHOPIFY_SHOP_DOMAIN||'')||!env.SHOPIFY_ADMIN_TOKEN)throw new Error('Shopify app credentials are not configured.');
  for(let attempt=0;attempt<3;attempt++){
    const response=await fetcher(`https://${env.SHOPIFY_SHOP_DOMAIN}/admin/api/2026-10/graphql.json`,{method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Access-Token':env.SHOPIFY_ADMIN_TOKEN},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(15000)});
    if(response.status===429||response.status>=500){if(attempt===2)throw new Error('Shopify temporarily unavailable; cursor preserved.');await new Promise(r=>setTimeout(r,200*(attempt+1)));continue;}
    if(!response.ok)throw new Error(`Shopify access failed (${response.status}); check app scopes and token.`);
    const body=await response.json();
    if(body.errors?.length){if(body.errors.every(e=>e.extensions?.code==='THROTTLED')&&attempt<2){await new Promise(r=>setTimeout(r,500*(attempt+1)));continue;}throw new Error('Shopify rejected the query; check scopes and API compatibility.');}
    if(!body.data)throw new Error('Shopify returned no data.');return body.data;
  }
}
// One page per call bounds request duration and preserves resumability.
export async function syncOrders(storage,env,{now=Date.now(),fetcher=fetch}={}){
  const current=await storage.read();const saved=current.data.shopifySync||{};
  const run=saved.run||{id:crypto.randomUUID(),start:new Date(saved.completedThrough?Date.parse(saved.completedThrough)-300000:now-59*86400000).toISOString(),end:new Date(now).toISOString(),cursor:null,pages:0,records:0};
  const query=`updated_at:>='${run.start}' updated_at:<='${run.end}'`;
  const response=await graphql(env,ordersQuery,{after:run.cursor,query},fetcher);
  const page=response.orders;
  if(!Array.isArray(page?.nodes)||typeof page.pageInfo?.hasNextPage!=='boolean')throw new Error('Invalid Shopify page.');
  const rows=page.nodes.map(normalizeOrder);
  if(page.pageInfo.hasNextPage&&(!page.pageInfo.endCursor||page.pageInfo.endCursor===run.cursor))throw new Error('Shopify returned a non-advancing cursor.');
  const result=await mutate(storage,state=>{
    const latest=state.shopifySync||{};
    if((latest.run?.id||null)!==(saved.run?.id||null)||(latest.run?.cursor||null)!==(saved.run?.cursor||null)||latest.completedThrough!==saved.completedThrough)throw new Error('Another sync advanced. Reload its status before retrying.');
    const orders={...state.shopifyOrders};
    for(const row of rows){const previous=orders[row.id];if(!previous||Date.parse(row.updatedAt)>=Date.parse(previous.updatedAt))orders[row.id]=row;}
    if(Object.keys(orders).length>2000)throw new Error('Order document capacity reached; migrate orders before further backfill.');
    const progress={...run,cursor:page.pageInfo.endCursor,pages:run.pages+1,records:run.records+rows.length};
    const shopifySync={...latest,lastPageAt:new Date(now).toISOString(),lastPageRecords:rows.length,run:page.pageInfo.hasNextPage?progress:null,...(!page.pageInfo.hasNextPage?{completedThrough:run.end,lastCompleted:progress}:{}),coverage:'Accessible orders updated in the configured window; initial window 59 days. Older history requires additional Shopify access.'};
    return {data:{...state,shopifyOrders:orders,shopifySync},progress:shopifySync};
  });return result.progress;
}
