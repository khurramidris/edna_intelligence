import {api} from './api.mjs';
import {supabaseStorage} from './supabase.mjs';
import {collect,webhook} from './collection.mjs';
import {maintenance} from './maintenance.mjs';
export default { async fetch(request,env) {
  if(new URL(request.url).pathname.startsWith('/api/')) {
    if(!env.ADMIN_TOKEN || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return new Response(JSON.stringify({error:'Hosted dashboard is awaiting configuration.'}),{status:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
    const path=new URL(request.url).pathname,storage=supabaseStorage(env);
    if(path==='/api/collect')return collect(request,storage,env);
    if(path==='/api/shopify/webhooks')return webhook(request,storage,env);
    return api(request,storage,{token:env.ADMIN_TOKEN,env});
  }
  return env.ASSETS.fetch(request);
},async scheduled(_event,env,ctx){ctx.waitUntil(maintenance(supabaseStorage(env),env));}};
