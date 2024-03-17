document.addEventListener("DOMContentLoaded", async () => {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);

  const currentUrl = tab.url;

  const urlObject = new URL(currentUrl);
  const urlBeforeSearchParam = urlObject.origin + urlObject.pathname;

  const currentTabUrlElement = document.getElementById('currentTabUrl');
  currentTabUrlElement.innerHTML = urlBeforeSearchParam;
  let isCurrentUrlLocked = false; // TODO: await isUrlLocked(currentUrl);

  const page0Element = document.getElementById('page0');
  const page1Element = document.getElementById('page1');
  const page2Element = document.getElementById('page2');
  const page3Element = document.getElementById('page3');
  const page4Element = document.getElementById('page4');
  const lockOrUnlockBtnElement = document.getElementById('lockOrUnlockBtn');
  const areYouSureElement = document.getElementById('areYouSure');

  updateLockAndUnlockButton(isCurrentUrlLocked, lockOrUnlockBtnElement, areYouSureElement);

  document.getElementById('setPasswordBtn').addEventListener('click', function() {
    const password = prompt('Enter password:');
    if (password !== null) {
      page0Element.style.display = 'none';
      page1Element.style.display = 'block';
    }
  });

  const goHomeButtons = document.querySelectorAll('.goHomeBtn');
  goHomeButtons.forEach(button => {
    button.addEventListener('click', () => {
      page1Element.style.display = 'none';
      page3Element.style.display = 'none';
      page4Element.style.display = 'none';
      page2Element.style.display = 'block';
    });
  });

  // TODO:
  document.getElementById('lockOrUnlockBtn').addEventListener('click', async function() {
    let successfulUpdate = true; // await storePassword(currentUrl, password);
    if (isCurrentUrlLocked) {
      // await unlockUrl(currentUrl);
      successfulUpdate = true;
    }
    else {
      // await lockUrl(currentUrl);
      successfulUpdate = true;
    }

    if (successfulUpdate) {
      page3Element.style.display = 'block';
      isCurrentUrlLocked = !isCurrentUrlLocked;
      updateLockAndUnlockButton(isCurrentUrlLocked, lockOrUnlockBtnElement, areYouSureElement);
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

function updateLockAndUnlockButton(isCurrentUrlLocked, lockOrUnlockBtnElement, areYouSureElement) {
  let homePageInfo = {
    buttonText: String,
    buttonColor: String,
    descriptionMessage: String
  }

  if (isCurrentUrlLocked) {
    homePageInfo = {
      buttonText: 'Unlock',
      buttonColor: 'green',
      descriptionMessage: 'To unlock this URL, Click the Unlock Button'
    }
  } else {
    homePageInfo = {
      buttonText: 'Lock',
      buttonColor: 'red',
      descriptionMessage: 'To lock this URL, Click the Lock Button'
    }
  }
  lockOrUnlockBtnElement.innerHTML = homePageInfo.buttonText;
  lockOrUnlockBtnElement.style.backgroundColor = homePageInfo.buttonColor;
  areYouSureElement.innerHTML = homePageInfo.descriptionMessage;
  areYouSureElement.style.color = homePageInfo.buttonColor;
}
