'use strict';

function initHeaderDate() {
  const dateEl = document.getElementById('header-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

async function loadDashboardData() {
  if (!window.auth) return;
  const res = await window.auth.apiFetch('/api/dashboard');
  const json = await res.json();
  if (!res.ok || json.success === false) throw new Error(json.message || 'Failed to load dashboard');
  const data = json.data || {};
  document.getElementById('stat-total-products').textContent = data.products ?? 0;
  document.getElementById('stat-total-categories').textContent = data.totalCategories ?? 0;
  document.getElementById('stat-low-stock').textContent = data.lowStock ?? 0;
  document.getElementById('stat-total-value').textContent = '$' + Number(data.inventoryValue || 0).toLocaleString('en-US');
  const badge = document.getElementById('alerts-badge');
  if (badge) { badge.textContent = data.lowStock ?? 0; badge.hidden = !(data.lowStock > 0); }
}

document.addEventListener('DOMContentLoaded', async () => {
  lucide.createIcons();
  initHeaderDate();
  try { await loadDashboardData(); } catch (err) { console.error(err); }
});
