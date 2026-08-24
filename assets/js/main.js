/* =====================================================
   BUD N' BUDDER — main.js
   Page-level chrome that isn't already owned by
   header.js / footer.js (those handle the mobile menu,
   header scroll shadow, cart drawer toggle, search
   overlay toggle, and back-to-top now that header/footer
   are loaded as partials).

   Everything here waits for "partials:loaded" (fired by
   include.js) instead of DOMContentLoaded, because
   #browseProductsBtn's dependency (window.BNB.openSearch)
   is only guaranteed to exist once header.js has run, and
   .reveal elements living inside footer.html don't exist
   in the DOM until the footer partial is injected.
   ===================================================== */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  /* ---------- "BROWSE PRODUCTS" -> OPEN SEARCH ---------- */
  function initBrowseProductsTrigger() {
    const browseBtn = $('#browseProductsBtn');
    if (!browseBtn) return;
    browseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.BNB && window.BNB.openSearch) window.BNB.openSearch();
    });
  }

  /* ---------- SCROLL REVEAL ---------- */
  function initRevealAnimations() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- INIT ---------- */
  document.addEventListener('partials:loaded', () => {
    initBrowseProductsTrigger();
    initRevealAnimations();
  });
})();