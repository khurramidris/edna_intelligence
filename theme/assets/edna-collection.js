(() => {
  if (window.ednaCollectionInitialized) return;
  window.ednaCollectionInitialized = true;
  let filter = 'all';
  let expanded = false;
  let search = '';
  const titleLabels = { all: 'All styles', stilettos: 'Stilettos', occasion: 'Occasion', traditional: 'Tradition', flats: 'Flats & Mules', street: 'Street & Sneakers', statement: 'Statement', wedding: 'Wedding Guest', everyday: 'Everyday', 'after-dark': 'After Dark', weekend: 'Weekend', quiet: 'The Quiet Edit', unexpected: 'The Unexpected Edit' };
  const render = () => {
    const catalog = document.querySelector('[data-edna-catalog]');
    if (!catalog) return;
    const cards = [...catalog.querySelectorAll('.edna-concept-card')];
    const limit = Number(catalog.dataset.limit) || 6;
    const matching = cards.filter((card) => (filter === 'all' || card.dataset.category === filter || card.dataset.edit === filter || card.dataset.occasions.split(' ').includes(filter)) && (!search || card.dataset.search.toLowerCase().includes(search)));
    cards.forEach((card) => { card.hidden = true; });
    const visible = filter !== 'all' || expanded ? matching : matching.slice(0, limit);
    visible.forEach((card) => { card.hidden = false; });
    document.querySelectorAll('[data-edna-collection-filter]').forEach((button) => { button.setAttribute(button.tagName === 'BUTTON' ? 'aria-pressed' : 'aria-current', String(button.dataset.ednaCollectionFilter === filter)); });
    catalog.querySelector('[data-edna-filter-label]').textContent = search || (filter === 'all' ? '' : titleLabels[filter] || filter);
    catalog.querySelector('[data-edna-no-results]').hidden = matching.length > 0;
    const count = catalog.querySelector('[data-edna-result-count]');
    count.textContent = visible.length + ' / ' + matching.length + ' ' + count.dataset.countLabel;
    const more = catalog.querySelector('[data-edna-show-all]');
    more.hidden = filter !== 'all' || matching.length <= limit;
    more.textContent = expanded ? more.dataset.lessLabel : more.dataset.allLabel;
  };
  const openStyle = (slug) => {
    const template = document.getElementById('EdnaStyle-' + slug);
    const dialog = document.querySelector('[data-edna-style-dialog]');
    if (!template || !dialog) return false;
    document.querySelector('[data-edna-wishlist-dialog]')?.close();
    dialog.querySelector('[data-edna-style-content]').replaceChildren(template.content.cloneNode(true));
    document.dispatchEvent(new CustomEvent('shopify:section:load'));
    if (!dialog.open) dialog.showModal();
    return true;
  };
  document.addEventListener('click', (event) => {
    const shortcut = event.target.closest('[data-edna-collection-filter]');
    if (shortcut) {
      event.preventDefault(); filter = shortcut.dataset.ednaCollectionFilter; search = ''; expanded = false; render();
      document.querySelector('#edna-edit')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    if (event.target.closest('[data-edna-show-all]')) { expanded = !expanded; render(); }
    const product = event.target.closest('[data-edna-open-style]');
    if (product && openStyle(product.dataset.ednaOpenStyle)) event.preventDefault();
    if (event.target.closest('[data-edna-close-product]')) document.querySelector('[data-edna-style-dialog]')?.close();
  });
  document.addEventListener('submit', (event) => {
    const form = event.target.closest('.edna-search-panel');
    if (!form || !document.querySelector('[data-edna-catalog]')) return;
    event.preventDefault();
    search = form.querySelector('[name=q]').value.trim().toLowerCase(); filter = 'all'; expanded = true; render();
    form.closest('details').open = false;
    document.querySelector('[data-edna-catalog-heading]').focus({preventScroll:true});
    document.querySelector('#edna-edit').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  });
  window.addEventListener('hashchange', () => { const slug = location.hash.replace(/^#edna-/, ''); openStyle(slug); });
  document.addEventListener('shopify:section:load', render);
  render();
  if (location.hash.startsWith('#edna-')) openStyle(location.hash.slice(6));
})();
