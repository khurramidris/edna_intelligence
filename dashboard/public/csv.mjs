// Quoted CSV with doubled quotes and CRLF/newlines. Validation remains on server.
export function parseCsv(text,kind){
 text=text.replace(/^\uFEFF/,'');
 if(text.length>1_000_000)throw new Error('CSV exceeds 1 MB.');
 const rows=[];let row=[],field='',quoted=false,closed=false;
 const finish=()=>{row.push(field);field='';closed=false;};
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;continue;}
  if(c==='"'){if(field||closed)throw new Error('Unexpected quote in CSV.');quoted=true;continue;}
  if(c===','){finish();continue;}
  if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;finish();rows.push(row);row=[];continue;}
  if(closed)throw new Error('Unexpected text after a quoted CSV field.');
  field+=c;
 }
 if(quoted)throw new Error('Unclosed quote in CSV.');
 if(field||closed||row.length){finish();rows.push(row);}
 while(rows.length&&rows.at(-1).every(v=>v===''))rows.pop();
 if(rows.length<2)throw new Error('CSV needs a header and data rows.');
 const headers=rows.shift().map(s=>s.trim());
 if(headers.some(h=>!h||!/^\w+$/.test(h))||new Set(headers).size!==headers.length)throw new Error('Use unique, named CSV columns from the template.');
 return rows.map((values,i)=>{
  if(values.length!==headers.length)throw new Error(`CSV row ${i+2}: column count differs from header.`);
  const out=Object.fromEntries(headers.map((h,j)=>[h,values[j]]));
  if(kind==='adSpend')for(const key of ['clicks','impressions']){if(!/^\d+$/.test(out[key]||''))throw new Error(`CSV row ${i+2}: invalid ${key}.`);out[key]=Number(out[key]);}
  if(kind==='orders')for(const key of ['courierFee','customerId','campaignId','platform'])if(out[key]==='')out[key]=null;
  return out;
 });
}
export function toCsv(records){
 const columns=Object.keys(records[0]);
 const quote=value=>'"'+String(value??'').replaceAll('"','""')+'"';
 return [columns.map(quote).join(','),...records.map(r=>columns.map(k=>quote(r[k])).join(','))].join('\r\n');
}
