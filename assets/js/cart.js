/* =====================================================
   BUD N' BUDDER — cart.js
   Cart page: renders the full cart as a table/card list
   and an order summary, reading/writing through the same
   window.BNB cart API that header.js uses for the drawer,
   so the badge, drawer, and this page always agree.
   Fires on "partials:loaded" (dispatched by include.js)
   since #cartTableBody etc. only need header/footer to
   exist first for the shared cart state to be safe to read.
   ===================================================== */
(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const money = (n) => '$' + n.toFixed(2);

  /* ---------- DISPLAY-ONLY VARIANT LABEL PER CATEGORY TYPE ---------- */
  const VARIANT_BY_TYPE = {
    flower: '3.5g',
    prerolls: '1 pre-roll',
    edibles: '100mg',
    vapes: '1 device',
    accessories: '1pc'
  };

  /* ---------- PRODUCT LOOKUP ----------
     The shared catalog in header.js has one duplicate id (two
     flower items both use "bs1"), so a plain find() would always
     resolve to whichever one appears first. Dedupe once here so
     cart lookups stay stable regardless of that upstream data. */
  function getUniqueProducts() {
    const seen = new Set();
    return window.BNB.getProducts().filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }

  /* ---------- RENDER ---------- */
  function renderCartPage() {
    const table = $('#cartTable');
    const body = $('#cartTableBody');
    const empty = $('#cartEmpty');
    const continueBtn = $('#continueShoppingBtn');
    if (!body) return;

    const cart = window.BNB.getCart();
    const products = getUniqueProducts();
    const entries = Object.entries(cart);

    if (!entries.length) {
      if (table) table.hidden = true;
      if (empty) empty.hidden = false;
      if (continueBtn) continueBtn.hidden = true;
      updateSummary(0, 0);
      return;
    }

    if (table) table.hidden = false;
    if (empty) empty.hidden = true;
    if (continueBtn) continueBtn.hidden = false;

    let subtotal = 0;
    let itemCount = 0;

    body.innerHTML = entries.map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      if (!p) return '';
      const lineTotal = p.price * qty;
      subtotal += lineTotal;
      itemCount += qty;
      const variant = VARIANT_BY_TYPE[p.type] || '';

      return `
        <div class="cart-row" data-id="${id}">
          <div class="cart-row__product">
            <div class="cart-row__thumb"><img src="${p.image}" alt="${p.name}"></div>
            <div class="cart-row__info">
              <span class="cart-row__name">${p.name}</span>
              ${variant ? `<span class="cart-row__variant">${variant}</span>` : ''}
              <span class="cart-row__cat">Category: ${p.cat}</span>
              <button class="cart-row__remove" data-page-remove="${id}">Remove</button>
            </div>
          </div>
          <div class="cart-row__price" data-label="Price">${money(p.price)}</div>
          <div class="cart-row__qty" data-label="Quantity">
            <div class="cart-row__qty-controls">
              <button type="button" data-page-qty-down="${id}" aria-label="Decrease quantity">−</button>
              <span>${qty}</span>
              <button type="button" data-page-qty-up="${id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="cart-row__total" data-label="Total">${money(lineTotal)}</div>
        </div>`;
    }).join('');

    updateSummary(subtotal, itemCount);
  }

  function updateSummary(subtotal, itemCount) {
    const countEl = $('#summaryCount');
    const subtotalEl = $('#summarySubtotal');
    const totalEl = $('#summaryTotal');
    if (countEl) countEl.textContent = itemCount;
    if (subtotalEl) subtotalEl.textContent = money(subtotal);
    if (totalEl) totalEl.textContent = money(subtotal);
  }

  /* ---------- ROW INTERACTIONS (qty +/-, remove) ----------
     Uses its own data-page-* attributes (rather than header.js's
     data-qty-up/down/remove) so this page can re-render its own
     table after the shared cart updates, on top of the drawer/
     badge refresh that window.BNB.changeQty/removeFromCart already
     trigger via saveCart(). */
  function initRowInteractions() {
    const body = $('#cartTableBody');
    if (!body) return;
    body.addEventListener('click', (e) => {
      const upBtn = e.target.closest('[data-page-qty-up]');
      if (upBtn) {
        window.BNB.changeQty(upBtn.getAttribute('data-page-qty-up'), 1);
        renderCartPage();
        return;
      }
      const downBtn = e.target.closest('[data-page-qty-down]');
      if (downBtn) {
        window.BNB.changeQty(downBtn.getAttribute('data-page-qty-down'), -1);
        renderCartPage();
        return;
      }
      const removeBtn = e.target.closest('[data-page-remove]');
      if (removeBtn) {
        window.BNB.removeFromCart(removeBtn.getAttribute('data-page-remove'));
        renderCartPage();
        return;
      }
    });
  }

  /* ---------- HEADER SEARCH OVERLAY RESULTS (searches the shop
     catalog, not the cart) ---------- */
  function initSearchOverlayResults() {
    const input = $('#searchInput');
    const results = $('#searchResults');
    if (!input || !results) return;
    const products = getUniqueProducts();

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = '<p class="search-overlay__hint">Try "flower", "gummies", or "vape"</p>';
        return;
      }
      const matches = products.filter((p) =>
        p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)
      );
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
  }

  /* ---------- CHECKOUT (same messaging as the cart drawer) ---------- */
  function initCheckoutButton() {
    const btn = $('#pageCheckoutBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (!window.BNB.cartCount(window.BNB.getCart())) return;
      alert('Checkout is coming soon! Your order will be ready for pickup or delivery confirmation shortly.');
    });
  }

  /* ---------- NAV: this page isn't Home or Shop, so just fix the
     shared "Home" link (href="#" is only correct on index.html) ---------- */
  function fixHomeLink() {
    $$('.main-nav__link, .mobile-menu a')
      .filter((a) => a.textContent.trim() === 'Home')
      .forEach((a) => a.setAttribute('href', 'index.html'));
  }

  function safe(fn) {
    try { fn(); }
    catch (err) { console.error('cart.js init failed at ' + fn.name + ':', err); }
  }

  document.addEventListener('partials:loaded', () => {
    safe(fixHomeLink);
    safe(renderCartPage);
    safe(initSearchOverlayResults);
    safe(initRowInteractions);
    safe(initCheckoutButton);
  });
})();