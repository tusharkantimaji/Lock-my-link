document.addEventListener("DOMContentLoaded", async () => {
  // let queryOptions = { active: true, lastFocusedWindow: true };
  // let [tab] = await chrome.tabs.query(queryOptions);

  // const currentUrl = tab.url;

  // const urlObject = new URL(currentUrl);
  // const urlBeforeSearchParam = urlObject.origin + urlObject.pathname;

  // const currentTabUrlElement = document.getElementById('currentTabUrl');
  // currentTabUrlElement.innerHTML = urlBeforeSearchParam;

  const page0Element = document.getElementById('page0');
  const page1Element = document.getElementById('page1');
  const page2Element = document.getElementById('page2');
  const page3Element = document.getElementById('page3');
  const page4Element = document.getElementById('page4');

  document.getElementById('setPasswordBtn').addEventListener('click', function() {
    const password = prompt('Enter password:');
    if (password !== null) {
      page0Element.style.display = 'none';
      page1Element.style.display = 'block';
    }
  });

  document.getElementById('goHomeBtn').addEventListener('click', function() {
    console.log("goHomeBtn clicked")
    page1Element.style.display = 'none';
    page3Element.style.display = 'none';
    page4Element.style.display = 'none';
    page2Element.style.display = 'block';
  });

  document.getElementById('lockBtn').addEventListener('click', async function() {
    console.log("lockBto clicked")
    const successStoring = true; // await storePassword(currentUrl, password);

    if (successStoring) {
      page3Element.style.display = 'block';
    }
    else {
      page4Element.style.display = 'block';
    }
    
    page2Element.style.display = 'none';
  });

});

async function storePassword(url, password) {
  console.log(url, password);

  return false;
}
