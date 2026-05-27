(function(){
  const TOKEN_KEY = 'token';
  const AUTH_PAGE = /auth\.html$/.test(location.pathname);

  function getToken(){ return localStorage.getItem(TOKEN_KEY); }
  function clearToken(){ localStorage.removeItem(TOKEN_KEY); }
  function redirectToAuth(){ if (!AUTH_PAGE) location.href='auth.html'; }
  function redirectToApp(){ if (AUTH_PAGE) location.href='index.html'; }

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

  function showMsg(text, ok){
    const el=document.getElementById('auth-message'); if(!el) return;
    el.textContent=text; el.className=`msg ${ok?'ok':'err'}`;
  }

  function toggle(tab){
    const login=document.getElementById('login-form'); const reg=document.getElementById('register-form');
    const bl=document.getElementById('show-login'); const br=document.getElementById('show-register');
    const isLogin = tab==='login';
    login?.classList.toggle('active', isLogin); reg?.classList.toggle('active', !isLogin);
    bl?.classList.toggle('active', isLogin); br?.classList.toggle('active', !isLogin);
    showMsg('', true);
  }

  function attachLogout(){
    const host=document.querySelector('.sidebar__user'); if(!host || document.getElementById('btn-logout')) return;
    const btn=document.createElement('button');
    btn.id='btn-logout'; btn.textContent='Logout';
    btn.style.cssText='margin-left:auto;background:#2d1111;border:1px solid #7f1d1d;color:#fca5a5;padding:6px 10px;border-radius:8px;cursor:pointer;font-size:12px';
    btn.addEventListener('click', ()=>{ clearToken(); location.href='auth.html'; });
    host.appendChild(btn);
  }

  window.auth = { getToken, clearToken, apiFetch, logout: ()=>{clearToken(); location.href='auth.html';} };

  document.addEventListener('DOMContentLoaded', ()=>{
    if (AUTH_PAGE) {
      if (getToken()) return redirectToApp();
      document.getElementById('show-login')?.addEventListener('click', ()=>toggle('login'));
      document.getElementById('show-register')?.addEventListener('click', ()=>toggle('register'));

      document.getElementById('register-form')?.addEventListener('submit', async (e)=>{
        e.preventDefault();
        try {
          const res = await fetch('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:document.getElementById('register-name').value.trim(),email:document.getElementById('register-email').value.trim(),password:document.getElementById('register-password').value})});
          const data = await res.json();
          if(!res.ok) throw new Error(data.message || 'Registration failed');
          showMsg('Registration successful. Please login.', true); toggle('login');
        } catch(err){ showMsg(err.message || 'Network error during registration.', false); }
      });

      document.getElementById('login-form')?.addEventListener('submit', async (e)=>{
        e.preventDefault();
        try {
          const res = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:document.getElementById('login-email').value.trim(),password:document.getElementById('login-password').value})});
          const data = await res.json();

          if (!res.ok || !data.data?.token) {
            throw new Error(data.message || 'Invalid credentials');
          }

          localStorage.setItem(TOKEN_KEY, data.data.token);

          location.href = 'index.html';
        } catch(err){ showMsg(err.message || 'Network error during login.', false); }
      });
      return;
    }

    if(!getToken()) return redirectToAuth();
    attachLogout();
  });
})();
