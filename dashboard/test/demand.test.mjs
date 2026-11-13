import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseSignups, demandReport, syncDemand, importSignups, customersQuery} from '../demand.mjs';
import {api} from '../api.mjs';

const env = {SHOPIFY_SHOP_DOMAIN: 'wearedna.myshopify.com', SHOPIFY_ADMIN_TOKEN: 'fixture-token'};
const gid = n => 'gid://shopify/Customer/' + n;
const products = [{id: 'gid://shopify/Product/1', title: 'Noor — Satin stiletto'}, {id: 'gid://shopify/Product/2', title: 'Gul — Zari-inspired khussa'}];
function storage(initial = {products, demandSignups: []}) {
  let s = {revision: 0, data: initial};
  return {read: async () => structuredClone(s), write: async (data, rev) => { assert.equal(rev, s.revision); s = {data, revision: rev + 1}; }};
}

test('want tags pair a design with a size exactly, even when a customer asks for several', () => {
  const rows = parseSignups(gid(7), '2026-11-12T01:00:00Z', ['notify', 'notify-noor-satin-stiletto', 'size-eu-38', 'want:noor-satin-stiletto:eu-38', 'want:gul-zari-inspired-khussa:eu-39']);
  assert.deepEqual(rows.map(r => [r.product, r.size, r.paired]).sort(), [['gul-zari-inspired-khussa', 'eu-39', true], ['noor-satin-stiletto', 'eu-38', true]]);
  assert.equal(rows[0].customer, '7');
});

test('older sign-ups pair only when unambiguous; otherwise each tag stands alone and is flagged', () => {
  const one = parseSignups(gid(1), '2026-11-12T00:00:00Z', ['notify', 'notify-noor-satin-stiletto', 'size-eu-37']);
  assert.deepEqual(one.map(r => [r.product, r.size, r.paired]), [['noor-satin-stiletto', 'eu-37', true]]);
  const many = parseSignups(gid(2), '2026-11-12T00:00:00Z', ['notify', 'notify-noor-satin-stiletto', 'notify-gul-zari-inspired-khussa', 'size-eu-37']);
  assert.equal(many.length, 3);
  assert.ok(many.every(r => r.paired === false));
  const bare = parseSignups(gid(3), '2026-11-12T00:00:00Z', ['notify']);
  assert.deepEqual(bare.map(r => [r.product, r.size, r.paired]), [[null, null, false]]);
});

test('customers without the notify tag, malformed ids and hostile tags produce nothing', () => {
  assert.deepEqual(parseSignups(gid(1), '2026-11-12T00:00:00Z', ['newsletter', 'edna-first-chapter']), []);
  assert.deepEqual(parseSignups('not-an-id', '2026-11-12T00:00:00Z', ['notify']), []);
  assert.deepEqual(parseSignups(gid(1), 'yesterday', ['notify']), []);
  const hostile = parseSignups(gid(1), '2026-11-12T00:00:00Z', ['notify', 'want:<script>:eu-38', 'want:' + 'a'.repeat(200) + ':eu-38', 'notify-Has Space']);
  assert.ok(hostile.every(r => r.product === null && r.size === null));
});

test('tags are matched case-insensitively and the date is the Pakistan calendar date', () => {
  const rows = parseSignups(gid(9), '2026-11-11T20:30:00Z', ['Notify', 'WANT:Noor-Satin-Stiletto:EU-38']);
  assert.equal(rows[0].product, 'noor-satin-stiletto');
  assert.equal(rows[0].at, '2026-11-12');
});

test('the query asks for ids, dates and tags only, never contact details', () => {
  assert.match(customersQuery, /nodes \{ id createdAt tags \}/);
  assert.doesNotMatch(customersQuery, /email|phone|firstName|lastName|address|displayName/i);
});

test('report totals, sorts sizes numerically, names designs and keeps unknown handles visible', () => {
  const state = {products, demandSignups: [
    ...parseSignups(gid(1), '2026-11-10T00:00:00Z', ['notify', 'want:noor-satin-stiletto:eu-40']),
    ...parseSignups(gid(2), '2026-11-11T00:00:00Z', ['notify', 'want:noor-satin-stiletto:eu-38']),
    ...parseSignups(gid(3), '2026-11-11T00:00:00Z', ['notify', 'want:noor-satin-stiletto:eu-38', 'want:retired-design:eu-36']),
    ...parseSignups(gid(4), '2026-11-12T00:00:00Z', ['notify', 'notify-gul-zari-inspired-khussa'])
  ]};
  const r = demandReport(state);
  assert.equal(r.people, 4);
  assert.equal(r.requests, 5);
  assert.equal(r.paired, 4);
  assert.equal(r.unpaired, 1);
  assert.equal(r.designs[0].title, 'Noor — Satin stiletto');
  assert.deepEqual(r.designs[0].sizes, [{size: 'eu-38', count: 2}, {size: 'eu-40', count: 1}]);
  assert.equal(r.designs.find(d => d.handle === 'retired-design').title, 'retired-design');
  assert.equal(r.designs.find(d => d.handle === 'gul-zari-inspired-khussa').unspecifiedSize, 1);
  assert.deepEqual(r.topSize, {size: 'eu-38', count: 2});
  assert.deepEqual(r.daily.map(d => d.count), [1, 3, 1]);
  assert.equal(demandReport({}).requests, 0);
});

test('a two-page pull stores only ids, dates, designs and sizes, and a second pull replaces rather than adds', async () => {
  const db = storage();
  const pages = [
    {nodes: [{id: gid(1), createdAt: '2026-11-10T00:00:00Z', tags: ['notify', 'want:noor-satin-stiletto:eu-38'], email: 'secret@example.com', phone: '+920000000000'}], pageInfo: {hasNextPage: true, endCursor: 'c1'}},
    {nodes: [{id: gid(2), createdAt: '2026-11-11T00:00:00Z', tags: ['notify', 'want:gul-zari-inspired-khussa:eu-39']}], pageInfo: {hasNextPage: false, endCursor: null}}
  ];
  let calls = [];
  const fetcher = async (_url, init) => { const body = JSON.parse(init.body); calls.push(body.variables); return Response.json({data: {customers: pages[calls.length - 1]}}); };
  const first = await syncDemand(db, env, {now: Date.parse('2026-11-12T00:00:00Z'), fetcher});
  assert.deepEqual(first, {pages: 2, requests: 2});
  assert.equal(calls[0].query, 'tag:notify');
  assert.equal(calls[1].after, 'c1');
  const saved = (await db.read()).data;
  assert.equal(saved.demandSignups.length, 2);
  assert.doesNotMatch(JSON.stringify(saved), /secret@example|\+92|email|phone/);
  assert.equal(saved.demandSync.source, 'shopify');
  calls = [];
  await syncDemand(db, env, {fetcher});
  assert.equal((await db.read()).data.demandSignups.length, 2);
});

test('a failed or malformed pull leaves the stored sign-ups untouched', async () => {
  const db = storage({products, demandSignups: parseSignups(gid(1), '2026-11-10T00:00:00Z', ['notify', 'want:noor-satin-stiletto:eu-38'])});
  await assert.rejects(syncDemand(db, env, {fetcher: async () => new Response('', {status: 401})}), /access failed/);
  await assert.rejects(syncDemand(db, env, {fetcher: async () => Response.json({data: {customers: {nodes: 'nope'}}})}), /Invalid Shopify page/);
  await assert.rejects(syncDemand(db, env, {fetcher: async () => Response.json({data: {customers: {nodes: [], pageInfo: {hasNextPage: true, endCursor: null}}}})}), /non-advancing/);
  await assert.rejects(syncDemand(db, {}, {}), /credentials are not configured/);
  assert.equal((await db.read()).revision, 0);
  assert.equal((await db.read()).data.demandSignups.length, 1);
});

test('import accepts exported rows, rejects emails as ids and bad dates', () => {
  const state = importSignups({products}, [{id: '55', date: '2026-11-11', tags: 'notify, want:noor-satin-stiletto:eu-38'}, {id: '56', date: '2026-11-12', tags: ['notify', 'notify-gul-zari-inspired-khussa', 'size-eu-37']}], Date.parse('2026-11-12T00:00:00Z'));
  assert.equal(state.demandSignups.length, 2);
  assert.equal(state.demandSync.source, 'import');
  assert.equal(state.demandSignups[0].at, '2026-11-11');
  assert.throws(() => importSignups({}, [{id: 'someone@example.com', date: '2026-11-11', tags: 'notify'}]), /numeric Shopify customer ID/);
  assert.throws(() => importSignups({}, [{id: '1', date: 'soon', tags: 'notify'}]), /invalid date/);
  assert.throws(() => importSignups({}, []), /1–2000/);
});

test('the API serves the report, pulls from Shopify and imports, behind the local-mode rules', async () => {
  const db = storage();
  const get = path => api(new Request('http://127.0.0.1:4173' + path), db, {local: true, env});
  const post = (path, body, config = {local: true, env}) => api(new Request('http://127.0.0.1:4173' + path, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)}), db, config);
  assert.equal((await (await get('/api/demand')).json()).requests, 0);
  assert.equal((await post('/api/demand/import', {rows: [{id: '1', date: '2026-11-11', tags: 'notify,want:noor-satin-stiletto:eu-38'}]})).status, 200);
  const report = await (await get('/api/demand')).json();
  assert.equal(report.requests, 1);
  assert.equal(report.designs[0].title, 'Noor — Satin stiletto');
  assert.equal((await post('/api/demand/sync', {}, {local: true, env: {}})).status, 400);
  assert.equal((await post('/api/demand/sync', {}, {local: false, token: 'secret', env})).status, 401);
});
