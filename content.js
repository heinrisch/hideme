// CRITICAL: Inject CSS immediately - this runs before DOM parsing
(function () {
    const style = document.createElement('style');
    style.id = 'hideme-protection';
    style.textContent = `
    html.hideme-processing * { visibility: hidden !important; }
    html.hideme-processing [data-hideme-processed="true"],
    html.hideme-processing [data-hideme-processed="true"] * { visibility: visible !important; }
    html.hideme-processing, html.hideme-processing body, html.hideme-processing head,
    html.hideme-processing script, html.hideme-processing style, html.hideme-processing link,
    html.hideme-processing meta, html.hideme-processing noscript { visibility: visible !important; }
    html.hideme-processing img, html.hideme-processing video, html.hideme-processing canvas,
    html.hideme-processing svg { visibility: visible !important; }
  `;
    (document.head || document.documentElement).prepend(style);
    document.documentElement.classList.add('hideme-processing');
})();

let state = {
    replacements: [],
    apiKeyProtection: true,
    emailDetection: true,
    textReplacement: true,
    isProcessing: false
};

const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

function removeHideCSS() {
    document.documentElement.classList.remove('hideme-processing');
    const style = document.getElementById('hideme-protection');
    if (style) style.remove();
}

async function loadSettings() {
    try {
        const res = await chrome.storage.sync.get(['replacements', 'apiKeyProtection', 'emailDetection', 'textReplacement']);
        state = {
            ...state,
            replacements: res.replacements || [],
            apiKeyProtection: res.apiKeyProtection !== false,
            emailDetection: res.emailDetection !== false,
            textReplacement: res.textReplacement !== false
        };
    } catch (e) {
        console.error('HideMe: Settings load error', e);
    }
}

const EXCLUDED_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'HEAD', 'META', 'LINK']);

function processTextNode(node) {
    if (!node.nodeValue?.trim()) return;
    if (node.parentElement && EXCLUDED_TAGS.has(node.parentElement.tagName)) return;

    let text = node.nodeValue;
    const initialText = text;

    if (state.textReplacement) {
        state.replacements.forEach(({ find, replace, caseInsensitive }) => {
            if (!find || !replace) return;
            try {
                const regex = new RegExp(escapeRegExp(find), 'g' + (caseInsensitive ? 'i' : ''));
                text = text.replace(regex, replace);
            } catch (e) { }
        });
    }

    if (state.emailDetection) {
        text = text.replace(EMAIL_PATTERN, '[EMAIL_HIDDEN]');
    }

    if (state.apiKeyProtection && typeof API_KEY_PATTERNS !== 'undefined') {
        API_KEY_PATTERNS.forEach(({ name, pattern, replacement }) => {
            if (name === 'Email Address') return;
            text = text.replace(pattern, replacement);
        });
    }

    if (text !== initialText) {
        node.nodeValue = text;
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function walkTextNodes(element) {
    if (!element) return;

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode: node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                return EXCLUDED_TAGS.has(node.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
            }
            return node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(processTextNode);
}

function processDocument() {
    if (state.isProcessing) return;
    state.isProcessing = true;
    try {
        walkTextNodes(document.body || document.documentElement);
    } finally {
        state.isProcessing = false;
    }
}

async function init() {
    await loadSettings();

    if (document.body) {
        processDocument();
        requestAnimationFrame(removeHideCSS);
    } else {
        new MutationObserver((_, obs) => {
            if (document.body) {
                obs.disconnect();
                processDocument();
                requestAnimationFrame(removeHideCSS);
            }
        }).observe(document.documentElement, { childList: true });
    }

    new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) processTextNode(node);
                    else if (node.nodeType === Node.ELEMENT_NODE) {
                        walkTextNodes(node);
                    }
                });
            } else if (mutation.type === 'characterData') {
                processTextNode(mutation.target);
            }
        });
    }).observe(document.documentElement, {
        childList: true, subtree: true, characterData: true
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync') {
            if (changes.replacements) state.replacements = changes.replacements.newValue || [];
            if (changes.apiKeyProtection) state.apiKeyProtection = changes.apiKeyProtection.newValue !== false;
            if (changes.emailDetection) state.emailDetection = changes.emailDetection.newValue !== false;
            if (changes.textReplacement) state.textReplacement = changes.textReplacement.newValue !== false;
            processDocument();
        }
    });

    setTimeout(() => {
        if (document.documentElement.classList.contains('hideme-processing')) {
            console.warn('HideMe: Fallback reveal');
            removeHideCSS();
        }
    }, 3000);
}

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
