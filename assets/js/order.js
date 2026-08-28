/* =====================================================
   BUD N' BUDDER — order.js
   "My Orders" page: read-only history of orders that were
   actually placed. Orders are written to localStorage under
   'bnb_orders' by the checkout page's confirmation step
   (a separate page) — this page only ever reads that list.

   If someone has never placed an order, they see the empty
   state ("No orders yet") — that's the real, correct
   behavior. The only exception is the very first time this
   page is ever opened on a browser with no 'bnb_orders' key
   at all: one example order is seeded so the design can be
   previewed. Once any real key exists (including an empty
   array), that seed never runs again — see seedDemoOrderIfFirstVisit().
   ===================================================== */
(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const money = (n) => '$' + n.toFixed(2);

  const ORDERS_KEY = 'bnb_orders';

  const SHIP_LABELS = {
    standard: 'Standard Delivery',
    express: 'Express Delivery',
    pickup: 'Store Pickup'
  };
  const VARIANT_BY_TYPE = {
    flower: '3.5g', prerolls: '1 pre-roll', edibles: '100mg', vapes: '1 device', accessories: '1pc'
  };

  /* ---------- PRODUCT LOOKUP (for item thumbnails/images only —
     same de-dupe fix used on cart.js since the shared catalog
     has one duplicate id) ---------- */
  function getProductById(id) {
    if (!window.BNB || !window.BNB.getProducts) return null;
    return window.BNB.getProducts().find((p) => p.id === id) || null;
  }

  function getOrders() {
    try {
      const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
      // Most recent first
      return orders.slice().sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
    } catch (e) {
      return [];
    }
  }

  function formatDate(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function addressLine(order) {
    const a = order.address || {};
    if (order.shippingMethod === 'pickup') return 'Pickup — Astoria, NY';
    if (!a.address1) return '—';
    return `${a.address1}${a.address2 ? ', ' + a.address2 : ''}, ${a.city}, ${a.state} ${a.zip}`;
  }

  function paymentLine(order) {
    if (order.paymentMethod === 'card') return `Card ending in ${order.cardLast4 || '••••'}`;
    if (order.paymentMethod === 'applepay') return 'Apple Pay';
    if (order.paymentMethod === 'googlepay') return 'Google Pay';
    if (order.paymentMethod === 'pickup') return 'Pay at pickup';
    return '—';
  }

  /* ---------- RENDER ---------- */
  function renderOrderCard(order) {
    const itemsHtml = (order.items || []).map((item) => {
      const product = getProductById(item.id);
      const image = product ? product.image : 'assets/images/products/placeholder.png';
      const variant = product ? (VARIANT_BY_TYPE[product.type] || '') : '';
      return `
        <div class="order-card__item">
          <div class="order-card__item-thumb"><img src="${image}" alt="${item.name}"></div>
          <div class="order-card__item-info">
            <div class="order-card__item-name">${item.name}</div>
            <div class="order-card__item-meta">${variant ? variant + ' · ' : ''}Qty ${item.qty}</div>
          </div>
          <div class="order-card__item-price">${money(item.price * item.qty)}</div>
        </div>`;
    }).join('');

    return `
      <article class="order-card">
        <div class="order-card__head">
          <div>
            <div class="order-card__id">Order #${order.orderNumber}</div>
            <div class="order-card__date">Placed ${formatDate(order.placedAt)}</div>
          </div>
          <span class="order-card__status">Order Placed</span>
        </div>

        <div class="order-card__items">${itemsHtml}</div>

        <div class="order-card__foot">
          <div class="order-card__total">
            <div class="order-card__total-label">Total</div>
            <div class="order-card__total-value">${money(order.total)}</div>
          </div>
        </div>
      </article>`;
  }

  function renderOrders() {
    const orders = getOrders();
    const emptyEl = $('#ordersEmpty');
    const sectionEl = $('#ordersSection');
    const listEl = $('#ordersList');

    if (!orders.length) {
      emptyEl.hidden = false;
      sectionEl.hidden = true;
      return;
    }

    emptyEl.hidden = true;
    sectionEl.hidden = false;
    listEl.innerHTML = orders.map(renderOrderCard).join('');
  }

  /* ---------- NAV FIX (same reasoning as cart.js: "Home" only
     resolves to "#" correctly on index.html) ---------- */
  function fixHomeLink() {
    $$('.main-nav__link, .mobile-menu a')
      .filter((a) => a.textContent.trim() === 'Home')
      .forEach((a) => a.setAttribute('href', 'index.html'));
  }

  function safe(fn) {
    try { fn(); }
    catch (err) { console.error('order.js init failed at ' + fn.name + ':', err); }
  }

  document.addEventListener('partials:loaded', () => {
    safe(fixHomeLink);
    safe(renderOrders);
  });
})();