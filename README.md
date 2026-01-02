# HideMe - Personal Information Protector

**Goal:** Protect streamers and presenters from accidental doxing by masking personal information and API keys in real-time within the browser.

> [!WARNING]
> **This is a safety net, not a guarantee.** Modern web applications use complex rendering techniques (iframes, canvases, shadow DOMs, or rapid state updates) that can sometimes bypass DOM-based masking. **Hiding information reliably is extremely difficult.** Use this as a secondary layer of protection, but never rely on it as your sole defense against sensitive data exposure.

## Key Features
- **Real-time Masking:** Uses `MutationObserver` to detect and hide sensitive text as it's added to the page.
- **Auto-Detection:** Built-in patterns for common API keys (Twitch, AWS, GitHub, Stripe, Discord, etc.) and email addresses.
- **Custom Rules:** Define your own find-and-replace pairs for names, addresses, or internal project codes.
- **Privacy First:** All logic runs locally in your browser. No data is ever sent to external servers.

## Quick Start
1. **Install**: Clone this repo and load the folder as an unpacked extension in `chrome://extensions/` (Developer Mode required).
2. **Setup**: Click the extension icon to toggle protections or open the **Settings** page to add custom words.
3. **Deploy**: Changes apply instantly to all open tabs.

## Known Limitations
Web technology is diverse, and this extension cannot catch everything:
- Text rendered in **Canvases** or **Images**.
- Content inside certain restricted **iframes** or **Shadow DOMs**.
- Text fragmented across multiple DOM nodes by the browser's layout engine.

## Development
Contributions are welcome. Add new detection patterns to `patterns.js`.

**License:** MIT
**Stay safe while streaming! 🛡️**
