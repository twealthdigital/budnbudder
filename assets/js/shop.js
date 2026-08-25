/* =====================================================
   BUD N' BUDDER — shop.js
   Shop page: product data, filtering, sorting, responsive
   pagination, cart, search overlay, off-canvas filter panel.
   Fires on "partials:loaded" (dispatched by include.js) since
   the header/footer/cart/search markup this file binds to
   lives in header.html/footer.html and isn't in the DOM yet
   at DOMContentLoaded.
   ===================================================== */
(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const money = (n) => '$' + n.toFixed(2);
  const CART_KEY = 'bnb_cart';

  /* =====================================================
     PRODUCT DATA
     -----------------------------------------------------
     This is a stand-in for a real product catalog. Everything
     below (filters, search, sort, pagination, cart) reads
     through getProducts(), so wiring up a backend later is a
     one-line swap:

       async function getProducts() {
         const res = await fetch('/api/products');
         return res.json();
       }

     removeProductById() / addProduct() are already wired to
     re-run the filter/render pipeline, ready to be called from
     an admin panel or hooked to DELETE/POST endpoints.
     ===================================================== */
  let PRODUCTS = [
    { id: 'sp01', name: 'Runtz Flower', cat: 'Flower', type: 'flower', price: 45.00, rating: 4.8, reviews: 42, badge: 'new', image: 'assets/images/products/bs1.png' },
    { id: 'sp02', name: "Packwoods Pre-Roll", cat: 'Pre-Roll', type: 'prerolls', price: 15.00, rating: 4.7, reviews: 22, badge: null, image: 'assets/images/products/na2.png' },
    { id: 'sp03', name: 'Big Chief Gummies', cat: 'Edibles', type: 'edibles', price: 25.00, rating: 4.9, reviews: 27, badge: 'bestseller', image: 'assets/images/products/bs3.png' },
    { id: 'sp04', name: 'CCELL M3 Battery', cat: 'Vaporizer', type: 'vapes', price: 20.00, rating: 4.7, reviews: 31, badge: null, image: 'assets/images/products/bs2.png' },
    { id: 'sp05', name: 'Sherbinski', cat: 'Flower', type: 'flower', price: 50.00, rating: 4.9, reviews: 19, badge: 'new', image: 'assets/images/products/na1.png' },
    { id: 'sp06', name: 'Hidden Hills Bar', cat: 'Edibles', type: 'edibles', price: 30.00, rating: 4.8, reviews: 24, badge: 'new', image: 'assets/images/products/na4.png' },
    { id: 'sp07', name: 'Muha Meds Disposable', cat: 'Vape', type: 'vapes', price: 40.00, rating: 4.8, reviews: 18, badge: 'bestseller', image: 'assets/images/products/na3.png' },
    { id: 'sp08', name: 'Jeeter Juice (Watermelon)', cat: 'Vape', type: 'vapes', price: 35.00, rating: 4.8, reviews: 36, badge: 'bestseller', image: 'assets/images/products/bs4.png' },
    { id: 'sp09', name: 'Gelato Flower', cat: 'Flower', type: 'flower', price: 48.00, rating: 4.7, reviews: 15, badge: null, image: 'assets/images/products/bs1.png' },
    { id: 'sp10', name: 'Grinder (4pc)', cat: 'Accessories', type: 'accessories', price: 25.00, rating: 4.6, reviews: 20, badge: null, image: 'assets/images/products/bs2.png' }
  ];

  function getProducts() { return PRODUCTS; }

  function removeProductById(id) {
    const i = PRODUCTS.findIndex((p) => p.id === id);
    if (i === -1) return false;
    PRODUCTS.splice(i, 1);
    buildCategoryList();
    applyFilters();
    return true;
  }
  function addProduct(product) {
    PRODUCTS.push(product);
    buildCategoryList();
    applyFilters();
  }
  window.BNB = window.BNB || {};
  window.BNB.removeProduct = removeProductById;
  window.BNB.addProduct = addProduct;
  window.BNB.getProducts = getProducts;

  /* ---------- CATEGORY ICONS (fallback covers any future category type) ---------- */
  const CATEGORY_ICONS = {
    flower: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2.5C12 2.5 6 6 6 12.5C6 15 7.2 17 9 18.4V22H15V18.4C16.8 17 18 15 18 12.5C18 6 12 2.5 12 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    prerolls: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 15L15 3L21 9L9 21L3 15Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M13 5L19 11" stroke="currentColor" stroke-width="1.4"/></svg>',
    edibles: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="7" width="17" height="13" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 11H20.5" stroke="currentColor" stroke-width="1.4"/><path d="M12 7V4.5C12 3.4 12.9 2.5 14 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    concentrates: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3C12 3 6.5 9.5 6.5 14.5C6.5 17.8 8.9 20.5 12 20.5C15.1 20.5 17.5 17.8 17.5 14.5C17.5 9.5 12 3 12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    vapes: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="7" y="3" width="6" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/><rect x="5.5" y="10" width="9" height="10.5" rx="2.5" stroke="currentColor" stroke-width="1.4"/></svg>',
    accessories: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.4"/></svg>',
    _default: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3H19.5C20.3 3 21 3.7 21 4.5V12L12 21L3 12Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/></svg>'
  };

  /* ---------- STATE ---------- */
  const state = {
    search: '',
    cats: new Set(),
    priceMin: null,
    priceMax: null,
    sort: 'default',
    page: 1
  };

  /* =====================================================
     CART (same localStorage key/shape as home.js so the
     cart stays in sync across pages)
     ===================================================== */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
  }
  function cartCount(cart) { return Object.keys(cart).length; }
  function addToCart(id) {
    const cart = getCart();
    cart[id] = (cart[id] || 0) + 1;
    saveCart(cart);
  }
  function changeQty(id, delta) {
    const cart = getCart();
    if (!cart[id]) return;
    cart[id] += delta;
    if (cart[id] <= 0) delete cart[id];
    saveCart(cart);
  }
  function removeFromCart(id) {
    const cart = getCart();
    delete cart[id];
    saveCart(cart);
  }
  function renderCart() {
    const cart = getCart();
    const badge = $('#cartBadge');
    const itemsWrap = $('#cartItems');
    const subtotalEl = $('#cartSubtotal');
    if (badge) badge.textContent = cartCount(cart);
    if (!itemsWrap) return;

    const entries = Object.entries(cart);
    if (!entries.length) {
      itemsWrap.innerHTML = '<div class="cart-empty">Your cart is empty.<br>Add some products to get started.</div>';
      if (subtotalEl) subtotalEl.textContent = money(0);
      return;
    }
    let subtotal = 0;
    itemsWrap.innerHTML = entries.map(([id, qty]) => {
      const p = PRODUCTS.find((x) => x.id === id);
      if (!p) return '';
      subtotal += p.price * qty;
      return `
        <div class="cart-line" data-id="${id}">
          <div class="cart-line__thumb"><img src="${p.image}" alt="${p.name}"></div>
          <div class="cart-line__info">
            <span class="cart-line__name">${p.name}</span>
            <span class="cart-line__meta">${money(p.price)} / ${p.cat}</span>
            <div class="cart-line__row">
              <div class="cart-line__qty">
                <button data-qty-down="${id}" aria-label="Decrease quantity">−</button>
                <span>${qty}</span>
                <button data-qty-up="${id}" aria-label="Increase quantity">+</button>
              </div>
              <button class="cart-line__remove" data-remove="${id}">Remove</button>
            </div>
          </div>
        </div>`;
    }).join('');
    if (subtotalEl) subtotalEl.textContent = money(subtotal);
  }

  function initCartAndProductClicks() {
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-add]');
      if (addBtn && addBtn.closest('.product-card')) {
        addToCart(addBtn.getAttribute('data-add'));
        addBtn.classList.add('is-added');
        setTimeout(() => addBtn.classList.remove('is-added'), 1300);
        return;
      }
      const upBtn = e.target.closest('[data-qty-up]');
      if (upBtn) return changeQty(upBtn.getAttribute('data-qty-up'), 1);
      const downBtn = e.target.closest('[data-qty-down]');
      if (downBtn) return changeQty(downBtn.getAttribute('data-qty-down'), -1);
      const removeBtn = e.target.closest('[data-remove]');
      if (removeBtn) return removeFromCart(removeBtn.getAttribute('data-remove'));
    });
    const checkoutBtn = $('#checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (!cartCount(getCart())) return;
        alert('Checkout is coming soon! Your order will be ready for pickup or delivery confirmation shortly.');
      });
    }
  }

  /* ---------- HEADER SEARCH OVERLAY RESULTS ---------- */
  function initSearchOverlayResults() {
    const input = $('#searchInput');
    const results = $('#searchResults');
    if (!input || !results) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = '<p class="search-overlay__hint">Try "flower", "gummies", or "vape"</p>';
        return;
      }
      const matches = PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
      if (!matches.length) {
        results.innerHTML = '<p class="search-overlay__hint">No products match "' + input.value + '".</p>';
        return;
      }
      results.innerHTML = matches.map((p) => `
        <a class="search-result" href="shop.html?cat=${encodeURIComponent(p.type)}&q=${encodeURIComponent(p.name)}">
          <span class="search-result__name">${p.name}</span>
          <span class="search-result__price">${money(p.price)}</span>
        </a>
      `).join('');
    });
    results.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add]');
      if (!btn) return;
      addToCart(btn.getAttribute('data-add'));
      if (window.BNB && window.BNB.closeSearch) window.BNB.closeSearch();
      if (window.BNB && window.BNB.openCart) window.BNB.openCart();
    });
  }

  /* =====================================================
     CATEGORY FILTERS — built dynamically from PRODUCTS so
     a category added with future product data shows up here
     with zero code changes.
     ===================================================== */
  function buildCategoryList() {
    const wrap = $('#categoryList');
    if (!wrap) return;

    const counts = {};
    PRODUCTS.forEach((p) => {
      const key = p.type || 'other';
      if (!counts[key]) counts[key] = { type: key, label: p.cat || key, count: 0 };
      counts[key].count += 1;
    });
    const cats = Object.values(counts).sort((a, b) => a.label.localeCompare(b.label));

    wrap.innerHTML = cats.map((c) => `
      <button type="button" class="category-row" data-cat="${c.type}">
        <span class="category-row__icon">${CATEGORY_ICONS[c.type] || CATEGORY_ICONS._default}</span>
        <span class="category-row__name">${c.label}</span>
        <span class="category-row__count">${c.count}</span>
      </button>`).join('');

    $$('.category-row', wrap).forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        if (state.cats.has(cat)) state.cats.delete(cat); else state.cats.add(cat);
        syncCategoryUI();
        state.page = 1;
        applyFilters();
      });
    });
    syncCategoryUI();
  }
  function syncCategoryUI() {
    $$('.category-row').forEach((btn) => {
      btn.classList.toggle('is-active', state.cats.has(btn.getAttribute('data-cat')));
    });
  }

  /* =====================================================
     PRICE RANGE (dual-thumb slider, bounds derived from data)
     ===================================================== */
  let priceBounds = { min: 0, max: 100 };

  function initPriceSlider() {
    const prices = PRODUCTS.map((p) => p.price);
    const dataMin = Math.floor(Math.min(...prices) / 5) * 5;
    const dataMax = Math.ceil(Math.max(...prices) / 5) * 5;
    priceBounds = { min: dataMin, max: dataMax };

    const minInput = $('#priceMin');
    const maxInput = $('#priceMax');
    [minInput, maxInput].forEach((el) => {
      el.min = priceBounds.min;
      el.max = priceBounds.max;
    });
    minInput.value = priceBounds.min;
    maxInput.value = priceBounds.max;
    state.priceMin = priceBounds.min;
    state.priceMax = priceBounds.max;
    renderPriceUI();

    function handleInput() {
      let minV = parseInt(minInput.value, 10);
      let maxV = parseInt(maxInput.value, 10);
      if (minV > maxV - 1) minV = maxV - 1 < priceBounds.min ? priceBounds.min : maxV - 1;
      minInput.value = minV;
      state.priceMin = minV;
      state.priceMax = maxV;
      renderPriceUI();
    }
    minInput.addEventListener('input', handleInput);
    maxInput.addEventListener('input', handleInput);

    const filterBtn = $('#priceFilterBtn');
    if (filterBtn) filterBtn.addEventListener('click', () => { state.page = 1; applyFilters(); });
  }
  function renderPriceUI() {
    $('#priceMinLabel').textContent = money(state.priceMin);
    $('#priceMaxLabel').textContent = money(state.priceMax);
    const range = priceBounds.max - priceBounds.min || 1;
    const left = ((state.priceMin - priceBounds.min) / range) * 100;
    const right = ((state.priceMax - priceBounds.min) / range) * 100;
    const fill = $('#priceRangeFill');
    if (fill) { fill.style.left = left + '%'; fill.style.right = (100 - right) + '%'; }
  }

  /* =====================================================
     SEARCH (sidebar) + SORT (sidebar radios + toolbar select,
     kept in sync)
     ===================================================== */
  function initSidebarSearch() {
    const form = $('#shopSearchForm');
    const input = $('#shopSearchInput');
    if (!form || !input) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      state.search = input.value.trim().toLowerCase();
      state.page = 1;
      applyFilters();
    });
  }

  const SORT_LABELS = {
    default: 'Sort by: Default',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
    bestsellers: 'Best Sellers',
    newest: 'Newest'
  };

  function setSort(value) {
    state.sort = value;
    const label = $('#toolbarSortLabel');
    const menu = $('#toolbarSortMenu');
    if (label) label.textContent = SORT_LABELS[value] || value;
    if (menu) $$('li', menu).forEach((li) => li.classList.toggle('is-selected', li.getAttribute('data-value') === value));
    state.page = 1;
    applyFilters();
  }
  function initSort() {
    const dropdown = $('#toolbarSortDropdown');
    const toggle = $('#toolbarSortToggle');
    const menu = $('#toolbarSortMenu');
    if (!dropdown || !toggle || !menu) return;

    function open() { dropdown.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true'); }
    function close() { dropdown.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }

    toggle.addEventListener('click', () => { dropdown.classList.contains('is-open') ? close() : open(); });
    $$('li', menu).forEach((li) => li.addEventListener('click', () => { setSort(li.getAttribute('data-value')); close(); }));
    document.addEventListener('click', (e) => { if (!dropdown.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

function clearAllFilters() {
    // Completely clear every active filter
    state.search = '';
    state.cats.clear();
    state.priceMin = priceBounds.min;
    state.priceMax = priceBounds.max;
    state.sort = 'default';
    state.page = 1;

    // Clear the search input
    const searchInput = $('#shopSearchInput');
    if (searchInput) searchInput.value = '';

    // Reset price inputs
    const minInput = $('#priceMin');
    const maxInput = $('#priceMax');

    if (minInput) minInput.value = priceBounds.min;
    if (maxInput) maxInput.value = priceBounds.max;

    // Reset category UI
    syncCategoryUI();

    // Reset price UI
    renderPriceUI();

    // Reset sort UI without calling applyFilters again
    const sortLabel = $('#toolbarSortLabel');
    const sortMenu = $('#toolbarSortMenu');

    if (sortLabel) {
      sortLabel.textContent = SORT_LABELS.default;
    }

    if (sortMenu) {
      $$('li', sortMenu).forEach((li) => {
        li.classList.toggle(
          'is-selected',
          li.getAttribute('data-value') === 'default'
        );
      });
    }

    // IMPORTANT:
    // Remove ?cat=... and ?q=... from the URL.
    // This prevents the Home Page "View" filter from being applied again.
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, '', url.pathname + url.hash);

    // Force the shop to render ALL products again
    applyFilters(true);
  }
function initClearAllFilters() {
    const btn = $('#clearAllFilters');
    if (btn) btn.addEventListener('click', clearAllFilters);
}

  /* =====================================================
     FILTER + SORT PIPELINE
     ===================================================== */
  function getFilteredSorted() {
    let list = PRODUCTS.filter((p) => {
      if (state.search && !(p.name.toLowerCase().includes(state.search) || p.cat.toLowerCase().includes(state.search))) return false;
      if (state.cats.size && !state.cats.has(p.type)) return false;
      if (state.priceMin != null && p.price < state.priceMin) return false;
      if (state.priceMax != null && p.price > state.priceMax) return false;
      return true;
    });

    switch (state.sort) {
      case 'price-asc': list = list.slice().sort((a, b) => a.price - b.price); break;
      case 'price-desc': list = list.slice().sort((a, b) => b.price - a.price); break;
      case 'bestsellers':
        list = list.slice().sort((a, b) => {
          const bestSellerDiff = (b.badge === 'bestseller' ? 1 : 0) - (a.badge === 'bestseller' ? 1 : 0);
          if (bestSellerDiff !== 0) return bestSellerDiff;
          return (b.rating * b.reviews) - (a.rating * a.reviews);
        });
        break;
      case 'newest':
        list = list.slice().sort((a, b) => (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0));
        break;
      default: break; /* keep catalog order */
    }
    return list;
  }

  /* =====================================================
     RESPONSIVE ITEMS-PER-PAGE
     Desktop (>1080px): 9 · Tablet (701–1080px): 6 · Mobile (<=700px): 4
     ===================================================== */
  function itemsPerPage() {
    const w = window.innerWidth;
    if (w > 1080) return 9;
    if (w > 700) return 6;
    return 4;
  }

  /* ---------- RENDER PRODUCT CARDS (same markup/classes as home page) ---------- */
  function starRow(rating) {
    const full = Math.round(rating);
    let s = '';
    for (let i = 1; i <= 5; i++) s += i <= full ? '★' : '☆';
    return s;
  }
  function badgeMarkup(badge) {
    if (!badge) return '';
    const label = badge === 'new' ? 'New' : 'Best Seller';
    return `<span class="product-card__badge product-card__badge--${badge}">${label}</span>`;
  }
  function renderGrid(pageItems) {
    const grid = $('#shopProductGrid');
    const empty = $('#shopEmpty');
    if (!grid) return;
    if (!pageItems.length) {
      grid.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    grid.innerHTML = pageItems.map((p) => `
      <div class="product-card" data-id="${p.id}">
        <div class="product-card__img">
          ${badgeMarkup(p.badge)}
          <div class="media-frame">
            <img src="${p.image}" alt="${p.name} — replace with product photography">
          </div>
        </div>
        <div class="product-card__body">
          <span class="product-card__cat">${p.cat}</span>
          <div class="product-card__name">${p.name}</div>
          <div class="product-card__rating">${starRow(p.rating)} <span>${p.rating.toFixed(1)}</span></div>
          <div class="product-card__price-row">
            <span class="product-card__price">${money(p.price)}</span>
            <button class="product-card__add" data-add="${p.id}" aria-label="Add ${p.name} to cart">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6H5L6.3 15.6C6.4 16.6 7.3 17.3 8.3 17.3H17.4C18.4 17.3 19.2 16.6 19.4 15.7L20.9 8.6C21.1 7.9 20.5 7.2 19.8 7.2H5.6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
              <span class="product-card__add-text">Added</span>
            </button>
          </div>
        </div>
      </div>`).join('');
  }

  /* ---------- PAGINATION ---------- */
  function pageWindow(current, total) {
    const pages = [];
    const push = (v) => pages.push(v);
    push(1);
    for (let i = current - 1; i <= current + 1; i++) if (i > 1 && i < total) push(i);
    if (total > 1) push(total);
    const out = [];
    let prev = null;
    pages.forEach((p) => {
      if (prev !== null && p - prev > 1) out.push('…');
      out.push(p);
      prev = p;
    });
    return out;
  }
  function renderPagination(totalItems, perPage) {
    const nav = $('#shopPagination');
    if (!nav) return;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    if (state.page > totalPages) state.page = totalPages;
    if (totalPages <= 1) { nav.innerHTML = ''; return; }

    const items = pageWindow(state.page, totalPages);
    let html = `<button class="pagination__nav" data-page="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''} aria-label="Previous page">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>`;
    items.forEach((it) => {
      if (it === '…') { html += '<span class="pagination__ellipsis">…</span>'; return; }
      html += `<button data-page="${it}" class="${it === state.page ? 'is-active' : ''}" aria-current="${it === state.page ? 'page' : 'false'}">${it}</button>`;
    });
    html += `<button class="pagination__nav" data-page="${state.page + 1}" ${state.page === totalPages ? 'disabled' : ''} aria-label="Next page">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>`;
    nav.innerHTML = html;

    $$('button[data-page]', nav).forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.getAttribute('data-page'), 10);
        if (Number.isNaN(p) || p < 1 || p > totalPages || p === state.page) return;
        state.page = p;
        applyFilters(true);
      });
    });
  }

  /* ---------- ACTIVE FILTER COUNT (mobile toggle badge) ---------- */
  function updateFilterCount() {
    const badge = $('#filterCount');
    if (!badge) return;
    let count = state.cats.size;
    if (state.search) count += 1;
    if (state.priceMin !== priceBounds.min || state.priceMax !== priceBounds.max) count += 1;
    badge.hidden = count === 0;
    badge.textContent = count;
  }

  /* =====================================================
     MAIN PIPELINE
     ===================================================== */
  function applyFilters(skipScroll) {
    const list = getFilteredSorted();
    const perPage = itemsPerPage();
    const totalPages = Math.max(1, Math.ceil(list.length / perPage));
    if (state.page > totalPages) state.page = totalPages;

    const start = (state.page - 1) * perPage;
    const pageItems = list.slice(start, start + perPage);

    renderGrid(pageItems);
    renderPagination(list.length, perPage);
    updateFilterCount();

    const countEl = $('#resultsCount');
    if (countEl) {
      countEl.textContent = list.length
        ? `Showing ${start + 1}–${Math.min(start + perPage, list.length)} of ${list.length} results`
        : 'Showing 0 results';
    }

    if (!skipScroll) {
      const section = $('#shop');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ---------- RESPONSIVE: recompute per-page on breakpoint change ---------- */
  function initResponsivePaging() {
    let lastPerPage = itemsPerPage();
    window.addEventListener('resize', () => {
      const current = itemsPerPage();
      if (current !== lastPerPage) {
        lastPerPage = current;
        state.page = 1;
        applyFilters(true);
      }
    });
  }

  /* =====================================================
     OFF-CANVAS MOBILE/TABLET FILTER PANEL
     ===================================================== */
  function initFilterDrawer() {
    const sidebar = $('#shopSidebar');
    const toggle = $('#filterToggle');
    const closeBtn = $('#sidebarClose');
    const scrim = $('#shopSidebarScrim');
    if (!sidebar || !toggle || !scrim) return;

    function open() { sidebar.classList.add('is-open'); scrim.classList.add('is-open'); }
    function close() { sidebar.classList.remove('is-open'); scrim.classList.remove('is-open'); }

    toggle.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    scrim.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* =====================================================
     NAV: highlight "Shop" instead of "Home" on this page,
     and make header/footer category links filter this page
     directly instead of redirecting to the home page grid.
     ===================================================== */
  function syncNavActiveState() {
    $$('.main-nav__link, .mobile-menu a').forEach((a) => a.classList.remove('is-active'));
    const shopLink = $$('.main-nav__dropdown > .main-nav__link')[0];
    if (shopLink) shopLink.classList.add('is-active');
    const mobileShop = $$('.mobile-menu a').find((a) => a.textContent.trim() === 'Shop');
    if (mobileShop) mobileShop.classList.add('is-active');

    // Home link is shared markup with href="#" (correct on index.html itself);
    // on this page it needs to actually point back to index.html.
    const homeLinks = [
      ...$$('.main-nav__link').filter((a) => a.textContent.trim() === 'Home'),
      ...$$('.mobile-menu a').filter((a) => a.textContent.trim() === 'Home')
    ];
    homeLinks.forEach((a) => a.setAttribute('href', 'index.html'));
  }

  function initHeaderFooterCategoryLinks() {
    $$('[data-cat]').forEach((link) => {
      // Only intercept links that aren't part of the sidebar itself
      if (link.closest('#shopSidebar')) return;
      link.addEventListener('click', (e) => {
        const cat = link.getAttribute('data-cat');
        if (!cat) return;
        e.preventDefault();
        state.cats.clear();
        state.cats.add(cat);
        state.page = 1;
        syncCategoryUI();
        applyFilters();
        if (window.BNB && window.BNB.closeCart) window.BNB.closeCart();
      });
    });
  }

  function applyCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    if (cat) { state.cats.add(cat); }

    // "View" links from the home page (and header search) land here with
    // ?q=<product name> — auto-filter straight to that product, whatever
    // it is, so newly added products work with zero extra wiring.
    const q = params.get('q');
    if (q) {
      state.search = q.trim().toLowerCase();
      const searchInput = $('#shopSearchInput');
      if (searchInput) searchInput.value = q;
    }
  }

  /* ---------- INIT ---------- */
  function safe(fn) {
    try { fn(); }
    catch (err) { console.error('shop.js init failed at ' + fn.name + ':', err); }
  }

  document.addEventListener('partials:loaded', () => {
    safe(syncNavActiveState);

    safe(applyCategoryFromURL);
    safe(buildCategoryList);
    safe(initPriceSlider);
    safe(initSidebarSearch);
    safe(initSort);
    safe(initClearAllFilters);
    safe(initCartAndProductClicks);
    safe(initSearchOverlayResults);
    safe(initFilterDrawer);
    safe(initResponsivePaging);
    safe(initHeaderFooterCategoryLinks);

    safe(() => applyFilters(true));
    safe(renderCart);
  });
})();