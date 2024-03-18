chrome.runtime.onInstalled.addListener(() => {
  const rules = chrome.runtime.getURL('rules.json');
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2], // Remove existing rules
    addRules: [
      {
        "id": 1,
        "priority": 1,
        "action": { "type": "block" },
        "condition": {"urlFilter": "https://www.facebook.com/", "resourceTypes": ["main_frame"] }
      },
      {
        "id": 2,
        "priority": 1,
        "action": { "type": "allow" },
        "condition": { "urlFilter": "https://twitter.com/home", "resourceTypes": ["main_frame"] }
      }
    ]
  });
});
