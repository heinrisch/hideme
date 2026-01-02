// Background service worker

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === 'install') {
        await chrome.storage.sync.set({
            replacements: [],
            apiKeyProtection: true,
            emailDetection: true,
            textReplacement: true
        });

        chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    }
});
