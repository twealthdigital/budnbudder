/* =====================================================
   BUD N' BUDDER — header.js
   Header partial behavior: mobile menu, scroll shadow,
   search overlay, cart drawer toggle.
   ===================================================== */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const money = (n) => '$' + n.toFixed(2);

  /* =====================================================
     SHARED PRODUCT CATALOG + CART
     Single source of truth for every page (home, shop, and
     any future page) so the badge/drawer/subtotal always agree.
     ===================================================== */
  const PRODUCTS = [
    { id: 'bs1', name: 'Runtz Flower', cat: 'Flower', type: 'flower', price: 45.00, rating: 4.8, reviews: 42, badge: 'new', image: 'assets/images/products/bs1.png' },
    { id: 'bs2', name: 'CCELL M3 Battery', cat: 'Vaporizer', type: 'vapes', price: 20.00, rating: 4.7, reviews: 31, badge: null, image: 'assets/images/products/bs2.png' },
    { id: 'bs3', name: 'Big Chief Gummies', cat: 'Edibles', type: 'edibles', price: 25.00, rating: 4.9, reviews: 27, badge: 'bestseller', image: 'assets/images/products/bs3.png' },
    { id: 'bs4', name: 'Jeeter Juice (Watermelon)', cat: 'Vape', type: 'vapes', price: 35.00, rating: 4.8, reviews: 36, badge: 'bestseller', image: 'assets/images/products/bs4.png' },
    { id: 'na1', name: 'Sherbinski', cat: 'Flower', type: 'flower', price: 50.00, rating: 4.9, reviews: 19, badge: 'new', image: 'assets/images/products/na1.png' },
    { id: 'na2', name: 'Packwoods Pre-Roll', cat: 'Pre-Roll', type: 'prerolls', price: 15.00, rating: 4.7, reviews: 22, badge: null, image: 'assets/images/products/na2.png' },
    { id: 'na3', name: 'Muha Meds Disposable', cat: 'Vape', type: 'vapes', price: 40.00, rating: 4.8, reviews: 18, badge: 'hot', image: 'assets/images/products/na3.png' },
    { id: 'na4', name: 'Hidden Hills Bar', cat: 'Edibles', type: 'edibles', price: 30.00, rating: 4.8, reviews: 24, badge: 'new', image: 'assets/images/products/na4.png' },
    { id: 'bs1', name: 'Gelato Flower', cat: 'Flower', type: 'flower', price: 45.00, rating: 4.8, reviews: 42, badge: 'new', image: 'assets/images/products/bs1.png' },
    { id: 'ac01', name: 'Grinder (4pc)', cat: 'Accessories', type: 'accessories', price: 25.00, rating: 4.6, reviews: 20, badge: null, image: 'assets/images/products/bs2.png' }
  ];
  function getProducts() { return PRODUCTS; }

  const CART_KEY = 'bnb_cart';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
  }
  function cartCount(cart) {
    return Object.keys(cart).length;
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

  function initCartInteractions() {
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-add]');
      if (addBtn) {
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
        window.location.href = 'cart.html';
      });
    }
  }

  window.BNB = window.BNB || {};
  window.BNB.getProducts = getProducts;
  window.BNB.getCart = getCart;
  window.BNB.addToCart = addToCart;
  window.BNB.changeQty = changeQty;
  window.BNB.removeFromCart = removeFromCart;
  window.BNB.renderCart = renderCart;
  window.BNB.cartCount = cartCount;

  function initMobileMenu() {
    const burger = $('#burgerToggle');
    const menu = $('#mobileMenu');
    if (!burger || !menu) return;
    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('is-open');
    });
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu.classList.remove('is-open')));
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('is-open') && !menu.contains(e.target) && !burger.contains(e.target)) {
        menu.classList.remove('is-open');
      }
    });
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

  function initCartDrawerSwipe() {
    const drawer = $('#cartDrawer');
    if (!drawer) return;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let tracking = false;   // touch is active, direction not decided yet
    let dragging = false;   // confirmed horizontal drag
    const DIRECTION_THRESHOLD = 10; // px of movement before we decide intent

    drawer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentX = 0;
      tracking = true;
      dragging = false;
    }, { passive: true });

    drawer.addEventListener('touchmove', (e) => {
      if (!tracking) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      if (!dragging) {
        // Not yet decided: wait until movement is big enough to tell intent
        if (Math.abs(dx) < DIRECTION_THRESHOLD && Math.abs(dy) < DIRECTION_THRESHOLD) return;

        if (Math.abs(dx) > Math.abs(dy) && dx > 0) {
          // Clearly a rightward horizontal swipe — take over from here
          dragging = true;
          drawer.style.transition = 'none';
        } else {
          // Vertical (or leftward) gesture — let the list scroll normally
          tracking = false;
          return;
        }
      }

      // Confirmed horizontal drag: follow the finger, block page scroll
      e.preventDefault();
      currentX = dx < 0 ? 0 : dx;
      drawer.style.transform = `translateX(${currentX}px)`;
    }, { passive: false });

    drawer.addEventListener('touchend', () => {
      tracking = false;
      if (!dragging) return;
      dragging = false;
      drawer.style.transition = '';
      drawer.style.transform = '';
      if (currentX > 90) closeCart();
      currentX = 0;
    });
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
    initCartDrawerSwipe();
    initSearchToggle();
    initCartInteractions();
    initAccountDropdown();
    initMobileAccountToggle();
    initActiveNav();
    renderCart();
  });

  function initMobileAccountToggle() {
    const wrap = document.getElementById('mobileAccount');
    const toggle = document.getElementById('mobileAccountToggle');
    if (!wrap || !toggle) return;
    toggle.addEventListener('click', () => {
      wrap.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', wrap.classList.contains('is-open'));
    });
  }

  function fixHomeLink(path) {
    if (path === 'index.html' || path === '') return;
    $$('.main-nav__link, .mobile-menu a')
      .filter((a) => a.textContent.trim() === 'Home')
      .forEach((a) => a.setAttribute('href', 'index.html'));
  }

  function initActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    fixHomeLink(path);

    $$('.main-nav__link, .mobile-menu a').forEach((a) => a.classList.remove('is-active'));
    const accountToggle = $('#accountToggle');
    if (accountToggle) accountToggle.classList.remove('is-active');

    if (path === 'auth.html') {
      if (accountToggle) accountToggle.classList.add('is-active');
      const mobileAccountToggle = $('#mobileAccountToggle');
      if (mobileAccountToggle) mobileAccountToggle.classList.add('is-active');
      return;
    }

    const NAV_MATCH = { 'index.html': 'Home', '': 'Home', 'shop.html': 'Shop', 'about.html': 'About' };
    const activeLabel = NAV_MATCH[path];
    if (!activeLabel) return;
    $$('.main-nav__link, .mobile-menu a').forEach((a) => {
      if (a.textContent.trim() === activeLabel) a.classList.add('is-active');
    });

    if (path === 'about.html') initContactScrollSpy();
  }

  function initContactScrollSpy() {
    const contactSection = document.getElementById('contact-form');
    if (!contactSection || !('IntersectionObserver' in window)) return;

    const aboutLinks = $$('.main-nav__link, .mobile-menu a').filter((a) => a.textContent.trim() === 'About');
    const contactLinks = $$('.main-nav__link, .mobile-menu a').filter((a) => a.textContent.trim() === 'Contact');

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          aboutLinks.forEach((a) => a.classList.remove('is-active'));
          contactLinks.forEach((a) => a.classList.add('is-active'));
        } else {
          contactLinks.forEach((a) => a.classList.remove('is-active'));
          aboutLinks.forEach((a) => a.classList.add('is-active'));
        }
      });
    }, { threshold: 0.4 });

    io.observe(contactSection);
  }

  function initAccountDropdown() {
  const wrap = $('#accountDropdown');
  const toggle = $('#accountToggle');
  if (!wrap || !toggle) return;

  function getSession() {
    try { return JSON.parse(sessionStorage.getItem('bnb_session')); }
    catch (e) { return null; }
  }
    function refresh() {
      const session = getSession();
      const loggedIn = !!session;

      const signinLink = wrap.querySelector('[data-account="signin"]');
      const signupLink = wrap.querySelector('[data-account="signup"]');
      const usernameEl = wrap.querySelector('[data-account="username"]');
      const ordersLink = wrap.querySelector('[data-account="orders"]');
      const logoutBtn = wrap.querySelector('[data-account="logout"]');
      signinLink.hidden = loggedIn;
      signupLink.hidden = loggedIn;
      usernameEl.hidden = !loggedIn;
      if (ordersLink) ordersLink.hidden = !loggedIn;
      logoutBtn.hidden = !loggedIn;
      if (loggedIn) usernameEl.textContent = session.name || session.email;

      const mSignin = document.querySelector('[data-account="mobile-signin"]');
      const mSignup = document.querySelector('[data-account="mobile-signup"]');
      const mUsername = document.querySelector('[data-account="mobile-username"]');
      const mOrders = document.querySelector('[data-account="mobile-orders"]');
      const mLogout = document.querySelector('[data-account="mobile-logout"]');
      if (mSignin) mSignin.hidden = loggedIn;
      if (mSignup) mSignup.hidden = loggedIn;
      if (mUsername) mUsername.hidden = !loggedIn;
      if (mOrders) mOrders.hidden = !loggedIn;
      if (mLogout) mLogout.hidden = !loggedIn;
      if (loggedIn && mUsername) mUsername.textContent = session.name || session.email;
    }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    wrap.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', wrap.classList.contains('is-open'));
  });
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) wrap.classList.remove('is-open');
  });
    wrap.querySelector('[data-account="logout"]').addEventListener('click', () => {
      sessionStorage.removeItem('bnb_session');
      refresh();
      wrap.classList.remove('is-open');
    });

    const mobileLogoutBtn = document.querySelector('[data-account="mobile-logout"]');
    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('bnb_session');
        refresh();
        const menu = document.getElementById('mobileMenu');
        if (menu) menu.classList.remove('is-open');
      });
    }

    refresh();
  }
})();