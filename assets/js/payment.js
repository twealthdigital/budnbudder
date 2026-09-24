/* =====================================================
   BUD N' BUDDER — payment.js
   Reads the PaymentIntent client secret + order summary
   saved by checkout.js, mounts the Stripe Payment
   Element, and confirms the payment.
   ===================================================== */
(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const STRIPE_PUBLISHABLE_KEY = window.BNB_STRIPE_PUBLISHABLE_KEY || '';

  const CLIENT_SECRET_KEY = 'bnb_checkout_client_secret';
  const AMOUNT_KEY = 'bnb_checkout_amount';
  const SUMMARY_KEY = 'bnb_checkout_summary';

  const state = {
    stripe: null,
    elements: null,
    paymentElement: null,
    submitting: false
  };

  function money(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return '$0.00';
    return '$' + number.toFixed(2);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function readSession() {
    let clientSecret = null, amount = null, summary = null;
    try {
      clientSecret = sessionStorage.getItem(CLIENT_SECRET_KEY);
      amount = sessionStorage.getItem(AMOUNT_KEY);
      const raw = sessionStorage.getItem(SUMMARY_KEY);
      summary = raw ? JSON.parse(raw) : null;
    } catch (_) {}
    return { clientSecret, amount, summary };
  }

  function showEmptyState() {
    const empty = $('#paymentEmpty');
    const content = $('#paymentContent');
    if (empty) empty.hidden = false;
    if (content) content.hidden = true;
  }

  function renderOrderSummary(summary) {
    const itemsEl = $('#summaryItems');
    const countEl = $('#summaryCount');
    const subtotalEl = $('#summarySubtotal');
    const taxEl = $('#summaryTax');
    const totalEl = $('#summaryTotal');

    if (!summary || !itemsEl) return;

    const items = Array.isArray(summary.items) ? summary.items : [];
    let itemCount = 0;

    itemsEl.innerHTML = items.map((item) => {
      itemCount += Number(item.quantity || 0);
      const imageMarkup = item.image
        ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || '')}" loading="lazy">`
        : `<div class="media-frame__placeholder" aria-hidden="true"></div>`;

      return `
        <div class="checkout-summary-item">
          <div class="checkout-summary-item__thumb">
            ${imageMarkup}
            <span class="checkout-summary-item__qty">${item.quantity}</span>
          </div>
          <div class="checkout-summary-item__info">
            <span class="checkout-summary-item__name">${escapeHtml(item.name || 'Product')}</span>
          </div>
          <span class="checkout-summary-item__price">${money(item.price * item.quantity)}</span>
        </div>
      `;
    }).join('');

    if (countEl) countEl.textContent = itemCount;
    if (subtotalEl) subtotalEl.textContent = money(summary.subtotal);
    if (taxEl) taxEl.textContent = money(summary.tax);
    if (totalEl) totalEl.textContent = money(summary.total);
  }

  function loadStripeScript() {
    return new Promise((resolve, reject) => {
      if (window.Stripe && typeof window.Stripe === 'function') {
        resolve(window.Stripe);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => {
        if (window.Stripe && typeof window.Stripe === 'function') resolve(window.Stripe);
        else reject(new Error('Stripe.js loaded but Stripe is unavailable.'));
      };
      script.onerror = () => reject(new Error('Unable to load Stripe.js.'));
      document.head.appendChild(script);
    });
  }

  async function initializeStripe() {
    if (state.stripe) return state.stripe;
    if (!STRIPE_PUBLISHABLE_KEY) throw new Error('Stripe is not configured on this page.');
    const StripeConstructor = await loadStripeScript();
    state.stripe = StripeConstructor(STRIPE_PUBLISHABLE_KEY);
    return state.stripe;
  }

  async function mountPaymentElement(clientSecret) {
    const stripe = await initializeStripe();

    state.elements = stripe.elements({ clientSecret });
    state.paymentElement = state.elements.create('payment', { layout: 'tabs' });
    state.paymentElement.mount('#payment-element');

    state.paymentElement.on('change', (event) => {
      const paymentError = $('#paymentError');
      if (!paymentError) return;
      if (event.error) {
        paymentError.textContent = event.error.message || '';
        paymentError.hidden = false;
      } else {
        paymentError.textContent = '';
        paymentError.hidden = true;
      }
    });
  }

  function showBanner(message) {
    const banner = $('#paymentErrorBanner');
    const text = $('#paymentErrorBannerText');
    if (text) text.textContent = message;
    if (banner) banner.hidden = false;
  }
  function hideBanner() {
    const banner = $('#paymentErrorBanner');
    if (banner) banner.hidden = true;
  }
  function showProcessing() {
    const overlay = $('#paymentProcessing');
    if (overlay) overlay.classList.add('is-active');
  }
  function hideProcessing() {
    const overlay = $('#paymentProcessing');
    if (overlay) overlay.classList.remove('is-active');
  }
  function setPayLoading(loading) {
    const button = $('#payBtn');
    if (!button) return;
    button.disabled = loading;
    button.classList.toggle('is-loading', loading);
  }

  async function handlePay() {
    if (state.submitting) return;
    hideBanner();

    if (!state.stripe || !state.elements) {
      showBanner('Payment form is not ready yet. Please wait a moment and try again.');
      return;
    }

    state.submitting = true;
    showProcessing();
    setPayLoading(true);

    try {
      const result = await state.stripe.confirmPayment({
        elements: state.elements,
        confirmParams: { return_url: window.location.origin + '/success.html' },
        redirect: 'if_required'
      });

      if (result.error) {
        throw new Error(result.error.message || 'Payment could not be completed.');
      }

      const paymentIntent = result.paymentIntent;

      if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
        try {
          sessionStorage.removeItem(CLIENT_SECRET_KEY);
          sessionStorage.removeItem(AMOUNT_KEY);
          sessionStorage.removeItem(SUMMARY_KEY);
        } catch (_) {}
        window.location.href = 'success.html';
        return;
      }

      throw new Error('Payment was not completed. Please try again.');

    } catch (error) {
      console.error('Stripe confirmation error:', error);
      hideProcessing();
      setPayLoading(false);
      state.submitting = false;
      showBanner(error.message || 'Something went wrong while processing your payment.');
    }
  }

  function fixHomeLink() {
    $$('.main-nav__link, .mobile-menu a')
      .filter((link) => link.textContent.trim() === 'Home')
      .forEach((link) => link.setAttribute('href', 'index.html'));
  }

  function safe(fn) {
    try { fn(); }
    catch (error) { console.error('payment.js init failed at ' + fn.name + ':', error); }
  }

  async function initialize() {
    safe(fixHomeLink);

    const { clientSecret, amount, summary } = readSession();

    if (!clientSecret) {
      showEmptyState();
      return;
    }

    renderOrderSummary(summary);

    const payBtn = $('#payBtn');
    const label = payBtn?.querySelector('.btn-label');
    if (label && amount) label.textContent = `Pay ${money(amount)}`;

    try {
      await mountPaymentElement(clientSecret);
    } catch (error) {
      console.error('Unable to load payment form:', error);
      showBanner(error.message || 'Unable to load the payment form. Please return to checkout and try again.');
      return;
    }

    if (payBtn) payBtn.addEventListener('click', handlePay);
  }

  document.addEventListener('partials:loaded', () => { initialize(); }, { once: true });
})();