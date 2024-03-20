chrome.runtime.onInstalled.addListener(() => {
  const rules = chrome.runtime.getURL('rules.json');
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2], // Remove existing rules
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
      "action": { "type": "block" },
      "condition": { "urlFilter": url, "resourceTypes": ["main_frame"] }
    }));

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rulesToRemove,
      addRules: rulesToAdd,
    }, () => {
      sendResponse({ success: true });
    });

    return true; // Indicates that sendResponse will be called asynchronously
  }
});