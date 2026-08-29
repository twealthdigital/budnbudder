/* =====================================================
   BUD N' BUDDER — ADMIN — admin-transactions.js
   ===================================================== */

(function () {
  "use strict";

  // ---------------------------------------------------
  // DATA — replace this block with a fetch()/API call.
  // Keep the same shape and the render functions below
  // will work unchanged.
  // ---------------------------------------------------
  const STATUS_LABELS = { success: "Completed", pending: "Pending", danger: "Failed" };

  let TRANSACTIONS = [
    { id: "TXN-3311", title: "Order #BB-1042 payment", description: "Card payment for Order #BB-1042", orderId: "#BB-1042", date: "Aug 27, 2026, 2:14 PM", method: "Visa •••• 4242", amount: 48.00, type: "credit", status: "success" },
    { id: "TXN-3310", title: "Order #BB-1041 payment", description: "Card payment for Order #BB-1041", orderId: "#BB-1041", date: "Aug 27, 2026, 11:02 AM", method: "Mastercard •••• 8821", amount: 62.50, type: "credit", status: "pending" },
    { id: "TXN-3309", title: "Refunded — Order #BB-1036", description: "Partial refund issued to customer", orderId: "#BB-1036", date: "Aug 26, 2026, 6:40 PM", method: "Visa •••• 4242", amount: 22.00, type: "debit", status: "success" },
    { id: "TXN-3308", title: "Order #BB-1040 payment", description: "Card payment for Order #BB-1040", orderId: "#BB-1040", date: "Aug 26, 2026, 3:15 PM", method: "Amex •••• 1009", amount: 95.00, type: "credit", status: "success" },
    { id: "TXN-3307", title: "Order #BB-1039 payment", description: "Card payment for Order #BB-1039", orderId: "#BB-1039", date: "Aug 26, 2026, 1:08 PM", method: "Visa •••• 7743", amount: 28.00, type: "credit", status: "failed" === undefined ? "danger" : "danger" },
    { id: "TXN-3306", title: "Order #BB-1038 payment", description: "Card payment for Order #BB-1038", orderId: "#BB-1038", date: "Aug 25, 2026, 6:40 PM", method: "Visa •••• 4242", amount: 16.00, type: "credit", status: "success" },
    { id: "TXN-3305", title: "Order #BB-1037 payment", description: "Card payment for Order #BB-1037", orderId: "#BB-1037", date: "Aug 24, 2026, 9:20 AM", method: "Mastercard •••• 3350", amount: 102.00, type: "credit", status: "pending" },
    { id: "TXN-3304", title: "Payout — Weekly settlement", description: "Automatic payout to linked bank account", orderId: "—", date: "Aug 23, 2026, 8:00 AM", method: "Bank Transfer", amount: 640.00, type: "debit", status: "success" },
    { id: "TXN-3303", title: "Order #BB-1036 payment", description: "Card payment for Order #BB-1036", orderId: "#BB-1036", date: "Aug 22, 2026, 4:55 PM", method: "Visa •••• 4242", amount: 38.00, type: "credit", status: "success" },
    { id: "TXN-3302", title: "Order #BB-1035 payment", description: "Card payment for Order #BB-1035", orderId: "#BB-1035", date: "Aug 20, 2026, 12:30 PM", method: "Amex •••• 1009", amount: 55.00, type: "credit", status: "failed" === undefined ? "danger" : "danger" },
    { id: "TXN-3301", title: "Order #BB-1034 payment", description: "Card payment for Order #BB-1034", orderId: "#BB-1034", date: "Aug 14, 2026, 10:05 AM", method: "Visa •••• 7743", amount: 44.00, type: "credit", status: "success" },
    { id: "TXN-3300", title: "Order #BB-1033 payment", description: "Card payment for Order #BB-1033", orderId: "#BB-1033", date: "Jul 30, 2026, 5:45 PM", method: "Mastercard •••• 8821", amount: 30.00, type: "credit", status: "success" }
  ];

  // ---------------------------------------------------
  // HELPERS
  // ---------------------------------------------------
  function fmtMoney(n) { return "$" + Number(n).toFixed(2); }

  function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  const DAY = 24 * 60 * 60 * 1000;
  function daysAgoFromDate(d) { return (Date.now() - d.getTime()) / DAY; }

  // ---------------------------------------------------
  // STATE
  // ---------------------------------------------------
  const state = {
    search: "",
    type: "all",       // all | credit | debit
    status: "all",      // all | success | pending | danger
    dateRange: "all",   // all | today | week | month
    amountMin: null,
    amountMax: null,
    page: 1
  };

  function isMobileView() { return window.matchMedia("(max-width: 640px)").matches; }
  function getPageSize() { return isMobileView() ? 6 : 8; }

  const TYPE_OPTIONS = [
    { value: "all", label: "All Types" },
    { value: "credit", label: "Credit" },
    { value: "debit", label: "Debit" }
  ];

  const STATUS_OPTIONS = [
    { value: "all", label: "All Statuses" },
    { value: "success", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "danger", label: "Failed" }
  ];

  const DATE_OPTIONS = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" }
  ];

  // ---------------------------------------------------
  // FILTERING
  // ---------------------------------------------------
  function getFiltered() {
    return TRANSACTIONS.filter(function (t) {
      if (state.search) {
        const q = state.search.toLowerCase();
        const matchesId = t.id.toLowerCase().indexOf(q) !== -1;
        const matchesDesc = t.description.toLowerCase().indexOf(q) !== -1;
        if (!matchesId && !matchesDesc) return false;
      }
      if (state.type !== "all" && t.type !== state.type) return false;
      if (state.status !== "all" && t.status !== state.status) return false;

      if (state.dateRange !== "all") {
        const age = daysAgoFromDate(new Date(t.date));
        if (state.dateRange === "today" && age > 1) return false;
        if (state.dateRange === "week" && age > 7) return false;
        if (state.dateRange === "month" && age > 30) return false;
      }

      if (state.amountMin != null && t.amount < state.amountMin) return false;
      if (state.amountMax != null && t.amount > state.amountMax) return false;

      return true;
    });
  }

  // ---------------------------------------------------
  // RENDER — filter dropdown menus
  // ---------------------------------------------------
  function renderTypeFilterMenu() {
    const menu = document.getElementById("typeFilterMenu");
    const label = document.getElementById("typeFilterLabel");
    if (!menu) return;
    menu.innerHTML = TYPE_OPTIONS.map(function (opt) {
      return `<button type="button" class="field-dropdown__item${state.type === opt.value ? " is-selected" : ""}" data-value="${opt.value}">${opt.label}</button>`;
    }).join("");
    if (label) {
      const current = TYPE_OPTIONS.find(function (o) { return o.value === state.type; });
      label.textContent = current ? current.label : "All Types";
    }
  }

  function renderStatusFilterMenu() {
    const menu = document.getElementById("statusFilterMenu");
    const label = document.getElementById("statusFilterLabel");
    if (!menu) return;
    menu.innerHTML = STATUS_OPTIONS.map(function (opt) {
      return `<button type="button" class="field-dropdown__item${state.status === opt.value ? " is-selected" : ""}" data-value="${opt.value}">${opt.label}</button>`;
    }).join("");
    if (label) {
      const current = STATUS_OPTIONS.find(function (o) { return o.value === state.status; });
      label.textContent = current ? current.label : "All Statuses";
    }
  }

  function renderDateFilterMenu() {
    const menu = document.getElementById("dateFilterMenu");
    const label = document.getElementById("dateFilterLabel");
    if (!menu) return;
    menu.innerHTML = DATE_OPTIONS.map(function (opt) {
      return `<button type="button" class="field-dropdown__item${state.dateRange === opt.value ? " is-selected" : ""}" data-value="${opt.value}">${opt.label}</button>`;
    }).join("");
    if (label) {
      const current = DATE_OPTIONS.find(function (o) { return o.value === state.dateRange; });
      label.textContent = current ? current.label : "All Time";
    }
  }

  // ---------------------------------------------------
  // PAGINATION
  // ---------------------------------------------------
  function getPage(items) {
    const pageSize = getPageSize();
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    let page = state.page || 1;
    if (page > totalPages) page = totalPages;
    state.page = page;
    const start = (page - 1) * pageSize;
    return { pageItems: items.slice(start, start + pageSize), page, totalPages };
  }

  function renderPaginationControls(page, totalPages) {
    const container = document.getElementById("txnsPagination");
    if (!container) return;
    if (totalPages <= 1) { container.innerHTML = ""; return; }
    container.innerHTML = `
      <div class="order-pagination">
        <button type="button" class="order-pagination__btn" data-page-action="prev" ${page <= 1 ? "disabled" : ""} aria-label="Previous page">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <span class="order-pagination__info">Page ${page} of ${totalPages}</span>
        <button type="button" class="order-pagination__btn" data-page-action="next" ${page >= totalPages ? "disabled" : ""} aria-label="Next page">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>`;
  }

  // ---------------------------------------------------
  // RENDER — header counts
  // ---------------------------------------------------
  function renderHeaderCounts() {
    const countLabel = document.getElementById("txnCountLabel");
    const netLabel = document.getElementById("txnNetLabel");
    if (countLabel) countLabel.textContent = TRANSACTIONS.length;
    if (netLabel) {
      const net = TRANSACTIONS.reduce(function (sum, t) {
        return sum + (t.type === "credit" ? t.amount : -t.amount);
      }, 0);
      netLabel.textContent = (net < 0 ? "-" : "") + fmtMoney(Math.abs(net));
    }
  }

  // ---------------------------------------------------
  // RENDER — transactions table
  // ---------------------------------------------------
  function renderTxnsTable() {
    const body = document.getElementById("txnsTableBody");
    const noResults = document.getElementById("noTxnsState");
    if (!body) return;

    renderHeaderCounts();

    const filtered = getFiltered();

    if (!filtered.length) {
      body.innerHTML = "";
      if (noResults) noResults.hidden = false;
      renderPaginationControls(1, 1);
      return;
    }
    if (noResults) noResults.hidden = true;

    const { pageItems, page, totalPages } = getPage(filtered);

    body.innerHTML = pageItems.map(function (t) {
      const sign = t.type === "credit" ? "+" : "-";
      return `
        <tr data-txn-id="${t.id}">
          <td data-label="Description" class="txn-description">${escapeHtml(t.title)}</td>
          <td data-label="Date">${t.date}</td>
          <td data-label="Amount" class="txn-amount is-${t.type}">${sign}${fmtMoney(t.amount)}</td>
          <td data-label="Status">
            <span class="admin-badge admin-badge--${t.status}">${STATUS_LABELS[t.status] || t.status}</span>
          </td>
          <td data-label="">
            <span class="order-row-actions">
              <button type="button" class="order-row-action" data-view-id="${t.id}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M2 12C2 12 5.5 5.5 12 5.5C18.5 5.5 22 12 22 12C22 12 18.5 18.5 12 18.5C5.5 18.5 2 12 2 12Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/></svg>
                View
              </button>
            </span>
          </td>
        </tr>`;
    }).join("");

    renderPaginationControls(page, totalPages);
  }

  // ---------------------------------------------------
  // TRANSACTION DETAIL MODAL
  // ---------------------------------------------------
  let activeTxnId = null;

  function openTxnModal(t) {
    activeTxnId = t.id;
    const overlay = document.getElementById("txnModalOverlay");
    if (!overlay) return;

    document.getElementById("txnModalTitle").textContent = t.id;
    document.getElementById("txnModalDate").textContent = t.date;

    const amountEl = document.getElementById("txnModalAmount");
    if (amountEl) {
      const sign = t.type === "credit" ? "+" : "-";
      amountEl.textContent = sign + fmtMoney(t.amount);
      amountEl.className = "txn-modal__amount is-" + t.type;
    }

    const statusBadge = document.getElementById("txnModalStatusBadge");
    if (statusBadge) {
      statusBadge.textContent = STATUS_LABELS[t.status] || t.status;
      statusBadge.className = "admin-badge admin-badge--" + t.status;
    }

    document.getElementById("txnModalDescription").textContent = t.description;
    document.getElementById("txnModalMethod").textContent = t.method;
    document.getElementById("txnModalOrder").textContent = t.orderId || "—";

    overlay.classList.add("is-open");
    document.body.classList.add("notif-modal-lock");
  }

  function closeTxnModal() {
    activeTxnId = null;
    const overlay = document.getElementById("txnModalOverlay");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("notif-modal-lock");
  }

  function initTxnModal() {
    const overlay = document.getElementById("txnModalOverlay");
    const closeBtn = document.getElementById("txnModalClose");
    const deleteBtn = document.getElementById("txnDeleteBtn");

    closeBtn && closeBtn.addEventListener("click", closeTxnModal);
    overlay && overlay.addEventListener("click", function (e) { if (e.target === overlay) closeTxnModal(); });

    deleteBtn && deleteBtn.addEventListener("click", function () {
      if (!activeTxnId) return;
      openConfirmModal(activeTxnId);
    });
  }

  // ---------------------------------------------------
  // DELETE TRANSACTION CONFIRM MODAL
  // ---------------------------------------------------
  let pendingDeleteId = null;

  function openConfirmModal(id) {
    pendingDeleteId = id;
    const overlay = document.getElementById("confirmModalOverlay");
    if (!overlay) return;
    overlay.classList.add("is-open");
    document.body.classList.add("notif-modal-lock");
  }

  function closeConfirmModal() {
    pendingDeleteId = null;
    const overlay = document.getElementById("confirmModalOverlay");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("notif-modal-lock");
  }

  function initConfirmModal() {
    const overlay = document.getElementById("confirmModalOverlay");
    const cancelBtn = document.getElementById("confirmCancelBtn");
    const deleteBtn = document.getElementById("confirmDeleteBtn");

    cancelBtn && cancelBtn.addEventListener("click", closeConfirmModal);
    overlay && overlay.addEventListener("click", function (e) { if (e.target === overlay) closeConfirmModal(); });

    deleteBtn && deleteBtn.addEventListener("click", function () {
      if (!pendingDeleteId) return;
      TRANSACTIONS = TRANSACTIONS.filter(function (t) { return t.id !== pendingDeleteId; });
      closeConfirmModal();
      closeTxnModal();
      renderTxnsTable();
    });
  }

  // ---------------------------------------------------
  // TABLE ACTIONS (view + pagination)
  // ---------------------------------------------------
  function initTableActions() {
    const body = document.getElementById("txnsTableBody");
    if (!body) return;

    body.addEventListener("click", function (e) {
      const viewBtn = e.target.closest("[data-view-id]");
      if (viewBtn) {
        const t = TRANSACTIONS.find(function (x) { return x.id === viewBtn.dataset.viewId; });
        if (t) openTxnModal(t);
        return;
      }
      const row = e.target.closest("tr[data-txn-id]");
      if (row) {
        const t = TRANSACTIONS.find(function (x) { return x.id === row.dataset.txnId; });
        if (t) openTxnModal(t);
      }
    });

    const pagination = document.getElementById("txnsPagination");
    pagination && pagination.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-page-action]");
      if (!btn || btn.disabled) return;
      state.page = (state.page || 1) + (btn.dataset.pageAction === "next" ? 1 : -1);
      renderTxnsTable();
    });

    let lastIsMobile = isMobileView();
    window.addEventListener("resize", function () {
      const nowMobile = isMobileView();
      if (nowMobile !== lastIsMobile) {
        lastIsMobile = nowMobile;
        state.page = 1;
        renderTxnsTable();
      }
    });
  }

  // ---------------------------------------------------
  // FILTER TOOLBAR
  // ---------------------------------------------------
  function initFilterToolbar() {
    const searchInput = document.getElementById("txnSearchInput");
    const amountMin = document.getElementById("amountMinInput");
    const amountMax = document.getElementById("amountMaxInput");
    const clearBtn = document.getElementById("clearFiltersBtn");

    searchInput && searchInput.addEventListener("input", function () {
      state.search = searchInput.value.trim();
      state.page = 1;
      renderTxnsTable();
    });

    amountMin && amountMin.addEventListener("input", function () {
      state.amountMin = amountMin.value === "" ? null : parseFloat(amountMin.value);
      state.page = 1;
      renderTxnsTable();
    });
    amountMax && amountMax.addEventListener("input", function () {
      state.amountMax = amountMax.value === "" ? null : parseFloat(amountMax.value);
      state.page = 1;
      renderTxnsTable();
    });

    clearBtn && clearBtn.addEventListener("click", function () {
      state.search = "";
      state.type = "all";
      state.status = "all";
      state.dateRange = "all";
      state.amountMin = null;
      state.amountMax = null;
      state.page = 1;
      if (searchInput) searchInput.value = "";
      if (amountMin) amountMin.value = "";
      if (amountMax) amountMax.value = "";
      renderTypeFilterMenu();
      renderStatusFilterMenu();
      renderDateFilterMenu();
      renderTxnsTable();
    });
  }

  function initTypeFilterDropdown() {
    initDropdown("typeFilterDropdown", "typeFilterToggle", "typeFilterMenu", function (value) {
      state.type = value;
      state.page = 1;
      renderTypeFilterMenu();
      renderTxnsTable();
    });
  }

  function initStatusFilterDropdown() {
    initDropdown("statusFilterDropdown", "statusFilterToggle", "statusFilterMenu", function (value) {
      state.status = value;
      state.page = 1;
      renderStatusFilterMenu();
      renderTxnsTable();
    });
  }

  function initDateFilterDropdown() {
    initDropdown("dateFilterDropdown", "dateFilterToggle", "dateFilterMenu", function (value) {
      state.dateRange = value;
      state.page = 1;
      renderDateFilterMenu();
      renderTxnsTable();
    });
  }

  // ---------------------------------------------------
  // GENERIC FIELD DROPDOWN
  // ---------------------------------------------------
  function initDropdown(wrapId, toggleId, menuId, onSelect) {
    const wrap = document.getElementById(wrapId);
    const toggle = document.getElementById(toggleId);
    const menu = document.getElementById(menuId);
    if (!wrap || !toggle || !menu) return;

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      const opening = !wrap.classList.contains("is-open");
      if (opening) closeAllDropdowns(wrap);
      wrap.classList.toggle("is-open");
    });

    menu.addEventListener("click", function (e) {
      const item = e.target.closest(".field-dropdown__item");
      if (!item) return;
      onSelect(item.dataset.value, item);
      wrap.classList.remove("is-open");
    });
  }

  function closeAllDropdowns(except) {
    document.querySelectorAll(".field-dropdown.is-open").forEach(function (d) {
      if (d !== except) d.classList.remove("is-open");
    });
  }

  function initGlobalDropdownClose() {
    document.addEventListener("click", function () { closeAllDropdowns(null); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAllDropdowns(null);
    });
  }

  // ---------------------------------------------------
  // NOTIFICATIONS (shared header widget, same shape as
  // dashboard.js/products.js/orders.js)
  // ---------------------------------------------------
  const NOTIFICATIONS = [
    { id: "ntf_1", type: "order", title: "New order received", text: "Order #BB-1042 from Marcus Reed", time: "2h ago", unread: true },
    { id: "ntf_2", type: "payment", title: "Payment confirmed", text: "Order #BB-1041 payment cleared", time: "5h ago", unread: true },
    { id: "ntf_3", type: "stock", title: "Low stock alert", text: "Wedding Cake 1g is running low", time: "Yesterday", unread: false }
  ];

  const NOTIF_ICONS = {
    order: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 8H20L19 20H5L4 8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 8V6C8 3.79 9.79 2 12 2C14.21 2 16 3.79 16 6V8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    payment: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5.5" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M3 9.5H21" stroke="currentColor" stroke-width="1.6"/></svg>',
    stock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 8L12 3L21 8V16L12 21L3 16V8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
  };

  function renderNotifications() {
    const list = document.getElementById("notifList");
    if (list) {
      list.innerHTML = !NOTIFICATIONS.length
        ? `<div class="dash-empty">No notifications.</div>`
        : NOTIFICATIONS.map(function (n) {
            return `
              <div class="admin-notif__item${n.unread ? " is-unread" : ""}" data-notif-id="${n.id}">
                <span class="admin-notif__icon">${NOTIF_ICONS[n.type] || ""}</span>
                <span class="admin-notif__body">
                  <span class="admin-notif__title">${n.title}</span>
                  <span class="admin-notif__text">${n.text}</span>
                  <span class="admin-notif__time">${n.time}</span>
                </span>
                <button type="button" class="admin-notif__dismiss" data-dismiss-id="${n.id}" aria-label="Dismiss notification">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
              </div>`;
          }).join("");
    }
    const totalCount = NOTIFICATIONS.length;
    const bellBadge = document.getElementById("bellBadge");
    if (bellBadge) { bellBadge.textContent = totalCount; bellBadge.style.display = totalCount ? "" : "none"; }
  }

  function openNotifModal(n) {
    const overlay = document.getElementById("notifModalOverlay");
    const icon = document.getElementById("notifModalIcon");
    const title = document.getElementById("notifModalTitle");
    const text = document.getElementById("notifModalText");
    const time = document.getElementById("notifModalTime");
    if (!overlay) return;
    if (icon) icon.innerHTML = NOTIF_ICONS[n.type] || "";
    if (title) title.textContent = n.title;
    if (text) text.textContent = n.text;
    if (time) time.textContent = n.time;
    overlay.classList.add("is-open");
    document.body.classList.add("notif-modal-lock");
  }

  function closeNotifModal() {
    const overlay = document.getElementById("notifModalOverlay");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("notif-modal-lock");
  }

  function initNotifModal() {
    const overlay = document.getElementById("notifModalOverlay");
    const closeBtn = document.getElementById("notifModalClose");
    if (!overlay) return;
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeNotifModal(); });
    closeBtn && closeBtn.addEventListener("click", closeNotifModal);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNotifModal(); });
  }

  function initNotifDropdown() {
    const notif = document.getElementById("adminNotif");
    const toggle = document.getElementById("notifBellBtn");
    const menu = notif ? notif.querySelector(".admin-notif__menu") : null;
    if (!notif || !toggle) return;

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      const opening = !notif.classList.contains("is-open");
      if (opening && window.AdminUI) window.AdminUI.closeOtherPanels(notif);
      notif.classList.toggle("is-open");
      if (opening && window.AdminUI) window.AdminUI.positionDropdown(toggle, menu);
    });
    document.addEventListener("click", function (e) {
      if (!notif.contains(e.target)) notif.classList.remove("is-open");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") notif.classList.remove("is-open");
    });
    window.addEventListener("resize", function () {
      if (notif.classList.contains("is-open") && window.AdminUI) window.AdminUI.positionDropdown(toggle, menu);
    });

    notif.addEventListener("click", function (e) {
      const dismissBtn = e.target.closest(".admin-notif__dismiss");
      if (dismissBtn) {
        e.stopPropagation();
        const idx = NOTIFICATIONS.findIndex(function (n) { return n.id === dismissBtn.dataset.dismissId; });
        if (idx > -1) NOTIFICATIONS.splice(idx, 1);
        renderNotifications();
        return;
      }
      const item = e.target.closest(".admin-notif__item");
      if (!item) return;
      const n = NOTIFICATIONS.find(function (x) { return x.id === item.dataset.notifId; });
      if (!n) return;
      n.unread = false;
      notif.classList.remove("is-open");
      openNotifModal(n);
    });
  }

  // ---------------------------------------------------
  // INIT
  // ---------------------------------------------------
  function init() {
    renderTypeFilterMenu();
    renderStatusFilterMenu();
    renderDateFilterMenu();
    renderTxnsTable();

    initFilterToolbar();
    initTypeFilterDropdown();
    initStatusFilterDropdown();
    initDateFilterDropdown();
    initGlobalDropdownClose();
    initTableActions();
    initTxnModal();
    initConfirmModal();

    renderNotifications();
    initNotifDropdown();
    initNotifModal();
  }

  document.addEventListener("DOMContentLoaded", init);
})();