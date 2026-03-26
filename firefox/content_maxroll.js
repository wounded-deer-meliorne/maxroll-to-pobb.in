// content_maxroll.js — PathToPobb.in (Firefox)
// Scrapes POB code, waits for storage write to complete, then redirects.

(function () {
  // Only run on actual /poe/pob/ pages, not directories or category pages
  function isPobPage(url) {
    try {
      const parts = new URL(url).pathname.replace(/\/$/, '').split('/').filter(Boolean);
      return parts.length >= 3 && parts[0] === 'poe' && parts[1] === 'pob' && parts[2] !== '';
    } catch(e) { return false; }
  }

  if (!isPobPage(window.location.href)) return;

  if (window.__maxrollPobExtensionRunning) return;
  window.__maxrollPobExtensionRunning = true;

  const overlay = document.createElement('div');
  overlay.id = '__pob-redirect-overlay';
  overlay.innerHTML = `
    <style>
      #__pob-redirect-overlay {
        position: fixed; inset: 0; z-index: 2147483647;
        background: #0d0d0d; display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #aaa; font-size: 14px; gap: 16px;
      }
      #__pob-redirect-overlay .spinner {
        width: 32px; height: 32px; border: 3px solid #333;
        border-top-color: #af6025; border-radius: 50%;
        animation: __pob-spin 0.8s linear infinite;
      }
      @keyframes __pob-spin { to { transform: rotate(360deg); } }
      #__pob-redirect-overlay .label { letter-spacing: 0.04em; }
    </style>
    <div class="spinner"></div>
    <div class="label">Loading build...</div>
  `;

  const attachOverlay = () => { (document.body || document.documentElement).appendChild(overlay); };
  if (document.body) { attachOverlay(); }
  else { document.addEventListener('DOMContentLoaded', attachOverlay); }

  const POB_CODE_REGEX = /^[A-Za-z0-9+/\-_]{80,}={0,2}$/;

  function getCodeFromElement(el) {
    const candidates = [el.value, el.textContent, el.innerText, el.defaultValue, el.getAttribute('value')];
    for (const val of candidates) {
      const trimmed = (val || '').trim();
      if (trimmed.length > 80 && POB_CODE_REGEX.test(trimmed)) return trimmed;
    }
    return null;
  }

  function findPobCode() {
    for (const sel of ['textarea.poe-textarea', 'textarea[readonly]', 'textarea[class*="poe"]']) {
      for (const el of document.querySelectorAll(sel)) {
        const code = getCodeFromElement(el);
        if (code) return code;
      }
    }
    for (const el of document.querySelectorAll('textarea')) {
      const code = getCodeFromElement(el);
      if (code) return code;
    }
    return null;
  }

  function dispatch(code) {
    if (window.__maxrollPobDispatched) return;
    window.__maxrollPobDispatched = true;
    console.log('[PathToPobb.in] POB code found, length:', code.length, '— writing to storage...');
    // Wait for storage write to COMPLETE before redirecting
    browser.storage.local.set({ pendingPobCode: code }).then(() => {
      console.log('[PathToPobb.in] Storage confirmed — redirecting to pobb.in');
      browser.runtime.sendMessage({ type: 'REDIRECT_TAB', url: 'https://pobb.in' });
    });
  }

  const observer = new MutationObserver(() => {
    const code = findPobCode();
    if (code) { observer.disconnect(); dispatch(code); }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true });

  let attempts = 0;
  const poll = setInterval(() => {
    const code = findPobCode();
    if (code) { clearInterval(poll); observer.disconnect(); dispatch(code); return; }
    if (++attempts >= 10) {
      clearInterval(poll); observer.disconnect(); 
    showError();
      console.warn('[PathToPobb.in] Gave up after 30s.');
    }
  }, 500);

  setTimeout(() => {
    const code = findPobCode();
    if (code) { clearInterval(poll); observer.disconnect(); dispatch(code); }
  }, 1000);

})();
