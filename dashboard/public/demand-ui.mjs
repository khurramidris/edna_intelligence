// Demand screen: which designs and sizes people asked for before stock existed.
// All figures come from /api/demand. Names, emails and phone numbers are never loaded here.
export async function renderDemand({content, request, intro, stat, esc}) {
  const head = intro('What people are asking for.', 'Back-in-stock requests by design and size. Use this to decide what to make and in which sizes.');
  content.innerHTML = head + '<p>Loading requests…</p>';
  try {
    const data = await request('demand');
    if (location.hash !== '#demand') return;
    const sizes = data.sizes.map(s => s.size);
    const max = Math.max(1, ...data.designs.flatMap(d => d.sizes.map(s => s.count)));
    const cell = (d, size) => {
      const count = d.sizes.find(s => s.size === size)?.count || 0;
      const shade = count ? `background:rgba(53,74,55,${(0.15 + 0.7 * count / max).toFixed(2)});color:${count / max > 0.5 ? '#fff' : 'inherit'}` : '';
      return `<td style="text-align:center;${shade}">${count || ''}</td>`;
    };
    const grid = data.designs.length
      ? `<div class="table-wrap"><table><thead><tr><th>Design</th><th>Requests</th>${sizes.map(s => `<th style="text-align:center">${esc(s.replace(/^eu-/, 'EU '))}</th>`).join('')}<th>No size</th><th>Latest</th></tr></thead><tbody>${data.designs.map(d => `<tr><td>${esc(d.title)}</td><td><strong>${d.requests}</strong></td>${sizes.map(s => cell(d, s)).join('')}<td style="text-align:center">${d.unspecifiedSize || ''}</td><td>${esc(d.last || '')}</td></tr>`).join('')}</tbody></table></div>`
      : '<p class="empty">No requests yet. They appear here once visitors use the back-in-stock form and you pull from Shopify.</p>';
    const top = data.designs[0];
    const synced = data.sync ? `${esc(data.sync.at.slice(0, 16).replace('T', ' '))} UTC · ${esc(data.sync.source)}` : 'Not pulled yet';
    content.innerHTML = head
      + `<div class="stats">${stat('PEOPLE', data.people, 'Distinct customers who asked')}${stat('REQUESTS', data.requests, `${data.paired} with design and size`)}${stat('MOST ASKED DESIGN', top ? esc(top.title.split(' — ')[0]) : '—', top ? top.requests + ' requests' : 'No data yet')}${stat('MOST ASKED SIZE', data.topSize ? esc(data.topSize.size.replace(/^eu-/, 'EU ')) : '—', data.topSize ? data.topSize.count + ' requests' : 'No data yet')}</div>`
      + `<section class="panel"><div class="toolbar"><h2 style="margin:0">Design by size</h2><button id="pull" type="button">Pull from Shopify</button></div><p class="muted">Last pulled: ${synced}</p>${grid}</section>`
      + (data.unpaired ? `<section class="panel"><h2>Unpaired requests</h2><p>${data.unpaired} older request${data.unpaired === 1 ? ' names' : 's name'} only a design or only a size, so ${data.unpaired === 1 ? 'it cannot' : 'they cannot'} be placed in the grid. ${data.unpaired === 1 ? 'It is' : 'They are'} included in the totals above.</p></section>` : '')
      + `<section class="panel"><h2>Requests by day</h2>${data.daily.length ? `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Requests</th></tr></thead><tbody>${data.daily.slice(-30).reverse().map(d => `<tr><td>${esc(d.date)}</td><td>${d.count}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">No requests yet.</p>'}</section>`
      + `<section class="panel"><h2>How to read this</h2>${data.notes.map(n => `<p class="muted">${esc(n)}</p>`).join('')}</section>`;
    const button = content.querySelector('#pull');
    button.onclick = async () => {
      button.disabled = true;
      button.textContent = 'Pulling…';
      try {
        await request('demand/sync', {});
        if (location.hash === '#demand') renderDemand({content, request, intro, stat, esc});
      } catch (error) {
        button.disabled = false;
        button.textContent = 'Pull from Shopify';
        const note = document.querySelector('#notice');
        if (note) note.textContent = error.message;
      }
    };
  } catch (error) {
    if (location.hash === '#demand') content.textContent = error.message;
  }
}
