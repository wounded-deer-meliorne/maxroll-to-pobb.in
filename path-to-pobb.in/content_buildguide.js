// content_buildguide.js
// Runs on maxroll.gg/poe/build-guides/* pages.
// Finds the "PoB Link" button, extracts the /poe/pob/ URL,
// then redirects to it — where content_maxroll.js takes over
// and continues the chain to pobb.in.

(function () {
  if (window.__maxrollBuildGuideRunning) return;
  window.__maxrollBuildGuideRunning = true;

  // ─── Overlay (same style as content_maxroll.js) ───────────────────────────
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

  // ─── Find the PoB Link and redirect ──────────────────────────────────────
  function findPobUrl() {
    // Confirmed selector from DevTools inspection:
    // <a class="poe-planner-pob-link" href="https://maxroll.gg/poe/pob/...">
    const link = document.querySelector('a.poe-planner-pob-link');
    if (link && link.href && link.href.includes('/poe/pob/')) {
      return link.href;
    }
    return null;
  }

  function tryFind(attempt = 0) {
    const MAX_ATTEMPTS = 40; // 40 x 500ms = 20s
    const INTERVAL_MS  = 500;

    const url = findPobUrl();
    if (url) {
      console.log('[PathToPobb.in] Found PoB URL on build guide:', url);
      window.location.href = url;
      return;
    }

    if (attempt < MAX_ATTEMPTS) {
      setTimeout(() => tryFind(attempt + 1), INTERVAL_MS);
    } else {
      // Give up — remove overlay and let user see the page normally
      overlay.remove();
      console.warn('[PathToPobb.in] Could not find a.poe-planner-pob-link after 20s.');
    }
  }

  // MutationObserver as backup for React rendering the button late
  const observer = new MutationObserver(() => {
    const url = findPobUrl();
    if (url) {
      observer.disconnect();
      console.log('[PathToPobb.in] MutationObserver found PoB URL:', url);
      window.location.href = url;
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  setTimeout(() => tryFind(), 800);

})();
