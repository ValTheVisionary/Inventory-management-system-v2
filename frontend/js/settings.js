'use strict';

async function loadSettings(){
  const r=await window.auth.apiFetch('/api/settings');
  const j=await r.json();
  const data=j.data||{};
  Object.entries(data).forEach(([sec,payload])=>{
    const s=document.querySelector(`[data-section-id="${sec}"]`);if(!s) return;
    Object.entries(payload||{}).forEach(([k,v])=>{
      const i=s.querySelector(`[name="${k}"]`);if(i) i.value=v;
      const t=s.querySelector(`.toggle-button[data-name="${k}"]`);
      if(t){t.dataset.checked=String(!!v);t.setAttribute('aria-checked',String(!!v));}
    });
  });
}

async function loadProfile(){
  const user = await window.auth.fetchCurrentUser();
  window.auth.renderUserProfile(user || {});
}


function gather(sectionId){
  const s=document.querySelector(`[data-section-id="${sectionId}"]`);
  const d={};
  s.querySelectorAll('.form-input[name],.form-select[name]').forEach(i=>d[i.name]=i.value);
  s.querySelectorAll('.toggle-button[data-name]').forEach(t=>d[t.dataset.name]=t.dataset.checked==='true');
  const date=s.querySelector('.date-format-btn.active');if(date)d.dateFormat=date.dataset.format;
  const th=s.querySelector('.theme-card.active');if(th)d.theme=th.dataset.theme;
  const c=s.querySelector('.color-swatch.active');if(c)d.accentColor=c.dataset.color;
  return d;
}

async function saveAccount(){
  const payload={
    name:document.getElementById('displayName').value.trim()
  };
  const currentPassword=document.getElementById('currentPassword').value;
  const newPassword=document.getElementById('newPassword').value;
  const confirmPassword=document.getElementById('confirmPassword').value;
  if(newPassword||confirmPassword||currentPassword){
    if(newPassword!==confirmPassword) throw new Error('New password and confirm password do not match');
    payload.currentPassword=currentPassword;
    payload.newPassword=newPassword;
  }
  const res=await window.auth.apiFetch('/api/users/me',{method:'PATCH',body:JSON.stringify(payload)});
  const body=await res.json();
  if(!res.ok) throw new Error(body.message||'Failed to update account');
  window.auth.setCurrentUser(body.data||{});
  ['currentPassword','newPassword','confirmPassword'].forEach(id=>{const el=document.getElementById(id);if(el) el.value='';});
}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.section-card').forEach(sec=>{
    const id=sec.dataset.sectionId;
    const btn=sec.querySelector('.btn-save');
    if(btn)btn.addEventListener('click',async()=>{
      try{
        if(id==='account') await saveAccount();
        else await window.auth.apiFetch(`/api/settings/${id}`,{method:'PUT',body:JSON.stringify(gather(id))});
      }catch(err){console.error(err);}
    });
  });

  Promise.all([loadSettings(),loadProfile()]).catch((err)=>console.error(err));
});
