// content_buildguide.js — PathToPobb.in (Chrome)

(function () {
  window.__maxrollBuildGuideRunning = false;
  if (window.__maxrollBuildGuideRunning) return;
  window.__maxrollBuildGuideRunning = true;

  // Only activate on specific build guide pages, not the directory
  function isBuildGuidePage(url) {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.replace(/\/$/, '').split('/').filter(Boolean);
      // Must match exactly /poe/build-guides/[slug] where slug is a real slug
      // Reject: /poe/category/build-guides, /poe/build-guides (no slug), query-only pages
      return (
        parts.length >= 3 &&
        parts[0] === 'poe' &&
        parts[1] === 'build-guides' &&
        parts[2] !== '' &&
        !parts[2].startsWith('?')
      );
    } catch (e) { return false; }
  }


  // Hide body immediately so page content never flashes through
  // Only hide if we're on a build page that we'll actually process
  const __pvHideStyle = document.createElement('style');
  __pvHideStyle.id = '__pob-hide-body';
  __pvHideStyle.textContent = 'body { visibility: hidden !important; }';
  (document.head || document.documentElement).appendChild(__pvHideStyle);

  function removeHideStyle() {
    const s = document.getElementById('__pob-hide-body');
    if (s) s.remove();
  }

  // If not a build page, remove the hide immediately
  if (!isBuildGuidePage(window.location.href)) {
    removeHideStyle();
  }

  let overlayEl = null;
  let detecting = false;
  let lastHandledUrl = '';

  function showOverlay() {
    if (overlayEl) return;
    overlayEl = document.createElement('div');
    overlayEl.id = '__pob-redirect-overlay';

    overlayEl.innerHTML = `
      <style>
        #__pob-redirect-overlay {
          position:fixed; inset:0; z-index:2147483647; background:#0d0d0d;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; gap:14px;
        }
        .pob-x {
          position:absolute; top:16px; right:20px;
          background:none; border:none; color:#444; font-size:24px; cursor:pointer; line-height:1;
          transition:color 0.15s;
        }
        .pob-x:hover { color:#aaa; }
        .pob-err-icon { font-size:30px; }
        .pob-err-title { color:#c0c0c0; font-size:15px; font-weight:600; letter-spacing:0.02em; }
        .pob-err-body { color:#555; font-size:12px; text-align:center; max-width:300px; line-height:1.6; }
        .pob-err-actions { display:flex; gap:10px; margin-top:4px; }
        .pob-btn-back {
          padding:7px 20px; background:none; border:1px solid #333; border-radius:6px;
          color:#777; font-size:12px; cursor:pointer; transition:all 0.15s;
        }
        .pob-btn-back:hover { border-color:#666; color:#bbb; }
        .pob-btn-stay {
          padding:7px 20px; background:#1a1a1a; border:1px solid #2a2a2a; border-radius:6px;
          color:#555; font-size:12px; cursor:pointer; transition:all 0.15s;
        }
        .pob-btn-stay:hover { border-color:#444; color:#888; }
      </style>
      <button class="pob-x" id="__pob-stay">&#x2715;</button>
      <div class="pob-err-icon">🔍</div>
      <div class="pob-err-title">No Path of Building link found</div>
      <div class="pob-err-body">This build may not have a POB link available, or it couldn't be detected in time.</div>
      <div class="pob-err-actions">
        <button class="pob-btn-back" id="__pob-back">&#x2190; Go back</button>
        <button class="pob-btn-stay" id="__pob-stay2">View build page</button>
      </div>
    `;
    overlayEl.querySelector('#__pob-back').addEventListener('click', () => { removeHideStyle(); history.back(); });
    overlayEl.querySelector('#__pob-stay').addEventListener('click', () => { removeHideStyle(); overlayEl.remove(); });
    overlayEl.querySelector('#__pob-stay2').addEventListener('click', () => { removeHideStyle(); overlayEl.remove(); });
  }

  function findUrl() {
    const spans = document.querySelectorAll('span.poe-link-text');
    for (const span of spans) {
      const text = (span.textContent || '').trim();
      if (text.startsWith('https://pobb.in/') || text.includes('maxroll.gg/poe/pob/')) return text;
    }
    const link = document.querySelector('a.poe-planner-pob-link');
    if (link && link.href && link.href.includes('/poe/pob/')) return link.href;
    return null;
  }

  function startDetection() {
    if (detecting) return;
    detecting = true;
    let attempts = 0;

    showOverlay();

    const detect = setInterval(() => {
      const url = findUrl();
      if (url) {
        clearInterval(detect);
        detecting = false;
        console.log('[PathToPobb.in] Build guide: found URL:', url);
        window.location.href = url;
        return;
      }
      if (++attempts >= 10) {
        clearInterval(detect);
        detecting = false;
        showError();
        console.warn('[PathToPobb.in] Build guide: gave up after 30s.');
      }
    }, 500);
  }

  // SPA navigation watcher
  function watchNavigation() {
    const currentUrl = window.location.href;
    if (currentUrl !== lastHandledUrl && isBuildGuidePage(currentUrl)) {
      console.log('[PathToPobb.in] Build guide: SPA nav to', currentUrl);
      lastHandledUrl = currentUrl;
      detecting = false;
      if (overlayEl) { overlayEl.remove(); overlayEl = null; }
      showOverlay();
      setTimeout(startDetection, 800);
    }
  }

  // Only start immediately if already on a specific build guide page
  if (isBuildGuidePage(window.location.href)) {
    lastHandledUrl = window.location.href;
    showOverlay();
  setTimeout(startDetection, 800);
  }

  setInterval(watchNavigation, 500);
})();
