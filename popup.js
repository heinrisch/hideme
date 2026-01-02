const ELEMENTS = {
    textReplacement: () => document.getElementById('textReplacementToggle'),
    emailDetection: () => document.getElementById('emailDetectionToggle'),
    apiKeyProtection: () => document.getElementById('apiKeyToggle'),
    statusIndicator: () => document.querySelector('.status-indicator'),
    statusText: () => document.querySelector('.status-text'),
    openSettings: () => document.getElementById('openSettings')
};

async function loadSettings() {
    const result = await chrome.storage.sync.get(['textReplacement', 'emailDetection', 'apiKeyProtection']);

    ELEMENTS.textReplacement().checked = result.textReplacement !== false;
    ELEMENTS.emailDetection().checked = result.emailDetection !== false;
    ELEMENTS.apiKeyProtection().checked = result.apiKeyProtection !== false;

    updateStatus();
}

async function saveSettings() {
    await chrome.storage.sync.set({
        textReplacement: ELEMENTS.textReplacement().checked,
        emailDetection: ELEMENTS.emailDetection().checked,
        apiKeyProtection: ELEMENTS.apiKeyProtection().checked
    });
    updateStatus();
}

function updateStatus() {
    const isActive = ELEMENTS.textReplacement().checked ||
        ELEMENTS.emailDetection().checked ||
        ELEMENTS.apiKeyProtection().checked;

    const indicator = ELEMENTS.statusIndicator();
    const text = ELEMENTS.statusText();

    indicator.classList.toggle('active', isActive);
    text.textContent = isActive ? 'Protection Active' : 'Protection Disabled';
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();

    ['textReplacement', 'emailDetection', 'apiKeyProtection'].forEach(key => {
        ELEMENTS[key]().addEventListener('change', saveSettings);
    });

    ELEMENTS.openSettings().addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    });
});
