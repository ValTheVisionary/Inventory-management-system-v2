/* ═══════════════════════════════════════════════
   INVENTORY MANAGEMENT SYSTEM — products.js
═══════════════════════════════════════════════ */

// ══════════════════════════════════════════════
// DATA LAYER
// ══════════════════════════════════════════════
let products = [
  { id: 1,  name: 'Wireless Headphones', category: 'Electronics', sku: 'WH-001',  stock: 234, reorderThreshold: 20, price: 89.99,  description: 'Premium wireless over-ear headphones' },
  { id: 2,  name: 'USB-C Hub 7-in-1',   category: 'Electronics', sku: 'UCH-002', stock: 189, reorderThreshold: 25, price: 49.99,  description: 'Multi-port USB-C hub with HDMI and card reader' },
  { id: 3,  name: 'Laptop Stand Pro',    category: 'Accessories', sku: 'LS-003',  stock: 8,   reorderThreshold: 15, price: 34.99,  description: 'Adjustable aluminum laptop stand' },
  { id: 4,  name: 'Mechanical Keyboard', category: 'Peripherals', sku: 'MK-004',  stock: 98,  reorderThreshold: 20, price: 129.99, description: 'TKL mechanical keyboard with Cherry MX switches' },
  { id: 5,  name: 'Webcam HD 1080p',    category: 'Electronics', sku: 'WC-005',  stock: 3,   reorderThreshold: 10, price: 69.99,  description: 'Full HD webcam with built-in noise-cancelling mic' },
  { id: 6,  name: 'Monitor Arm Dual',   category: 'Accessories', sku: 'MA-006',  stock: 45,  reorderThreshold: 10, price: 79.99,  description: 'Fully adjustable dual monitor arm' },
  { id: 7,  name: 'Desk Mat XL',        category: 'Accessories', sku: 'DM-007',  stock: 120, reorderThreshold: 30, price: 24.99,  description: 'Extended gaming and office desk mat, 90×40cm' },
  { id: 8,  name: 'Gaming Mouse Pro',   category: 'Peripherals', sku: 'GM-008',  stock: 5,   reorderThreshold: 15, price: 59.99,  description: 'High DPI gaming mouse with RGB lighting' },
  { id: 9,  name: '4K HDMI Cable 2m',   category: 'Accessories', sku: 'HC-009',  stock: 310, reorderThreshold: 50, price: 12.99,  description: 'High-speed 4K HDMI 2.1 cable' },
  { id: 10, name: 'NVMe SSD 1TB',       category: 'Storage',     sku: 'SSD-010', stock: 62,  reorderThreshold: 20, price: 89.99,  description: 'PCIe Gen4 NVMe M.2 SSD' },
];

let editingProductId = null;
let toastTimer       = null;
let searchDebounce   = null;

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════
const isLowStock = p => p.stock <= p.reorderThreshold;

const $ = id => document.getElementById(id);

function getFilteredProducts() {
  const query = $('search-input').value.toLowerCase().trim();
  const cat   = $('category-filter').value;

  return products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query);
    const matchCat = cat === 'all' || p.category === cat;
    return matchSearch && matchCat;
  });
}

// ══════════════════════════════════════════════
// TABLE RENDER
// ══════════════════════════════════════════════
function renderTable() {
  const tbody    = $('table-body');
  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr class="table-row--empty">
        <td colspan="7">
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
              fill="none" stroke="#444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16.5 9.4l-9-5.19"/>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <p class="empty-state__text">No products match your search.</p>
          </div>
        </td>
      </tr>`;
    updateTableFooter(filtered);
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const low = isLowStock(p);
    return `
      <tr class="table-row ${low ? 'row--low-stock' : ''}" data-id="${p.id}">

        <td class="cell-product-name">${escHtml(p.name)}</td>

        <td class="cell-category">${escHtml(p.category)}</td>

        <td class="cell-sku">${escHtml(p.sku)}</td>

        <td class="cell-stock">
          <span class="stock-value ${low ? 'stock-value--low' : ''}">${p.stock}</span>
          <span class="stock-unit">units</span>
        </td>

        <td class="cell-price">$${p.price.toFixed(2)}</td>

        <td>
          <span class="status-badge ${low ? 'status-badge--low-stock' : 'status-badge--in-stock'}">
            <span class="status-badge__dot"></span>
            ${low ? 'Low Stock' : 'In Stock'}
          </span>
        </td>

        <td class="cell-actions">
          <div class="action-btns">
            <button class="action-btn action-btn--edit" data-action="edit" data-id="${p.id}" title="Edit product">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="action-btn action-btn--delete" data-action="delete" data-id="${p.id}" title="Delete product">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </td>

      </tr>`;
  }).join('');

  updateTableFooter(filtered);
}

function updateTableFooter(filtered) {
  const lowCount = filtered.filter(isLowStock).length;

  $('footer-count').textContent =
    `Showing ${filtered.length} of ${products.length} products`;

  const warning     = $('low-stock-warning');
  const warningText = $('low-stock-warning-text');

  if (lowCount > 0) {
    warningText.textContent = `${lowCount} item${lowCount > 1 ? 's' : ''} need restocking`;
    warning.classList.remove('hidden');
  } else {
    warning.classList.add('hidden');
  }
}

// Prevent XSS from user input rendered into HTML
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ══════════════════════════════════════════════
// SEARCH & FILTER
// ══════════════════════════════════════════════
$('search-input').addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(renderTable, 200);
});

$('category-filter').addEventListener('change', renderTable);

// ══════════════════════════════════════════════
// TABLE ROW ACTIONS (delegated)
// ══════════════════════════════════════════════
$('table-body').addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const id      = parseInt(btn.dataset.id);
  const product = products.find(p => p.id === id);
  if (!product) return;

  if (btn.dataset.action === 'edit') {
    editingProductId = id;
    populateModalForm(product);
    $('modal-title').textContent    = 'Edit Product';
    $('modal-subtitle').textContent = 'Update product details';
    $('btn-save').textContent       = 'Save Changes';
    openModal();
  }

  if (btn.dataset.action === 'delete') {
    deleteProduct(id);
  }
});

// ══════════════════════════════════════════════
// ADD PRODUCT
// ══════════════════════════════════════════════
$('btn-add-product').addEventListener('click', () => {
  editingProductId = null;
  resetModalForm();
  $('modal-title').textContent    = 'Add New Product';
  $('modal-subtitle').textContent = 'Fill in the details to add to inventory';
  $('btn-save').textContent       = 'Add Product';
  openModal();
});

// ══════════════════════════════════════════════
// SAVE PRODUCT (Add & Edit)
// ══════════════════════════════════════════════
$('btn-save').addEventListener('click', () => {
  const name = $('field-name').value.trim();
  const sku  = $('field-sku').value.trim();

  if (!name) { $('field-name').focus(); highlightError('field-name'); return; }
  if (!sku)  { $('field-sku').focus();  highlightError('field-sku');  return; }

  const formData = {
    name,
    sku,
    category:         $('field-category').value,
    stock:            parseInt($('field-stock').value)   || 0,
    reorderThreshold: parseInt($('field-reorder').value) || 0,
    price:            parseFloat($('field-price').value) || 0,
    description:      $('field-description').value.trim(),
  };

  if (editingProductId !== null) {
    const idx = products.findIndex(p => p.id === editingProductId);
    if (idx > -1) products[idx] = { id: editingProductId, ...formData };
  } else {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({ id: newId, ...formData });
  }

  closeModal();
  renderTable();
  updateNavBadge();
});

function highlightError(fieldId) {
  const el = $(fieldId);
  el.style.borderColor = '#FF1744';
  el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
}

// ══════════════════════════════════════════════
// DELETE PRODUCT
// ══════════════════════════════════════════════
function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  products = products.filter(p => p.id !== id);
  renderTable();
  updateNavBadge();
}

// ══════════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════════
function openModal() {
  $('modal-overlay').classList.add('is-open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('field-name').focus(), 120);
}

function closeModal() {
  $('modal-overlay').classList.remove('is-open');
  document.body.style.overflow = '';
  editingProductId = null;
}

function resetModalForm() {
  $('modal-form').reset();
  $('field-category').value = 'Electronics';
  $('field-stock').value    = '0';
  $('field-reorder').value  = '10';
  $('field-price').value    = '0.00';
}

function populateModalForm(p) {
  $('field-name').value        = p.name;
  $('field-sku').value         = p.sku;
  $('field-category').value    = p.category;
  $('field-stock').value       = p.stock;
  $('field-reorder').value     = p.reorderThreshold;
  $('field-price').value       = p.price;
  $('field-description').value = p.description;
}

// Close triggers
$('modal-overlay').addEventListener('click', e => {
  if (e.target === $('modal-overlay')) closeModal();
});
$('modal-close-btn').addEventListener('click', closeModal);
$('btn-cancel').addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ══════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════
function showToast(productName, units) {
  $('toast-product-name').textContent = productName;
  $('toast-units').textContent        = units;
  $('low-stock-toast').classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(dismissToast, 6000);
}

function dismissToast() {
  $('low-stock-toast').classList.remove('is-visible');
  clearTimeout(toastTimer);
}

$('toast-dismiss-btn').addEventListener('click', dismissToast);

// ══════════════════════════════════════════════
// NAV BADGE & ALERT PILL
// ══════════════════════════════════════════════
function updateNavBadge() {
  const lowCount = products.filter(isLowStock).length;

  const badge = $('alerts-badge');
  if (badge) {
    badge.textContent    = lowCount;
    badge.style.display  = lowCount > 0 ? 'flex' : 'none';
  }

  const pill      = $('header-alert-pill');
  const pillCount = pill ? pill.querySelector('.pill-count') : null;
  if (pill && pillCount) {
    pillCount.textContent = lowCount;
    pill.style.display    = lowCount > 0 ? 'flex' : 'none';
  }
}

// ══════════════════════════════════════════════
// BELL & ALERT PILL → TOAST
// ══════════════════════════════════════════════
$('bell-btn').addEventListener('click', () => {
  const lowItem = products.find(isLowStock);
  if (lowItem) showToast(lowItem.name, lowItem.stock);
});

$('header-alert-pill').addEventListener('click', () => {
  const lowItem = products.find(isLowStock);
  if (lowItem) showToast(lowItem.name, lowItem.stock);
});

// ══════════════════════════════════════════════
// HEADER DATE
// ══════════════════════════════════════════════
function initHeaderDate() {
  const el = $('header-date');
  if (el) {
    el.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initHeaderDate();
  renderTable();
  updateNavBadge();

  // Auto-show toast for first low stock item
  const firstLow = products.find(isLowStock);
  if (firstLow) {
    setTimeout(() => showToast(firstLow.name, firstLow.stock), 800);
  }
});