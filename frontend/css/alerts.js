/* =============================================
   alerts.js — Alerts page logic
   ============================================= */

// ── Mock Data ──────────────────────────────────
const alertsData = [
  {
    id: 1,
    severity: 'critical',
    message: 'Out of stock — immediate restock required',
    product: 'Webcam HD 1080p',
    timestamp: '2 min ago',
    read: false
  },
  {
    id: 2,
    severity: 'warning',
    message: 'Stock below reorder threshold',
    product: 'Gaming Mouse Pro',
    timestamp: '14 min ago',
    read: false
  },
  {
    id: 3,
    severity: 'warning',
    message: 'Stock below reorder threshold',
    product: 'Laptop Stand Pro',
    timestamp: '1 hr ago',
    read: false
  },
  {
    id: 4,
    severity: 'info',
    message: 'Restocked successfully — 50 units added',
    product: 'Wireless Headphones',
    timestamp: '2 hrs ago',
    read: true
  },
  {
    id: 5,
    severity: 'info',
    message: 'New product added to inventory',
    product: 'USB-C Charging Cable',
    timestamp: '3 hrs ago',
    read: true
  },
  {
    id: 6,
    severity: 'critical',
    message: 'Stock critically low — 2 units remain',
    product: 'USB-C Hub 7-in-1',
    timestamp: '5 hrs ago',
    read: false
  },
  {
    id: 7,
    severity: 'warning',
    message: 'Approaching reorder threshold',
    product: 'Desk Mat XL',
    timestamp: '6 hrs ago',
    read: true
  },
  {
    id: 8,
    severity: 'info',
    message: 'Monthly stock report generated',
    product: 'System',
    timestamp: '1 day ago',
    read: true
  }
];

// ── Severity Config ────────────────────────────
const severityConfig = {
  critical: {
    color: '#FF1744',
    bg: 'rgba(255, 23, 68, 0.10)',
    border: 'rgba(255, 23, 68, 0.2)',
    label: 'Critical',
    iconSVG: (size, color) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>`
  },
  warning: {
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.2)',
    label: 'Warning',
    iconSVG: (size, color) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>`
  },
  info: {
    color: '#60A5FA',
    bg: 'rgba(96, 165, 250, 0.08)',
    border: 'rgba(96, 165, 250, 0.2)',
    label: 'Info',
    iconSVG: (size, color) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
      </svg>`
  }
};

// Shared icon helpers
const icons = {
  clock: (size, color) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>`,
  x: (size, color) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`
};

// ── State ──────────────────────────────────────
let activeFilter = 'All';

// ── XSS Guard ──────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Render ─────────────────────────────────────
function renderAlertCard(alert, index) {
  const cfg = severityConfig[alert.severity];
  const isUnread = !alert.read;

  const cardStyle = isUnread
    ? `background:${cfg.bg}; border-color:${cfg.border};`
    : `background:#1E1E1E; border-color:rgba(255,255,255,0.06); opacity:0.65;`;

  const staggerDelay = `animation-delay:${index * 40}ms;`;

  return `
    <div
      class="alert-card alert-severity-${alert.severity} ${isUnread ? 'alert-unread' : 'alert-read'}"
      data-alert-id="${alert.id}"
      data-severity="${alert.severity}"
      data-read="${alert.read}"
      style="${cardStyle} ${staggerDelay}"
      role="article"
      aria-label="${escHtml(cfg.label)} alert for ${escHtml(alert.product)}"
    >
      <div class="alert-icon-box alert-icon-${alert.severity}" aria-hidden="true">
        ${cfg.iconSVG(17, cfg.color)}
      </div>

      <div class="alert-content">
        <div class="alert-header">
          <span class="severity-label severity-${alert.severity}">${escHtml(cfg.label.toUpperCase())}</span>
          <span class="product-name">${escHtml(alert.product)}</span>
          ${isUnread ? `<span class="new-badge" style="background:${cfg.color};" aria-label="New unread alert">NEW</span>` : ''}
        </div>
        <p class="alert-message">${escHtml(alert.message)}</p>
      </div>

      <div class="alert-actions">
        <div class="alert-timestamp" aria-label="Time: ${escHtml(alert.timestamp)}">
          ${icons.clock(11, '#555')}
          ${escHtml(alert.timestamp)}
        </div>
        <button
          class="btn-dismiss"
          aria-label="Dismiss alert for ${escHtml(alert.product)}"
        >
          ${icons.x(11, 'currentColor')}
          Dismiss
        </button>
      </div>
    </div>
  `;
}

function renderAlerts() {
  const list = document.getElementById('alertList');
  const filtered = getFilteredAlerts();

  if (filtered.length === 0) {
    list.innerHTML = '';
    showEmptyState(true);
    return;
  }

  showEmptyState(false);
  list.innerHTML = filtered.map((a, i) => renderAlertCard(a, i)).join('');
}

// ── Filter Logic ───────────────────────────────
function getFilteredAlerts() {
  if (activeFilter === 'All') return alertsData;
  return alertsData.filter(a => a.severity === activeFilter);
}

function setActiveFilter(filter) {
  activeFilter = filter;

  document.querySelectorAll('.tab-filter-btn').forEach(btn => {
    const isActive = btn.dataset.filter === filter;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  renderAlerts();
}

// ── Tab Counts ─────────────────────────────────
function updateTabCounts() {
  const total    = alertsData.length;
  const critical = alertsData.filter(a => a.severity === 'critical').length;
  const warning  = alertsData.filter(a => a.severity === 'warning').length;
  const info     = alertsData.filter(a => a.severity === 'info').length;

  const btns = document.querySelectorAll('.tab-filter-btn');
  if (btns[0]) btns[0].querySelector('.tab-count').textContent = `(${total})`;
  if (btns[1]) btns[1].querySelector('.tab-count').textContent = `(${critical})`;
  if (btns[2]) btns[2].querySelector('.tab-count').textContent = `(${warning})`;
  if (btns[3]) btns[3].querySelector('.tab-count').textContent = `(${info})`;
}

// ── Header / Badge ─────────────────────────────
function updateHeader() {
  const unreadCount = alertsData.filter(a => !a.read).length;
  const subtitle    = document.getElementById('alertsSubtitle');
  const markAllBtn  = document.getElementById('btnMarkAllRead');
  const badge       = document.getElementById('sidebarBadge');
  const alertPill   = document.getElementById('alertPill');
  const pillText    = document.getElementById('alertPillText');

  // Sidebar badge
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
  }

  // Alert pill in header
  if (alertPill) {
    const lowCount = alertsData.filter(a => a.severity === 'critical' || a.severity === 'warning').length;
    if (pillText) pillText.textContent = `${lowCount} low stock alert${lowCount !== 1 ? 's' : ''}`;
    alertPill.style.display = lowCount > 0 ? 'flex' : 'none';
  }

  // Subtitle + mark all button
  if (unreadCount > 0) {
    subtitle.innerHTML = `<span class="unread-count">${unreadCount} unread</span> alerts require attention`;
    if (markAllBtn) markAllBtn.style.display = 'flex';
  } else {
    subtitle.textContent = 'All alerts are up to date';
    if (markAllBtn) markAllBtn.style.display = 'none';
  }
}

// ── Empty State ────────────────────────────────
function showEmptyState(show) {
  const emptyState = document.getElementById('emptyState');
  const list       = document.getElementById('alertList');
  const emptyText  = document.getElementById('emptyText');

  if (show) {
    list.style.display = 'none';
    emptyState.style.display = 'block';
    const filterText = activeFilter !== 'All' ? ` ${activeFilter.toLowerCase()}` : '';
    if (emptyText) emptyText.textContent = `All clear — no${filterText} alerts at this time.`;
  } else {
    list.style.display = 'flex';
    emptyState.style.display = 'none';
  }
}

// ── Dismiss Alert ──────────────────────────────
function dismissAlert(alertCard) {
  const alertId = parseInt(alertCard.dataset.alertId);
  const product = alertCard.querySelector('.product-name')?.textContent || 'item';

  alertCard.classList.add('dismissing');

  setTimeout(() => {
    alertCard.remove();

    const idx = alertsData.findIndex(a => a.id === alertId);
    if (idx > -1) alertsData.splice(idx, 1);

    updateTabCounts();
    updateHeader();

    // Check if filtered list is now empty
    const visible = document.querySelectorAll('.alert-card').length;
    if (visible === 0) showEmptyState(true);

    announceToSR(`Alert for ${product} has been dismissed`);
  }, 220);
}

// ── Mark All as Read ───────────────────────────
function markAllAsRead() {
  alertsData.forEach(a => { a.read = true; });

  document.querySelectorAll('.alert-card.alert-unread').forEach(card => {
    card.classList.remove('alert-unread');
    card.classList.add('alert-read');
    card.style.background = '#1E1E1E';
    card.style.borderColor = 'rgba(255,255,255,0.06)';
    card.style.opacity = '0.65';

    card.querySelector('.new-badge')?.remove();
    card.dataset.read = 'true';
  });

  updateHeader();
  announceToSR('All alerts marked as read');
}

// ── Screen Reader Announce ─────────────────────
function announceToSR(message) {
  const el = document.getElementById('srAnnouncement');
  if (el) { el.textContent = ''; setTimeout(() => { el.textContent = message; }, 50); }
}

// ── Toast ──────────────────────────────────────
let toastTimer = null;

function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast) return;

  if (toastMsg && msg) toastMsg.textContent = msg;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => hideToast(), 6000);
}

function hideToast() {
  const toast = document.getElementById('toast');
  if (toast) toast.classList.remove('show');
}

// ── Header Date ────────────────────────────────
function setHeaderDate() {
  const el = document.getElementById('headerDate');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });
}

// ── Init ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setHeaderDate();
  updateTabCounts();
  updateHeader();
  renderAlerts();

  // Auto toast on load if unread alerts exist
  const unread = alertsData.filter(a => !a.read).length;
  if (unread > 0) {
    setTimeout(() => showToast(`You have ${unread} unread alert${unread !== 1 ? 's' : ''}.`), 800);
  }

  // ── Event: Filter tabs ──
  document.querySelectorAll('.tab-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => setActiveFilter(btn.dataset.filter));
  });

  // ── Event: Mark all as read ──
  const markAllBtn = document.getElementById('btnMarkAllRead');
  if (markAllBtn) markAllBtn.addEventListener('click', markAllAsRead);

  // ── Event: Dismiss (delegated) ──
  document.getElementById('alertList').addEventListener('click', e => {
    const btn = e.target.closest('.btn-dismiss');
    if (btn) {
      const card = btn.closest('.alert-card');
      if (card) dismissAlert(card);
    }
  });

  // ── Event: Bell button ──
  const bellBtn = document.getElementById('bellBtn');
  if (bellBtn) {
    bellBtn.addEventListener('click', () => {
      const unread = alertsData.filter(a => !a.read).length;
      showToast(unread > 0
        ? `You have ${unread} unread alert${unread !== 1 ? 's' : ''}.`
        : 'All alerts are up to date.');
    });
  }

  // ── Event: Alert pill ──
  const alertPill = document.getElementById('alertPill');
  if (alertPill) alertPill.addEventListener('click', () => setActiveFilter('critical'));

  // ── Event: Toast close ──
  const toastClose = document.getElementById('toastClose');
  if (toastClose) toastClose.addEventListener('click', hideToast);

  lucide.createIcons();
});
