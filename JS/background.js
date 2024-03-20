chrome.runtime.onInstalled.addListener(() => {
  const rules = chrome.runtime.getURL('rules.json');
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [],
    addRules: []
  });
});

const localStorageLockedUrlsKey = "lockMyLinkLockedUrls";


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateRules') {
    const rulesToRemove = [];
    for (let i = 1; i <= message.currentRulesLength; i++) {
      rulesToRemove.push(i);
    }

    const updatedRules = message.updatedRules;
    const rulesToAdd = Object.keys(updatedRules).map((url, i) => ({
      "id": i + 1,
      "priority": 1,
      // "action": { "type": "block" },
      "action": {
        "type": "redirect",
        "redirect": {
          // "url": `https://38.media.tumblr.com/tumblr_ldbj01lZiP1qe0eclo1_500.gif`
          "extensionPath": "/JS/checkPassword.js"
        },
      },
      "condition": { "urlFilter": url, "resourceTypes": ["main_frame"] }
    }));

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rulesToRemove,
      addRules: rulesToAdd,
    }, () => {
      sendResponse({ success: true });
    });

    return true;
  }
});
