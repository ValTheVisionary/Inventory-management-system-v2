/* ============================================================
   stock.js — Stock Management page logic
   Depends on: dashboard.js (products array + toast logic)
   ============================================================ */

'use strict';

/* ── Mock Data ───────────────────────────────────────────────
   In production this will come from the API.
   Mirrors the same shape used on products.html.
   ─────────────────────────────────────────────────────────── */
const stockProducts = [
  { id: 1,  name: 'Wireless Gaming Mouse',    category: 'Electronics',  sku: 'WGM-2024-001',  stock: 142, reorderThreshold: 50,  price: 79.99  },
  { id: 2,  name: 'USB-C Charging Cable',     category: 'Accessories',  sku: 'USBC-2024-002', stock: 23,  reorderThreshold: 100, price: 12.99  },
  { id: 3,  name: 'Mechanical Keyboard',      category: 'Electronics',  sku: 'MKB-2024-003',  stock: 0,   reorderThreshold: 25,  price: 129.99 },
  { id: 4,  name: 'HD Webcam 1080p',          category: 'Peripherals',  sku: 'WBC-2024-004',  stock: 67,  reorderThreshold: 30,  price: 89.99  },
  { id: 5,  name: 'Laptop Stand Adjustable',  category: 'Accessories',  sku: 'LSA-2024-005',  stock: 12,  reorderThreshold: 40,  price: 34.99  },
  { id: 6,  name: 'HDMI Cable 4K 2m',        category: 'Accessories',  sku: 'HDM-2024-006',  stock: 198, reorderThreshold: 60,  price: 18.99  },
  { id: 7,  name: 'Wireless Earbuds Pro',     category: 'Electronics',  sku: 'WEP-2024-007',  stock: 8,   reorderThreshold: 35,  price: 149.99 },
  { id: 8,  name: 'USB Hub 7-Port',           category: 'Peripherals',  sku: 'UHB-2024-008',  stock: 0,   reorderThreshold: 20,  price: 45.99  },
  { id: 9,  name: 'SSD 1TB NVMe',            category: 'Storage',      sku: 'SSD-2024-009',  stock: 54,  reorderThreshold: 25,  price: 109.99 },
  { id: 10, name: 'Network Switch 8-Port',    category: 'Networking',   sku: 'NSW-2024-010',  stock: 31,  reorderThreshold: 15,  price: 59.99  },
  { id: 11, name: 'Ergonomic Mouse Pad XL',   category: 'Accessories',  sku: 'EMP-2024-011',  stock: 76,  reorderThreshold: 30,  price: 22.99  },
  { id: 12, name: 'Bluetooth Speaker',        category: 'Electronics',  sku: 'BTS-2024-012',  stock: 4,   reorderThreshold: 20,  price: 69.99  },
  { id: 13, name: 'USB-A to USB-C Adapter',   category: 'Accessories',  sku: 'UAC-2024-013',  stock: 210, reorderThreshold: 80,  price: 9.99   },
  { id: 14, name: 'Portable SSD 500GB',       category: 'Storage',      sku: 'PSS-2024-014',  stock: 18,  reorderThreshold: 25,  price: 79.99  },
  { id: 15, name: 'Cat6 Ethernet Cable 5m',   category: 'Networking',   sku: 'CAT-2024-015',  stock: 95,  reorderThreshold: 40,  price: 14.99  },
  { id: 16, name: 'Monitor Arm Dual',         category: 'Peripherals',  sku: 'MAD-2024-016',  stock: 0,   reorderThreshold: 10,  price: 119.99 },
  { id: 17, name: 'Noise Cancelling Headset', category: 'Electronics',  sku: 'NCH-2024-017',  stock: 29,  reorderThreshold: 30,  price: 199.99 },
  { id: 18, name: 'Wireless Charger Pad',     category: 'Accessories',  sku: 'WCP-2024-018',  stock: 53,  reorderThreshold: 25,  price: 29.99  },
  { id: 19, name: 'PCIe Wi-Fi 6 Card',        category: 'Networking',   sku: 'PWC-2024-019',  stock: 7,   reorderThreshold: 15,  price: 49.99  },
  { id: 20, name: 'Mechanical Numpad',        category: 'Peripherals',  sku: 'MNP-2024-020',  stock: 41,  reorderThreshold: 20,  price: 54.99  },
  { id: 21, name: 'HDD 4TB Desktop',          category: 'Storage',      sku: 'HDD-2024-021',  stock: 22,  reorderThreshold: 12,  price: 84.99  },
  { id: 22, name: 'USB-C Docking Station',    category: 'Peripherals',  sku: 'UDS-2024-022',  stock: 0,   reorderThreshold: 10,  price: 159.99 },
  { id: 23, name: 'Smart Power Strip',        category: 'Accessories',  sku: 'SPS-2024-023',  stock: 88,  reorderThreshold: 35,  price: 39.99  },
  { id: 24, name: 'Gaming Headset RGB',       category: 'Electronics',  sku: 'GHR-2024-024',  stock: 15,  reorderThreshold: 20,  price: 89.99  },
];

/* ── State ───────────────────────────────────────────────────── */
let activeFilter    = 'All';
let searchQuery     = '';
let restockQuantity = 50;
const stockAdjustments = {};  // { productId: adjustmentValue }

/* ── Stock Status Helper ─────────────────────────────────────── */
function getStockStatus(stock, threshold) {
  if (stock === 0)             return 'Out of Stock';
  if (stock <= threshold)      return 'Low Stock';
  return 'In Stock';
}

function statusClass(status) {
  return status === 'In Stock' ? 'in-stock'
       : status === 'Low Stock' ? 'low-stock'
       : 'out-stock';
}

function statusBadgeClass(status) {
  return status === 'In Stock' ? 'status-in-stock'
       : status === 'Low Stock' ? 'status-low-stock'
       : 'status-out-stock';
}

/* ── Escape helper ───────────────────────────────────────────── */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Row Renderer ────────────────────────────────────────────── */
function renderRow(p) {
  const status   = getStockStatus(p.stock, p.reorderThreshold);
  const sc       = statusClass(status);
  const bc       = statusBadgeClass(status);
  const isAlert  = status !== 'In Stock';
  const adj      = stockAdjustments[p.id] || 0;
  const adjClass = adj > 0 ? 'positive' : adj < 0 ? 'negative' : '';

  return `
    <tr
      data-product-id="${p.id}"
      data-current-stock="${p.stock}"
      data-reorder-threshold="${p.reorderThreshold}"
      data-status="${status}"
      class="${isAlert ? 'row-low-stock' : ''}"
    >
      <td class="td-checkbox">
        <input type="checkbox" aria-label="Select ${esc(p.name)}">
      </td>
      <td class="td-product-name">${esc(p.name)}</td>
      <td class="td-sku">${esc(p.sku)}</td>
      <td class="td-category">${esc(p.category)}</td>
      <td>
        <span class="td-stock-value ${sc}">
          ${p.stock} <span class="td-stock-units">units</span>
        </span>
      </td>
      <td class="td-threshold">${p.reorderThreshold}</td>
      <td>
        <span class="status-badge ${bc}">
          <span class="status-dot"></span>
          ${status}
        </span>
      </td>
      <td>
        <div class="stock-adjust-controls">
          <button class="adjust-btn adjust-minus" aria-label="Decrease stock for ${esc(p.name)}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <input
            type="number"
            class="adjust-input${adjClass ? ' ' + adjClass : ''}"
            value="${adj}"
            aria-label="Stock adjustment for ${esc(p.name)}"
          >
          <button class="adjust-btn adjust-plus" aria-label="Increase stock for ${esc(p.name)}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button class="apply-btn" style="display:${adj !== 0 ? 'block' : 'none'}">Apply</button>
        </div>
      </td>
    </tr>`;
}

/* ── Filtered products ───────────────────────────────────────── */
function getFiltered() {
  return stockProducts.filter(p => {
    const status      = getStockStatus(p.stock, p.reorderThreshold);
    const matchSearch = !searchQuery
      || p.name.toLowerCase().includes(searchQuery)
      || p.sku.toLowerCase().includes(searchQuery);
    const matchFilter = activeFilter === 'All' || status === activeFilter;
    return matchSearch && matchFilter;
  });
}

/* ── Render Table ────────────────────────────────────────────── */
function renderTable() {
  const tbody    = document.getElementById('stock-table-body');
  const filtered = getFiltered();

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="8" class="empty-state-cell">
          <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          No products match your filter.
        </td>
      </tr>`;
  } else {
    tbody.innerHTML = filtered.map(renderRow).join('');
  }

  updateFooter(filtered.length);
  updateStatistics();
  updateTabCounts();
  updateNavBadge();
  updateSelectAllState();
}

/* ── Statistics ──────────────────────────────────────────────── */
function updateStatistics() {
  let inStock = 0, lowStock = 0, outStock = 0;
  stockProducts.forEach(p => {
    const s = getStockStatus(p.stock, p.reorderThreshold);
    if (s === 'In Stock')      inStock++;
    else if (s === 'Low Stock') lowStock++;
    else                        outStock++;
  });
  document.getElementById('stat-total').textContent     = stockProducts.length;
  document.getElementById('stat-in-stock').textContent  = inStock;
  document.getElementById('stat-low-stock').textContent = lowStock;
  document.getElementById('stat-out-stock').textContent = outStock;
}

function updateTabCounts() {
  let inStock = 0, lowStock = 0, outStock = 0;
  stockProducts.forEach(p => {
    const s = getStockStatus(p.stock, p.reorderThreshold);
    if (s === 'In Stock')       inStock++;
    else if (s === 'Low Stock') lowStock++;
    else                        outStock++;
  });
  document.getElementById('tab-count-all').textContent  = `(${stockProducts.length})`;
  document.getElementById('tab-count-in').textContent   = `(${inStock})`;
  document.getElementById('tab-count-low').textContent  = `(${lowStock})`;
  document.getElementById('tab-count-out').textContent  = `(${outStock})`;
}

/* ── Footer ──────────────────────────────────────────────────── */
function updateFooter(shownCount) {
  const selected = document.querySelectorAll('.stock-table tbody input[type="checkbox"]:checked').length;
  const footerEl = document.getElementById('footer-text');
  let text = `Showing ${shownCount} of ${stockProducts.length} products`;
  if (selected > 0) text += ` · ${selected} selected`;
  footerEl.textContent = text;
}

/* ── Nav Badge ───────────────────────────────────────────────── */
function updateNavBadge() {
  const lowCount = stockProducts.filter(p => p.stock <= p.reorderThreshold).length;
  const badge    = document.getElementById('alerts-badge');
  const pill     = document.getElementById('header-alert-pill');

  if (badge) {
    badge.textContent = lowCount;
    badge.hidden      = lowCount === 0;
  }
  if (pill) {
    const countEl = pill.querySelector('.pill-count');
    if (countEl) countEl.textContent = lowCount;
    pill.hidden = lowCount === 0;
  }
}

/* ── Select All State ────────────────────────────────────────── */
function updateSelectAllState() {
  const selectAll   = document.getElementById('select-all');
  const checkboxes  = document.querySelectorAll('.stock-table tbody input[type="checkbox"]');
  const checked     = document.querySelectorAll('.stock-table tbody input[type="checkbox"]:checked');
  if (!selectAll || checkboxes.length === 0) return;
  selectAll.indeterminate = checked.length > 0 && checked.length < checkboxes.length;
  selectAll.checked       = checked.length > 0 && checked.length === checkboxes.length;
}

function updateBulkRestockBtn() {
  const selected = document.querySelectorAll('.stock-table tbody input[type="checkbox"]:checked').length;
  const btn      = document.getElementById('bulk-restock-btn');
  const label    = selected > 0 ? `Restock ${selected} Selected` : 'Bulk Restock Low Stock';
  btn.innerHTML  = `
    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
    </svg>
    ${label}`;
}

/* ── Stock Update ────────────────────────────────────────────── */
function applyStockUpdate(productId, newStock) {
  const idx = stockProducts.findIndex(p => p.id === productId);
  if (idx === -1) return;

  stockProducts[idx].stock = newStock;

  const row           = document.querySelector(`tr[data-product-id="${productId}"]`);
  if (!row) return;

  row.dataset.currentStock = newStock;

  const threshold  = stockProducts[idx].reorderThreshold;
  const newStatus  = getStockStatus(newStock, threshold);
  const sc         = statusClass(newStatus);
  const bc         = statusBadgeClass(newStatus);
  const isAlert    = newStatus !== 'In Stock';

  // Update row highlight
  row.classList.toggle('row-low-stock', isAlert);

  // Update stock cell
  const stockCell = row.querySelector('.td-stock-value');
  stockCell.className       = `td-stock-value ${sc}`;
  stockCell.innerHTML       = `${newStock} <span class="td-stock-units">units</span>`;

  // Update status badge
  const badge     = row.querySelector('.status-badge');
  badge.className = `status-badge ${bc}`;
  badge.innerHTML = `<span class="status-dot"></span>${newStatus}`;

  // Update row data-status
  row.dataset.status = newStatus;

  updateStatistics();
  updateTabCounts();
  updateNavBadge();
}

/* ── Adjust input helper ─────────────────────────────────────── */
function updateAdjustInput(input, value) {
  input.classList.remove('positive', 'negative');
  if (value > 0) input.classList.add('positive');
  if (value < 0) input.classList.add('negative');
}

function toggleApplyBtn(row, value) {
  const applyBtn = row.querySelector('.apply-btn');
  if (applyBtn) applyBtn.style.display = value !== 0 ? 'block' : 'none';
}

/* ── Event Delegation — table body ───────────────────────────── */
document.getElementById('stock-table-body').addEventListener('click', e => {

  // Minus button
  if (e.target.closest('.adjust-minus')) {
    const row       = e.target.closest('tr');
    const id        = parseInt(row.dataset.productId, 10);
    const input     = row.querySelector('.adjust-input');
    stockAdjustments[id] = (stockAdjustments[id] || 0) - 1;
    input.value = stockAdjustments[id];
    updateAdjustInput(input, stockAdjustments[id]);
    toggleApplyBtn(row, stockAdjustments[id]);
  }

  // Plus button
  if (e.target.closest('.adjust-plus')) {
    const row       = e.target.closest('tr');
    const id        = parseInt(row.dataset.productId, 10);
    const input     = row.querySelector('.adjust-input');
    stockAdjustments[id] = (stockAdjustments[id] || 0) + 1;
    input.value = stockAdjustments[id];
    updateAdjustInput(input, stockAdjustments[id]);
    toggleApplyBtn(row, stockAdjustments[id]);
  }

  // Apply button
  if (e.target.closest('.apply-btn')) {
    const row        = e.target.closest('tr');
    const id         = parseInt(row.dataset.productId, 10);
    const adj        = stockAdjustments[id] || 0;
    const current    = parseInt(row.dataset.currentStock, 10);
    const newStock   = Math.max(0, current + adj);

    applyStockUpdate(id, newStock);

    delete stockAdjustments[id];
    const input = row.querySelector('.adjust-input');
    input.value = 0;
    updateAdjustInput(input, 0);
    toggleApplyBtn(row, 0);
  }

  // Row checkbox
  if (e.target.matches('input[type="checkbox"]')) {
    const row = e.target.closest('tr');
    row.classList.toggle('row-selected', e.target.checked);
    updateSelectAllState();
    updateBulkRestockBtn();
    updateFooter(getFiltered().length);
  }
});

// Manual adjust input typing
document.getElementById('stock-table-body').addEventListener('input', e => {
  if (!e.target.classList.contains('adjust-input')) return;
  const row   = e.target.closest('tr');
  const id    = parseInt(row.dataset.productId, 10);
  const value = parseInt(e.target.value, 10) || 0;
  stockAdjustments[id] = value;
  updateAdjustInput(e.target, value);
  toggleApplyBtn(row, value);
});

/* ── Select All ──────────────────────────────────────────────── */
document.getElementById('select-all').addEventListener('change', e => {
  const checked = e.target.checked;
  document.querySelectorAll('.stock-table tbody input[type="checkbox"]').forEach(cb => {
    cb.checked = checked;
    cb.closest('tr').classList.toggle('row-selected', checked);
  });
  updateBulkRestockBtn();
  updateFooter(getFiltered().length);
});

/* ── Search ──────────────────────────────────────────────────── */
let searchDebounce;
document.getElementById('search-input').addEventListener('input', e => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderTable();
  }, 200);
});

/* ── Filter Tabs ─────────────────────────────────────────────── */
document.querySelectorAll('.tab-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-filter-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    activeFilter = btn.dataset.filter;
    renderTable();
  });
});

/* ── Restock Qty ─────────────────────────────────────────────── */
document.getElementById('restock-qty').addEventListener('input', e => {
  const val = parseInt(e.target.value, 10);
  restockQuantity = val >= 1 ? val : 1;
  if (val < 1) e.target.value = 1;
});

/* ── Bulk Restock ────────────────────────────────────────────── */
document.getElementById('bulk-restock-btn').addEventListener('click', () => {
  const selectedRows = document.querySelectorAll('.stock-table tbody input[type="checkbox"]:checked');

  if (selectedRows.length > 0) {
    selectedRows.forEach(cb => {
      const row     = cb.closest('tr');
      const id      = parseInt(row.dataset.productId, 10);
      const current = parseInt(row.dataset.currentStock, 10);
      applyStockUpdate(id, current + restockQuantity);
      cb.checked = false;
      row.classList.remove('row-selected');
    });
  } else {
    // Restock all low-stock items
    stockProducts
      .filter(p => getStockStatus(p.stock, p.reorderThreshold) !== 'In Stock')
      .forEach(p => applyStockUpdate(p.id, p.stock + restockQuantity));
  }

  renderTable();
  updateBulkRestockBtn();
});

/* ── Export CSV ──────────────────────────────────────────────── */
document.getElementById('export-btn').addEventListener('click', () => {
  const filtered = getFiltered();
  const headers  = ['Product Name', 'SKU', 'Category', 'Stock', 'Reorder Threshold', 'Status'];
  const rows     = filtered.map(p => [
    p.name,
    p.sku,
    p.category,
    p.stock,
    p.reorderThreshold,
    getStockStatus(p.stock, p.reorderThreshold),
  ]);

  const csv  = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'stock-report.csv';
  a.click();
  URL.revokeObjectURL(url);
});

/* ── Toast ───────────────────────────────────────────────────── */
let toastTimer;

function showToast(name, units) {
  const toast = document.getElementById('low-stock-toast');
  document.getElementById('toast-product-name').textContent = name;
  document.getElementById('toast-units').textContent        = units;
  toast.hidden = false;
  toast.classList.add('toast--visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(dismissToast, 6000);
  lucide.createIcons();
}

function dismissToast() {
  const toast = document.getElementById('low-stock-toast');
  toast.classList.remove('toast--visible');
  setTimeout(() => { toast.hidden = true; }, 300);
}

document.getElementById('toast-dismiss-btn').addEventListener('click', dismissToast);

document.getElementById('bell-btn').addEventListener('click', () => {
  const low = stockProducts.find(p => p.stock <= p.reorderThreshold);
  if (low) showToast(low.name, low.stock);
});

document.getElementById('header-alert-pill').addEventListener('click', () => {
  const low = stockProducts.find(p => p.stock <= p.reorderThreshold);
  if (low) showToast(low.name, low.stock);
});

/* ── Init ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Header date
  const dateEl = document.getElementById('header-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  renderTable();
  lucide.createIcons();

  // Auto toast for first low-stock item
  const lowItem = stockProducts.find(p => p.stock <= p.reorderThreshold);
  if (lowItem) setTimeout(() => showToast(lowItem.name, lowItem.stock), 800);
});