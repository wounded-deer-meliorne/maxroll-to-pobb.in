// content_mobalytics.js
// Runs on mobalytics.gg/poe/builds/* pages.
// Finds the pobb.in URL in input#poe2PobCode and redirects directly to it.
// content_pobb.js then handles auto-fill and submit on pobb.in.

(function () {
  if (window.__mobPobExtensionRunning) return;
  window.__mobPobExtensionRunning = true;

  // ─── Overlay ──────────────────────────────────────────────────────────────
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

  // ─── Find the pobb.in URL ─────────────────────────────────────────────────
  function findPobUrl() {
    // Confirmed selector from DevTools: input#poe2PobCode
    const input = document.querySelector('input#poe2PobCode');
    if (!input) return null;

    const val = (input.value || '').trim();
    if (val.startsWith('https://pobb.in/')) return val;

    return null;
  }

  function tryFind(attempt = 0) {
    const MAX_ATTEMPTS = 40;
    const INTERVAL_MS  = 500;

    const url = findPobUrl();
    if (url) {
      console.log('[PathToPobb.in] Mobalytics: found pobb.in URL:', url);
      window.location.href = url;
      return;
    }

    if (attempt < MAX_ATTEMPTS) {
      setTimeout(() => tryFind(attempt + 1), INTERVAL_MS);
    } else {
      overlay.remove();
      console.warn('[PathToPobb.in] Mobalytics: could not find input#poe2PobCode after 20s.');
    }
  }

  // MutationObserver in case React renders the input late
  const observer = new MutationObserver(() => {
    const url = findPobUrl();
    if (url) {
      observer.disconnect();
      console.log('[PathToPobb.in] Mobalytics: MutationObserver found pobb.in URL:', url);
      window.location.href = url;
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

  setTimeout(() => tryFind(), 800);

})();
