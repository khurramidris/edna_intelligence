(() => {
  if (window.ednaInitialized) return;
  window.ednaInitialized = true;

  /* ---------- Measurement helpers ---------- */
  // Custom events go to Shopify's customer-events bus under the "edna:" prefix.
  // Payloads never contain personal data. See docs/EVENTS.md.
  const publish = (name, data) => {
    try { window.Shopify?.analytics?.publish?.('edna:' + name, data || {}); } catch { /* analytics must never break the page */ }
  };

  /* ---------- Saved styles (device-local wishlist) ---------- */
  const key = 'edna:saved-styles:v1';
  let saved = [];
  const valid = (item) => item && typeof item.title === 'string' && typeof item.url === 'string' && item.url.startsWith('/') && !item.url.startsWith('//');
  try { const data = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(data)) saved = data.filter(valid).slice(0, 100); } catch { /* storage unavailable */ }
  const announce = (message) => { const status = document.querySelector('[data-edna-status]'); if (status) status.textContent = status.dataset[message] || ''; };
  const refresh = () => {
    document.querySelectorAll('[data-edna-save]').forEach((button) => { button.hidden = false; button.setAttribute('aria-pressed', String(saved.some((item) => item.url === button.dataset.productUrl))); });
    document.querySelectorAll('[data-edna-wishlist]').forEach((button) => { button.hidden = false; });
    const list = document.querySelector('[data-edna-saved-list]');
    if (list) { list.replaceChildren(); saved.forEach((item) => { const li = document.createElement('li'); const a = document.createElement('a'); a.href = item.url; a.textContent = item.title; li.append(a); list.append(li); }); }
    const empty = document.querySelector('[data-edna-saved-empty]'); if (empty) empty.hidden = saved.length > 0;
  };

  /* ---------- Delegated clicks ---------- */
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-edna-save]');
    if (button) {
      const item = { url: button.dataset.productUrl, title: button.dataset.productTitle };
      if (valid(item)) {
        const exists = saved.some((entry) => entry.url === item.url);
        const next = exists ? saved.filter((entry) => entry.url !== item.url) : [...saved, item].slice(-100);
        try { localStorage.setItem(key, JSON.stringify(next)); saved = next; refresh(); announce(exists ? 'removed' : 'saved'); publish(exists ? 'wishlist_removed' : 'wishlist_added', { productId: button.dataset.productId }); } catch { announce('unavailable'); }
      }
    }
    if (event.target.closest('[data-edna-wishlist]')) {
      const dialog = document.querySelector('[data-edna-wishlist-dialog]');
      if (dialog && !dialog.open) dialog.showModal();
    }
    if (event.target.closest('[data-edna-close]')) document.querySelector('[data-edna-wishlist-dialog]')?.close();

    const tracked = event.target.closest('[data-edna-event]');
    if (tracked) publish(tracked.dataset.ednaEvent, { productId: tracked.dataset.productId, variantId: tracked.dataset.variantId });

    // Close the navigation panel when the click lands outside it or on one of its links.
    const menu = document.querySelector('[data-edna-menu]');
    if (menu && menu.open && (!menu.contains(event.target) || event.target.closest('.edna-menu-panel a, [data-edna-wishlist]'))) menu.open = false;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const menu = document.querySelector('[data-edna-menu]');
    if (menu && menu.open) { menu.open = false; menu.querySelector('summary')?.focus(); }
  });

  /* ---------- Size selection ---------- */
  // The back-in-stock panel is rendered once; it is shown or hidden here as the shopper changes size.
  const handleize = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const updateNotify = (picker) => {
    const panel = document.querySelector('[data-edna-notify]');
    if (!panel) return;
    let variants;
    try { variants = JSON.parse(panel.dataset.variants || '[]'); } catch { return; }
    const parts = [...picker.querySelectorAll('input[type=radio]:checked')].map((input) => input.value);
    picker.querySelectorAll('select').forEach((select) => parts.push(select.value));
    const title = parts.join(' / ');
    const match = variants.find((variant) => variant.t === title);
    if (!match) return;
    panel.hidden = match.a;
    const heading = panel.querySelector('[data-edna-notify-heading]');
    if (heading) heading.textContent = (panel.dataset.heading || '').replace('{size}', title).trim();
    const tags = panel.querySelector('[data-edna-notify-tags]');
    if (tags) tags.value = panel.dataset.baseTags + ',size-' + handleize(title);
    const link = panel.querySelector('[data-edna-notify-wa]');
    if (link && panel.dataset.waNumber) {
      const message = (panel.dataset.waMessage || '').replace('{product}', panel.dataset.product || '') + ' (' + title + ')';
      link.href = 'https://wa.me/' + panel.dataset.waNumber + '?text=' + encodeURIComponent(message);
    }
  };
  document.addEventListener('change', (event) => {
    const input = event.target;
    const isRadio = input instanceof HTMLInputElement && input.type === 'radio';
    const isSelect = input instanceof HTMLSelectElement;
    if (!isRadio && !isSelect) return;
    const picker = input.closest('variant-picker');
    if (!picker) return;
    updateNotify(picker);
    if (!isRadio) return;
    const name = (input.dataset.optionName || '').toLowerCase();
    if (name && name !== 'size') return;
    const detail = { productId: picker.dataset.productId, size: input.value };
    publish('size_selected', detail);
    if (input.dataset.optionAvailable === 'false') publish('unavailable_size_selected', detail);
  });

  document.addEventListener('submit', (event) => {
    if (event.target.closest?.('[data-edna-notify]')) publish('notify_requested', {});
  });

  /* ---------- Ad source on every order ---------- */
  // Campaign parameters are kept for the session and written to the cart as attributes
  // when the first item is added, so each order records where it came from.
  // Nothing is stored unless Shopify's privacy API says analytics is allowed.
  const params = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'ttclid', 'gclid'];
  const attributionKey = 'edna:attribution:v1';
  const withPrivacy = (callback) => {
    const shopify = window.Shopify;
    if (!shopify) return;
    if (shopify.customerPrivacy) { callback(shopify.customerPrivacy); return; }
    if (typeof shopify.loadFeatures === 'function') {
      try { shopify.loadFeatures([{ name: 'consent-tracking-api', version: '0.1' }], (error) => { if (!error && shopify.customerPrivacy) callback(shopify.customerPrivacy); }); } catch { /* unavailable */ }
    }
  };
  const captureAttribution = () => {
    const search = new URLSearchParams(location.search);
    const found = {};
    params.forEach((name) => { const value = search.get(name); if (value && value.length <= 200) found[name] = value; });
    if (!Object.keys(found).length) return;
    withPrivacy((privacy) => {
      if (typeof privacy.analyticsProcessingAllowed === 'function' && !privacy.analyticsProcessingAllowed()) return;
      try {
        const landing = location.pathname;
        const previous = JSON.parse(sessionStorage.getItem(attributionKey) || 'null');
        const record = { ...found, landing, at: new Date().toISOString(), first: previous?.first || { ...found, landing } };
        sessionStorage.setItem(attributionKey, JSON.stringify(record));
      } catch { /* storage unavailable */ }
    });
  };
  let attributionWritten = false;
  const writeAttribution = () => {
    if (attributionWritten) return;
    let record = null;
    try { record = JSON.parse(sessionStorage.getItem(attributionKey) || 'null'); } catch { /* ignore */ }
    if (!record) return;
    attributionWritten = true;
    const attributes = {};
    params.forEach((name) => { if (record[name]) attributes['edna_' + name] = record[name]; });
    if (record.landing) attributes.edna_landing = record.landing;
    if (record.first?.utm_source) attributes.edna_first_source = record.first.utm_source;
    if (record.first?.utm_campaign) attributes.edna_first_campaign = record.first.utm_campaign;
    fetch('/cart/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attributes }) }).catch(() => { attributionWritten = false; });
  };
  const nativeFetch = window.fetch;
  if (typeof nativeFetch === 'function') {
    window.fetch = function (input, init) {
      const result = nativeFetch.apply(this, arguments);
      try {
        const url = typeof input === 'string' ? input : input?.url || '';
        if (/\/cart\/add/.test(url)) result.then((response) => { if (response.ok) writeAttribution(); }).catch(() => {});
      } catch { /* never interfere with the request */ }
      return result;
    };
  }
  captureAttribution();

  /* ---------- Images held back until needed ---------- */
  // Product photos below the first screen start loading when the shopper scrolls near them, so the
  // hero image and the first row get the whole connection. Hover photos load on first hover.
  const wakeImage = (image) => {
    if (image.dataset.src) image.src = image.dataset.src;
    if (image.dataset.srcset) image.srcset = image.dataset.srcset;
    image.removeAttribute('data-src');
    image.removeAttribute('data-srcset');
  };
  const watchImages = () => {
    const pending = [...document.querySelectorAll('img[data-src], img[data-srcset]')];
    if (!pending.length) return;
    if (!('IntersectionObserver' in window)) { pending.forEach(wakeImage); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { wakeImage(entry.target); observer.unobserve(entry.target); } });
    }, { rootMargin: '500px 0px' });
    pending.forEach((image) => observer.observe(image));
  };
  document.addEventListener('pointerover', (event) => {
    const card = event.target.closest?.('.edna-product');
    const hover = card?.querySelector('img[data-hover-src]');
    if (!hover) return;
    hover.src = hover.dataset.hoverSrc;
    if (hover.dataset.hoverSrcset) hover.srcset = hover.dataset.hoverSrcset;
    hover.removeAttribute('data-hover-src');
    hover.removeAttribute('data-hover-srcset');
  }, { passive: true });
  watchImages();

  document.addEventListener('shopify:section:load', () => { refresh(); watchImages(); });
  window.addEventListener('storage', (event) => { if (event.key !== key) return; try { const data = JSON.parse(event.newValue || '[]'); saved = Array.isArray(data) ? data.filter(valid).slice(0, 100) : []; refresh(); } catch { /* ignore */ } });
  refresh();
})();
