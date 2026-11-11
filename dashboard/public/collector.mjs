// Browser transport. Connect a storefront/pixel adapter at activation time.
// The visitor id lasts only for this instance; no persistent tracking storage.
export function createCollector({endpoint,fetcher=fetch}) {
  if(!endpoint.startsWith('https://'))throw new Error('Collection requires HTTPS.');
  let consent=false,visitorId=null;
  const supported=new Set(['page_viewed','product_viewed','product_added_to_cart','product_removed_from_cart','cart_viewed','checkout_started','checkout_completed','search_submitted','collection_viewed']);
  return {
    setAnalyticsConsent(allowed){consent=allowed===true;if(!consent)visitorId=null;},
    async track(name,{productId,eventId}={}){
      if(!consent)return {sent:false,reason:'consent'};
      if(!supported.has(name))throw new Error('Unsupported event.');
      visitorId ||= crypto.randomUUID();
      const event={id:eventId||crypto.randomUUID(),visitorId,name,at:new Date().toISOString(),analyticsConsent:true,...(productId?{productId}:{})};
      const response=await fetcher(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({events:[event]}),credentials:'omit',keepalive:true});
      if(!response.ok)throw new Error(`Collection failed (${response.status}).`);
      return {sent:true,id:event.id};
    }
  };
}
