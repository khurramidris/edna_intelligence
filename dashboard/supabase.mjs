export function supabaseStorage(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Database connection is not configured.');
  const endpoint = new URL('/rest/v1/edna_state',env.SUPABASE_URL);
  if(endpoint.protocol!=='https:') throw new Error('Database requires HTTPS.');
  async function call(query,init={}) {
    const res = await fetch(endpoint+query,{...init,headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json',Prefer:'return=representation',...init.headers}});
    if(!res.ok) throw new Error('Database request failed. Check backend configuration and migration.');
    return res.json();
  }
  async function rpc(name,body={}){
    const response=await fetch(new URL('/rest/v1/rpc/'+name,env.SUPABASE_URL),{method:'POST',headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!response.ok)throw new Error('Event database request failed. Apply migration 002 and verify configuration.');
    return response.json();
  }
  return {
    async ingestEvents(records){return {accepted:await rpc('edna_ingest_events',{records})};},
    async eventSummary(){return rpc('edna_event_summary');},
    async pruneEvents(){return rpc('edna_prune_events');},
    async read(){const rows=await call('?id=eq.edna&select=data,revision');if(!rows.length) throw new Error('Import the initial EDNA snapshot into the database.');return rows[0];},
    async write(data,revision){const rows=await call(`?id=eq.edna&revision=eq.${revision}`,{method:'PATCH',body:JSON.stringify({data,revision:revision+1,updated_at:new Date().toISOString()})});if(!rows.length)throw new Error('CONFLICT');}
  };
}
