/* =====================================================
   BUD N' BUDDER — ADMIN — admin-main.js
   Shared behavior for every admin page: mobile sidebar
   toggle, account dropdown, and marking the active nav
   link. Exposes window.AdminUI so page-specific scripts
   (dashboard.js, products.js, orders.js…) can hook in.
   ===================================================== */

(function () {
  "use strict";

  function initSidebar() {
    const sidebar = document.getElementById("adminSidebar");
    const toggleBtn = document.getElementById("adminSidebarToggle");
    const closeBtn = document.getElementById("adminSidebarClose");
    const scrim = document.getElementById("adminScrim");
    if (!sidebar) return;

    function open() {
      sidebar.classList.add("is-open");
      if (scrim) scrim.classList.add("is-open");
    }
    function close() {
      sidebar.classList.remove("is-open");
      if (scrim) scrim.classList.remove("is-open");
    }

    toggleBtn && toggleBtn.addEventListener("click", open);
    closeBtn && closeBtn.addEventListener("click", close);
    scrim && scrim.addEventListener("click", close);

    // Close the off-canvas sidebar automatically if the viewport
    // grows back past the breakpoint where it's docked.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) close();
    });
  }

  // On mobile, dropdown panels switch to position:fixed (see
  // admin-base.css) so they can't overflow the viewport. This sets
  // an exact `top` in px, measured from the toggle button's real
  // position, so the panel always lands directly under it instead
  // of relying on a guessed CSS value. No-op on desktop, where the
  // panel stays absolutely positioned under its toggle via CSS.
  const MOBILE_QUERY = "(max-width: 640px)";
  const DROPDOWN_GUTTER = 16; // must match the CSS gutter in the mobile media query
  function positionDropdown(toggleEl, menuEl) {
    if (!toggleEl || !menuEl) return;
    if (!window.matchMedia(MOBILE_QUERY).matches) {
      menuEl.style.top = "";
      menuEl.style.left = "";
      menuEl.style.width = "";
      return;
    }
    const rect = toggleEl.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    menuEl.style.top = Math.round(rect.bottom + 8) + "px";
    menuEl.style.left = DROPDOWN_GUTTER + "px";
    menuEl.style.width = Math.round(viewportWidth - DROPDOWN_GUTTER * 2) + "px";
  }

  // Closes every topbar panel (notif bell, account menu) except the one
  // currently being opened, so only one can ever be visible at a time.
  function closeOtherPanels(exceptEl) {
    ["adminNotif", "adminAccount"].forEach(function (id) {
      const el = document.getElementById(id);
      if (el && el !== exceptEl) el.classList.remove("is-open");
    });
  }

  function initAccountDropdown() {
    const account = document.getElementById("adminAccount");
    const toggle = document.getElementById("adminAccountToggle");
    const menu = account ? account.querySelector(".admin-account__menu") : null;
    if (!account || !toggle) return;

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      const opening = !account.classList.contains("is-open");
      if (opening) closeOtherPanels(account);
      account.classList.toggle("is-open");
      if (opening) positionDropdown(toggle, menu);
    });

    document.addEventListener("click", function (e) {
      if (!account.contains(e.target)) account.classList.remove("is-open");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") account.classList.remove("is-open");
    });

    window.addEventListener("resize", function () {
      if (account.classList.contains("is-open")) positionDropdown(toggle, menu);
    });
  }

  function initLogoutButtons() {
    document.querySelectorAll("#adminLogoutBtn, #adminAccountLogout").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.location.href = "admin-auth.html";
      });
    });
  }

  // Marks the nav link whose data-page matches the page's
  // body[data-page] attribute as active — set once per HTML
  // file (e.g. <body class="admin" data-page="dashboard">).
  function markActiveNav() {
    const current = document.body.getAttribute("data-page");
    if (!current) return;
    document.querySelectorAll(".admin-nav__link").forEach(function (link) {
      if (link.getAttribute("data-page") === current) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function init() {
    initSidebar();
    initAccountDropdown();
    markActiveNav();
    initLogoutButtons();
  }

  document.addEventListener("DOMContentLoaded", init);

  window.AdminUI = { init: init, positionDropdown: positionDropdown, closeOtherPanels: closeOtherPanels };
})();