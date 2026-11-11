import http from 'node:http';

import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';

import {fileURLToPath} from 'node:url';

import {api} from './api.mjs';

import {supabaseStorage} from './supabase.mjs';

const root = fileURLToPath(new URL('.',import.meta.url));

await mkdir(root+'.data',{recursive:true});

const file=root+'.data/state.json';

try { await readFile(file); } catch(e) { if(e.code!=='ENOENT') throw e; await writeFile(file,await readFile(root+'seed.json')); }

let queue=Promise.resolve();

const localStorage={read:async()=>JSON.parse(await readFile(file,'utf8')),write(data,revision){

  const job=queue.then(async()=>{const now=await localStorage.read();if(now.revision!==revision)throw new Error('CONFLICT');await writeFile(file+'.tmp',JSON.stringify({revision:revision+1,data},null,2));await rename(file+'.tmp',file);});

  queue=job.catch(()=>{});return job;

}};

const cloud=Boolean(process.env.SUPABASE_URL);

if(cloud&&!process.env.ADMIN_TOKEN) throw new Error('ADMIN_TOKEN is required when connecting to Supabase.');

const storage=cloud?supabaseStorage(process.env):localStorage;

http.createServer(async(req,res)=>{

  try {

    const host=req.headers.host;

    if(!/^127\.0\.0\.1:4173$/.test(host||'')){res.writeHead(403);return res.end('Invalid host');}

    const url=new URL(req.url,'http://'+host);

    if(url.pathname.startsWith('/api/')) {

      const chunks=[];let size=0;

      for await (const chunk of req) {size+=chunk.length;if(size>1_000_000){res.writeHead(413);return res.end('Import exceeds 1 MB');}chunks.push(chunk);}

      const request=new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});

      const response=await api(request,storage,{local:!cloud,token:process.env.ADMIN_TOKEN,env:process.env});

      res.writeHead(response.status,Object.fromEntries(response.headers));return res.end(await response.text());

    }

    const files={'/':'index.html','/collector.mjs':'collector.mjs','/growth-ui.mjs':'growth-ui.mjs','/csv.mjs':'csv.mjs','/app.js':'app.js','/style.css':'style.css'};

    const name=files[url.pathname];if(!name){res.writeHead(404);return res.end('Not found');}

    res.writeHead(200,{'Content-Type':name.endsWith('.css')?'text/css':(name.endsWith('.js')||name.endsWith('.mjs'))?'text/javascript':'text/html','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});

    res.end(await readFile(root+'public/'+name));

  }catch{res.writeHead(500);res.end('Unable to complete request.');}

}).listen(4173,'127.0.0.1',()=>console.log('EDNA dashboard: http://127.0.0.1:4173'));

