import {mergeImport,metrics,validateImport} from './domain.mjs';
import {intelligence,ingestEvents} from './intelligence.mjs';
import {bodyText,mutate,saveEvents} from './collection.mjs';
import {syncOrders} from './shopify-sync.mjs';
import {audiences,marketing} from './growth.mjs';
const json = (data,status=200) => new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function api(request, storage, config={}) {
  const url = new URL(request.url);
  if (!config.local && (!config.token || request.headers.get('Authorization') !== `Bearer ${config.token}`)) return json({error:'Enter the dashboard access token.'},401);
  if (request.headers.get('origin') && request.headers.get('origin') !== url.origin) return json({error:'Cross-origin requests are not allowed.'},403);
  try {
    if(request.method==='POST'&&url.pathname==='/api/shopify/sync')return json(await syncOrders(storage,config.env||{}));
    if(request.method==='GET'&&url.pathname==='/api/shopify/status'){
      const {data}=await storage.read();return json({configured:Boolean(config.env?.SHOPIFY_ADMIN_TOKEN&&config.env?.SHOPIFY_SHOP_DOMAIN),sync:data.shopifySync||null,records:Object.keys(data.shopifyOrders||{}).length});
    }
    if(request.method==='POST'&&url.pathname==='/api/events/import'){
      const input=JSON.parse(await bodyText(request));
      const result=await saveEvents(storage,input.events);
      return json({accepted:result.accepted});
    }
    const current = await storage.read();
    if(request.method==='GET'&&url.pathname==='/api/audiences')return json(audiences(current.data));
    if(request.method==='GET'&&url.pathname==='/api/marketing')return json(marketing(current.data,url.searchParams.get('from'),url.searchParams.get('to')));
    if(request.method==='GET'&&url.pathname==='/api/intelligence'){
      const report=intelligence(current.data);
      if(storage.eventSummary){
        const summary=await storage.eventSummary();Object.assign(report,summary);
        report.products=summary.products.map(p=>({...p,title:current.data.products.find(x=>x.id===p.id)?.title||p.id}));
        report.alerts=report.alerts.filter(a=>a.level!=='review'&&(summary.eventCount===0||a.level!=='setup'));
        const candidates=summary.products.filter(p=>p.views>=20&&p.adds===0);
        if(candidates.length)report.alerts.push({level:'review',title:`${candidates.length} products have views without cart additions`,detail:'At least 20 view events per product. Review price, fit and availability; event counts do not establish individual shoppers.'});
      }
      return json(report);
    }
    if (request.method==='GET' && url.pathname==='/api/state') return json({...current.data,metrics:metrics(current.data),storage:config.local?'Local file':'Supabase',revision:current.revision});
    if (request.method==='POST' && ['/api/import/preview','/api/import/apply'].includes(url.pathname)) {
      if (!(request.headers.get('content-type')||'').includes('application/json')) return json({error:'Send application/json.'},415);
      const raw = await request.text();
      if(raw.length>1_000_000) return json({error:'Import exceeds 1 MB.'},413);
      const {kind,rows,revision} = JSON.parse(raw);
      const validated = validateImport(kind,rows,current.data);
      if(url.pathname.endsWith('preview')) {mergeImport(current.data,kind,rows);return json({count:validated.length,updates:validated.filter(r=>(current.data[kind]||[]).some(x=>x.id===r.id)).length,revision:current.revision});}
      if(revision!==current.revision) return json({error:'Data changed. Preview this import again.'},409);
      await storage.write(mergeImport(current.data,kind,rows),current.revision);
      return json({saved:validated.length});
    }
    return json({error:'Endpoint not found.'},404);
  } catch(error) { return json({error:error.message==='CONFLICT'?'Data changed. Preview again.':error.publicMessage || (error instanceof SyntaxError?'Invalid JSON.':error.message)},error.message==='CONFLICT'?409:400); }
}
