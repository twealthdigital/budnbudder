/* =====================================================
   BUD N' BUDDER — ADMIN — admin-orders.js
   ===================================================== */

(function () {
  "use strict";

  // ---------------------------------------------------
  // DATA — replace this block with a fetch()/API call.
  // Keep the same shape and the render functions below
  // will work unchanged.
  // ---------------------------------------------------
  const STATUS_LABELS = { success: "Delivered", pending: "Processing", danger: "Cancelled" };

  let ORDERS = [
    {
      id: "#BB-1042", date: "Aug 27, 2026, 2:14 PM", status: "success",
      customer: { name: "Marcus Reed", email: "marcus.reed@email.com", avatar: "assets/img/customers/marcus.jpg" },
      address: "412 Willow St, Apt 3B, Portland, OR 97205",
      items: [
        { name: "OG Kush 3.5g", image: "assets/img/products/og-kush.jpg", qty: 1, price: 45.0 },
        { name: "Classic Pre-Roll 1g", image: "assets/img/products/preroll-1g.jpg", qty: 1, price: 10.0 }
      ],
      shipping: 5.0, tax: 0.0
    },
    {
      id: "#BB-1041", date: "Aug 27, 2026, 11:02 AM", status: "pending",
      customer: { name: "Aisha Patel", email: "aisha.patel@email.com", avatar: "assets/img/customers/aisha.jpg" },
      address: "88 Harbor Ave, Seattle, WA 98101",
      items: [
        { name: "Blue Dream Cart", image: "assets/img/products/blue-dream.jpg", qty: 1, price: 42.0 },
        { name: "Mixed Fruit Gummies 10pk", image: "assets/img/products/gummies.jpg", qty: 1, price: 20.5 }
      ],
      shipping: 0.0, tax: 0.0
    },
    {
      id: "#BB-1040", date: "Aug 26, 2026, 3:15 PM", status: "success",
      customer: { name: "Tyler Brooks", email: "tyler.brooks@email.com", avatar: "assets/img/customers/tyler.jpg" },
      address: "1290 Cedar Ln, Denver, CO 80203",
      items: [
        { name: "Sour Diesel 7g", image: "assets/img/products/sour-diesel.jpg", qty: 1, price: 78.0 },
        { name: "Glass Bowl Piece", image: "assets/img/products/glass-bowl.jpg", qty: 1, price: 14.0 }
      ],
      shipping: 3.0, tax: 0.0
    },
    {
      id: "#BB-1039", date: "Aug 26, 2026, 1:08 PM", status: "danger",
      customer: { name: "Jenna Cole", email: "jenna.cole@email.com", avatar: "assets/img/customers/jenna.jpg" },
      address: "76 Maple Ct, Austin, TX 78701",
      items: [
        { name: "Mixed Fruit Gummies 10pk", image: "assets/img/products/gummies.jpg", qty: 1, price: 28.0 }
      ],
      shipping: 0.0, tax: 0.0
    },
    {
      id: "#BB-1038", date: "Aug 25, 2026, 6:40 PM", status: "success",
      customer: { name: "Devon Ortiz", email: "devon.ortiz@email.com", avatar: "assets/img/customers/devon.jpg" },
      address: "540 Birchwood Dr, San Diego, CA 92101",
      items: [
        { name: "Wedding Cake 1g", image: "assets/img/products/wedding-cake.jpg", qty: 1, price: 16.0 }
      ],
      shipping: 0.0, tax: 0.0
    },
    {
      id: "#BB-1037", date: "Aug 24, 2026, 9:20 AM", status: "pending",
      customer: { name: "Priya Nair", email: "priya.nair@email.com", avatar: "assets/img/customers/priya.jpg" },
      address: "22 Fountain Ave, Miami, FL 33101",
      items: [
        { name: "Jeeter Live Resin Cart", image: "assets/img/products/jeeter-cart.jpg", qty: 2, price: 35.0 },
        { name: "Stiiizy Pod 1g", image: "assets/img/products/stiiizy-pod.jpg", qty: 1, price: 32.0 }
      ],
      shipping: 6.0, tax: 0.0
    },
    {
      id: "#BB-1036", date: "Aug 22, 2026, 4:55 PM", status: "success",
      customer: { name: "Chris Palmer", email: "chris.palmer@email.com", avatar: "assets/img/customers/chris.jpg" },
      address: "9 Elm Terrace, Chicago, IL 60601",
      items: [
        { name: "Infused Pre-Roll 5pk", image: "assets/img/products/preroll-5pk.jpg", qty: 1, price: 38.0 }
      ],
      shipping: 0.0, tax: 0.0
    },
    {
      id: "#BB-1035", date: "Aug 20, 2026, 12:30 PM", status: "danger",
      customer: { name: "Sofia Reyes", email: "sofia.reyes@email.com", avatar: "assets/img/customers/sofia.jpg" },
      address: "300 Riverside Pkwy, Sacramento, CA 95814",
      items: [
        { name: "Live Rosin Badder 1g", image: "assets/img/products/rosin-badder.jpg", qty: 1, price: 55.0 }
      ],
      shipping: 0.0, tax: 0.0
    },
    {
      id: "#BB-1034", date: "Aug 14, 2026, 10:05 AM", status: "success",
      customer: { name: "Noah Kim", email: "noah.kim@email.com", avatar: "assets/img/customers/noah.jpg" },
      address: "17 Sunset Blvd, Los Angeles, CA 90028",
      items: [
        { name: "Dark Chocolate Bar 100mg", image: "assets/img/products/choco-bar.jpg", qty: 2, price: 22.0 }
      ],
      shipping: 4.0, tax: 0.0
    },
    {
      id: "#BB-1033", date: "Jul 30, 2026, 5:45 PM", status: "success",
      customer: { name: "Emily Frost", email: "emily.frost@email.com", avatar: "assets/img/customers/emily.jpg" },
      address: "58 Aspen Way, Boulder, CO 80302",
      items: [
        { name: "Classic Pre-Roll 1g", image: "assets/img/products/preroll-1g.jpg", qty: 3, price: 10.0 }
      ],
      shipping: 0.0, tax: 0.0
    }
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

  function itemsSubtotal(order) {
    return order.items.reduce(function (sum, it) { return sum + it.price * it.qty; }, 0);
  }

  function orderTotal(order) {
    return itemsSubtotal(order) + (order.shipping || 0) + (order.tax || 0);
  }

  function itemsCount(order) {
    return order.items.reduce(function (sum, it) { return sum + it.qty; }, 0);
  }

  const DAY = 24 * 60 * 60 * 1000;
  function daysAgoFromDate(d) { return (Date.now() - d.getTime()) / DAY; }

  // ---------------------------------------------------
  // STATE
  // ---------------------------------------------------
  const state = {
    search: "",
    status: "all",
    dateRange: "all",   // all | today | week | month
    amountMin: null,
    amountMax: null,
    page: 1
  };

  function isMobileView() { return window.matchMedia("(max-width: 640px)").matches; }
  function getPageSize() { return isMobileView() ? 6 : 8; }

  const STATUS_OPTIONS = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Processing" },
    { value: "success", label: "Delivered" },
    { value: "danger", label: "Cancelled" }
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
    return ORDERS.filter(function (o) {
      if (state.search) {
        const q = state.search.toLowerCase();
        const matchesId = o.id.toLowerCase().indexOf(q) !== -1;
        const matchesCustomer = o.customer.name.toLowerCase().indexOf(q) !== -1;
        if (!matchesId && !matchesCustomer) return false;
      }
      if (state.status !== "all" && o.status !== state.status) return false;

      if (state.dateRange !== "all") {
        const age = daysAgoFromDate(new Date(o.date));
        if (state.dateRange === "today" && age > 1) return false;
        if (state.dateRange === "week" && age > 7) return false;
        if (state.dateRange === "month" && age > 30) return false;
      }

      const total = orderTotal(o);
      if (state.amountMin != null && total < state.amountMin) return false;
      if (state.amountMax != null && total > state.amountMax) return false;

      return true;
    });
  }

  // ---------------------------------------------------
  // RENDER — filter dropdown menus
  // ---------------------------------------------------
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
    const container = document.getElementById("ordersPagination");
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
    const countLabel = document.getElementById("orderCountLabel");
    const revenueLabel = document.getElementById("orderRevenueLabel");
    if (countLabel) countLabel.textContent = ORDERS.length;
    if (revenueLabel) {
      const revenue = ORDERS
        .filter(function (o) { return o.status !== "danger"; })
        .reduce(function (sum, o) { return sum + orderTotal(o); }, 0);
      revenueLabel.textContent = fmtMoney(revenue);
    }
  }

  // ---------------------------------------------------
  // RENDER — orders table
  // ---------------------------------------------------
  function renderOrdersTable() {
    const body = document.getElementById("ordersTableBody");
    const noResults = document.getElementById("noOrdersState");
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

    body.innerHTML = pageItems.map(function (order) {
      const total = orderTotal(order);
      const count = itemsCount(order);
      return `
        <tr data-order-id="${order.id}">
          <td data-label="Order ID" class="order-id">${order.id}</td>
          <td data-label="Customer">
            <span class="order-customer">
              <span class="order-customer__info">
                <span class="order-customer__name">${escapeHtml(order.customer.name)}</span>
                <span class="order-customer__email">${escapeHtml(order.customer.email)}</span>
              </span>
            </span>
          </td>
          <td data-label="Items" class="order-items-count">${count} item${count !== 1 ? "s" : ""}</td>
          <td data-label="Date">${order.date}</td>
          <td data-label="Total" class="order-total">${fmtMoney(total)}</td>
          <td data-label="Status">
            <span class="admin-badge admin-badge--${order.status}">${STATUS_LABELS[order.status] || order.status}</span>
          </td>
          <td data-label="">
            <span class="order-row-actions">
              <button type="button" class="order-row-action" data-view-id="${order.id}">
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
  // ORDER DETAIL MODAL
  // ---------------------------------------------------
  let activeOrderId = null;

  function openOrderModal(order) {
    activeOrderId = order.id;
    const overlay = document.getElementById("orderModalOverlay");
    if (!overlay) return;

    document.getElementById("orderModalTitle").textContent = "Order " + order.id;
    document.getElementById("orderModalDate").textContent = order.date;
    document.getElementById("orderModalAddress").textContent = order.address;

    document.getElementById("orderModalCustomer").innerHTML = `
      <img class="order-modal__customer-avatar" src="${order.customer.avatar}" alt="${escapeHtml(order.customer.name)}" onerror="this.style.opacity='0'">
      <span class="order-modal__customer-info">
        <span class="order-modal__customer-name">${escapeHtml(order.customer.name)}</span>
        <span class="order-modal__customer-meta">${escapeHtml(order.customer.email)}</span>
      </span>`;

    document.getElementById("orderModalItems").innerHTML = order.items.map(function (it) {
      return `
        <div class="order-modal__item">
          <img class="order-modal__item-img" src="${it.image}" alt="${escapeHtml(it.name)}" onerror="this.style.opacity='0'">
          <span class="order-modal__item-body">
            <span class="order-modal__item-name">${escapeHtml(it.name)}</span>
            <span class="order-modal__item-qty">Qty ${it.qty} × ${fmtMoney(it.price)}</span>
          </span>
          <span class="order-modal__item-price">${fmtMoney(it.price * it.qty)}</span>
        </div>`;
    }).join("");

    const subtotal = itemsSubtotal(order);
    document.getElementById("orderModalTotals").innerHTML = `
      <span class="order-modal__totals-row"><span>Subtotal</span><span>${fmtMoney(subtotal)}</span></span>
      <span class="order-modal__totals-row"><span>Shipping</span><span>${fmtMoney(order.shipping || 0)}</span></span>
      <span class="order-modal__totals-row"><span>Tax</span><span>${fmtMoney(order.tax || 0)}</span></span>
      <span class="order-modal__totals-row is-grand"><span>Total</span><span>${fmtMoney(orderTotal(order))}</span></span>`;

    overlay.classList.add("is-open");
    document.body.classList.add("notif-modal-lock");
  }

  function closeOrderModal() {
    activeOrderId = null;
    const overlay = document.getElementById("orderModalOverlay");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("notif-modal-lock");
  }

  function initOrderModal() {
    const overlay = document.getElementById("orderModalOverlay");
    const closeBtn = document.getElementById("orderModalClose");
    const cancelOrderBtn = document.getElementById("orderCancelOrderBtn");

    closeBtn && closeBtn.addEventListener("click", closeOrderModal);
    overlay && overlay.addEventListener("click", function (e) { if (e.target === overlay) closeOrderModal(); });

    cancelOrderBtn && cancelOrderBtn.addEventListener("click", function () {
      if (!activeOrderId) return;
      openConfirmModal(activeOrderId);
    });
  }


  // ---------------------------------------------------
  // CANCEL ORDER CONFIRM MODAL
  // ---------------------------------------------------
  let pendingCancelId = null;

  function openConfirmModal(id) {
    pendingCancelId = id;
    const overlay = document.getElementById("confirmModalOverlay");
    if (!overlay) return;
    overlay.classList.add("is-open");
    document.body.classList.add("notif-modal-lock");
  }

  function closeConfirmModal() {
    pendingCancelId = null;
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
      if (!pendingCancelId) return;
      ORDERS = ORDERS.filter(function (o) { return o.id !== pendingCancelId; });
      closeConfirmModal();
      closeOrderModal();
      renderOrdersTable();
    });
  }

  // ---------------------------------------------------
  // TABLE ACTIONS (view + pagination)
  // ---------------------------------------------------
  function initTableActions() {
    const body = document.getElementById("ordersTableBody");
    if (!body) return;

    body.addEventListener("click", function (e) {
      const viewBtn = e.target.closest("[data-view-id]");
      if (viewBtn) {
        const order = ORDERS.find(function (o) { return o.id === viewBtn.dataset.viewId; });
        if (order) openOrderModal(order);
        return;
      }
      const row = e.target.closest("tr[data-order-id]");
      if (row) {
        const order = ORDERS.find(function (o) { return o.id === row.dataset.orderId; });
        if (order) openOrderModal(order);
      }
    });

    const pagination = document.getElementById("ordersPagination");
    pagination && pagination.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-page-action]");
      if (!btn || btn.disabled) return;
      state.page = (state.page || 1) + (btn.dataset.pageAction === "next" ? 1 : -1);
      renderOrdersTable();
    });

    let lastIsMobile = isMobileView();
    window.addEventListener("resize", function () {
      const nowMobile = isMobileView();
      if (nowMobile !== lastIsMobile) {
        lastIsMobile = nowMobile;
        state.page = 1;
        renderOrdersTable();
      }
    });
  }

  // ---------------------------------------------------
  // FILTER TOOLBAR
  // ---------------------------------------------------
  function initFilterToolbar() {
    const searchInput = document.getElementById("orderSearchInput");
    const amountMin = document.getElementById("amountMinInput");
    const amountMax = document.getElementById("amountMaxInput");
    const clearBtn = document.getElementById("clearFiltersBtn");

    searchInput && searchInput.addEventListener("input", function () {
      state.search = searchInput.value.trim();
      state.page = 1;
      renderOrdersTable();
    });

    amountMin && amountMin.addEventListener("input", function () {
      state.amountMin = amountMin.value === "" ? null : parseFloat(amountMin.value);
      state.page = 1;
      renderOrdersTable();
    });
    amountMax && amountMax.addEventListener("input", function () {
      state.amountMax = amountMax.value === "" ? null : parseFloat(amountMax.value);
      state.page = 1;
      renderOrdersTable();
    });

    clearBtn && clearBtn.addEventListener("click", function () {
      state.search = "";
      state.status = "all";
      state.dateRange = "all";
      state.amountMin = null;
      state.amountMax = null;
      state.page = 1;
      if (searchInput) searchInput.value = "";
      if (amountMin) amountMin.value = "";
      if (amountMax) amountMax.value = "";
      renderStatusFilterMenu();
      renderDateFilterMenu();
      renderOrdersTable();
    });
  }

  function initStatusFilterDropdown() {
    initDropdown("statusFilterDropdown", "statusFilterToggle", "statusFilterMenu", function (value) {
      state.status = value;
      state.page = 1;
      renderStatusFilterMenu();
      renderOrdersTable();
    });
  }

  function initDateFilterDropdown() {
    initDropdown("dateFilterDropdown", "dateFilterToggle", "dateFilterMenu", function (value) {
      state.dateRange = value;
      state.page = 1;
      renderDateFilterMenu();
      renderOrdersTable();
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
  // dashboard.js/products.js)
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
    const sidebarBadge = document.getElementById("sidebarNotifCount");
    if (bellBadge) { bellBadge.textContent = totalCount; bellBadge.style.display = totalCount ? "" : "none"; }
    if (sidebarBadge) { sidebarBadge.textContent = totalCount; sidebarBadge.style.display = totalCount ? "" : "none"; }
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
    renderStatusFilterMenu();
    renderDateFilterMenu();
    renderOrdersTable();

    initFilterToolbar();
    initStatusFilterDropdown();
    initDateFilterDropdown();
    initGlobalDropdownClose();
    initTableActions();
    initOrderModal();
    initConfirmModal();

    renderNotifications();
    initNotifDropdown();
    initNotifModal();
  }

  document.addEventListener("DOMContentLoaded", init);
})();