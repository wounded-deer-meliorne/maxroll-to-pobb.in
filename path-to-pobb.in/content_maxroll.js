// content_maxroll.js
// Runs on maxroll.gg/poe/pob/* pages.
// Immediately hides the page, scrapes the POB code, then redirects to pobb.in.

(function () {
  if (window.__maxrollPobExtensionRunning) return;
  window.__maxrollPobExtensionRunning = true;

  // ─── STEP 1: Blank the page immediately ──────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = '__pob-redirect-overlay';
  overlay.innerHTML = `
    <style>
      #__pob-redirect-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        background: #0d0d0d;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #aaa;
        font-size: 14px;
        gap: 16px;
      }
      #__pob-redirect-overlay .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #333;
        border-top-color: #af6025;
        border-radius: 50%;
        animation: __pob-spin 0.8s linear infinite;
      }
      @keyframes __pob-spin { to { transform: rotate(360deg); } }
      #__pob-redirect-overlay .label { letter-spacing: 0.04em; }
    </style>
    <div class="spinner"></div>
    <div class="label">Loading build...</div>
  `;

  const attachOverlay = () => {
    (document.body || document.documentElement).appendChild(overlay);
  };
  if (document.body) { attachOverlay(); }
  else { document.addEventListener('DOMContentLoaded', attachOverlay); }

  // ─── STEP 2: Extract the POB code ────────────────────────────────────────
  // POB codes are long base64url strings (100+ chars)
  const POB_CODE_REGEX = /^[A-Za-z0-9+/\-_]{80,}={0,2}$/;

  function getCodeFromElement(el) {
    // Try all possible ways to read the value from a textarea
    const candidates = [
      el.value,
      el.textContent,
      el.innerText,
      el.defaultValue,
      el.getAttribute('value'),
    ];
    for (const val of candidates) {
      const trimmed = (val || '').trim();
      if (trimmed.length > 80 && POB_CODE_REGEX.test(trimmed)) {
        return trimmed;
      }
    }
    return null;
  }

  function findPobCode() {
    // Strategy A: confirmed class name — with OR without readonly (React may add it late)
    for (const sel of [
      'textarea.poe-textarea',
      'textarea[readonly]',
      'textarea[class*="poe"]',
      'textarea[class*="pob"]',
    ]) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        const code = getCodeFromElement(el);
        if (code) {
          console.log('[PathToPobb.in] Found via selector:', sel);
          return code;
        }
      }
    }

    // Strategy B: scan ALL textareas (broadest fallback)
    for (const el of document.querySelectorAll('textarea')) {
      const code = getCodeFromElement(el);
      if (code) {
        console.log('[PathToPobb.in] Found via textarea scan');
        return code;
      }
    }

    return null;
  }

  function dispatch(code) {
    if (window.__maxrollPobDispatched) return;
    window.__maxrollPobDispatched = true;
    console.log('[PathToPobb.in] Dispatching POB code to background...');
    chrome.runtime.sendMessage({ type: 'POB_CODE_FOUND', code });
  }

  // ─── STEP 3a: MutationObserver — fires the moment the textarea appears ───
  // This catches React renders faster than any polling interval.
  const observer = new MutationObserver(() => {
    const code = findPobCode();
    if (code) {
      observer.disconnect();
      dispatch(code);
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,  // catches React patching text nodes directly
    attributes: true,     // catches readonly being added after mount
  });

  // ─── STEP 3b: Polling fallback (backs up the observer) ───────────────────
  let attempts = 0;
  const MAX_ATTEMPTS = 60; // 60 × 500ms = 30s

  const poll = setInterval(() => {
    const code = findPobCode();
    if (code) {
      clearInterval(poll);
      observer.disconnect();
      dispatch(code);
      return;
    }
    if (++attempts >= MAX_ATTEMPTS) {
      clearInterval(poll);
      observer.disconnect();
      overlay.remove();
      console.warn('[PathToPobb.in] Gave up after 30s. textarea.poe-textarea not found or value was empty.');
    }
  }, 500);

  // Run once immediately after a short delay in case it's already rendered
  setTimeout(() => {
    const code = findPobCode();
    if (code) {
      clearInterval(poll);
      observer.disconnect();
      dispatch(code);
    }
  }, 1000);

})();
