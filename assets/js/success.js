/* =====================================================
   BUD N' BUDDER — success.js
   Order-confirmation page. This page is intentionally
   static/read-only — it never displays order details, it
   just confirms the order was placed and hands the person
   off to order.html. No order data is read or written here.
   ===================================================== */
(function () {
  'use strict';

  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------- NAV FIX (same reasoning as cart.js/order.js:
     "Home" only resolves to "#" correctly on index.html) ---------- */
  function fixHomeLink() {
    $$('.main-nav__link, .mobile-menu a')
      .filter((a) => a.textContent.trim() === 'Home')
      .forEach((a) => a.setAttribute('href', 'index.html'));
  }

  function safe(fn) {
    try { fn(); }
    catch (err) { console.error('success.js init failed at ' + fn.name + ':', err); }
  }

  /* =====================================================
     PAYMENT VERIFICATION
     Asks the backend whether this order was really paid
     instead of assuming success.
     ===================================================== */
  const API_BASE =
    window.BNB_API_BASE_URL ||
    'https://budnbudder-backend.onrender.com/api';

  const LAST_ORDER_ID_KEY = 'bnb_last_order_id';
  const LAST_ORDER_NUMBER_KEY = 'bnb_last_order_number';

  const MAX_CHECKS = 8;     // how many times we ask the backend
  const CHECK_DELAY = 2000; // ms between checks

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function showState(name) {
    $$('[data-state]').forEach((el) => {
      el.hidden = el.getAttribute('data-state') !== name;
    });
  }

  function goToFailedPage() {
    window.location.replace('payment-failed.html');
  }

  async function getJson(path) {
    const response = await fetch(API_BASE + path, {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Request failed (' + response.status + ')');
    }

    return response.json();
  }

  async function loadOrder(orderId, orderNumber) {
    /* 1) Guest checkout order */
    try {
      const data = await getJson(
        '/orders/guest/' + encodeURIComponent(orderId)
      );

      if (data && data.order) return data.order;
    } catch (_) { /* fall through to logged-in orders */ }

    /* 2) Logged-in customer's orders */
    try {
      const data = await getJson('/orders/my-orders');
      const orders = Array.isArray(data && data.orders)
        ? data.orders
        : [];

      return (
        orders.find((o) => String(o._id || o.id) === String(orderId)) ||
        orders.find(
          (o) => orderNumber && o.orderNumber === orderNumber
        ) ||
        null
      );
    } catch (_) {
      return null;
    }
  }

  async function verifyPayment() {
    /* Only runs on success.html */
    if (!document.querySelector('[data-state="checking"]')) return;

    const params = new URLSearchParams(window.location.search);

    /* Stripe redirect flows (3D Secure / bank redirects) */
    if (params.get('redirect_status') === 'failed') {
      goToFailedPage();
      return;
    }

    let orderId = null;
    let orderNumber = null;

    try {
      orderId = sessionStorage.getItem(LAST_ORDER_ID_KEY);
      orderNumber = sessionStorage.getItem(LAST_ORDER_NUMBER_KEY);
    } catch (_) {}

    /* Opened directly, no order was placed in this session */
    if (!orderId) {
      showState('unknown');
      return;
    }

    for (let attempt = 0; attempt < MAX_CHECKS; attempt++) {
      const order = await loadOrder(orderId, orderNumber);

      const payment = String(
        (order && order.paymentStatus) || ''
      ).toLowerCase();

      const status = String(
        (order && order.status) || ''
      ).toLowerCase();

      if (payment === 'paid') {
        showState('success');
        return;
      }

      if (payment === 'failed' || (status === 'cancelled' && payment !== 'paid')) {
        goToFailedPage();
        return;
      }

      /* still pending (or backend waking up): wait and ask again */
      await sleep(CHECK_DELAY);
    }

    /* Backend never confirmed either way */
    showState('pending');
  }

  document.addEventListener('partials:loaded', () => {
    safe(fixHomeLink);
  });

  verifyPayment();
})();