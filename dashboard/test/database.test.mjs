import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('Postgres migration: dedupe, aggregates, retention and private permissions',async()=>{
 const db=new PGlite();
 try{
  await db.exec('create role anon; create role authenticated; create role service_role;');
  await db.exec(await readFile(new URL('../schema.sql',import.meta.url),'utf8'));
  await db.exec(await readFile(new URL('../migrations/002_events.sql',import.meta.url),'utf8'));
  const records=[{id:'e1',visitorId:'v1',name:'product_viewed',at:new Date().toISOString(),productId:'p1',analyticsConsent:true}];
  const ingest=()=>db.query('select edna_ingest_events($1::jsonb) as accepted',[JSON.stringify(records)]);
  assert.equal((await ingest()).rows[0].accepted,1);assert.equal((await ingest()).rows[0].accepted,0);
  const report=(await db.query('select edna_event_summary() as data')).rows[0].data;
  assert.equal(report.eventCount,1);assert.equal(report.products[0].views,1);
  await db.query("insert into edna_events values ('old','old','page_viewed',now()-interval '31 days',null)");
  assert.equal((await db.query('select edna_prune_events() as removed')).rows[0].removed,1);
  const permissions=(await db.query("select has_table_privilege('anon','edna_events','SELECT') as read, has_function_privilege('authenticated','edna_ingest_events(jsonb)','EXECUTE') as write")).rows[0];
  assert.equal(permissions.read,false);assert.equal(permissions.write,false);
  await assert.rejects(db.query('select edna_ingest_events($1::jsonb)',[JSON.stringify([{...records[0],analyticsConsent:false}])]),/Consent required/);
 }finally{await db.close();}
});
