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

  /* ---------- PRODUCT DATA (shared catalog from header.js, split into
     this page's two sections by id so it always matches the shop page
     and the cart drawer) ---------- */
  const ALL_PRODUCTS = window.BNB.getProducts();
  const BEST_SELLERS = ALL_PRODUCTS.filter((p) => ['bs1', 'bs2', 'bs3', 'bs4'].includes(p.id));
  const NEW_ARRIVALS = ALL_PRODUCTS.filter((p) => ['na1', 'na2', 'na3', 'na4'].includes(p.id));

  /* ---------- PRODUCT RENDERING ---------- */
  function starRow(rating) {
    const full = Math.round(rating);
    let s = '';
    for (let i = 1; i <= 5; i++) s += i <= full ? '★' : '☆';
    return s;
  }
  const BADGE_LABELS = { new: 'New', bestseller: 'Best Seller', hot: 'Hot' };
  function badgeMarkup(badge) {
    if (!badge) return '';
    const label = BADGE_LABELS[badge] || badge;
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
          <a class="product-card__view" href="shop.html?cat=${encodeURIComponent(p.type)}&q=${encodeURIComponent(p.name)}" aria-label="View ${p.name} in the shop">
            View
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <div class="media-frame">
            <img src="assets/images/products/${p.id}.png" alt="${p.name} — replace with product photography">
          </div>
        </div>
        <div class="product-card__body">
          <span class="product-card__cat">${p.cat}</span>
          <div class="product-card__name">${p.name}</div>
          <div class="product-card__rating">${starRow(p.rating)} <span>${p.rating.toFixed(1)}</span></div>
          <div class="product-card__price-row">
            <span class="product-card__price">${money(p.price)}</span>
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
        <a class="search-result" href="shop.html?cat=${encodeURIComponent(p.type)}&q=${encodeURIComponent(p.name)}">
          <span class="search-result__name">${p.name}</span>
          <span class="search-result__price">${money(p.price)}</span>
        </a>
      `).join('');
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
    initSearchResults();
    initCategoryFilter();
    initTestimonialDots();
  });
})();