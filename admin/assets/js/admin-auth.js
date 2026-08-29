/* =====================================================
   BUD N' BUDDER — ADMIN — auth.js
   Single page for both Sign In and Signed Out states.

   - Default view: Sign In form.
   - Visited as auth.html?mode=logout : shows the Signed
     Out confirmation instead (this is what the sidebar/
     account "Logout" buttons on the other admin pages
     should link to).
   - This is a front-end-only demo: there's no real backend
     yet, so "signing in" just checks that both fields are
     filled in, stores a flag in sessionStorage, and sends
     the admin to the dashboard. Swap checkCredentials()
     for a real API call when the backend is ready.
   ===================================================== */

(function () {
  "use strict";

  const EYE_OPEN = '<path d="M2 12C2 12 5.5 5.5 12 5.5C18.5 5.5 22 12 22 12C22 12 18.5 18.5 12 18.5C5.5 18.5 2 12 2 12Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/>';
  const EYE_CLOSED = '<path d="M3 3L21 21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M10.6 5.6C11 5.55 11.5 5.5 12 5.5C18.5 5.5 22 12 22 12C22 12 20.8 14.2 18.5 16M6.3 6.9C3.6 8.8 2 12 2 12C2 12 5.5 18.5 12 18.5C13.6 18.5 15 18.1 16.2 17.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.9 10C9.5 10.4 9.2 11 9.2 11.7C9.2 13 10.3 14 11.5 14C12.2 14 12.8 13.7 13.2 13.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>';

  // ---------------------------------------------------
  // VIEW SWITCHING (Sign In vs Signed Out)
  // ---------------------------------------------------
  const AUTH_PANEL_IDS = [
    "authSignUp", "authSignIn", "authSignOut",
    "authForgotEmail", "authForgotConfirm", "authForgotCode",
    "authForgotReset", "authForgotSuccess"
  ];

  function showAuthPanel(id, title) {
    AUTH_PANEL_IDS.forEach(function (panelId) {
      const el = document.getElementById(panelId);
      if (el) el.hidden = panelId !== id;
    });
    if (title) document.title = title;
  }

  function showSignedOutView() {
    showAuthPanel("authSignOut", "Signed Out | Bud n' Budder Admin");
  }

  function showSignInView() {
    showAuthPanel("authSignIn", "Sign In | Bud n' Budder Admin");
  }

  function showSignUpView() {
    showAuthPanel("authSignUp", "Sign Up | Bud n' Budder Admin");
  }

  // ---------------------------------------------------
  // FORGOT PASSWORD — VIEW SWITCHING
  // ---------------------------------------------------
  const forgotPasswordState = { email: "", code: "" };

  function showForgotEmailView(wrongEmail) {
    const notice = document.getElementById("forgotWrongEmailNotice");
    if (notice) notice.hidden = !wrongEmail;
    showAuthPanel("authForgotEmail", "Forgot Password | Bud n' Budder Admin");
  }

  function showForgotConfirmView() {
    const emailText = document.getElementById("forgotConfirmEmailText");
    if (emailText) emailText.textContent = forgotPasswordState.email;
    showAuthPanel("authForgotConfirm", "Confirm Email | Bud n' Budder Admin");
  }

  function showForgotCodeView() {
    const emailText = document.getElementById("forgotCodeEmailText");
    if (emailText) emailText.textContent = forgotPasswordState.email;
    clearOtpInputs();
    showAuthPanel("authForgotCode", "Enter Code | Bud n' Budder Admin");
  }

  function showForgotResetView() {
    showAuthPanel("authForgotReset", "Reset Password | Bud n' Budder Admin");
  }

  function showForgotSuccessView() {
    showAuthPanel("authForgotSuccess", "Password Changed | Bud n' Budder Admin");
  }

  function setButtonLoading(btn, loadingText, restoreText) {
    if (!btn) return;
    const label = btn.querySelector(".auth-submit__label") || btn;
    if (loadingText) {
      btn.disabled = true;
      btn.dataset.originalLabel = label.textContent;
      label.textContent = loadingText;
    } else {
      btn.disabled = false;
      label.textContent = restoreText || btn.dataset.originalLabel || label.textContent;
    }
  }

  // ---------------------------------------------------
  // FORGOT PASSWORD — BACKEND HOOKS
  // Swap the body of each function below for a real fetch()
  // call once the backend exists — the request shape is
  // sketched out in the comments. Right now each one just
  // resolves after a short delay so the whole flow is
  // clickable during front-end development.
  // ---------------------------------------------------
  function requestPasswordResetCode(email) {
    // TODO(backend): send the reset code.
    // return fetch("/api/admin/forgot-password/send-code", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email })
    // }).then(function (res) {
    //   if (!res.ok) throw new Error("Could not send reset code.");
    //   return res.json();
    // });
    return new Promise(function (resolve) { setTimeout(resolve, 700); });
  }

  function verifyPasswordResetCode(email, code) {
    // TODO(backend): verify the code.
    // return fetch("/api/admin/forgot-password/verify-code", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email, code })
    // }).then(function (res) {
    //   if (!res.ok) throw new Error("Invalid or expired code.");
    //   return res.json();
    // });
    return new Promise(function (resolve) { setTimeout(resolve, 700); });
  }

  function submitNewPassword(email, code, newPassword) {
    // TODO(backend): reset the password.
    // return fetch("/api/admin/forgot-password/reset", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email, code, newPassword })
    // }).then(function (res) {
    //   if (!res.ok) throw new Error("Could not reset password.");
    //   return res.json();
    // });
    return new Promise(function (resolve) { setTimeout(resolve, 700); });
  }

  // ---------------------------------------------------
  // FORGOT PASSWORD — OTP CODE BOXES
  // ---------------------------------------------------
  function initOtpBoxes() {
    const boxes = Array.prototype.slice.call(document.querySelectorAll(".otp-input__box"));
    boxes.forEach(function (box, i) {
      box.addEventListener("input", function () {
        box.value = box.value.replace(/[^0-9]/g, "").slice(0, 1);
        if (box.value && boxes[i + 1]) boxes[i + 1].focus();
      });
      box.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !box.value && boxes[i - 1]) boxes[i - 1].focus();
      });
      box.addEventListener("paste", function (e) {
        e.preventDefault();
        const pasted = (e.clipboardData.getData("text") || "").replace(/[^0-9]/g, "").slice(0, 6);
        pasted.split("").forEach(function (digit, idx) { if (boxes[idx]) boxes[idx].value = digit; });
        const next = boxes[Math.min(pasted.length, boxes.length - 1)];
        if (next) next.focus();
      });
    });
  }

  function getOtpValue() {
    return Array.prototype.slice.call(document.querySelectorAll(".otp-input__box"))
      .map(function (box) { return box.value; }).join("");
  }

  function clearOtpInputs() {
    document.querySelectorAll(".otp-input__box").forEach(function (box) { box.value = ""; });
  }

  // ---------------------------------------------------
  // FORGOT PASSWORD — FULL FLOW WIRING
  // ---------------------------------------------------
  function initForgotPasswordFlow() {
    // Step 1 -> Step 2
    const emailForm = document.getElementById("forgotEmailForm");
    emailForm && emailForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const error = document.getElementById("forgotEmailError");
      const email = document.getElementById("forgotEmailInput").value.trim();
      if (!email) {
        if (error) { error.textContent = "Please enter your email address."; error.hidden = false; }
        return;
      }
      if (error) error.hidden = true;
      forgotPasswordState.email = email;
      showForgotConfirmView();
    });

    // Step 2: edit icon -> back to Step 1 with "wrong email" notice
    const editBtn = document.getElementById("forgotEditEmailBtn");
    editBtn && editBtn.addEventListener("click", function () {
      const emailInput = document.getElementById("forgotEmailInput");
      if (emailInput) emailInput.value = forgotPasswordState.email;
      showForgotEmailView(true);
    });

    // Step 2 -> Step 3: send code
    const confirmBtn = document.getElementById("forgotConfirmContinueBtn");
    confirmBtn && confirmBtn.addEventListener("click", function () {
      const error = document.getElementById("forgotConfirmError");
      setButtonLoading(confirmBtn, "Sending…");
      requestPasswordResetCode(forgotPasswordState.email)
        .then(function () {
          setButtonLoading(confirmBtn, false, "Send Code");
          if (error) error.hidden = true;
          showForgotCodeView();
        })
        .catch(function () {
          setButtonLoading(confirmBtn, false, "Send Code");
          if (error) { error.textContent = "Couldn't send the code. Please try again."; error.hidden = false; }
        });
    });

    initOtpBoxes();

    // Step 3 -> Step 4: verify code
    const codeForm = document.getElementById("forgotCodeForm");
    codeForm && codeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const error = document.getElementById("forgotCodeError");
      const submitBtn = document.getElementById("forgotCodeSubmitBtn");
      const code = getOtpValue();

      if (code.length !== 6) {
        if (error) { error.textContent = "Enter all 6 digits of your code."; error.hidden = false; }
        return;
      }
      if (error) error.hidden = true;
      forgotPasswordState.code = code;
      setButtonLoading(submitBtn, "Verifying…");

      verifyPasswordResetCode(forgotPasswordState.email, code)
        .then(function () {
          setButtonLoading(submitBtn, false, "Verify Code");
          showForgotResetView();
        })
        .catch(function () {
          setButtonLoading(submitBtn, false, "Verify Code");
          if (error) { error.textContent = "That code is invalid or expired. Please try again."; error.hidden = false; }
        });
    });

    // Resend code
    const resendLink = document.getElementById("resendCodeLink");
    resendLink && resendLink.addEventListener("click", function (e) {
      e.preventDefault();
      clearOtpInputs();
      requestPasswordResetCode(forgotPasswordState.email);
    });

    // Step 4 -> Step 5: set new password
    const resetForm = document.getElementById("forgotResetForm");
    resetForm && resetForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const error = document.getElementById("forgotResetError");
      const submitBtn = document.getElementById("forgotResetSubmitBtn");
      const newPassword = document.getElementById("forgotNewPasswordInput").value;
      const confirmPassword = document.getElementById("forgotConfirmPasswordInput").value;

      if (!newPassword || !confirmPassword) {
        if (error) { error.textContent = "Please fill in both password fields."; error.hidden = false; }
        return;
      }
      if (newPassword !== confirmPassword) {
        if (error) { error.textContent = "Passwords don't match."; error.hidden = false; }
        return;
      }
      if (error) error.hidden = true;
      setButtonLoading(submitBtn, "Saving…");

      submitNewPassword(forgotPasswordState.email, forgotPasswordState.code, newPassword)
        .then(function () {
          setButtonLoading(submitBtn, false, "Reset Password");
          showForgotSuccessView();

          const signInEmail = document.getElementById("authEmailInput");
          const signInPassword = document.getElementById("authPasswordInput");
          if (signInEmail) signInEmail.value = forgotPasswordState.email;
          if (signInPassword) signInPassword.value = newPassword;

          setTimeout(showSignInView, 1800);
        })
        .catch(function () {
          setButtonLoading(submitBtn, false, "Reset Password");
          if (error) { error.textContent = "Couldn't reset your password. Please try again."; error.hidden = false; }
        });
    });

    // Back-to-sign-in links from the forgot-password steps
    ["backToSignInFromForgot", "backToSignInFromConfirm"].forEach(function (id) {
      const link = document.getElementById(id);
      link && link.addEventListener("click", function (e) { e.preventDefault(); showSignInView(); });
    });
  }

  function initViewFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "logout") {
      sessionStorage.removeItem("bnbAdminAuthed");
      showSignedOutView();
    } else if (params.get("mode") === "signin") {
      showSignInView();
    } else {
      showSignUpView();
    }
  }

  // ---------------------------------------------------
  // PASSWORD SHOW/HIDE
  // ---------------------------------------------------
  function initPasswordToggle() {
    const toggle = document.getElementById("authPasswordToggle");
    const input = document.getElementById("authPasswordInput");
    const icon = document.getElementById("authEyeIcon");
    if (!toggle || !input || !icon) return;

    toggle.addEventListener("click", function () {
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      icon.innerHTML = showing ? EYE_OPEN : EYE_CLOSED;
      toggle.setAttribute("aria-label", showing ? "Show password" : "Hide password");
    });
  }

  // ---------------------------------------------------
  // SIGN IN FORM
  // ---------------------------------------------------
  // Placeholder check — replace with a real API call once
  // the backend exists. Keeping the shape (email, password)
  // -> boolean means swapping it out later is a one-line change.
  function checkCredentials(email, password) {
    return Boolean(email) && Boolean(password);
  }

  // ---------------------------------------------------
  // INPUT RESTRICTIONS — blocks invalid characters as
  // they're typed (not just on submit): Access Code only
  // accepts digits (max 6), Admin Master Key rejects
  // whitespace.
  // ---------------------------------------------------
  function initSignUpInputRestrictions() {
    const accessCode = document.getElementById("signupAccessCodeInput");
    const masterKey = document.getElementById("signupMasterKeyInput");
    const error = document.getElementById("signupFormError");

    if (accessCode) {
      accessCode.addEventListener("beforeinput", function (e) {
        if (e.data && /[^0-9]/.test(e.data)) {
          e.preventDefault();
          if (error) { error.textContent = "Access code can only contain numbers."; error.hidden = false; }
        }
      });
      accessCode.addEventListener("input", function () {
        accessCode.value = accessCode.value.replace(/[^0-9]/g, "").slice(0, 6);
      });
    }

    if (masterKey) {
      masterKey.addEventListener("beforeinput", function (e) {
        if (e.data && /\s/.test(e.data)) {
          e.preventDefault();
          if (error) { error.textContent = "Admin master key cannot contain spaces."; error.hidden = false; }
        }
      });
      masterKey.addEventListener("input", function () {
        masterKey.value = masterKey.value.replace(/\s/g, "");
      });
    }
  }

  // ---------------------------------------------------
  // SIGN UP FORM
  // ---------------------------------------------------
  function initSignUpForm() {
    const form = document.getElementById("signUpForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const error = document.getElementById("signupFormError");
      const email = document.getElementById("signupEmailInput").value.trim();
      const password = document.getElementById("signupPasswordInput").value;
      const accessCode = document.getElementById("signupAccessCodeInput").value;
      const masterKey = document.getElementById("signupMasterKeyInput").value;

      if (!email || !password) {
        if (error) { error.textContent = "Please enter both your email and password."; error.hidden = false; }
        return;
      }
      if (!/^[0-9]{6}$/.test(accessCode)) {
        if (error) { error.textContent = "Access code must be exactly 6 digits."; error.hidden = false; }
        return;
      }
      if (!masterKey) {
        if (error) { error.textContent = "Please enter an admin master key."; error.hidden = false; }
        return;
      }
      if (/\s/.test(masterKey)) {
        if (error) { error.textContent = "Admin master key cannot contain spaces."; error.hidden = false; }
        return;
      }

      if (error) { error.hidden = true; error.textContent = ""; }

      sessionStorage.setItem("bnbAdminAccessCode", accessCode);
      sessionStorage.setItem("bnbAdminMasterKey", masterKey);

      const signInEmail = document.getElementById("authEmailInput");
      const signInPassword = document.getElementById("authPasswordInput");
      if (signInEmail) signInEmail.value = email;
      if (signInPassword) signInPassword.value = password;

      showSignInView();
    });
  }

  // ---------------------------------------------------
  // SIGN UP <-> SIGN IN TOGGLE LINKS
  // ---------------------------------------------------
  function initAuthSwitchLinks() {
    const toSignIn = document.getElementById("goToSignInLink");
    const toSignUp = document.getElementById("goToSignUpLink");
    toSignIn && toSignIn.addEventListener("click", function (e) { e.preventDefault(); showSignInView(); });
    toSignUp && toSignUp.addEventListener("click", function (e) { e.preventDefault(); showSignUpView(); });
  }

  function initSignInForm() {
    const form = document.getElementById("signInForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const error = document.getElementById("authFormError");
      const email = document.getElementById("authEmailInput").value.trim();
      const password = document.getElementById("authPasswordInput").value;
      const remember = document.getElementById("authRememberInput").checked;

      if (!email || !password) {
        if (error) { error.textContent = "Please enter both your email and password."; error.hidden = false; }
        return;
      }

      if (!checkCredentials(email, password)) {
        if (error) { error.textContent = "Incorrect email or password. Please try again."; error.hidden = false; }
        return;
      }

      if (error) { error.hidden = true; error.textContent = ""; }

      const store = remember ? window.localStorage : window.sessionStorage;
      store.setItem("bnbAdminAuthed", "1");

      window.location.href = "admin-dashboard.html";
    });
  }

  // ---------------------------------------------------
  // "FORGOT PASSWORD" (placeholder until reset flow exists)
  // ---------------------------------------------------
  function initForgotPasswordLink() {
    const link = document.getElementById("authForgotLink");
    if (!link) return;
    link.addEventListener("click", function (e) {
      e.preventDefault();
      showForgotEmailView(false);
    });
  }

  // ---------------------------------------------------
  // "BACK TO SIGN IN" (from the Signed Out panel)
  // ---------------------------------------------------
  function initBackToSignIn() {
    const btn = document.getElementById("backToSignInBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.location.href = "admin-auth.html";
    });
  }

  // ---------------------------------------------------
  // INIT
  // ---------------------------------------------------
  function init() {
    initViewFromUrl();
    initPasswordToggle();
    initSignUpInputRestrictions();
    initSignUpForm();
    initAuthSwitchLinks();
    initSignInForm();
    initForgotPasswordLink();
    initForgotPasswordFlow();
    initBackToSignIn();
  }

  document.addEventListener("DOMContentLoaded", init);
})();