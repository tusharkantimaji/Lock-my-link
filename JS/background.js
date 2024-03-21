chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [],
    addRules: []
  });
});

const localStorageLockedUrlsKey = "lockMyLinkLockedUrls";


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateRules') {
    const updatedRules = message.updatedRules;
    const rulesToAdd = Object.keys(updatedRules).map((url) => ({
      "id": updatedRules[url],
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
      removeRuleIds: message.idToRemove,
      addRules: rulesToAdd,
    }, () => {
      sendResponse({ success: true });
    });

    return true;
  }
});
