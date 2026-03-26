// background.js
// Receives POB code from content_maxroll.js, stores it, then redirects the tab.

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'POB_CODE_FOUND') {
    const tabId = sender.tab.id;
    console.log('[PathToPobb.in] Storing POB code and redirecting tab', tabId);

    // Use local storage (more reliable across redirects than session storage)
    chrome.storage.local.set({ pendingPobCode: message.code }, () => {
      chrome.tabs.update(tabId, { url: 'https://pobb.in' });
    });
  }
});
