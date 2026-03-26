// content_pobb.js — PathToPobb.in (Chrome)

(function () {

  chrome.storage.local.get('pendingPobCode', ({ pendingPobCode }) => {
    if (!pendingPobCode) {
      console.log('[PathToPobb.in] No pending POB code in storage.');
      return;
    }

    console.log('[PathToPobb.in] POB code found, length:', pendingPobCode.length);
    chrome.storage.local.remove('pendingPobCode');
    injectWhenReady(pendingPobCode);
  });

  function injectWhenReady(code, attempt = 0) {
    const textarea =
      document.querySelector('textarea[aria-label="Path of Building buildcode"]') ||
      document.querySelector('textarea[data-hk]') ||
      document.querySelector('textarea');

    if (textarea) {
      console.log('[PathToPobb.in] Textarea found on attempt', attempt);
      inject(textarea, code);
      return;
    }

    if (attempt < 60) {
      setTimeout(() => injectWhenReady(code, attempt + 1), 300);
    } else {
      console.warn('[PathToPobb.in] Textarea never appeared.');
    }
  }

  function inject(textarea, code) {
    // Wait after finding textarea — Svelte may still be initialising
    setTimeout(() => doInject(textarea, code), 400);
  }

  function doInject(textarea, code) {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    )?.set;

    if (nativeSetter) { nativeSetter.call(textarea, code); }
    else { textarea.value = code; }

    textarea.dispatchEvent(new Event('input',  { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    textarea.focus();

    console.log('[PathToPobb.in] Injected. Value length:', textarea.value.length);

    // Verify value stuck — Svelte sometimes resets it on re-render
    setTimeout(() => {
      if (!textarea.value || textarea.value.length < 10) {
        console.log('[PathToPobb.in] Value cleared by Svelte, retrying...');
        if (nativeSetter) { nativeSetter.call(textarea, code); }
        else { textarea.value = code; }
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
      setTimeout(() => clickCreate(), 400);
    }, 300);
  }

  function clickCreate() {
    const btn =
      document.querySelector('button[data-hk="8.7"]') ||
      [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Create');

    if (btn) {
      console.log('[PathToPobb.in] Clicking Create...');
      btn.click();
    } else {
      setTimeout(() => {
        const retry =
          document.querySelector('button[data-hk="8.7"]') ||
          [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Create');
        if (retry) { retry.click(); }
        else { console.warn('[PathToPobb.in] Create button not found.'); }
      }, 800);
    }
  }

})();
