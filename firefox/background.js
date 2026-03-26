// background.js — PathToPobb.in (Firefox)

browser.runtime.onMessage.addListener((message, sender) => {

  // POB code scraped from maxroll — store and redirect to pobb.in
  if (message.type === 'POB_CODE_FOUND') {
    const tabId = sender.tab.id;
    console.log('[PathToPobb.in] Storing POB code, redirecting tab', tabId);
    browser.storage.local.set({ pendingPobCode: message.code }).then(() => {
      browser.tabs.update(tabId, { url: 'https://pobb.in' });
    });
  }

  // Content script asking background to perform a tab redirect
  // (more reliable than window.location.href in Firefox MV2)
  if (message.type === 'REDIRECT_TAB') {
    const tabId = sender.tab.id;
    console.log('[PathToPobb.in] Redirecting tab', tabId, 'to', message.url);
    browser.tabs.update(tabId, { url: message.url });
  }

});
