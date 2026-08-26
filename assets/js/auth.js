/* =====================================================
   BUD N' BUDDER — auth.js
   Sign In / Sign Up / Forgot Password page.

   Everything here is CLIENT-SIDE ONLY, which is a hard
   limit worth being upfront about: this file can validate
   shape (is it an email, does the password meet the rule
   set, do the two password fields match) and it can make
   the UI *behave* like a secured flow (lockout after
   repeated failures, no plaintext password logging, OTP-
   style code entry, disabled submit until valid). It CANNOT
   actually secure an account — real auth requires a server
   to hash + store credentials, rate-limit by IP, issue
   session tokens, and send real emails. Treat the "account
   store" below as a UI stand-in, not a security boundary.

   Fires on "partials:loaded" (dispatched by include.js)
   since nothing here needs header/footer, but staying
   consistent with the rest of the site avoids a second
   init pattern.
   ===================================================== */
(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* =====================================================
     LOCAL "ACCOUNT STORE" (demo only — see note above)
     ===================================================== */
  const USERS_KEY = 'bnb_users';
  const SESSION_KEY = 'bnb_session';
  const ATTEMPTS_KEY = 'bnb_signin_attempts';
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  /* Never store or compare plaintext passwords, even in a demo.
     SubtleCrypto's SHA-256 is used purely so nothing readable
     ever sits in localStorage — this is NOT a substitute for
     server-side salted hashing (bcrypt/argon2) and must not be
     treated as production auth. */
  async function digest(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function getAttempts() {
    try { return JSON.parse(sessionStorage.getItem(ATTEMPTS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveAttempts(a) { sessionStorage.setItem(ATTEMPTS_KEY, JSON.stringify(a)); }

  /* =====================================================
     VIEW SWITCHING
     ===================================================== */
  function initViewSwitching() {
    const views = $$('.auth-view');
    function showView(id) {
      views.forEach((v) => { v.hidden = v.id !== id; });
      clearAllBanners();
      const first = document.getElementById(id);
      const firstInput = first && first.querySelector('input:not([type="checkbox"])');
      if (firstInput) setTimeout(() => firstInput.focus(), 60);
    }
    $$('[data-goto]').forEach((btn) => {
      btn.addEventListener('click', () => showView(btn.getAttribute('data-goto')));
    });
    window.__bnbShowAuthView = showView;

    const params = new URLSearchParams(window.location.search);
if (params.get('mode') === 'signup') showView('viewSignUp');
  }

  /* =====================================================
     PASSWORD VISIBILITY TOGGLE
     ===================================================== */
  function initPasswordToggles() {
    $$('[data-toggle-pw]').forEach((btn) => {
      const targetId = btn.getAttribute('data-toggle-pw');
      const input = document.getElementById(targetId);
      if (!input) return;
      btn.addEventListener('click', () => {
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.classList.toggle('is-active', show);
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        input.focus({ preventScroll: true });
      });
    });
  }

  /* =====================================================
     PASSWORD RULES + STRENGTH
     ===================================================== */
  const RULES = {
    length: (v) => v.length >= 8,
    upper: (v) => /[A-Z]/.test(v),
    lower: (v) => /[a-z]/.test(v),
    number: (v) => /[0-9]/.test(v),
    symbol: (v) => /[^A-Za-z0-9]/.test(v)
  };

  // Small deny-list of the most common breached/guessable passwords.
  // Not exhaustive — a real deny-list check belongs server-side
  // against a full corpus (e.g. HaveIBeenPwned's k-anonymity API).
  const COMMON_PASSWORDS = new Set([
    'password', 'password1', '12345678', '123456789', 'qwerty123',
    'letmein1', 'iloveyou', 'admin123', 'welcome1', 'abc12345'
  ]);

  function evaluateRules(value) {
    const results = {};
    Object.keys(RULES).forEach((key) => { results[key] = RULES[key](value); });
    return results;
  }
  function allRulesMet(results) {
    return Object.values(results).every(Boolean);
  }
  function strengthLevel(value, results) {
    if (!value) return null;
    const metCount = Object.values(results).filter(Boolean).length;
    const isCommon = COMMON_PASSWORDS.has(value.toLowerCase());
    if (isCommon || metCount <= 2) return 'weak';
    if (metCount === 3) return 'fair';
    if (metCount === 4) return 'good';
    return value.length >= 12 ? 'strong' : 'good';
  }
  const STRENGTH_LABEL = { weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' };

  function buildStrengthMeter() {
    const wrap = document.createElement('div');
    wrap.className = 'pw-strength';
    wrap.innerHTML = `
      <div class="pw-strength__track">
        <span class="pw-strength__seg"></span>
        <span class="pw-strength__seg"></span>
        <span class="pw-strength__seg"></span>
        <span class="pw-strength__seg"></span>
      </div>
      <span class="pw-strength__label"></span>
    `;
    return wrap;
  }

  /* Wires one password input to its .pw-requirements dropdown:
     shows the panel on focus, keeps it open until the field
     blurs (and the click wasn't on the panel itself), live-
     updates each rule's checkmark, and shows a strength meter
     once there's input. Returns a getter for "is this field
     currently valid" so submit handlers can reuse it. */
  function wirePasswordField(input) {
    const panel = document.querySelector(`.pw-requirements[data-for="${input.id}"]`);
    if (!panel) return () => true;

    const meter = buildStrengthMeter();
    panel.insertBefore(meter, panel.firstChild);
    const items = {};
    $$('li[data-rule]', panel).forEach((li) => { items[li.getAttribute('data-rule')] = li; });

    function refresh() {
      const value = input.value;
      const results = evaluateRules(value);
      Object.keys(items).forEach((key) => {
        items[key].classList.toggle('is-met', !!results[key]);
      });
      const level = strengthLevel(value, results);
      if (level) {
        meter.classList.add('is-visible');
        meter.dataset.level = level;
        meter.querySelector('.pw-strength__label').textContent = STRENGTH_LABEL[level];
      } else {
        meter.classList.remove('is-visible');
        delete meter.dataset.level;
      }
      return allRulesMet(results) && !COMMON_PASSWORDS.has(value.toLowerCase());
    }

    function open() { panel.classList.add('is-open'); }
    function close() { panel.classList.remove('is-open'); }

    input.addEventListener('focus', () => { refresh(); open(); });
    input.addEventListener('input', refresh);
    input.addEventListener('blur', (e) => {
      // Delay so a click landing on the panel itself doesn't
      // instantly close it before that click registers.
      setTimeout(() => {
        if (!panel.contains(document.activeElement) && document.activeElement !== input) close();
      }, 120);
    });
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== input) close();
    });

    refresh();
    return () => allRulesMet(evaluateRules(input.value)) && !COMMON_PASSWORDS.has(input.value.toLowerCase());
  }

  function initPasswordRequirementPanels() {
    const validators = {};
    $$('.pw-input, #signUpPassword').forEach((input) => {
      if (input.dataset.pwWired) return;
      input.dataset.pwWired = '1';
      validators[input.id] = wirePasswordField(input);
    });
    return validators;
  }

  /* =====================================================
     FIELD-LEVEL VALIDATION HELPERS
     ===================================================== */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFieldError(input, message) {
    const field = input.closest('.form-field');
    const errorEl = field && field.querySelector('.form-error');
    if (field) field.classList.toggle('has-error', !!message);
    if (errorEl) errorEl.textContent = message || '';
  }

  function showBanner(view, type, message) {
    let banner = view.querySelector('.auth-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'auth-banner';
      const form = view.querySelector('form');
      (form || view).insertAdjacentElement('beforebegin', banner);
    }
    banner.className = `auth-banner auth-banner--${type}`;
    banner.textContent = message;
    banner.hidden = false;
  }
  function clearBanner(view) {
    const banner = view && view.querySelector('.auth-banner');
    if (banner) banner.hidden = true;
  }
  function clearAllBanners() { $$('.auth-banner').forEach((b) => { b.hidden = true; }); }

  function setLoading(btn, isLoading) {
    if (!btn) return;
    btn.classList.toggle('is-loading', isLoading);
    btn.disabled = isLoading;
  }

  /* =====================================================
     SIGN IN
     ===================================================== */
  function initSignIn(pwValidators) {
    const form = $('#signInForm');
    if (!form) return;
    const view = $('#viewSignIn');
    const emailInput = $('#signInEmail');
    const pwInput = $('#signInPassword');
    const submitBtn = form.querySelector('.auth-submit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearBanner(view);
      setFieldError(emailInput, '');
      setFieldError(pwInput, '');

      const email = emailInput.value.trim().toLowerCase();
      let valid = true;

      if (!email) { setFieldError(emailInput, 'Email is required.'); valid = false; }
      else if (!EMAIL_RE.test(email)) { setFieldError(emailInput, 'Enter a valid email address.'); valid = false; }

      if (!pwInput.value) { setFieldError(pwInput, 'Password is required.'); valid = false; }

      if (!valid) return;

      // Lockout check, keyed by email so one account being hammered
      // doesn't block every visitor sharing the browser.
      const attempts = getAttempts();
      const record = attempts[email];
      if (record && record.count >= MAX_ATTEMPTS && Date.now() - record.last < LOCKOUT_MS) {
        const minsLeft = Math.ceil((LOCKOUT_MS - (Date.now() - record.last)) / 60000);
        showBanner(view, 'error', `Too many failed attempts. Try again in ${minsLeft} minute${minsLeft === 1 ? '' : 's'}.`);
        return;
      }

      setLoading(submitBtn, true);
      const hashed = await digest(pwInput.value);
      // Simulate real network latency so the lockout/attempt logic
      // doesn't feel instant (and to avoid encouraging brute-force UX).
      await new Promise((r) => setTimeout(r, 500));

      const users = getUsers();
      const user = users[email];
      const ok = user && user.passwordHash === hashed;

      if (!ok) {
        const next = { count: (record && Date.now() - record.last < LOCKOUT_MS ? record.count : 0) + 1, last: Date.now() };
        attempts[email] = next;
        saveAttempts(attempts);
        setLoading(submitBtn, false);
        const remaining = MAX_ATTEMPTS - next.count;
        if (remaining <= 0) {
          showBanner(view, 'error', 'Too many failed attempts. Your sign-in has been temporarily locked.');
        } else {
          showBanner(view, 'error', `Incorrect email or password. ${remaining} attempt${remaining === 1 ? '' : 's'} left before a temporary lock.`);
        }
        pwInput.value = '';
        return;
      }

      delete attempts[email];
      saveAttempts(attempts);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email, name: user.name, since: Date.now() }));
      setLoading(submitBtn, false);
      showBanner(view, 'success', 'Signed in successfully. Redirecting…');
      pwInput.value = '';
      setTimeout(() => { window.location.href = 'index.html'; }, 700);
    });
  }

  /* =====================================================
     SIGN UP
     ===================================================== */
  function initSignUp(pwValidators) {
    const form = $('#signUpForm');
    if (!form) return;
    const view = $('#viewSignUp');
    const nameInput = $('#signUpName');
    const emailInput = $('#signUpEmail');
    const pwInput = $('#signUpPassword');
    const confirmInput = $('#signUpConfirm');
    const termsInput = $('#agreeTerms');
    const submitBtn = form.querySelector('.auth-submit');

    function checkConfirmMatch() {
      if (!confirmInput.value) { setFieldError(confirmInput, ''); return true; }
      const match = confirmInput.value === pwInput.value;
      setFieldError(confirmInput, match ? '' : 'Passwords do not match.');
      return match;
    }
    confirmInput.addEventListener('input', checkConfirmMatch);
    pwInput.addEventListener('input', () => { if (confirmInput.value) checkConfirmMatch(); });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearBanner(view);
      [nameInput, emailInput, pwInput, confirmInput].forEach((i) => setFieldError(i, ''));

      let valid = true;
      const name = nameInput.value.trim();
      const email = emailInput.value.trim().toLowerCase();

      if (!name) { setFieldError(nameInput, 'Full name is required.'); valid = false; }

      if (!email) { setFieldError(emailInput, 'Email is required.'); valid = false; }
      else if (!EMAIL_RE.test(email)) { setFieldError(emailInput, 'Enter a valid email address.'); valid = false; }

      const passwordValid = (pwValidators[pwInput.id] || (() => allRulesMet(evaluateRules(pwInput.value))))();
      if (!pwInput.value) { setFieldError(pwInput, 'Password is required.'); valid = false; }
      else if (!passwordValid) { setFieldError(pwInput, 'Password does not meet all requirements above.'); valid = false; }

      if (!checkConfirmMatch()) valid = false;
      if (!confirmInput.value) { setFieldError(confirmInput, 'Please confirm your password.'); valid = false; }

      if (!termsInput.checked) {
        showBanner(view, 'error', 'Please confirm you are 21+ and agree to the Terms & Privacy Policy.');
        valid = false;
      }

      if (!valid) return;

      setLoading(submitBtn, true);
      const users = getUsers();
      if (users[email]) {
        setLoading(submitBtn, false);
        setFieldError(emailInput, 'An account with this email already exists.');
        return;
      }

      const passwordHash = await digest(pwInput.value);
      users[email] = { name, passwordHash, createdAt: Date.now() };
      saveUsers(users);
      await new Promise((r) => setTimeout(r, 400));

      setLoading(submitBtn, false);
      pwInput.value = '';
      confirmInput.value = '';
      showBanner(view, 'success', 'Account created! You can now sign in.');
      setTimeout(() => window.__bnbShowAuthView('viewSignIn'), 900);
    });
  }

  /* =====================================================
     FORGOT PASSWORD (email -> code -> success)
     Code is generated + kept client-side purely as a UI
     stand-in; a real flow issues the code server-side and
     never exposes it to the browser at all.
     ===================================================== */
  function initForgotPassword() {
    const emailForm = $('#forgotEmailForm');
    const codeForm = $('#forgotCodeForm');
    if (!emailForm || !codeForm) return;

    const emailView = $('#viewForgotEmail');
    const codeView = $('#viewForgotCode');
    const emailInput = $('#forgotEmail');
    const codeInput = $('#forgotCode');
    const emailDisplay = $('#forgotEmailDisplay');
    const resendBtn = $('#resendCodeBtn');

    let pendingCode = null;
    let pendingEmail = '';
    let resendTimer = null;

    function generateCode() {
      return String(Math.floor(100000 + Math.random() * 900000));
    }

    function startResendCooldown(seconds) {
      let remaining = seconds;
      resendBtn.disabled = true;
      const base = 'Resend code';
      resendBtn.textContent = `${base} (${remaining}s)`;
      clearInterval(resendTimer);
      resendTimer = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(resendTimer);
          resendBtn.disabled = false;
          resendBtn.textContent = base;
        } else {
          resendBtn.textContent = `${base} (${remaining}s)`;
        }
      }, 1000);
    }

    emailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearBanner(emailView);
      setFieldError(emailInput, '');

      const email = emailInput.value.trim().toLowerCase();
      if (!email) { setFieldError(emailInput, 'Email is required.'); return; }
      if (!EMAIL_RE.test(email)) { setFieldError(emailInput, 'Enter a valid email address.'); return; }

      pendingEmail = email;
      pendingCode = generateCode();
      // Demo-only stand-in for "the email that would be sent".
      console.info('[Bud n\' Budder demo] Verification code for ' + email + ':', pendingCode);

      emailDisplay.textContent = email;
      codeInput.value = '';
      setFieldError(codeInput, '');
      window.__bnbShowAuthView('viewForgotCode');
      startResendCooldown(30);
    });

    resendBtn.addEventListener('click', () => {
      if (resendBtn.disabled || !pendingEmail) return;
      pendingCode = generateCode();
      console.info('[Bud n\' Budder demo] New verification code for ' + pendingEmail + ':', pendingCode);
      showBanner(codeView, 'success', 'A new code has been sent.');
      startResendCooldown(30);
    });

    codeInput.addEventListener('input', () => {
      codeInput.value = codeInput.value.replace(/\D/g, '').slice(0, 6);
    });

    codeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearBanner(codeView);
      setFieldError(codeInput, '');

      const value = codeInput.value.trim();
      if (value.length !== 6) { setFieldError(codeInput, 'Enter the 6-digit code.'); return; }
      if (value !== pendingCode) { setFieldError(codeInput, 'Incorrect code. Please try again.'); return; }

      pendingCode = null;
      window.__bnbShowAuthView('viewForgotSuccess');
    });
  }

  /* =====================================================
     INIT
     ===================================================== */
  function safe(fn, ...args) {
    try { return fn(...args); }
    catch (err) { console.error('auth.js init failed at ' + fn.name + ':', err); }
  }

  document.addEventListener('partials:loaded', () => {
    safe(initViewSwitching);
    safe(initPasswordToggles);
    const validators = safe(initPasswordRequirementPanels) || {};
    safe(initSignIn, validators);
    safe(initSignUp, validators);
    safe(initForgotPassword);
  });
})();