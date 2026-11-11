import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseCsv,toCsv} from '../public/csv.mjs';
test('CSV quoted commas, escaped quotes, line breaks and numeric fields round trip',()=>{const rows=[{id:'1',campaignName:'Summer, "EDNA"\nCollection',clicks:2,impressions:4}];assert.deepEqual(parseCsv(toCsv(rows),'adSpend'),rows);});
test('CSV rejects ragged rows, duplicate headers and unclosed quotes',()=>{assert.throws(()=>parseCsv('id,id\na,b','orders'));assert.throws(()=>parseCsv('id,date\na','orders'));assert.throws(()=>parseCsv('id\n"unfinished','orders'));assert.throws(()=>parseCsv('id\n"a"b','orders'));});
test('CSV blank optional order values become unknown rather than zero',()=>{const rows=parseCsv('id,courierFee,customerId\r\n1,,\r\n','orders');assert.equal(rows[0].courierFee,null);assert.equal(rows[0].customerId,null);});
