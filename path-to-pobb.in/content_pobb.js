// content_pobb.js
// Runs on pobb.in after redirect from maxroll.
// Reads the stored POB code and injects it into pobb.in's textarea.

(function () {

  // Use local storage (matches what background.js writes to)
  chrome.storage.local.get('pendingPobCode', ({ pendingPobCode }) => {
    if (!pendingPobCode) {
      console.log('[PathToPobb.in] No pending POB code found in storage.');
      return;
    }

    console.log('[PathToPobb.in] POB code found in storage, length:', pendingPobCode.length);

    // Clear immediately so it doesn't re-trigger on future visits
    chrome.storage.local.remove('pendingPobCode');

    // Wait for Svelte to mount the textarea, then inject
    injectWhenReady(pendingPobCode);
  });

  function injectWhenReady(code, attempt = 0) {
    const MAX_ATTEMPTS = 40;

    const textarea = document.querySelector('textarea[aria-label="Path of Building buildcode"]')
                  || document.querySelector('textarea[data-hk]')
                  || document.querySelector('textarea');

    if (textarea) {
      console.log('[PathToPobb.in] Textarea found, injecting...');
      inject(textarea, code);
      return;
    }

    if (attempt < MAX_ATTEMPTS) {
      setTimeout(() => injectWhenReady(code, attempt + 1), 300);
    } else {
      console.warn('[PathToPobb.in] Textarea never appeared after 12s.');
    }
  }

  function inject(textarea, code) {
    // Confirmed working method from manual console test:
    // native setter + input event is all Svelte needs
    const nativeSetter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype, 'value'
    )?.set;

    if (nativeSetter) {
      nativeSetter.call(textarea, code);
    } else {
      textarea.value = code;
    }

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.focus();

    console.log("[PathToPobb.in] Injected. Value length:", textarea.value.length);

    // Click the Create button after a short delay to let Svelte process the input
    setTimeout(() => {
      const createBtn =
        document.querySelector("button[data-hk='8.7']") ||
        [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Create");

      if (createBtn) {
        console.log("[PathToPobb.in] Clicking Create button...");
        createBtn.click();
      } else {
        console.warn("[PathToPobb.in] Create button not found.");
      }
    }, 500);
  }

})();
