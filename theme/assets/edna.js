(() => {
  if (window.ednaInitialized) return;
  window.ednaInitialized = true;
  const key = 'edna:saved-styles:v1';
  let saved = [];
  const valid = (item) => item && typeof item.title === 'string' && typeof item.url === 'string' && item.url.startsWith('/') && !item.url.startsWith('//');
  try { const data = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(data)) saved = data.filter(valid).slice(0, 100); } catch {}
  const announce = (message) => { const status = document.querySelector('[data-edna-status]'); if (status) status.textContent = status.dataset[message] || ''; };
  const refresh = () => {
    document.querySelectorAll('[data-edna-save]').forEach((button) => { button.hidden = false; button.setAttribute('aria-pressed', String(saved.some((item) => item.url === button.dataset.productUrl))); });
    document.querySelectorAll('[data-edna-wishlist]').forEach((button) => { button.hidden = false; });
    const list = document.querySelector('[data-edna-saved-list]');
    if (list) { list.replaceChildren(); saved.forEach((item) => { const li = document.createElement('li'); const a = document.createElement('a'); a.href = item.url; a.textContent = item.title; li.append(a); list.append(li); }); }
    const empty = document.querySelector('[data-edna-saved-empty]'); if (empty) empty.hidden = saved.length > 0;
  };
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-edna-save]');
    if (button) {
      const item = { url: button.dataset.productUrl, title: button.dataset.productTitle };
      if (!valid(item)) return;
      const exists = saved.some((entry) => entry.url === item.url);
      const next = exists ? saved.filter((entry) => entry.url !== item.url) : [...saved, item].slice(-100);
      try { localStorage.setItem(key, JSON.stringify(next)); saved = next; refresh(); announce(exists ? 'removed' : 'saved'); } catch { announce('unavailable'); }
    }
    if (event.target.closest('[data-edna-wishlist]')) {
      const dialog = document.querySelector('[data-edna-wishlist-dialog]');
      if (dialog && !dialog.open) dialog.showModal();
    }
    if (event.target.closest('[data-edna-close]')) document.querySelector('[data-edna-wishlist-dialog]')?.close();
  });
  document.addEventListener('shopify:section:load', refresh);
  window.addEventListener('storage', (event) => { if (event.key !== key) return; try { const data = JSON.parse(event.newValue || '[]'); saved = Array.isArray(data) ? data.filter(valid).slice(0, 100) : []; refresh(); } catch {} });
  refresh();
})();
