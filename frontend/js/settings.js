/* ─────────────────────────────────────────────────────────────────
   settings.js  —  Settings page logic
   Depends on: settings.html, css/dashboard.css, css/settings.css
───────────────────────────────────────────────────────────────── */

'use strict';

// ── Section State ────────────────────────────────────────────────────
const sectionState = {
  general:       { dirty: false, saved: false },
  notifications: { dirty: false, saved: false },
  appearance:    { dirty: false, saved: false },
  account:       { dirty: false, saved: false }
};

let savedTimers = {};

function markDirty(sectionId) {
  sectionState[sectionId].dirty = true;
  sectionState[sectionId].saved = false;
  clearTimeout(savedTimers[sectionId]);
  updateFooterIndicator(sectionId);
}

function markSaved(sectionId) {
  sectionState[sectionId].dirty = false;
  sectionState[sectionId].saved = true;
  updateFooterIndicator(sectionId);

  clearTimeout(savedTimers[sectionId]);
  savedTimers[sectionId] = setTimeout(() => {
    sectionState[sectionId].saved = false;
    updateFooterIndicator(sectionId);
  }, 2500);
}

function updateFooterIndicator(sectionId) {
  const section   = document.querySelector(`[data-section-id="${sectionId}"]`);
  if (!section) return;
  const unsaved   = section.querySelector('.state-unsaved');
  const saved     = section.querySelector('.state-saved');
  const state     = sectionState[sectionId];

  if (state.dirty) {
    unsaved.style.display = 'inline';
    saved.style.display   = 'none';
  } else if (state.saved) {
    unsaved.style.display = 'none';
    saved.style.display   = 'flex';
    saved.classList.add('visible');
  } else {
    unsaved.style.display = 'none';
    saved.style.display   = 'none';
    saved.classList.remove('visible');
  }
}

// ── Attach Change Listeners to All Inputs / Selects ──────────────────
document.querySelectorAll('.section-card').forEach(section => {
  const id = section.dataset.sectionId;

  section.querySelectorAll('.form-input, .password-input').forEach(input => {
    input.addEventListener('input', () => markDirty(id));
  });

  section.querySelectorAll('.form-select').forEach(select => {
    select.addEventListener('change', () => markDirty(id));
  });
});

// ── Toggle Switches ──────────────────────────────────────────────────
document.querySelectorAll('.toggle-button').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const isOn    = toggle.dataset.checked === 'true';
    const newVal  = !isOn;
    toggle.dataset.checked = String(newVal);
    toggle.setAttribute('aria-checked', String(newVal));

    const section = toggle.closest('.section-card');
    markDirty(section.dataset.sectionId);
  });
});

// ── Date Format Buttons ──────────────────────────────────────────────
document.querySelectorAll('.date-format-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.date-format-group')
       .querySelectorAll('.date-format-btn')
       .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    markDirty('general');
  });
});

// ── Theme Cards ──────────────────────────────────────────────────────
document.querySelectorAll('.theme-card').forEach(card => {
  // Click
  card.addEventListener('click', () => selectTheme(card));

  // Keyboard (Enter / Space)
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectTheme(card);
    }
  });
});

function selectTheme(card) {
  document.querySelectorAll('.theme-card').forEach(c => {
    c.classList.remove('active');
    c.setAttribute('aria-checked', 'false');
  });
  card.classList.add('active');
  card.setAttribute('aria-checked', 'true');
  markDirty('appearance');
}

// ── Color Swatches ───────────────────────────────────────────────────
document.querySelectorAll('.color-swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('.color-swatch').forEach(s => {
      s.classList.remove('active');
      s.setAttribute('aria-pressed', 'false');
    });
    swatch.classList.add('active');
    swatch.setAttribute('aria-pressed', 'true');
    markDirty('appearance');
  });
});

// ── Password Toggle ──────────────────────────────────────────────────
const passwordToggleBtn = document.getElementById('passwordToggleBtn');
const passwordLocked    = document.getElementById('passwordLocked');
const passwordFields    = document.getElementById('passwordFields');
let   passwordExpanded  = false;

passwordToggleBtn.addEventListener('click', () => {
  passwordExpanded = !passwordExpanded;

  if (passwordExpanded) {
    passwordLocked.style.display = 'none';
    passwordFields.style.display = 'flex';
    passwordToggleBtn.textContent = 'Cancel';
    passwordToggleBtn.classList.add('active');
    document.getElementById('currentPassword').focus();
  } else {
    passwordLocked.style.display = 'flex';
    passwordFields.style.display = 'none';
    passwordToggleBtn.textContent = 'Change Password';
    passwordToggleBtn.classList.remove('active');
    // Clear password inputs
    ['currentPassword', 'newPassword', 'confirmPassword'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }
});

// ── Gather Form Data ─────────────────────────────────────────────────
function gatherFormData(sectionId) {
  const section = document.querySelector(`[data-section-id="${sectionId}"]`);
  const data    = {};

  // Named text/email/number inputs
  section.querySelectorAll('.form-input[name]').forEach(input => {
    data[input.name] = input.value;
  });

  // Named selects
  section.querySelectorAll('.form-select[name]').forEach(select => {
    data[select.name] = select.value;
  });

  // Toggle switches
  section.querySelectorAll('.toggle-button[data-name]').forEach(toggle => {
    data[toggle.dataset.name] = toggle.dataset.checked === 'true';
  });

  // Date format
  const activeDateBtn = section.querySelector('.date-format-btn.active');
  if (activeDateBtn) data.dateFormat = activeDateBtn.dataset.format;

  // Theme
  const activeTheme = section.querySelector('.theme-card.active');
  if (activeTheme) data.theme = activeTheme.dataset.theme;

  // Accent color
  const activeSwatch = section.querySelector('.color-swatch.active');
  if (activeSwatch) data.accentColor = activeSwatch.dataset.color;

  // Password fields (account only)
  if (sectionId === 'account') {
    const cur     = document.getElementById('currentPassword');
    const nw      = document.getElementById('newPassword');
    const confirm = document.getElementById('confirmPassword');
    if (cur)     data.currentPassword  = cur.value;
    if (nw)      data.newPassword      = nw.value;
    if (confirm) data.confirmPassword  = confirm.value;
  }

  return data;
}

// ── Validation ───────────────────────────────────────────────────────
function validateFormData(sectionId, data) {
  const errors = [];

  if (sectionId === 'notifications') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.notifEmail && !emailRegex.test(data.notifEmail)) {
      errors.push('Please enter a valid notification email address.');
    }
    if (data.reorderThreshold !== undefined && parseInt(data.reorderThreshold) < 1) {
      errors.push('Reorder threshold must be at least 1.');
    }
  }

  if (sectionId === 'account') {
    const hasPw = data.currentPassword || data.newPassword || data.confirmPassword;
    if (hasPw) {
      if (!data.currentPassword) {
        errors.push('Current password is required.');
      }
      if (!data.newPassword || data.newPassword.length < 8) {
        errors.push('New password must be at least 8 characters.');
      }
      if (data.newPassword !== data.confirmPassword) {
        errors.push('New password and confirmation do not match.');
      }
    }
  }

  if (errors.length) {
    alert(errors.join('\n'));
    return false;
  }
  return true;
}

// ── Save to localStorage ─────────────────────────────────────────────
function persistSettings(sectionId, data) {
  try {
    const existing = JSON.parse(localStorage.getItem('inventrackSettings') || '{}');
    existing[sectionId] = data;
    localStorage.setItem('inventrackSettings', JSON.stringify(existing));
  } catch (e) {
    // localStorage may not be available in all environments
  }
}

// ── Load from localStorage ───────────────────────────────────────────
function loadSettings() {
  let settings = {};
  try {
    settings = JSON.parse(localStorage.getItem('inventrackSettings') || '{}');
  } catch (e) {
    return;
  }

  Object.keys(settings).forEach(sectionId => {
    const section = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!section) return;
    const sData = settings[sectionId];

    // Named inputs
    Object.keys(sData).forEach(key => {
      const val = sData[key];

      // Text/email/number inputs
      const input = section.querySelector(`[name="${key}"]`);
      if (input && input.tagName === 'INPUT') {
        input.value = val;
        return;
      }

      // Selects
      const select = section.querySelector(`select[name="${key}"]`);
      if (select) {
        select.value = val;
        return;
      }

      // Toggle switches
      const toggle = section.querySelector(`.toggle-button[data-name="${key}"]`);
      if (toggle) {
        toggle.dataset.checked = String(val);
        toggle.setAttribute('aria-checked', String(val));
        return;
      }

      // Date format
      if (key === 'dateFormat') {
        const btn = section.querySelector(`.date-format-btn[data-format="${val}"]`);
        if (btn) {
          section.querySelectorAll('.date-format-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
        return;
      }

      // Theme
      if (key === 'theme') {
        const card = section.querySelector(`.theme-card[data-theme="${val}"]`);
        if (card) {
          section.querySelectorAll('.theme-card').forEach(c => {
            c.classList.remove('active');
            c.setAttribute('aria-checked', 'false');
          });
          card.classList.add('active');
          card.setAttribute('aria-checked', 'true');
        }
        return;
      }

      // Accent color
      if (key === 'accentColor') {
        const swatch = section.querySelector(`.color-swatch[data-color="${val}"]`);
        if (swatch) {
          section.querySelectorAll('.color-swatch').forEach(s => {
            s.classList.remove('active');
            s.setAttribute('aria-pressed', 'false');
          });
          swatch.classList.add('active');
          swatch.setAttribute('aria-pressed', 'true');
        }
      }
    });
  });
}

// ── Save Buttons ─────────────────────────────────────────────────────
document.querySelectorAll('.btn-save').forEach(btn => {
  btn.addEventListener('click', () => {
    const section   = btn.closest('.section-card');
    const sectionId = section.dataset.sectionId;
    const data      = gatherFormData(sectionId);

    if (!validateFormData(sectionId, data)) return;

    persistSettings(sectionId, data);
    markSaved(sectionId);

    // Clear password fields after successful account save
    if (sectionId === 'account' && passwordExpanded) {
      ['currentPassword', 'newPassword', 'confirmPassword'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      // Collapse password section
      passwordExpanded = false;
      passwordLocked.style.display   = 'flex';
      passwordFields.style.display   = 'none';
      passwordToggleBtn.textContent  = 'Change Password';
      passwordToggleBtn.classList.remove('active');
    }
  });
});

// ── Header Date ──────────────────────────────────────────────────────
(function setHeaderDate() {
  const el = document.getElementById('headerDate');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
})();

// ── Toast ────────────────────────────────────────────────────────────
let toastTimer = null;

function showToast(msg) {
  const toast   = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('toast--visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 6000);
}

function hideToast() {
  document.getElementById('toast').classList.remove('show');
}

document.getElementById('toastClose').addEventListener('click', hideToast);

document.getElementById('bellBtn').addEventListener('click', () => {
  showToast(document.getElementById('toastMsg').textContent || '3 low stock alerts need attention');
});

document.getElementById('alertPill').addEventListener('click', () => {
  window.location.href = 'alerts.html';
});

// ── Init ─────────────────────────────────────────────────────────────
(function init() {
  loadSettings();
  setTimeout(() => showToast('3 low stock alerts need attention'), 800);
})();

// Auth/session validation for protected routes
document.addEventListener('DOMContentLoaded', async () => {
  if (!window.auth) return;
  try {
    const endpoint = '/api/dashboard';
    await window.auth.apiFetch(endpoint);
  } catch (err) {
    console.error(err);
  }
});
