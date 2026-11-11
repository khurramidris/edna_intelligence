export function money(value) {
  if (!/^(0|[1-9]\d{0,9})(\.\d{1,2})?$/.test(String(value))) throw new Error('Amounts must be nonnegative PKR with at most two decimals.');
  return Math.round(Number(value) * 100);
}
export function validateImport(kind, rows, state) {
  if (!Array.isArray(rows) || !rows.length || rows.length > 2000) throw new Error('Supply an array of 1–2000 records.');
  const ids = new Set();
  return rows.map((row, i) => {
    const fail = message => { throw new Error(`Row ${i + 1}: ${message}`); };
    if (!row || typeof row !== 'object' || Array.isArray(row)) fail('Expected a record.');
    const text = (key, max = 100) => { if (typeof row[key] !== 'string' || !row[key].trim() || row[key].length > max) fail(`Invalid ${key}.`); return row[key].trim(); };
    const id = text('id');
    if (ids.has(id)) fail('Duplicate id in this import.');
    ids.add(id);
    const dateValue=key=>{const value=text(key);if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)fail(`Invalid ${key}; use YYYY-MM-DD.`);return value;};
    const optionalId=key=>{if(row[key]==null||row[key]==='')return null;const value=text(key,150);if(!/^[a-zA-Z0-9_:/.-]+$/.test(value))fail(`Invalid ${key}; use an opaque identifier, not contact details.`);return value;};
    if(kind==='adSpend'){
      const date=dateValue('date'),platform=text('platform'),campaignId=optionalId('campaignId');
      if(!['meta','google','tiktok','other'].includes(platform)||!campaignId)fail('Supply a supported platform and campaignId.');
      const canonical=`${date}:${platform}:${campaignId}`;
      if(id!==canonical)fail(`id must equal ${canonical} to avoid duplicate daily spend.`);
      const integer=key=>{if(!Number.isSafeInteger(row[key])||row[key]<0||row[key]>1000000000)fail(`Invalid ${key}.`);return row[key];};
      if(row.currency!=='PKR')fail('Convert amounts to PKR before importing; retain exchange-rate evidence in source.');
      return {id,date,platform,campaignId,campaignName:text('campaignName',120),spend:money(row.spend),impressions:integer('impressions'),clicks:integer('clicks'),currency:'PKR',source:text('source',120)};
    }
    if(kind==='customers'){
      if(!/^[a-zA-Z0-9_:/.-]{1,100}$/.test(id))fail('Use an opaque customer ID, not contact details.');
      if(!['unknown','subscribed','unsubscribed'].includes(row.emailConsent))fail('Invalid emailConsent.');
      return {id,emailConsent:row.emailConsent,consentUpdatedAt:dateValue('consentUpdatedAt'),source:text('source',120)};
    }
    if (kind === 'costs') {
      if (!state.products.some(p => p.id === id)) fail('Product id is not in the catalog.');
      return {id, unitCost: money(row.unitCost), packaging: money(row.packaging)};
    }
    if (kind !== 'orders') fail('Unknown import type.');
    const date = text('date');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date) fail('Use a valid YYYY-MM-DD date.');
    if (!['placed','shipped','delivered','returned','cancelled'].includes(row.status)) fail('Invalid delivery status.');
    if (!['COD','PREPAID'].includes(row.payment)) fail('Payment must be COD or PREPAID.');
    const campaignId=optionalId('campaignId'),customerId=optionalId('customerId');
    const platform=row.platform||null;
    if(campaignId&&!['meta','google','tiktok','other'].includes(platform))fail('Attributed orders require platform.');
    return {id, date, status:row.status, payment:row.payment, total:money(row.total), collected:money(row.collected), refunded:money(row.refunded), courierFee: row.courierFee === null ? null : money(row.courierFee), source:text('source',120),customerId,campaignId,platform:campaignId?platform:null};
  });
}
export function mergeImport(state, kind, rows) {
  const records = validateImport(kind, rows, state);
  const map = new Map((state[kind]||[]).map(r => [r.id,r]));
  if(kind==='customers')for(const record of records){const old=map.get(record.id);if(old&&old.consentUpdatedAt>record.consentUpdatedAt)throw new Error('An older consent record cannot replace a newer one.');}
  records.forEach(r => map.set(r.id,r));
  return {...state, [kind]:[...map.values()], history:[{at:new Date().toISOString(),kind,count:records.length},...state.history].slice(0,100)};
}
export function metrics(state) {
  const orders = state.orders;
  const sum = key => orders.reduce((v,r)=>v+(r[key] ?? 0),0);
  return {orderCount:orders.length, booked:orders.filter(r=>r.status!=='cancelled').reduce((v,r)=>v+r.total,0), collected:sum('collected'), refunded:sum('refunded'), netCash:sum('collected')-sum('refunded'), delivered:orders.filter(r=>r.status==='delivered').length, returns:orders.filter(r=>r.status==='returned').length, codOutstanding:orders.filter(r=>r.payment==='COD' && r.status==='delivered').reduce((v,r)=>v+Math.max(0,r.total-r.collected),0), costCoverage:state.costs.length, missingCourierFees:orders.filter(r=>r.courierFee===null).length};
}
