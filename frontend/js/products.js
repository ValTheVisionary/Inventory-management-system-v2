'use strict';

let products = [];
let categories = [];
let editingProductId = null;
let toastTimer = null;
let searchDebounce = null;

const $ = (id) => document.getElementById(id);
const isLowStock = (p) => p.stock <= p.reorderThreshold;

function escHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

async function apiJson(url, options = {}) {
  const res = await window.auth.apiFetch(url, options);
  const json = await res.json();
  if (!res.ok || json.success === false) throw new Error(json.message || 'Request failed');
  return json;
}

async function loadData() {
  const [prodRes, catRes] = await Promise.all([apiJson('/api/products?limit=500'), apiJson('/api/categories')]);
  products = prodRes.data || [];
  categories = catRes.data || [];
  renderCategoryOptions();
  renderTable();
  updateNavBadge();
}

function renderCategoryOptions() {
  const names = categories.map(c => c.name);
  $('category-filter').innerHTML = `<option value="all">All Categories</option>${names.map(n => `<option value="${escHtml(n)}">${escHtml(n)}</option>`).join('')}`;
  const current = $('field-category').value;
  $('field-category').innerHTML = names.map(n => `<option ${n===current?'selected':''}>${escHtml(n)}</option>`).join('');
}

function getFilteredProducts() {
  const query = $('search-input').value.toLowerCase().trim();
  const cat = $('category-filter').value;
  return products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query);
    const matchCat = cat === 'all' || p.category === cat;
    return matchSearch && matchCat;
  });
}

function renderTable() { /* reused simplified */
  const tbody = $('table-body');
  const filtered = getFilteredProducts();
  if (!filtered.length) { tbody.innerHTML = '<tr class="table-row--empty"><td colspan="7"><div class="empty-state"><p class="empty-state__text">No products match your search.</p></div></td></tr>'; updateTableFooter(filtered); return; }
  tbody.innerHTML = filtered.map(p=>`<tr class="table-row ${isLowStock(p)?'row--low-stock':''}"><td class="cell-product-name">${escHtml(p.name)}</td><td>${escHtml(p.category)}</td><td>${escHtml(p.sku)}</td><td><span class="stock-value ${isLowStock(p)?'stock-value--low':''}">${p.stock}</span> <span class="stock-unit">units</span></td><td>$${Number(p.price).toFixed(2)}</td><td><span class="status-badge ${isLowStock(p)?'status-badge--low-stock':'status-badge--in-stock'}">${isLowStock(p)?'Low Stock':'In Stock'}</span></td><td class="cell-actions"><div class="action-btns"><button class="action-btn action-btn--edit" data-action="edit" data-id="${p.id}">Edit</button><button class="action-btn action-btn--delete" data-action="delete" data-id="${p.id}">Delete</button></div></td></tr>`).join('');
  updateTableFooter(filtered);
}

function updateTableFooter(filtered) { $('footer-count').textContent = `Showing ${filtered.length} of ${products.length} products`; const low = filtered.filter(isLowStock).length; $('low-stock-warning').classList.toggle('hidden', low===0); $('low-stock-warning-text').textContent = `${low} item${low===1?'':'s'} need restocking`; }
function updateNavBadge() { const lowCount = products.filter(isLowStock).length; const badge = $('alerts-badge'); if (badge) { badge.textContent = lowCount; badge.style.display = lowCount ? 'flex' : 'none'; } const pill = $('header-alert-pill'); const pillCount = pill?.querySelector('.pill-count'); if (pill&&pillCount) { pillCount.textContent=lowCount; pill.style.display=lowCount?'flex':'none'; } }

function openModal(){ $('modal-overlay').classList.add('is-open'); document.body.style.overflow='hidden'; }
function closeModal(){ $('modal-overlay').classList.remove('is-open'); document.body.style.overflow=''; editingProductId=null; }
function populateModalForm(p){ $('field-name').value=p.name; $('field-sku').value=p.sku; $('field-category').value=p.category; $('field-stock').value=p.stock; $('field-reorder').value=p.reorderThreshold; $('field-price').value=p.price; $('field-description').value=p.description||''; }
function resetModalForm(){ $('modal-form').reset(); }

$('search-input').addEventListener('input',()=>{ clearTimeout(searchDebounce); searchDebounce=setTimeout(renderTable,200);});
$('category-filter').addEventListener('change',renderTable);
$('table-body').addEventListener('click',async(e)=>{ const btn=e.target.closest('[data-action]'); if(!btn)return; const id=+btn.dataset.id; const p=products.find(x=>x.id===id); if(!p)return; if(btn.dataset.action==='edit'){editingProductId=id; populateModalForm(p); openModal();} if(btn.dataset.action==='delete'){ if(!confirm('Delete this product?')) return; await apiJson(`/api/products/${id}`,{method:'DELETE'}); await loadData(); }});
$('btn-add-product').addEventListener('click',()=>{ editingProductId=null; resetModalForm(); openModal(); });
$('btn-save').addEventListener('click',async()=>{ const payload={name:$('field-name').value.trim(),sku:$('field-sku').value.trim(),category:$('field-category').value,stock:+$('field-stock').value||0,reorderThreshold:+$('field-reorder').value||0,price:+$('field-price').value||0,description:$('field-description').value.trim()}; if(!payload.name||!payload.sku)return; if(editingProductId){ await apiJson(`/api/products/${editingProductId}`,{method:'PUT',body:JSON.stringify(payload)});}else{ await apiJson('/api/products',{method:'POST',body:JSON.stringify(payload)});} closeModal(); await loadData(); });
$('modal-overlay').addEventListener('click',e=>{if(e.target===$('modal-overlay'))closeModal();}); $('modal-close-btn').addEventListener('click',closeModal); $('btn-cancel').addEventListener('click',closeModal);

function initHeaderDate(){ const el=$('header-date'); if(el)el.textContent=new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}); }

document.addEventListener('DOMContentLoaded', async ()=>{ lucide.createIcons(); initHeaderDate(); if (!window.auth) return; try{ await loadData(); }catch(e){ console.error(e);} });
