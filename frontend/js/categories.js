/* ============================================================
   categories.js — Categories page logic
   Depends on: dashboard.js (for products array + toast/nav logic)
   ============================================================ */

'use strict';

/* ── Data Layer ──────────────────────────────────────────────── */
const categories = [
  { id: 1, name: 'Electronics', icon: '⚡', count: 24 },
  { id: 2, name: 'Accessories', icon: '🔧', count: 18 },
  { id: 3, name: 'Peripherals', icon: '🖥️', count: 12 },
  { id: 4, name: 'Software',    icon: '💿', count: 8  },
  { id: 5, name: 'Storage',     icon: '💾', count: 15 },
  { id: 6, name: 'Networking',  icon: '📡', count: 9  },
];

const iconOptions = ['⚡', '🔧', '🖥️', '💿', '💾', '📡', '📦', '🛒', '🔌', '📷', '🖱️', '⌨️'];

let editingCategoryId = null;
let selectedIcon      = iconOptions[0];

/* ── Helpers ─────────────────────────────────────────────────── */
function getMaxCount() {
  if (!categories.length) return 1;
  return Math.max(...categories.map(c => c.count));
}

function getTotalProducts() {
  return categories.reduce((sum, c) => sum + c.count, 0);
}

/* ── Grid Render ─────────────────────────────────────────────── */
function renderCategoryGrid() {
  const grid     = document.getElementById('category-grid');
  const maxCount = getMaxCount();

  if (categories.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
        <p class="empty-state__text">No categories yet. Add your first one.</p>
      </div>`;
    updateGridFooter();
    lucide.createIcons();
    return;
  }

  grid.innerHTML = categories.map(cat => {
    const pct = maxCount > 0 ? Math.round((cat.count / maxCount) * 100) : 0;
    return `
      <div class="category-card" data-id="${cat.id}">
        <div class="card-top-row">
          <div class="card-icon-box" aria-hidden="true">${cat.icon}</div>
          <button
            class="card-edit-btn"
            data-action="edit"
            data-id="${cat.id}"
            aria-label="Edit ${cat.name}"
          >
            <i data-lucide="edit-2"></i>
          </button>
        </div>
        <h3 class="card-name">${cat.name}</h3>
        <p class="card-count">${cat.count} product${cat.count === 1 ? '' : 's'} listed</p>
        <div class="card-progress">
          <div class="card-progress__header">
            <span class="card-progress__label">Capacity</span>
            <span class="card-progress__pct">${pct}%</span>
          </div>
          <div class="card-progress__track">
            <div
              class="card-progress__fill"
              data-width="${pct}"
              style="width: 0%"
            ></div>
          </div>
        </div>
      </div>`;
  }).join('');

  // Re-init Lucide icons injected into the grid
  lucide.createIcons();

  // Animate progress bars: double-rAF ensures transition fires after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.card-progress__fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
    });
  });

  updateGridFooter();
}

function updateGridFooter() {
  const catEl = document.getElementById('footer-cat-count');
  const totEl = document.getElementById('footer-product-total');
  if (catEl) catEl.textContent = categories.length;
  if (totEl) totEl.textContent = getTotalProducts();

  // Keep page subtitle in sync
  const subtitle = document.getElementById('page-subtitle');
  if (subtitle) {
    subtitle.textContent = `${categories.length} ${categories.length === 1 ? 'category' : 'categories'} · manage your product groups`;
  }
}

/* ── Nav Badge Update ────────────────────────────────────────── */
function updateNavBadge() {
  // Uses the shared `products` array from dashboard.js if available
  const lowCount = (typeof products !== 'undefined')
    ? products.filter(p => p.stock <= p.reorderThreshold).length
    : 0;

  const badge = document.getElementById('alerts-badge');
  if (badge) {
    badge.textContent   = lowCount;
    badge.style.display = lowCount > 0 ? 'flex' : 'none';
  }

  const pill = document.getElementById('header-alert-pill');
  if (pill) {
    const countEl = pill.querySelector('.pill-count');
    if (countEl) countEl.textContent = lowCount;
    pill.style.display = lowCount > 0 ? 'flex' : 'none';
  }
}

/* ── Icon Picker ─────────────────────────────────────────────── */
function renderIconPicker() {
  const picker = document.getElementById('icon-picker');
  if (!picker) return;

  picker.innerHTML = iconOptions.map((icon, i) => `
    <button
      class="icon-option${icon === selectedIcon ? ' is-selected' : ''}"
      data-icon="${icon}"
      type="button"
      aria-label="Select icon ${icon}"
      aria-pressed="${icon === selectedIcon}"
    >${icon}</button>
  `).join('');
}

document.getElementById('icon-picker').addEventListener('click', e => {
  const opt = e.target.closest('.icon-option');
  if (!opt) return;

  selectedIcon = opt.dataset.icon;

  document.querySelectorAll('.icon-option').forEach(o => {
    const active = o === opt;
    o.classList.toggle('is-selected', active);
    o.setAttribute('aria-pressed', active);
  });
});

/* ── Modal Open / Close ──────────────────────────────────────── */
function openModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  // Re-init lucide inside modal (X icon)
  lucide.createIcons();
  setTimeout(() => {
    const nameField = document.getElementById('field-name');
    if (nameField) nameField.focus();
  }, 120);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('is-open');
  document.body.style.overflow = '';
  editingCategoryId = null;
}

function resetModalForm() {
  document.getElementById('field-name').value  = '';
  document.getElementById('field-count').value = '0';
  selectedIcon = iconOptions[0];
  document.querySelectorAll('.icon-option').forEach((opt, i) => {
    const active = i === 0;
    opt.classList.toggle('is-selected', active);
    opt.setAttribute('aria-pressed', active);
  });
  // Clear any validation error state
  const nameField = document.getElementById('field-name');
  if (nameField) nameField.style.borderColor = '';
}

function populateModalForm(cat) {
  selectedIcon = cat.icon;
  document.querySelectorAll('.icon-option').forEach(opt => {
    const active = opt.dataset.icon === cat.icon;
    opt.classList.toggle('is-selected', active);
    opt.setAttribute('aria-pressed', active);
  });
  document.getElementById('field-name').value  = cat.name;
  document.getElementById('field-count').value = cat.count;
}

function setDeleteBtnVisibility(show) {
  const btn = document.getElementById('btn-delete-category');
  if (btn) btn.style.display = show ? 'inline-flex' : 'none';
}

/* ── Close triggers ──────────────────────────────────────────── */
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.getElementById('modal-close-btn').addEventListener('click', closeModal);
document.getElementById('btn-cancel').addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ── Add Category Flow ───────────────────────────────────────── */
document.getElementById('btn-add-category').addEventListener('click', () => {
  editingCategoryId = null;
  resetModalForm();
  document.getElementById('modal-title').textContent           = 'Add New Category';
  document.querySelector('.modal-subtitle').textContent        = 'Create a new product category';
  document.getElementById('btn-save').textContent              = 'Add Category';
  setDeleteBtnVisibility(false);
  openModal();
});

/* ── Edit Category Flow ──────────────────────────────────────── */
document.getElementById('category-grid').addEventListener('click', e => {
  const btn = e.target.closest('[data-action="edit"]');
  if (!btn) return;

  const id  = parseInt(btn.dataset.id, 10);
  const cat = categories.find(c => c.id === id);
  if (!cat) return;

  editingCategoryId = id;
  populateModalForm(cat);
  document.getElementById('modal-title').textContent           = 'Edit Category';
  document.querySelector('.modal-subtitle').textContent        = 'Update category details';
  document.getElementById('btn-save').textContent              = 'Save Changes';
  setDeleteBtnVisibility(true);
  openModal();
});

/* ── Save Category ───────────────────────────────────────────── */
document.getElementById('btn-save').addEventListener('click', () => {
  const nameField  = document.getElementById('field-name');
  const name       = nameField.value.trim();
  const count      = parseInt(document.getElementById('field-count').value, 10) || 0;

  if (!name) {
    highlightError(nameField);
    return;
  }

  if (editingCategoryId !== null) {
    const idx = categories.findIndex(c => c.id === editingCategoryId);
    if (idx > -1) {
      categories[idx] = { ...categories[idx], name, icon: selectedIcon, count };
    }
  } else {
    const newId = categories.length > 0
      ? Math.max(...categories.map(c => c.id)) + 1
      : 1;
    categories.push({ id: newId, name, icon: selectedIcon, count });
  }

  closeModal();
  renderCategoryGrid();
  updateNavBadge();
});

/* ── Delete Category ─────────────────────────────────────────── */
document.getElementById('btn-delete-category').addEventListener('click', () => {
  if (!editingCategoryId) return;
  if (!confirm('Delete this category? This cannot be undone.')) return;

  const idx = categories.findIndex(c => c.id === editingCategoryId);
  if (idx > -1) categories.splice(idx, 1);

  closeModal();
  renderCategoryGrid();
  updateNavBadge();
});

/* ── Validation Error Shake ──────────────────────────────────── */
function highlightError(el) {
  el.style.borderColor = '#FF1744';
  el.focus();
  el.animate(
    [
      { transform: 'translateX(-4px)' },
      { transform: 'translateX(4px)'  },
      { transform: 'translateX(-3px)' },
      { transform: 'translateX(3px)'  },
      { transform: 'translateX(0)'    },
    ],
    { duration: 300, easing: 'ease' }
  );
  el.addEventListener('input', () => {
    el.style.borderColor = '';
  }, { once: true });
}

/* ── Toast ───────────────────────────────────────────────────── */
let toastTimer;

function showToast(productName, units) {
  const nameEl  = document.getElementById('toast-product-name');
  const unitsEl = document.getElementById('toast-units');
  if (nameEl)  nameEl.textContent  = productName;
  if (unitsEl) unitsEl.textContent = units;

  const toast = document.getElementById('low-stock-toast');
  if (toast) toast.classList.add('is-visible');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(dismissToast, 6000);

  lucide.createIcons();
}

function dismissToast() {
  const toast = document.getElementById('low-stock-toast');
  if (toast) toast.classList.remove('is-visible');
  clearTimeout(toastTimer);
}

document.getElementById('toast-dismiss-btn').addEventListener('click', dismissToast);

// Bell button re-triggers toast
const bellBtn = document.getElementById('bell-btn');
if (bellBtn) {
  bellBtn.addEventListener('click', () => {
    if (typeof products !== 'undefined') {
      const lowItem = products.find(p => p.stock <= p.reorderThreshold);
      if (lowItem) showToast(lowItem.name, lowItem.stock);
    }
  });
}

// Alert pill re-triggers toast
const alertPill = document.getElementById('header-alert-pill');
if (alertPill) {
  alertPill.addEventListener('click', () => {
    if (typeof products !== 'undefined') {
      const lowItem = products.find(p => p.stock <= p.reorderThreshold);
      if (lowItem) showToast(lowItem.name, lowItem.stock);
    }
  });
}

/* ── Init ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Dynamic header date
  const dateEl = document.getElementById('header-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  renderIconPicker();
  renderCategoryGrid();
  updateNavBadge();
  lucide.createIcons();

  // Auto toast on load if any low-stock products exist
  if (typeof products !== 'undefined') {
    const lowItem = products.find(p => p.stock <= p.reorderThreshold);
    if (lowItem) setTimeout(() => showToast(lowItem.name, lowItem.stock), 800);
  }
});
