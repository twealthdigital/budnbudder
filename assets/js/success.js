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

  document.addEventListener('partials:loaded', () => {
    safe(fixHomeLink);
  });
})();