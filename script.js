async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);

  const currentUrl = tab.url;

  const urlObject = new URL(currentUrl);
  const urlBeforeSearchParam = urlObject.origin + urlObject.pathname;

  const rootElement = document.getElementById('root');
  rootElement.innerHTML = `Are you sure you want to lock this URL: ${urlBeforeSearchParam} ?`;
}

getCurrentTab();