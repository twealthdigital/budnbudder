/* =====================================================
   BUD N' BUDDER — ADMIN — admin-dashboard.js
   ===================================================== */

(function () {
  "use strict";

  // ---------------------------------------------------
  // DATA — replace this block with a fetch()/API call.
  // Keep the same shape and the render functions below
  // will work unchanged.
  // ---------------------------------------------------
  const STATUS_LABELS = { success: "success", pending: "pending", danger: "Cancelled" };

  const DATA = {
    recentOrders: [
      { id: "#BB-1042", product: "OG Kush 3.5g", image: "assets/img/products/og-kush.jpg", customer: "Marcus Reed", avatar: "assets/img/customers/marcus.jpg", date: "Aug 27, 2026", total: "$48.00", status: "success" },
      { id: "#BB-1041", product: "Blue Dream Cart", image: "assets/img/products/blue-dream.jpg", customer: "Aisha Patel", avatar: "assets/img/customers/aisha.jpg", date: "Aug 27, 2026", total: "$62.50", status: "pending" },
      { id: "#BB-1040", product: "Sour Diesel 7g", image: "assets/img/products/sour-diesel.jpg", customer: "Tyler Brooks", avatar: "assets/img/customers/tyler.jpg", date: "Aug 26, 2026", total: "$95.00", status: "success" },
      { id: "#BB-1039", product: "Gummies 10pk", image: "assets/img/products/gummies.jpg", customer: "Jenna Cole", avatar: "assets/img/customers/jenna.jpg", date: "Aug 26, 2026", total: "$28.00", status: "danger" },
      { id: "#BB-1038", product: "Wedding Cake 1g", image: "assets/img/products/wedding-cake.jpg", customer: "Devon Ortiz", avatar: "assets/img/customers/devon.jpg", date: "Aug 25, 2026", total: "$16.00", status: "success" }
    ],
    transactions: [
      { title: "Order #BB-1042 payment", image: "assets/img/txn/card.svg", time: "Today, 2:14 PM", amount: "+$48.00", type: "credit" },
      { title: "Order #BB-1041 payment", image: "assets/img/txn/card.svg", time: "Today, 11:02 AM", amount: "+$62.50", type: "credit" },
      { title: "Refunded — Order #BB-1036", time: "Yesterday, 6:40 PM", amount: "-$22.00", type: "debit" },
      { title: "Order #BB-1040 payment", image: "assets/img/txn/card.svg", time: "Yesterday, 3:15 PM", amount: "+$95.00", type: "credit" },
      { title: "Order #BB-1039 payment", image: "assets/img/txn/card.svg", time: "Yesterday, 1:08 PM", amount: "+$28.00", type: "credit" }
    ]
  };

  // ---------------------------------------------------
  // RENDER — Recent Orders
  // ---------------------------------------------------
  function renderRecentOrders() {
    const body = document.getElementById("recentOrdersBody");
    if (!body) return;

    if (!DATA.recentOrders.length) {
      body.innerHTML = `<tr><td colspan="6" class="dash-empty">No recent orders yet.</td></tr>`;
      return;
    }

    body.innerHTML = DATA.recentOrders.map(function (order) {
      return `
        <tr>
          <td data-label="Order ID" class="order-id">${order.id}</td>
          <td data-label="Product">
            <span class="order-product">
              <img class="order-product__img" src="${order.image}" alt="${order.product}">
              <span class="order-product__name">${order.product}</span>
            </span>
          </td>
          <td data-label="Customer">
            <span class="order-customer">${order.customer}</span>
          </td>
          <td data-label="Date">${order.date}</td>
          <td data-label="Total" class="order-total">${order.total}</td>
          <td data-label="Status">
            <span class="admin-badge admin-badge--${order.status}">${STATUS_LABELS[order.status] || order.status}</span>
          </td>
        </tr>`;
    }).join("");
  }

  // ---------------------------------------------------
  // RENDER — Transaction History
  // ---------------------------------------------------
  function renderTransactions() {
    const list = document.getElementById("transactionList");
    if (!list) return;

    if (!DATA.transactions.length) {
      list.innerHTML = `<div class="dash-empty">No transactions yet.</div>`;
      return;
    }

    list.innerHTML = DATA.transactions.map(function (txn) {
      return `
        <div class="txn-item">
          <div class="txn-item__body">
            <span class="txn-item__title">${txn.title}</span>
            <span class="txn-item__time">${txn.time}</span>
          </div>
          <span class="txn-item__amount is-${txn.type}">${txn.amount}</span>
        </div>`;
    }).join("");
  }

  // ---------------------------------------------------
  // EARNINGS — computed live from real timestamps, so the
  // 24h/7d/30d windows are always accurate whenever this
  // loads. Replace EARNINGS_SOURCE with your real order/
  // payment records (each needs a real Date + amount) —
  // the math and rendering stay the same.
  // ---------------------------------------------------
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;

  function hoursAgo(h) { return new Date(Date.now() - h * HOUR); }
  function daysAgo(d) { return new Date(Date.now() - d * DAY); }

  // ---------------------------------------------------
  // NOTIFICATIONS — replace with a real fetch() returning
  // the same shape: { id, type, title, text, time, unread }.
  // "id" is for backend actions (e.g. mark-as-read/delete
  // calls keyed by id). "type" picks the icon in ICON_MAP.
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

  const EARNINGS_SOURCE = [
    { date: hoursAgo(2), amount: 48.00 },
    { date: hoursAgo(5), amount: 62.50 },
    { date: hoursAgo(14), amount: 95.00 },
    { date: daysAgo(2), amount: 28.00 },
    { date: daysAgo(4), amount: 16.00 },
    { date: daysAgo(6), amount: 74.00 },
    { date: daysAgo(9), amount: 120.00 },
    { date: daysAgo(15), amount: 55.00 },
    { date: daysAgo(22), amount: 88.00 },
    { date: daysAgo(28), amount: 40.00 }
  ];

  function sumWithin(windowMs) {
    const cutoff = Date.now() - windowMs;
    return EARNINGS_SOURCE
      .filter(function (e) { return e.date.getTime() >= cutoff; })
      .reduce(function (total, e) { return total + e.amount; }, 0);
  }

  function fmtMoney(n) {
    return "$" + n.toFixed(2);
  }

  function renderEarningsSkeleton() {
    const grid = document.getElementById("earningsGrid");
    if (!grid) return;
    grid.innerHTML = ["Today", "This Week", "This Month"].map(function (label, i) {
      return `
        <div class="earnings-card${i === 2 ? " earnings-card--highlight" : ""}">
          <span class="earnings-card__label">${label.toUpperCase()}</span>
          <span class="earnings-skeleton"></span>
          <span class="earnings-card__meta">&nbsp;</span>
        </div>`;
    }).join("");
  }

  function renderEarnings() {
    const grid = document.getElementById("earningsGrid");
    const updated = document.getElementById("earningsUpdated");
    if (!grid) return;

    const today = sumWithin(DAY);
    const week = sumWithin(7 * DAY);
    const month = sumWithin(30 * DAY);

    grid.innerHTML = `
      <div class="earnings-card">
        <span class="earnings-card__label">Today</span>
        <span class="earnings-card__value">${fmtMoney(today)}</span>
        <span class="earnings-card__meta">Last 24 hours</span>
      </div>
      <div class="earnings-card">
        <span class="earnings-card__label">This Week</span>
        <span class="earnings-card__value">${fmtMoney(week)}</span>
        <span class="earnings-card__meta">Last 7 days</span>
      </div>
      <div class="earnings-card earnings-card--highlight">
        <span class="earnings-card__label">This Month</span>
        <span class="earnings-card__value">${fmtMoney(month)}</span>
        <span class="earnings-card__meta">Last 30 days</span>
      </div>`;

    if (updated) {
      updated.textContent = "Updated " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  }

  function initEarningsReload() {
    const btn = document.getElementById("earningsReloadBtn");
    if (!btn) return;

    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-loading")) return;
      btn.classList.add("is-loading");
      renderEarningsSkeleton();

      // Simulated network delay so the skeleton is visible. Once
      // EARNINGS_SOURCE is replaced with a real fetch(), swap this
      // setTimeout for `await fetch(...)` — keep the skeleton call
      // before it and renderEarnings() after it resolves, exactly
      // as below — nothing else in this handler needs to change.
      setTimeout(function () {
        renderEarnings();
        btn.classList.remove("is-loading");
      }, 600);
    });
  }

  function renderNotifications() {
    const list = document.getElementById("notifList");

    if (list) {
      if (!NOTIFICATIONS.length) {
        list.innerHTML = `<div class="dash-empty">No notifications.</div>`;
      } else {
        list.innerHTML = NOTIFICATIONS.map(function (n) {
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
    }

    // The badge counts stay wired to NOTIFICATIONS so they always
    // match how many notifications are actually present — this runs
    // regardless of whether the list is empty or not. Once
    // notifications come from the backend, just recompute this
    // after your fetch resolves.
    const totalCount = NOTIFICATIONS.length;
    const bellBadge = document.getElementById("bellBadge");
    const sidebarBadge = document.getElementById("sidebarNotifCount");
    if (bellBadge) { bellBadge.textContent = totalCount; bellBadge.style.display = totalCount ? "" : "none"; }
    if (sidebarBadge) { sidebarBadge.textContent = totalCount; sidebarBadge.style.display = totalCount ? "" : "none"; }
  }

  function initNotifDropdown() {
    const notif = document.getElementById("adminNotif");
    const toggle = document.getElementById("notifBellBtn");
    const menu = notif ? notif.querySelector(".admin-notif__menu") : null;
    if (!notif || !toggle) return;

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      const opening = !notif.classList.contains("is-open");
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

    // Clicking an item opens the detail modal; clicking its dismiss
    // (x) button instead removes that notification from the list.
    notif.addEventListener("click", function (e) {
      const dismissBtn = e.target.closest(".admin-notif__dismiss");
      if (dismissBtn) {
        e.stopPropagation();
        dismissNotification(dismissBtn.dataset.dismissId);
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

  function dismissNotification(id) {
    const idx = NOTIFICATIONS.findIndex(function (n) { return n.id === id; });
    if (idx === -1) return;
    NOTIFICATIONS.splice(idx, 1);
    renderNotifications();
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

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeNotifModal();
    });
    closeBtn && closeBtn.addEventListener("click", closeNotifModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNotifModal();
    });
  }

  function init() {
    renderRecentOrders();
    renderTransactions();
    renderEarnings();
    initEarningsReload();
    renderNotifications();
    initNotifDropdown();
    initNotifModal();
  }

  document.addEventListener("DOMContentLoaded", init);
})();