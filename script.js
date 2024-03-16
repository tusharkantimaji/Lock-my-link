document.addEventListener("DOMContentLoaded", async () => {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);

  const currentUrl = tab.url;

  const urlObject = new URL(currentUrl);
  const urlBeforeSearchParam = urlObject.origin + urlObject.pathname;

  const currentTabUrlElement = document.getElementById('currentTabUrl');
  currentTabUrlElement.innerHTML = urlBeforeSearchParam;

  const page1Element = document.getElementById('page1');
  const page2Element = document.getElementById('page2');
  const page3Element = document.getElementById('page3');

  document.getElementById('confirmBtn').addEventListener('click', function() {
    const password = prompt('Enter password:');
    if (password !== null) {
      const showPasswordElement = document.getElementById('passwordContent');

      showPasswordElement.innerHTML = ` ${password}`;
      page1Element.style.display = 'none';
      page2Element.style.display = 'block';
    }
  });


  document.getElementById('lockBtn').addEventListener('click', function() {
    page2Element.style.display = 'none';
    page3Element.style.display = 'block';
  });

});
