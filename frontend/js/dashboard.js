/* ═══════════════════════════════════════════════
   INVENTORY MANAGEMENT SYSTEM — app.js
═══════════════════════════════════════════════ */

// ── Sample Product Data ──
const products = [
  { id: 1,  name: 'Wireless Headphones',  category: 'Electronics',   sku: 'EL-001', stock: 234, reorderThreshold: 20, price: 89.99  },
  { id: 2,  name: 'USB-C Hub Pro',        category: 'Electronics',   sku: 'EL-002', stock: 189, reorderThreshold: 15, price: 49.99  },
  { id: 3,  name: 'Laptop Stand Pro',     category: 'Accessories',   sku: 'AC-001', stock: 8,   reorderThreshold: 25, price: 34.99  },
  { id: 4,  name: 'Mechanical Keyboard',  category: 'Electronics',   sku: 'EL-003', stock: 98,  reorderThreshold: 20, price: 129.99 },
  { id: 5,  name: 'HD Webcam',            category: 'Electronics',   sku: 'EL-004', stock: 5,   reorderThreshold: 20, price: 79.99  },
  { id: 6,  name: 'Ergonomic Mouse',      category: 'Accessories',   sku: 'AC-002', stock: 142, reorderThreshold: 15, price: 59.99  },
  { id: 7,  name: 'Monitor Arm',          category: 'Furniture',     sku: 'FU-001', stock: 3,   reorderThreshold: 10, price: 44.99  },
  { id: 8,  name: 'Cable Organizer',      category: 'Accessories',   sku: 'AC-003', stock: 320, reorderThreshold: 30, price: 14.99  },
  { id: 9,  name: 'LED Desk Lamp',        category: 'Lighting',      sku: 'LT-001', stock: 67,  reorderThreshold: 10, price: 29.99  },
  { id: 10, name: 'Phone Stand',          category: 'Accessories',   sku: 'AC-004', stock: 88,  reorderThreshold: 20, price: 19.99  },
  { id: 11, name: 'Laptop Backpack',      category: 'Bags',          sku: 'BG-001', stock: 54,  reorderThreshold: 10, price: 69.99  },
  { id: 12, name: 'Screen Cleaner Kit',   category: 'Maintenance',   sku: 'MN-001', stock: 210, reorderThreshold: 30, price: 9.99   },
];

// ── Sample Activity Data ──
const activityItems = [
  { type: 'update', action: 'STOCK UPDATED',  product: 'Wireless Headphones',  detail: 'Stock adjusted from 210 to 234 units', time: '2 min ago'  },
  { type: 'add',    action: 'PRODUCT ADDED',  product: 'Screen Cleaner Kit',   detail: 'New product added to Maintenance category', time: '18 min ago' },
  { type: 'alert',  action: 'LOW STOCK',      product: 'HD Webcam',            detail: 'Only 5 units remaining — below threshold of 20', time: '45 min ago' },
  { type: 'update', action: 'STOCK UPDATED',  product: 'Laptop Backpack',      detail: 'Stock adjusted from 60 to 54 units', time: '1 hr ago'   },
  { type: 'alert',  action: 'LOW STOCK',      product: 'Monitor Arm',          detail: 'Only 3 units remaining — below threshold of 10', time: '2 hrs ago'  },
  { type: 'add',    action: 'PRODUCT ADDED',  product: 'Ergonomic Mouse',      detail: 'New product added to Accessories category', time: '4 hrs ago'  },
];

// ══════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      const page  = item.dataset.page;
      const label = item.dataset.label;

      document.getElementById('header-title').textContent = label;

      document.querySelectorAll('.page-section').forEach(s => s.hidden = true);
      const target = document.getElementById(`page-${page}`);
      if (target) target.hidden = false;

      // Re-init lucide icons after page switch
      lucide.createIcons();
    });
  });
}

// ══════════════════════════════════════════════
// HEADER DATE
// ══════════════════════════════════════════════
function initHeaderDate() {
  const dateEl = document.getElementById('header-date');
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateEl.textContent = new Date().toLocaleDateString('en-US', opts);
}

// ══════════════════════════════════════════════
// STAT CARDS
// ══════════════════════════════════════════════
function renderStatCards() {
  const lowStock   = products.filter(p => p.stock <= p.reorderThreshold);
  const totalValue = products.reduce((s, p) => s + (p.stock * p.price), 0);
  const uniqueCats = new Set(products.map(p => p.category)).size;

  document.getElementById('stat-total-products').textContent  = products.length;
  document.getElementById('stat-total-categories').textContent = uniqueCats;
  document.getElementById('stat-low-stock').textContent       = lowStock.length;
  document.getElementById('stat-total-value').textContent     =
    '$' + totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 });

  const badge = document.getElementById('alerts-badge');
  badge.textContent = lowStock.length;
  badge.hidden = lowStock.length === 0;
}

// ══════════════════════════════════════════════
// ACTIVITY FEED
// ══════════════════════════════════════════════
function renderActivityFeed() {
  const list = document.getElementById('activity-list');
  list.innerHTML = activityItems.map(item => `
    <div class="activity-item">
      <div class="activity-item__dot dot--${item.type}"></div>
      <div class="activity-item__body">
        <div class="activity-item__top">
          <span class="activity-item__tag tag--${item.type}">${item.action}</span>
          <span class="activity-item__name">${item.product}</span>
        </div>
        <p class="activity-item__detail">${item.detail}</p>
      </div>
      <span class="activity-item__time">${item.time}</span>
    </div>
  `).join('');
}

// ══════════════════════════════════════════════
// CHARTS
// ══════════════════════════════════════════════
function initCharts() {
  Chart.defaults.color        = '#555555';
  Chart.defaults.font.family  = "'Inter', sans-serif";
  Chart.defaults.font.size    = 11;

  const tooltipDefaults = {
    backgroundColor:  '#252525',
    borderColor:      'rgba(255,255,255,0.08)',
    borderWidth:      1,
    titleColor:       '#999',
    bodyColor:        '#E53935',
    bodyFont:         { weight: '700', size: 14 },
    padding:          10,
    cornerRadius:     8,
    displayColors:    false,
  };

  // ── Line Chart: Stock Levels Over Time ──
  const lineCtx = document.getElementById('chart-stock-time').getContext('2d');
  new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'],
      datasets: [{
        label: 'Units',
        data: [4200, 3800, 5100, 4700, 5900, 5400, 6200, 5800],
        borderColor:          '#E53935',
        borderWidth:           2.5,
        pointBackgroundColor: '#E53935',
        pointRadius:           4,
        pointHoverRadius:      6,
        tension:               0.4,
        fill:                  false,
      }]
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      plugins: {
        legend:  { display: false },
        tooltip: tooltipDefaults,
      },
      scales: {
        x: {
          grid:  { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#555' },
        },
        y: {
          grid:  { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#555' },
        },
      },
    }
  });

  // ── Bar Chart: Top Products by Stock ──
  const barCtx = document.getElementById('chart-top-products').getContext('2d');
  new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: ['Headphones','USB-C Hub','Laptop Stand','Keyboard','Webcam'],
      datasets: [{
        label: 'Stock',
        data: [234, 189, 156, 98, 67],
        backgroundColor: '#E53935',
        borderRadius:    4,
        borderSkipped:   false,
      }]
    },
    options: {
      indexAxis:           'y',
      responsive:          true,
      maintainAspectRatio: false,
      plugins: {
        legend:  { display: false },
        tooltip: tooltipDefaults,
      },
      scales: {
        x: {
          grid:  { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#555' },
        },
        y: {
          grid:  { display: false },
          ticks: { color: '#888' },
        },
      },
    }
  });
}

// ══════════════════════════════════════════════
// TOAST NOTIFICATION
// ══════════════════════════════════════════════
function showToast(productName, units) {
  const toast = document.getElementById('low-stock-toast');
  toast.querySelector('.toast__product').textContent = productName;
  toast.querySelector('.toast__units').textContent   = units;
  toast.hidden = false;
  toast.classList.add('toast--visible');
  lucide.createIcons();

  // Auto-dismiss after 6 seconds
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => dismissToast(), 6000);
}

function dismissToast() {
  const toast = document.getElementById('low-stock-toast');
  toast.classList.remove('toast--visible');
  setTimeout(() => { toast.hidden = true; }, 300);
}

document.getElementById('toast-dismiss').addEventListener('click', dismissToast);

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initHeaderDate();
  initNavigation();
  renderStatCards();
  renderActivityFeed();
  initCharts();

  // Auto-show toast on load after 800ms
  setTimeout(() => showToast('Laptop Stand Pro', 8), 800);
});