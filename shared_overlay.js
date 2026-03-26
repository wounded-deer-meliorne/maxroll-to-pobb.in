// Shared overlay helper — not a real file, just for reference.
// The showError function below replaces removeOverlay() on timeout.
// Copy the showError function into each content script.

function showError(overlayEl) {
  if (!overlayEl) return;
  overlayEl.innerHTML = `
    <style>
      #__pob-redirect-overlay {
        position: fixed; inset: 0; z-index: 2147483647;
        background: #0d0d0d; display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        gap: 14px;
      }
      #__pob-redirect-overlay .pob-err-icon { font-size: 32px; }
      #__pob-redirect-overlay .pob-err-title {
        color: #e07040; font-size: 16px; font-weight: 600; letter-spacing: 0.02em;
      }
      #__pob-redirect-overlay .pob-err-body {
        color: #666; font-size: 13px; text-align: center;
        max-width: 320px; line-height: 1.6;
      }
      #__pob-redirect-overlay .pob-err-dismiss {
        margin-top: 6px; padding: 7px 22px;
        background: none; border: 1px solid #333; border-radius: 6px;
        color: #555; font-size: 12px; cursor: pointer;
        transition: border-color 0.15s, color 0.15s;
      }
      #__pob-redirect-overlay .pob-err-dismiss:hover { border-color: #666; color: #aaa; }
    </style>
    <div class="pob-err-icon">⚠️</div>
    <div class="pob-err-title">No POB link found</div>
    <div class="pob-err-body">
      This build doesn't appear to have a Path of Building link available,
      or the page took too long to load it.
    </div>
    <button class="pob-err-dismiss" id="__pob-dismiss">Dismiss</button>
  `;
  document.getElementById('__pob-dismiss')?.addEventListener('click', () => overlayEl.remove());
}
