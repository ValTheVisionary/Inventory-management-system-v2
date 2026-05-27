(function(){
  const TOKEN_KEY = 'token';
  const USER_KEY = 'auth_user';
  const AUTH_PAGE = /auth\.html$/.test(location.pathname);

  function getToken(){ return localStorage.getItem(TOKEN_KEY); }
  function clearToken(){ localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
  function redirectToAuth(){ if (!AUTH_PAGE) location.href='auth.html'; }
  function redirectToApp(){ if (AUTH_PAGE) location.href='index.html'; }
  function getInitials(name=''){ return name.split(' ').filter(Boolean).map((p)=>p[0]).join('').slice(0,2).toUpperCase() || '--'; }
  function roleLabel(role=''){ return String(role || '').replaceAll('_',' ').toUpperCase() || '—'; }

  function renderUserProfile(user={}){
    const name = user.name || 'Loading...';
    const role = roleLabel(user.role);
    const initials = getInitials(user.name || '');
    document.querySelectorAll('.sidebar__user .user-name').forEach((el)=>{ el.textContent = name; });
    document.querySelectorAll('.sidebar__user .user-role').forEach((el)=>{ el.textContent = role; });
    document.querySelectorAll('.sidebar__user .user-avatar').forEach((el)=>{ el.textContent = initials; });

    const byId = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    byId('sidebarUserName', name); byId('sidebarUserRole', role); byId('sidebarUserAvatar', initials);
    byId('accountUserName', name); byId('accountUserRole', role); byId('accountUserAvatar', initials);

    const dn = document.getElementById('displayName'); if (dn && user.name) dn.value = user.name;
    const notifEmail = document.getElementById('notifEmail'); if (notifEmail && user.email && !notifEmail.value) notifEmail.value = user.email;
  }

  function getCurrentUser(){
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  }

  function setCurrentUser(user){
    localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
    renderUserProfile(user || {});
    window.dispatchEvent(new CustomEvent('auth:user-updated', { detail: user || {} }));
  }

  async function fetchCurrentUser(){
    const res = await apiFetch('/api/users/me');
    const body = await res.json();
    if (!res.ok || body.success === false) throw new Error(body.message || 'Failed to load profile');
    const user = body.data || {};
    setCurrentUser(user);
    return user;
  }

  async function apiFetch(url, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...(options.headers||{}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      clearToken();
      if (!AUTH_PAGE) location.href = 'auth.html';
      throw new Error('Session expired. Please login again.');
    }
    return res;
  }

  function showMsg(text, ok){ const el=document.getElementById('auth-message'); if(!el) return; el.textContent=text; el.className=`msg ${ok?'ok':'err'}`; }
  function toggle(tab){ const login=document.getElementById('login-form'); const reg=document.getElementById('register-form'); const bl=document.getElementById('show-login'); const br=document.getElementById('show-register'); const isLogin = tab==='login'; login?.classList.toggle('active', isLogin); reg?.classList.toggle('active', !isLogin); bl?.classList.toggle('active', isLogin); br?.classList.toggle('active', !isLogin); showMsg('', true); }

  function attachLogout(){
    const host=document.querySelector('.sidebar__user'); if(!host || document.getElementById('btn-logout')) return;
    const btn=document.createElement('button');
    btn.id='btn-logout'; btn.textContent='Logout';
    btn.style.cssText='margin-left:auto;background:#2d1111;border:1px solid #7f1d1d;color:#fca5a5;padding:6px 10px;border-radius:8px;cursor:pointer;font-size:12px';
    btn.addEventListener('click', ()=>{ clearToken(); location.href='auth.html'; });
    host.appendChild(btn);
  }

  window.auth = { getToken, clearToken, apiFetch, logout: ()=>{clearToken(); location.href='auth.html';}, getCurrentUser, setCurrentUser, fetchCurrentUser, renderUserProfile };

  window.addEventListener('storage', (e)=>{ if (e.key === USER_KEY) renderUserProfile(getCurrentUser() || {}); });
  window.addEventListener('auth:user-updated', (e)=>renderUserProfile(e.detail || {}));

  document.addEventListener('DOMContentLoaded', ()=>{
    if (AUTH_PAGE) {
      if (getToken()) return redirectToApp();
      document.getElementById('show-login')?.addEventListener('click', ()=>toggle('login'));
      document.getElementById('show-register')?.addEventListener('click', ()=>toggle('register'));
      document.getElementById('register-form')?.addEventListener('submit', async (e)=>{ e.preventDefault(); try { const res = await fetch('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:document.getElementById('register-name').value.trim(),email:document.getElementById('register-email').value.trim(),password:document.getElementById('register-password').value})}); const data = await res.json(); if(!res.ok) throw new Error(data.message || 'Registration failed'); showMsg('Registration successful. Please login.', true); toggle('login'); } catch(err){ showMsg(err.message || 'Network error during registration.', false); } });
      document.getElementById('login-form')?.addEventListener('submit', async (e)=>{ e.preventDefault(); try { const res = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:document.getElementById('login-email').value.trim(),password:document.getElementById('login-password').value})}); const data = await res.json(); if (!res.ok || !data.data?.token) throw new Error(data.message || 'Invalid credentials'); localStorage.setItem(TOKEN_KEY, data.data.token); if (data.data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.data.user)); location.href = 'index.html'; } catch(err){ showMsg(err.message || 'Network error during login.', false); } });
      return;
    }

    if(!getToken()) return redirectToAuth();
    attachLogout();
    const cached = getCurrentUser();
    if (cached) renderUserProfile(cached);
    fetchCurrentUser().catch((err)=>console.error(err));
  });
})();
