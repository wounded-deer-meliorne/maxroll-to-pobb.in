# PathToPobb.in

**A Chrome extension for Path of Exile players.**

Automatically redirects PoE build links from Maxroll and Mobalytics to pobb.in — with the Path of Building code pre-filled and submitted instantly.

![Promo](https://raw.githubusercontent.com/wounded-deer-meliorne/PathToPobb.in/main/promo_1200x800.png)

---

## Supported sources

| Site | URL pattern | How it works |
|------|-------------|--------------|
| Maxroll (POB page) | `maxroll.gg/poe/pob/*` | Scrapes POB code from the page |
| Maxroll (Build guide) | `maxroll.gg/poe/build-guides/*` | Finds the PoB Link button and follows it |
| Mobalytics | `mobalytics.gg/poe/builds/*` | Reads the pobb.in URL directly from the page |

---

## How it works

1. You click any supported build link
2. A loading screen covers the page — you never see the source site load
3. The extension grabs the POB code or pobb.in URL silently in the background
4. The tab redirects to pobb.in with the code auto-filled and Create clicked
5. Your shareable build link is ready

---

## Installation

### From the Chrome Web Store
*Coming soon.*

### Manual (Developer Mode)
1. Download or clone this repo
2. Go to `chrome://extensions` in Chrome
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select this folder

---

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension config, permissions, content script rules |
| `background.js` | Stores POB code in local storage, triggers tab redirect |
| `content_maxroll.js` | Scrapes POB code from maxroll.gg/poe/pob/* |
| `content_buildguide.js` | Finds PoB Link button on maxroll.gg build guides |
| `content_mobalytics.js` | Reads pobb.in URL from mobalytics.gg build pages |
| `content_pobb.js` | Injects POB code into pobb.in and auto-clicks Create |
| `icon128.png` | Extension icon |

---

## Troubleshooting

Open DevTools (F12) on any supported page and check the Console for `[PathToPobb.in]` log lines.

---

## Contributing

PRs welcome. If any source site updates their DOM and breaks the selectors, open an issue with the new element structure.

You can support this by buying me pizza at https://ko-fi.com/woundeddeermeliorne

---

## Disclaimer

Not affiliated with Maxroll, Mobalytics, pobb.in, or Grinding Gear Games. Path of Exile is a trademark of Grinding Gear Games.

---

## License

[MIT](LICENSE)
