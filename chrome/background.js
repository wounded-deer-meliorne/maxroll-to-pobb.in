// background.js — PathToPobb.in (Chrome)

// ─── Standard message handler ─────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'POB_CODE_FOUND') {
    const tabId = sender.tab.id;
    console.log('[PathToPobb.in] Storing POB code, redirecting tab', tabId);
    chrome.storage.local.set({ pendingPobCode: message.code }, () => {
      chrome.tabs.update(tabId, { url: 'https://pobb.in' });
    });
  }
});

// ─── SPA navigation detection ─────────────────────────────────────────────
// When the user clicks links inside a React/Next.js SPA, the page URL changes
// but no full reload happens — so content scripts never re-fire.
// We watch for URL changes on maxroll and mobalytics tabs and re-inject
// the appropriate content script when they navigate to a matching path.

const RULES = [
  {
    match: url => url.includes('maxroll.gg/poe/pob/'),
    script: 'content_maxroll.js'
  },
  {
    match: url => url.includes('maxroll.gg/poe/build-guides/'),
    script: 'content_buildguide.js'
  },
  {
    match: url => url.includes('mobalytics.gg/poe/builds/') &&
                  // exclude the directory index page itself
                  url.replace('mobalytics.gg/poe/builds', '').replace(/\/$/, '').length > 0,
    script: 'content_mobalytics.js'
  }
];

// Track last URL per tab so we only act on genuine navigations
const lastUrl = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = tab.url || '';

  // Only act when the URL actually changes (SPA pushState fires 'loading' or 'complete')
  if (!changeInfo.url && changeInfo.status !== 'complete') return;
  const newUrl = changeInfo.url || url;
  if (!newUrl) return;
  if (lastUrl[tabId] === newUrl) return;
  lastUrl[tabId] = newUrl;

  // Check if URL matches any of our rules
  const rule = RULES.find(r => r.match(newUrl));
  if (!rule) return;

  // Wait briefly for the SPA to finish rendering, then inject
  setTimeout(() => {
    chrome.scripting.executeScript({
      target: { tabId },
      files: [rule.script]
    }).catch(err => {
      console.warn('[PathToPobb.in] Could not inject', rule.script, ':', err.message);
    });
  }, 800);
});

// Clean up tracking when tab is closed
chrome.tabs.onRemoved.addListener(tabId => { delete lastUrl[tabId]; });
