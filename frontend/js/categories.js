'use strict';

let categories = [];
let products = [];
const iconOptions = ['⚡','🔧','🖥️','💿','💾','📡','📦','🛒','🔌','📷','🖱️','⌨️'];
let editingCategoryId = null;
let selectedIcon = iconOptions[0];

async function apiJson(url, options={}){ const res = await window.auth.apiFetch(url, options); const json = await res.json(); if(!res.ok || json.success===false) throw new Error(json.message||'Request failed'); return json; }
async function refreshData(){ const [c,p]=await Promise.all([apiJson('/api/categories'), apiJson('/api/products?limit=500')]); categories=c.data||[]; products=p.data||[]; renderCategoryGrid(); updateNavBadge(); }

function renderCategoryGrid(){ const grid=document.getElementById('category-grid'); if(!categories.length){grid.innerHTML='<div class="empty-state"><p class="empty-state__text">No categories yet. Add your first one.</p></div>'; updateGridFooter(); return;} const max=Math.max(...categories.map(c=>c.count),1); grid.innerHTML=categories.map(cat=>{const pct=Math.round((cat.count/max)*100); return `<div class="category-card" data-id="${cat.id}"><div class="card-top-row"><div class="card-icon-box">${cat.icon}</div><button class="card-edit-btn" data-action="edit" data-id="${cat.id}"><i data-lucide="edit-2"></i></button></div><h3 class="card-name">${cat.name}</h3><p class="card-count">${cat.count} products listed</p><div class="card-progress"><div class="card-progress__track"><div class="card-progress__fill" style="width:${pct}%"></div></div></div></div>`}).join(''); lucide.createIcons(); updateGridFooter(); }
function updateGridFooter(){ document.getElementById('footer-cat-count').textContent=categories.length; document.getElementById('footer-product-total').textContent=categories.reduce((s,c)=>s+c.count,0); document.getElementById('page-subtitle').textContent=`${categories.length} categories · manage your product groups`; }
function updateNavBadge(){ const low=products.filter(p=>p.stock<=p.reorderThreshold).length; const badge=document.getElementById('alerts-badge'); if(badge){badge.textContent=low; badge.style.display=low?'flex':'none';} const pill=document.getElementById('header-alert-pill'); if(pill){pill.querySelector('.pill-count').textContent=low; pill.style.display=low?'flex':'none';} }
function renderIconPicker(){ const picker=document.getElementById('icon-picker'); picker.innerHTML=iconOptions.map(icon=>`<button class="icon-option${icon===selectedIcon?' is-selected':''}" data-icon="${icon}" type="button">${icon}</button>`).join(''); }

function openModal(){document.getElementById('modal-overlay').classList.add('is-open');}
function closeModal(){document.getElementById('modal-overlay').classList.remove('is-open'); editingCategoryId=null;}

// events

document.addEventListener('DOMContentLoaded', async ()=>{ lucide.createIcons(); renderIconPicker(); if(!window.auth)return; await refreshData(); });
document.getElementById('icon-picker').addEventListener('click',e=>{const opt=e.target.closest('.icon-option'); if(!opt)return; selectedIcon=opt.dataset.icon; renderIconPicker();});
document.getElementById('btn-add-category').addEventListener('click',()=>{editingCategoryId=null; selectedIcon=iconOptions[0]; document.getElementById('field-name').value=''; document.getElementById('modal-title').textContent='Add New Category'; document.getElementById('btn-delete-category').style.display='none'; openModal(); renderIconPicker();});
document.getElementById('category-grid').addEventListener('click',e=>{const btn=e.target.closest('[data-action="edit"]'); if(!btn)return; const cat=categories.find(c=>c.id===+btn.dataset.id); if(!cat)return; editingCategoryId=cat.id; selectedIcon=cat.icon; document.getElementById('field-name').value=cat.name; document.getElementById('modal-title').textContent='Edit Category'; document.getElementById('btn-delete-category').style.display='inline-flex'; openModal(); renderIconPicker();});
document.getElementById('btn-save').addEventListener('click', async ()=>{ const payload={name:document.getElementById('field-name').value.trim(),icon:selectedIcon}; if(!payload.name)return; if(editingCategoryId){ await apiJson(`/api/categories/${editingCategoryId}`,{method:'PUT',body:JSON.stringify(payload)});} else { await apiJson('/api/categories',{method:'POST',body:JSON.stringify(payload)});} closeModal(); await refreshData(); });
document.getElementById('btn-delete-category').addEventListener('click', async ()=>{ if(!editingCategoryId) return; if(!confirm('Delete this category?'))return; await apiJson(`/api/categories/${editingCategoryId}`,{method:'DELETE'}); closeModal(); await refreshData(); });
document.getElementById('modal-close-btn').addEventListener('click',closeModal); document.getElementById('btn-cancel').addEventListener('click',closeModal); document.getElementById('modal-overlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal();});
