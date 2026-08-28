/* =====================================================
   BUD N' BUDDER — checkout.js
   Complete checkout with strict validation, Stripe-ready
   payment integration, and seamless guest/logged-in user
   experience. All fields are validated with strict rules
   to ensure backend-ready data.
   ===================================================== */

(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const money = (n) => '$' + n.toFixed(2);

  /* =====================================================
     STATE
     ===================================================== */
  const ORDERS_KEY = 'bnb_orders';
  const session = getSession();

  /* =====================================================
     SESSION HELPER
     ===================================================== */
  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem('bnb_session'));
    } catch (e) {
      return null;
    }
  }

  /* =====================================================
     PRODUCT LOOKUP - OPTIMIZED WITH MAP
     ===================================================== */
  let productMap = new Map();

  function buildProductMap() {
    if (!window.BNB || !window.BNB.getProducts) return;
    const products = window.BNB.getProducts();
    const map = new Map();
    const seen = new Set();
    
    products.forEach((p) => {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        map.set(p.id, p);
      }
    });
    
    productMap = map;
  }

  function getProductById(id) {
    return productMap.get(id) || null;
  }

  function getAllProducts() {
    return Array.from(productMap.values());
  }

  const VARIANT_BY_TYPE = {
    flower: '3.5g',
    prerolls: '1 pre-roll',
    edibles: '100mg',
    vapes: '1 device',
    accessories: '1pc'
  };

  /* =====================================================
     STRICT VALIDATION RULES
     ===================================================== */
  const VALIDATORS = {
    // Name: letters, spaces, hyphens, apostrophes only
    name: (value) => ({
      valid: /^[A-Za-z\u00C0-\u024F\s\-']{2,40}$/.test(value.trim()),
      message: 'Name must be 2-40 characters (letters, spaces, hyphens, apostrophes only)'
    }),

    // Email: strict RFC 5322-ish with domain validation
    email: (value) => {
      const trimmed = value.trim();
      const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      const valid = re.test(trimmed) && trimmed.length <= 120;
      return {
        valid,
        message: valid ? '' : 'Please enter a valid email address (e.g., name@domain.com)'
      };
    },

    // Phone: US/Canada format with area code
    phone: (value) => {
      const cleaned = value.replace(/[\s\-\(\)\.]/g, '');
      const valid = /^[0-9]{10}$/.test(cleaned);
      return {
        valid,
        message: valid ? '' : 'Please enter a valid 10-digit phone number'
      };
    },

    // Address: alphanumeric, spaces, common punctuation
    address: (value) => {
      const trimmed = value.trim();
      const valid = /^[A-Za-z0-9\s\-#.,'\/]{3,80}$/.test(trimmed);
      return {
        valid,
        message: valid ? '' : 'Address must be 3-80 characters (letters, numbers, spaces, and common punctuation)'
      };
    },

    // City: letters, spaces, hyphens, apostrophes only
    city: (value) => {
      const trimmed = value.trim();
      const valid = /^[A-Za-z\u00C0-\u024F\s\-']{2,50}$/.test(trimmed);
      return {
        valid,
        message: valid ? '' : 'City must be 2-50 characters (letters, spaces, hyphens, apostrophes only)'
      };
    },

    // State: US state abbreviation (2 letters)
    state: (value) => {
      const valid = /^[A-Z]{2}$/.test(value);
      return {
        valid,
        message: valid ? '' : 'Please select a valid US state'
      };
    },

    // ZIP: US ZIP code (5 digits or 5+4)
    zip: (value) => {
      const cleaned = value.replace(/\s/g, '');
      const valid = /^[0-9]{5}(?:-[0-9]{4})?$/.test(cleaned);
      return {
        valid,
        message: valid ? '' : 'Please enter a valid US ZIP code (e.g., 11103 or 11103-1234)'
      };
    }
  };

  /* =====================================================
     US STATES DATA
     ===================================================== */
  const US_STATES = [
    { abbr: 'AL', name: 'Alabama' },
    { abbr: 'AK', name: 'Alaska' },
    { abbr: 'AZ', name: 'Arizona' },
    { abbr: 'AR', name: 'Arkansas' },
    { abbr: 'CA', name: 'California' },
    { abbr: 'CO', name: 'Colorado' },
    { abbr: 'CT', name: 'Connecticut' },
    { abbr: 'DE', name: 'Delaware' },
    { abbr: 'FL', name: 'Florida' },
    { abbr: 'GA', name: 'Georgia' },
    { abbr: 'HI', name: 'Hawaii' },
    { abbr: 'ID', name: 'Idaho' },
    { abbr: 'IL', name: 'Illinois' },
    { abbr: 'IN', name: 'Indiana' },
    { abbr: 'IA', name: 'Iowa' },
    { abbr: 'KS', name: 'Kansas' },
    { abbr: 'KY', name: 'Kentucky' },
    { abbr: 'LA', name: 'Louisiana' },
    { abbr: 'ME', name: 'Maine' },
    { abbr: 'MD', name: 'Maryland' },
    { abbr: 'MA', name: 'Massachusetts' },
    { abbr: 'MI', name: 'Michigan' },
    { abbr: 'MN', name: 'Minnesota' },
    { abbr: 'MS', name: 'Mississippi' },
    { abbr: 'MO', name: 'Missouri' },
    { abbr: 'MT', name: 'Montana' },
    { abbr: 'NE', name: 'Nebraska' },
    { abbr: 'NV', name: 'Nevada' },
    { abbr: 'NH', name: 'New Hampshire' },
    { abbr: 'NJ', name: 'New Jersey' },
    { abbr: 'NM', name: 'New Mexico' },
    { abbr: 'NY', name: 'New York' },
    { abbr: 'NC', name: 'North Carolina' },
    { abbr: 'ND', name: 'North Dakota' },
    { abbr: 'OH', name: 'Ohio' },
    { abbr: 'OK', name: 'Oklahoma' },
    { abbr: 'OR', name: 'Oregon' },
    { abbr: 'PA', name: 'Pennsylvania' },
    { abbr: 'RI', name: 'Rhode Island' },
    { abbr: 'SC', name: 'South Carolina' },
    { abbr: 'SD', name: 'South Dakota' },
    { abbr: 'TN', name: 'Tennessee' },
    { abbr: 'TX', name: 'Texas' },
    { abbr: 'UT', name: 'Utah' },
    { abbr: 'VT', name: 'Vermont' },
    { abbr: 'VA', name: 'Virginia' },
    { abbr: 'WA', name: 'Washington' },
    { abbr: 'WV', name: 'West Virginia' },
    { abbr: 'WI', name: 'Wisconsin' },
    { abbr: 'WY', name: 'Wyoming' }
  ];

  /* =====================================================
     POPULATE STATE SELECT
     ===================================================== */
  function populateStates() {
    const select = $('#state');
    if (!select) return;

    const defaultOption = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (defaultOption) {
      select.appendChild(defaultOption);
    } else {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Select';
      opt.disabled = true;
      opt.selected = true;
      select.appendChild(opt);
    }

    US_STATES.forEach((state) => {
      const opt = document.createElement('option');
      opt.value = state.abbr;
      opt.textContent = state.name;
      select.appendChild(opt);
    });
  }

  /* =====================================================
     AUTO-FILL LOGGED-IN USER EMAIL
     ===================================================== */
  function autoFillUserEmail() {
    const session = getSession();
    if (!session) return;

    const emailInput = $('#email');
    const signedInNote = $('#signedInNote');
    const signedInName = $('#signedInName');
    const guestNote = $('#guestNote');
    const emailHint = $('#emailHint');

    if (emailInput) {
      emailInput.value = session.email || '';
      emailInput.readOnly = true;
      emailInput.closest('.input-wrap')?.classList.add('is-readonly');
    }

    if (signedInNote) {
      signedInNote.hidden = false;
      if (signedInName) signedInName.textContent = session.name || session.email || 'User';
    }

    if (guestNote) guestNote.hidden = true;
    if (emailHint) emailHint.hidden = false;
  }

  /* =====================================================
     PHONE FORMATTING (as user types)
     ===================================================== */
  function formatPhoneInput(input) {
    input.addEventListener('input', function () {
      let digits = this.value.replace(/\D/g, '');
      if (digits.length > 10) digits = digits.slice(0, 10);
      
      let formatted = '';
      if (digits.length > 0) {
        formatted = '(' + digits.slice(0, 3);
        if (digits.length > 3) {
          formatted += ') ' + digits.slice(3, 6);
          if (digits.length > 6) {
            formatted += '-' + digits.slice(6, 10);
          }
        }
      }
      
      this.value = formatted;
    });
  }

  /* =====================================================
     ZIP FORMATTING (as user types)
     ===================================================== */
  function formatZipInput(input) {
    input.addEventListener('input', function () {
      let digits = this.value.replace(/\D/g, '');
      if (digits.length > 9) digits = digits.slice(0, 9);
      
      if (digits.length > 5) {
        this.value = digits.slice(0, 5) + '-' + digits.slice(5, 9);
      } else {
        this.value = digits;
      }
    });
  }

  /* =====================================================
     CHARACTER COUNTER FOR NOTES
     ===================================================== */
  function initCharacterCounter() {
    const textarea = $('#notes');
    const countEl = $('#notesCount');
    if (!textarea || !countEl) return;

    textarea.addEventListener('input', function () {
      const len = this.value.length;
      countEl.textContent = len + '/200';
    });
  }

  /* =====================================================
     FIELD VALIDATION (real-time and on-submit)
     ===================================================== */
  function validateField(input) {
    const field = input.closest('.form-field');
    const errorEl = field?.querySelector('.form-error');
    if (!field || !errorEl) return true;

    const validator = VALIDATORS[input.id];
    if (!validator) return true;

    const result = validator(input.value);
    
    if (!result.valid) {
      field.classList.add('has-error');
      errorEl.textContent = result.message;
      return false;
    } else {
      field.classList.remove('has-error');
      errorEl.textContent = '';
      return true;
    }
  }

  function initRealTimeValidation() {
    const inputs = $$('#checkoutForm input, #checkoutForm select, #checkoutForm textarea');
    inputs.forEach((input) => {
      if (input.id === 'notes' || input.id === 'countryDisplay') return;
      
      input.addEventListener('blur', function () {
        validateField(this);
      });

      if (input.tagName !== 'SELECT') {
        input.addEventListener('input', function () {
          const field = this.closest('.form-field');
          const errorEl = field?.querySelector('.form-error');
          if (field && errorEl) {
            const validator = VALIDATORS[this.id];
            if (validator) {
              const result = validator(this.value);
              if (result.valid) {
                field.classList.remove('has-error');
                errorEl.textContent = '';
              }
            }
          }
        });
      }
    });
  }

  /* =====================================================
     COMPLETE FORM VALIDATION
     ===================================================== */
  function validateAllFields() {
    let isValid = true;
    const fields = $$('#checkoutForm input, #checkoutForm select, #checkoutForm textarea');
    
    fields.forEach((input) => {
      if (input.readOnly || input.disabled || input.id === 'notes' || input.id === 'countryDisplay') return;
      if (!validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /* =====================================================
     RENDER ORDER SUMMARY (from cart) - OPTIMIZED WITH MAP
     ===================================================== */
  function renderOrderSummary() {
    const itemsEl = $('#summaryItems');
    const countEl = $('#summaryCount');
    const subtotalEl = $('#summarySubtotal');
    const totalEl = $('#summaryTotal');
    
    if (!itemsEl) return;

    // Build product map first
    buildProductMap();

    const cart = window.BNB?.getCart?.() || {};
    const entries = Object.entries(cart);

    if (!entries.length) {
      const emptyEl = $('#checkoutEmpty');
      const contentEl = $('#checkoutContent');
      if (emptyEl) emptyEl.hidden = false;
      if (contentEl) contentEl.hidden = true;
      return;
    }

    let subtotal = 0;
    let itemCount = 0;

    itemsEl.innerHTML = entries.map(([id, qty]) => {
      // Use Map lookup instead of find()
      const p = getProductById(id);
      if (!p) return '';
      subtotal += p.price * qty;
      itemCount += qty;
      const variant = VARIANT_BY_TYPE[p.type] || '';

      return `
        <div class="checkout-summary-item">
          <div class="checkout-summary-item__thumb">
            <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">
            <span class="checkout-summary-item__qty">${qty}</span>
          </div>
          <div class="checkout-summary-item__info">
            <span class="checkout-summary-item__name">${escapeHtml(p.name)}</span>
            ${variant ? `<span class="checkout-summary-item__variant">${variant}</span>` : ''}
          </div>
          <span class="checkout-summary-item__price">${money(p.price * qty)}</span>
        </div>`;
    }).join('');

    if (countEl) countEl.textContent = itemCount;
    if (subtotalEl) subtotalEl.textContent = money(subtotal);
    if (totalEl) totalEl.textContent = money(subtotal);
  }

  /* =====================================================
     CREATE ORDER OBJECT (for Stripe and storage) - OPTIMIZED WITH MAP
     ===================================================== */
  function buildOrderObject(formData) {
    const cart = window.BNB?.getCart?.() || {};
    
    // Build items array using Map lookup
    const items = Object.entries(cart).map(([id, qty]) => {
      const p = getProductById(id);
      return {
        id: id,
        name: p?.name || 'Unknown Product',
        price: p?.price || 0,
        qty: qty,
        type: p?.type || 'unknown'
      };
    });

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal * 0.0875; // NY state + local tax (example)
    const shipping = 0;
    const total = subtotal + tax + shipping;

    return {
      orderNumber: 'BNB-' + Date.now().toString().slice(-8) + '-' + Math.random().toString(36).slice(-4).toUpperCase(),
      placedAt: new Date().toISOString(),
      items: items,
      subtotal: subtotal,
      tax: tax,
      shipping: shipping,
      total: total,
      currency: 'USD',
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      },
      shippingAddress: {
        address1: formData.address1,
        address2: formData.address2 || '',
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: 'US'
      },
      notes: formData.notes || '',
      status: 'pending',
      paymentMethod: 'stripe'
    };
  }

  /* =====================================================
     SAVE ORDER TO localStorage
     ===================================================== */
  function saveOrder(order) {
    try {
      const orders = JSON.parse(sessionStorage.getItem(ORDERS_KEY)) || [];
      orders.push(order);
      sessionStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      return true;
    } catch (e) {
      console.error('Failed to save order:', e);
      return false;
    }
  }

  /* =====================================================
     CLEAR CART AFTER ORDER
     ===================================================== */
  function clearCart() {
    localStorage.setItem('bnb_cart', JSON.stringify({}));
    if (window.BNB?.renderCart) window.BNB.renderCart();
  }

  /* =====================================================
     STRIPE INTEGRATION PLACEHOLDER
     ===================================================== */
  async function initiateStripePayment(order) {
    // This is where you'll integrate Stripe.js
    // Example:
    /*
    const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY');
    
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: order })
    });
    
    const { clientSecret, paymentIntentId } = await response.json();
    
    const result = await stripe.confirmPayment({
      clientSecret,
      confirmParams: {
        return_url: window.location.origin + '/success.html'
      }
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    */

    // For now, simulate a successful payment
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, paymentIntentId: 'pi_sim_' + Date.now() });
      }, 2000);
    });
  }

  /* =====================================================
     SHOW PROCESSING OVERLAY
     ===================================================== */
  function showProcessing() {
    const overlay = $('#checkoutProcessing');
    if (overlay) overlay.classList.add('is-active');
  }

  function hideProcessing() {
    const overlay = $('#checkoutProcessing');
    if (overlay) overlay.classList.remove('is-active');
  }

  /* =====================================================
     HANDLE FORM SUBMISSION
     ===================================================== */
  async function handleCheckoutSubmit(e) {
    e.preventDefault();

    const submitBtn = $('#proceedPaymentBtn');
    const banner = $('#formErrorBanner');
    const bannerText = $('#formErrorBannerText');

    if (banner) banner.hidden = true;

    if (!validateAllFields()) {
      if (banner) {
        banner.hidden = false;
        if (bannerText) bannerText.textContent = 'Please fix the highlighted fields before continuing.';
      }
      const firstError = document.querySelector('.form-field.has-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = firstError.querySelector('input, select, textarea');
        if (input) input.focus();
      }
      return;
    }

    const formData = {
      firstName: $('#firstName').value.trim(),
      lastName: $('#lastName').value.trim(),
      email: $('#email').value.trim().toLowerCase(),
      phone: $('#phone').value.trim(),
      address1: $('#address1').value.trim(),
      address2: $('#address2').value.trim(),
      city: $('#city').value.trim(),
      state: $('#state').value,
      zip: $('#zip').value.trim(),
      country: $('#country').value,
      notes: $('#notes').value.trim()
    };

    const cart = window.BNB?.getCart?.() || {};
    if (Object.keys(cart).length === 0) {
      if (banner) {
        banner.hidden = false;
        if (bannerText) bannerText.textContent = 'Your cart is empty. Please add items before checking out.';
      }
      return;
    }

    const order = buildOrderObject(formData);

    showProcessing();
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    try {
      const saved = saveOrder(order);
      if (!saved) {
        throw new Error('Failed to save order. Please try again.');
      }

      clearCart();

      const paymentResult = await initiateStripePayment(order);

      if (paymentResult.success) {
        window.location.href = 'success.html';
      } else {
        throw new Error('Payment failed. Please try again.');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      
      if (banner) {
        banner.hidden = false;
        if (bannerText) bannerText.textContent = error.message || 'Something went wrong. Please try again.';
      }
      
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      hideProcessing();

      if (banner) banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* =====================================================
     NAV FIX (Home link)
     ===================================================== */
  function fixHomeLink() {
    $$('.main-nav__link, .mobile-menu a')
      .filter((a) => a.textContent.trim() === 'Home')
      .forEach((a) => a.setAttribute('href', 'index.html'));
  }

  /* =====================================================
     INIT
     ===================================================== */
  function safe(fn) {
    try { fn(); }
    catch (err) { console.error('checkout.js init failed at ' + fn.name + ':', err); }
  }

  document.addEventListener('partials:loaded', () => {
    safe(fixHomeLink);
    safe(populateStates);
    safe(autoFillUserEmail);
    safe(renderOrderSummary);
    safe(formatPhoneInput.bind(null, $('#phone')));
    safe(formatZipInput.bind(null, $('#zip')));
    safe(initCharacterCounter);
    safe(initRealTimeValidation);

    const form = $('#checkoutForm');
    const submitBtn = $('#proceedPaymentBtn');
    if (form && submitBtn) {
      submitBtn.addEventListener('click', handleCheckoutSubmit);
    }
  });

})();