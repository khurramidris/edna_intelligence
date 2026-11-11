import {mutate} from './collection.mjs';
import {syncOrders} from './shopify-sync.mjs';
export async function maintenance(storage,env,now=Date.now()){
  if(storage.pruneEvents)await storage.pruneEvents();
  await mutate(storage,state=>({data:{...state,events:(state.events||[]).filter(e=>Date.parse(e.at)>=now-30*86400000),webhookReceipts:(state.webhookReceipts||[]).filter(r=>Date.parse(r.at)>=now-7*86400000),lastMaintenanceAt:new Date(now).toISOString()}}));
  if(env.ENABLE_SHOPIFY_SYNC==='true')return syncOrders(storage,env,{now});
  return {sync:'disabled'};
}
