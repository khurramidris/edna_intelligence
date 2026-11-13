// Back-in-stock demand by design and size.
//
// The storefront's back-in-stock form creates a Shopify customer tagged
// `notify`, `notify-<product-handle>`, `size-<size>` and `want:<product-handle>:<size>`.
// This module turns those tags into counts. It asks Shopify only for the opaque customer
// id, the creation time and the tags. Names, emails and phone numbers are never requested
// and never stored, so they cannot leak from this database.
import {graphql} from './shopify-sync.mjs';
import {mutate} from './collection.mjs';

export const customersQuery = `query EdnaDemand($after: String, $query: String!) {
  customers(first: 100, after: $after, query: $query) {
    nodes { id createdAt tags }
    pageInfo { hasNextPage endCursor }
  }
}`;

const MAX_PAGES = 40;
const MAX_RECORDS = 5000;
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const clean = value => typeof value === 'string' && value.length <= 100 && slug.test(value) ? value : null;
export const handleize = text => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const pkDate = value => new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date(value));

// One customer can ask for several designs and sizes. `want:` tags carry the design and size
// together, so they pair exactly. Older sign-ups only have separate design and size tags: they
// pair when there is exactly one of each, otherwise each tag is counted on its own and flagged
// as unpaired rather than guessing which size belonged to which design.
export function parseSignups(customerId, createdAt, tags) {
  const id = String(customerId).split('/').pop();
  if (!/^\d+$/.test(id) || !Number.isFinite(Date.parse(createdAt)) || !Array.isArray(tags)) return [];
  const at = pkDate(createdAt);
  const lower = tags.filter(tag => typeof tag === 'string').map(tag => tag.trim().toLowerCase());
  if (!lower.includes('notify')) return [];
  const record = (product, size, paired) => ({id: `${id}:${product || '-'}:${size || '-'}`, customer: id, at, product, size, paired});
  const out = new Map();
  for (const tag of lower) {
    const match = /^want:([^:]+):([^:]+)$/.exec(tag);
    if (!match) continue;
    const product = clean(match[1]), size = clean(match[2]);
    if (product && size) out.set(`${product}:${size}`, record(product, size, true));
  }
  if (out.size) return [...out.values()];
  const products = [...new Set(lower.filter(tag => tag.startsWith('notify-')).map(tag => clean(tag.slice(7))).filter(Boolean))];
  const sizes = [...new Set(lower.filter(tag => tag.startsWith('size-')).map(tag => clean(tag.slice(5))).filter(Boolean))];
  if (products.length === 1 && sizes.length === 1) return [record(products[0], sizes[0], true)];
  const rows = [...products.map(product => record(product, null, false)), ...sizes.map(size => record(null, size, false))];
  return rows.length ? rows : [record(null, null, false)];
}

const sizeOrder = size => { const n = /(\d+(?:\.\d+)?)$/.exec(size || ''); return n ? Number(n[1]) : Number.POSITIVE_INFINITY; };
const bySize = (a, b) => sizeOrder(a.size) - sizeOrder(b.size) || String(a.size).localeCompare(String(b.size));

export function demandReport(state) {
  const signups = state.demandSignups || [];
  const titles = new Map((state.products || []).map(p => [handleize(p.title), p.title]));
  const customers = new Set(signups.map(s => s.customer));
  const designs = new Map(), sizes = new Map(), days = new Map();
  let paired = 0, unpaired = 0;
  for (const s of signups) {
    if (s.paired) paired++; else unpaired++;
    days.set(s.at, (days.get(s.at) || 0) + 1);
    if (s.size) sizes.set(s.size, (sizes.get(s.size) || 0) + 1);
    if (!s.product) continue;
    const d = designs.get(s.product) || {handle: s.product, title: titles.get(s.product) || s.product, requests: 0, last: null, sizes: new Map(), unspecifiedSize: 0};
    d.requests++;
    d.last = !d.last || s.at > d.last ? s.at : d.last;
    if (s.size) d.sizes.set(s.size, (d.sizes.get(s.size) || 0) + 1); else d.unspecifiedSize++;
    designs.set(s.product, d);
  }
  const sizeList = [...sizes].map(([size, count]) => ({size, count})).sort(bySize);
  return {
    sync: state.demandSync || null,
    people: customers.size,
    requests: signups.length,
    paired,
    unpaired,
    designs: [...designs.values()].map(d => ({handle: d.handle, title: d.title, requests: d.requests, last: d.last, unspecifiedSize: d.unspecifiedSize, sizes: [...d.sizes].map(([size, count]) => ({size, count})).sort(bySize)})).sort((a, b) => b.requests - a.requests || a.title.localeCompare(b.title)),
    sizes: sizeList,
    topSize: [...sizeList].sort((a, b) => b.count - a.count)[0] || null,
    daily: [...days].map(([date, count]) => ({date, count})).sort((a, b) => a.date.localeCompare(b.date)),
    notes: [
      'Dates are when the customer record was created, not when each design was added to it.',
      'A person who asks for several sizes appears once per request. Requests are not sales and not a forecast of sales.'
    ]
  };
}

// Pull every customer who used the back-in-stock form and replace the stored sign-ups.
// A full refresh is idempotent: running it twice gives the same result.
export async function syncDemand(storage, env, {now = Date.now(), fetcher = fetch} = {}) {
  const found = new Map();
  let after = null, pages = 0, hasNext = true;
  while (hasNext) {
    if (++pages > MAX_PAGES) throw new Error('Too many sign-ups for one pull; migrate demand storage before continuing.');
    const data = await graphql(env, customersQuery, {after, query: 'tag:notify'}, fetcher);
    const page = data.customers;
    if (!Array.isArray(page?.nodes) || typeof page.pageInfo?.hasNextPage !== 'boolean') throw new Error('Invalid Shopify page.');
    for (const node of page.nodes) for (const s of parseSignups(node.id, node.createdAt, node.tags)) found.set(s.id, s);
    if (page.pageInfo.hasNextPage && (!page.pageInfo.endCursor || page.pageInfo.endCursor === after)) throw new Error('Shopify returned a non-advancing cursor.');
    hasNext = page.pageInfo.hasNextPage;
    after = page.pageInfo.endCursor;
  }
  if (found.size > MAX_RECORDS) throw new Error('Too many sign-up records for the local database; migrate demand storage before continuing.');
  const records = [...found.values()];
  await mutate(storage, state => ({data: {...state, demandSignups: records, demandSync: {at: new Date(now).toISOString(), source: 'shopify', pages, requests: records.length}}}));
  return {pages, requests: records.length};
}

// Fallback for when no Shopify token exists yet: rows exported from the Shopify customer list.
// Each row is {id, date, tags}. `id` must be the numeric Shopify customer ID.
export function importSignups(state, rows, now = Date.now()) {
  if (!Array.isArray(rows) || !rows.length || rows.length > 2000) throw new Error('Supply an array of 1–2000 rows.');
  const found = new Map();
  rows.forEach((row, i) => {
    if (!row || typeof row !== 'object') throw new Error(`Row ${i + 1}: expected a record.`);
    const date = typeof row.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(row.date) ? row.date.slice(0, 10) : null;
    if (!date || !Number.isFinite(Date.parse(date))) throw new Error(`Row ${i + 1}: invalid date; use YYYY-MM-DD.`);
    if (!/^\d{1,20}$/.test(String(row.id ?? ''))) throw new Error(`Row ${i + 1}: id must be the numeric Shopify customer ID, not an email.`);
    const tags = typeof row.tags === 'string' ? row.tags.split(',') : row.tags;
    for (const s of parseSignups(String(row.id), date + 'T12:00:00+05:00', tags)) found.set(s.id, s);
  });
  if (found.size > MAX_RECORDS) throw new Error('Too many sign-up records for the local database.');
  return {...state, demandSignups: [...found.values()], demandSync: {at: new Date(now).toISOString(), source: 'import', pages: 0, requests: found.size}};
}
