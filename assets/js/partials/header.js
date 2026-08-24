/* =====================================================
   BUD N' BUDDER — header.js
   Header partial behavior: mobile menu, scroll shadow,
   search overlay, cart drawer toggle.
   ===================================================== */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  function initMobileMenu() {
    const burger = $('#burgerToggle');
    const menu = $('#mobileMenu');
    if (!burger || !menu) return;
    burger.addEventListener('click', () => menu.classList.toggle('is-open'));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu.classList.remove('is-open')));
  }

  function initHeaderScroll() {
    const header = $('#siteHeader');
    if (!header) return;
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 8 ? '0 4px 18px rgba(0,0,0,0.35)' : 'none';
    });
  }

  function openCart() {
    $('#cartDrawer').classList.add('is-open');
    $('#overlayScrim').classList.add('is-open');
  }
  function closeCart() {
    $('#cartDrawer').classList.remove('is-open');
    $('#overlayScrim').classList.remove('is-open');
  }
  function initCartDrawerToggle() {
    const cartToggle = $('#cartToggle');
    const cartClose = $('#cartClose');
    const scrim = $('#overlayScrim');
    if (cartToggle) cartToggle.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (scrim) scrim.addEventListener('click', closeCart);
  }
  window.BNB = window.BNB || {};
  window.BNB.openCart = openCart;
  window.BNB.closeCart = closeCart;

  function initSearchToggle() {
    const toggle = $('#searchToggle');
    const overlay = $('#searchOverlay');
    const closeBtn = $('#searchClose');
    const input = $('#searchInput');
    if (!toggle || !overlay) return;

    function open() {
      overlay.classList.add('is-open');
      setTimeout(() => input.focus(), 50);
    }
    function close() {
      overlay.classList.remove('is-open');
      input.value = '';
      input.dispatchEvent(new Event('input'));
    }
    toggle.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    window.BNB.closeSearch = close;
    window.BNB.openSearch = open;
  }

  document.addEventListener('partials:loaded', () => {
    initMobileMenu();
    initHeaderScroll();
    initCartDrawerToggle();
    initSearchToggle();
  });
})();