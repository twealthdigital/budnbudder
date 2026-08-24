/* =====================================================
   BUD N' BUDDER — home.js
   Home page only: product data, product rendering,
   cart item logic, search results, category filter,
   testimonial dots. Requires main.js to run first
   (uses window.BNB.openCart / closeSearch).
   ===================================================== */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const money = (n) => '$' + n.toFixed(2);

  /* ---------- PRODUCT DATA ---------- */
  const BEST_SELLERS = [
    { id: 'bs1', name: 'Runtz Flower', cat: 'Flower', type: 'flower', price: 45.0, rating: 4.8, reviews: 42, badge: 'new' },
    { id: 'bs2', name: 'CCELL M3 Battery', cat: 'Vaporizer', type: 'vapes', price: 20.0, rating: 4.7, reviews: 31, badge: null },
    { id: 'bs3', name: 'Big Chief Gummies', cat: 'Edibles', type: 'edibles', price: 25.0, rating: 4.9, reviews: 27, badge: 'hot' },
    { id: 'bs4', name: 'Jeeter Juice (Watermelon)', cat: 'Vape', type: 'vapes', price: 35.0, rating: 4.8, reviews: 36, badge: null }
  ];

  const NEW_ARRIVALS = [
    { id: 'na1', name: 'Sherbinski', cat: 'Flower', type: 'flower', price: 50.0, rating: 4.9, reviews: 19, badge: 'new' },
    { id: 'na2', name: 'Packwoods Pre-Roll', cat: 'Pre-Roll', type: 'prerolls', price: 15.0, rating: 4.7, reviews: 22, badge: null },
    { id: 'na3', name: 'Muha Meds Disposable', cat: 'Vape', type: 'vapes', price: 40.0, rating: 4.8, reviews: 18, badge: 'hot' },
    { id: 'na4', name: 'Hidden Hills Bar', cat: 'Edibles', type: 'edibles', price: 30.0, rating: 4.8, reviews: 24, badge: 'new' }
  ];

  const ALL_PRODUCTS = [...BEST_SELLERS, ...NEW_ARRIVALS];
  const CART_KEY = 'bnb_cart';

  /* ---------- CART STORAGE ---------- */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
  }
  function cartCount(cart) {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  }
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
      const p = ALL_PRODUCTS.find((x) => x.id === id);
      if (!p) return '';
      subtotal += p.price * qty;
      return `
        <div class="cart-line" data-id="${id}">
          <div class="cart-line__thumb"></div>
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

  /* ---------- PRODUCT RENDERING ---------- */
  function starRow(rating) {
    const full = Math.round(rating);
    let s = '';
    for (let i = 1; i <= 5; i++) s += i <= full ? '★' : '☆';
    return s;
  }
  function badgeMarkup(badge) {
    if (!badge) return '';
    const label = badge === 'new' ? 'New' : 'Hot';
    return `<span class="product-card__badge product-card__badge--${badge}">${label}</span>`;
  }
  function renderGrid(targetSel, list) {
    const grid = $(targetSel);
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = '<p style="padding:30px;color:#82836f;">No products found.</p>';
      return;
    }
    grid.innerHTML = list.map((p) => `
      <div class="product-card" data-id="${p.id}">
        <div class="product-card__img">
          ${badgeMarkup(p.badge)}
          <div class="media-frame">
            <img src="assets/images/products/${p.id}.jpg" alt="${p.name} — replace with product photography">
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
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
  function renderProducts(list) {
    if (!list) {
      renderGrid('#bestSellersGrid', BEST_SELLERS);
      renderGrid('#newArrivalsGrid', NEW_ARRIVALS);
    } else {
      renderGrid('#bestSellersGrid', list);
      renderGrid('#newArrivalsGrid', []);
    }
  }

  /* ---------- PRODUCT-CARD / CART-LINE CLICK DELEGATION ---------- */
  function initProductClicks() {
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-add]');
      if (addBtn && addBtn.closest('.product-card')) {
        addToCart(addBtn.getAttribute('data-add'));
        addBtn.classList.add('is-added');
        setTimeout(() => addBtn.classList.remove('is-added'), 900);
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

  /* ---------- SEARCH RESULTS (overlay open/close lives in main.js) ---------- */
  function initSearchResults() {
    const input = $('#searchInput');
    const results = $('#searchResults');
    if (!input || !results) return;

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = '<p class="search-overlay__hint">Try "flower", "gummies", or "vape"</p>';
        return;
      }
      const matches = ALL_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)
      );
      if (!matches.length) {
        results.innerHTML = '<p class="search-overlay__hint">No products match "' + input.value + '".</p>';
        return;
      }
      results.innerHTML = matches.map((p) => `
        <a class="search-result" data-add="${p.id}">
          <span class="search-result__thumb"></span>
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

  /* ---------- CATEGORY FILTER (nav dropdown + footer shop links) ---------- */
  function initCategoryFilter() {
    document.querySelectorAll('[data-cat]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const cat = link.getAttribute('data-cat');
        if (!cat) return;
        e.preventDefault();
        renderProducts(ALL_PRODUCTS.filter((p) => p.type === cat));
        document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ---------- TESTIMONIAL CAROUSEL (dots + arrows) ---------- */
  function initTestimonialDots() {
    const dots = document.querySelectorAll('#testimonialDots span');
    const cards = document.querySelectorAll('.testimonial-card');
    const track = $('#testimonialGrid');
    const prevBtn = $('#testimonialPrev');
    const nextBtn = $('#testimonialNext');
    if (!dots.length || !track) return;

    function setActive(i) {
      dots.forEach((d) => d.classList.remove('is-active'));
      if (dots[i]) dots[i].classList.add('is-active');
    }
    function goTo(i) {
      const clamped = Math.max(0, Math.min(i, cards.length - 1));
      if (cards[clamped]) cards[clamped].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      setActive(clamped);
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    if (prevBtn) prevBtn.addEventListener('click', () => {
      const active = [...dots].findIndex((d) => d.classList.contains('is-active'));
      goTo((active - 1 + cards.length) % cards.length);
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      const active = [...dots].findIndex((d) => d.classList.contains('is-active'));
      goTo((active + 1) % cards.length);
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = [...cards].indexOf(entry.target);
            if (idx !== -1) setActive(idx);
          }
        });
      }, { root: track, threshold: 0.6 });
      cards.forEach((c) => io.observe(c));
    }
  }

  /* ---------- INIT ----------
     Fires on "partials:loaded" (dispatched by include.js) rather
     than DOMContentLoaded, because several of the elements this
     file binds to — #cartBadge/#cartItems/#cartSubtotal/#checkoutBtn,
     #searchInput/#searchResults, and the [data-cat] nav/footer links —
     live inside header.html/footer.html and don't exist in the DOM
     until those partials are fetched and injected. */
  document.addEventListener('partials:loaded', () => {
    renderProducts();
    initProductClicks();
    initSearchResults();
    initCategoryFilter();
    initTestimonialDots();
    renderCart();
  });
})();