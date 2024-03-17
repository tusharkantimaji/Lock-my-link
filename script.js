const localStoragePasswordKey = "lockMyLinkPassword";
const localStorageLockedUrlsKey = "lockMyLinkLockedUrls";

document.addEventListener("DOMContentLoaded", async () => {
  const allElementObjects = getAllElementObjects();

  decideLandingPageView(allElementObjects);

  const urlBeforeSearchParam = await getCurrentTabUrl();
  let isCurrentUrlLockedObj = isUrlLocked(urlBeforeSearchParam);

  allElementObjects.currentTabUrlElement.innerHTML = urlBeforeSearchParam;
  updateLockAndUnlockButton(isCurrentUrlLockedObj, allElementObjects);

  document.getElementById('setPasswordBtn').addEventListener('click', () => handleSetPasswordClick(allElementObjects));

  const goHomeButtons = document.querySelectorAll('.goHomeBtn');
  goHomeButtons.forEach(button => {
    button.addEventListener('click', () => handleGoHomeClick(allElementObjects));
  });

  document.getElementById('lockOrUnlockBtn').addEventListener('click', () => lockOrUnlockBtnClick(urlBeforeSearchParam, isCurrentUrlLockedObj, allElementObjects));
});

function isUrlLocked(url) {
  const lockedUrls = localStorage.getItem(localStorageLockedUrlsKey);
  const lockedUrlsObj = lockedUrls ? JSON.parse(lockedUrls) : {};
  return lockedUrlsObj[url] ? {isCurrentUrlLocked: true} : {isCurrentUrlLocked: false};
}

function updateLockAndUnlockButton(isCurrentUrlLockedObj, allElementObjects) {
  let homePageInfo = {
    buttonText: String,
    buttonColor: String,
    descriptionMessage: String
  }

  const lockedUrls = localStorage.getItem(localStorageLockedUrlsKey);
  const storedPassword = localStorage.getItem(localStoragePasswordKey);

  if (isCurrentUrlLockedObj.isCurrentUrlLocked) {
    homePageInfo = {
      buttonText: 'Unlock',
      buttonColor: 'green',
      descriptionMessage: 'To unlock this URL, Click the Unlock Button' + " " + "Password: " + storedPassword + " " + "Locked URLs: " + lockedUrls
    }
  } else {
    homePageInfo = {
      buttonText: 'Lock',
      buttonColor: 'red',
      descriptionMessage: 'To lock this URL, Click the Lock Button' + " " + "Password: " + storedPassword + " " + "Locked URLs: " + lockedUrls
    }
  }
  allElementObjects.lockOrUnlockBtnElement.innerHTML = homePageInfo.buttonText;
  allElementObjects.lockOrUnlockBtnElement.style.backgroundColor = homePageInfo.buttonColor;
  allElementObjects.areYouSureElement.innerHTML = homePageInfo.descriptionMessage;
  allElementObjects.areYouSureElement.style.color = homePageInfo.buttonColor;
}

async function getCurrentTabUrl() {
  // let queryOptions = { active: true, lastFocusedWindow: true };
  // let [tab] = await chrome.tabs.query(queryOptions);

  // const currentUrl = tab.url;

  // const urlObject = new URL(currentUrl);
  // const urlBeforeSearchParam = urlObject.origin + urlObject.pathname;

  return "urlBeforeSearchParam";
}

function getAllElementObjects() {
  const page0Element = document.getElementById('page0');
  const page1Element = document.getElementById('page1');
  const page2Element = document.getElementById('page2');
  const page3Element = document.getElementById('page3');
  const page4Element = document.getElementById('page4');
  const currentTabUrlElement = document.getElementById('currentTabUrl');
  const lockOrUnlockBtnElement = document.getElementById('lockOrUnlockBtn');
  const areYouSureElement = document.getElementById('areYouSure');

  return {
    page0Element,
    page1Element,
    page2Element,
    page3Element,
    page4Element,
    currentTabUrlElement,
    lockOrUnlockBtnElement,
    areYouSureElement
  };
}

async function handleSetPasswordClick(allElementObjects) {
  const password = prompt('Enter password:');
  if (password !== null) {
    await storePassword(password);
    allElementObjects.page0Element.style.display = 'none';
    allElementObjects.page1Element.style.display = 'block';
  }
}

async function storePassword(password) {
  localStorage.setItem(localStoragePasswordKey, password);
  localStorage.setItem(localStorageLockedUrlsKey, JSON.stringify({}));
}

function handleGoHomeClick(allElementObjects) {
  allElementObjects.page1Element.style.display = 'none';
  allElementObjects.page3Element.style.display = 'none';
  allElementObjects.page4Element.style.display = 'none';
  allElementObjects.page2Element.style.display = 'block';
}

function lockOrUnlockBtnClick(currentUrl, isCurrentUrlLockedObj, allElementObjects) {
  let successfulUpdate = false;
  if (isCurrentUrlLockedObj.isCurrentUrlLocked) {
    unlockUrl(currentUrl);
    successfulUpdate = true;
  }
  else {
    lockUrl(currentUrl);
    successfulUpdate = true;
  }

  if (successfulUpdate) {
    allElementObjects.page3Element.style.display = 'block';
    isCurrentUrlLockedObj.isCurrentUrlLocked = !isCurrentUrlLockedObj.isCurrentUrlLocked;
    updateLockAndUnlockButton(isCurrentUrlLockedObj, allElementObjects);
  }
  else {
    allElementObjects.page4Element.style.display = 'block';
  }
  
  allElementObjects.page2Element.style.display = 'none';
}

function lockUrl(currentUrl) {
  const lockedUrls = localStorage.getItem(localStorageLockedUrlsKey);
  const lockedUrlsObj = lockedUrls ? JSON.parse(lockedUrls) : {};
  lockedUrlsObj[currentUrl] = true;
  localStorage.setItem(localStorageLockedUrlsKey, JSON.stringify(lockedUrlsObj));
}

function unlockUrl(currentUrl) {
  const lockedUrls = localStorage.getItem(localStorageLockedUrlsKey);
  const lockedUrlsObj = lockedUrls ? JSON.parse(lockedUrls) : {};
  delete lockedUrlsObj[currentUrl];
  localStorage.setItem(localStorageLockedUrlsKey, JSON.stringify(lockedUrlsObj));
}

function decideLandingPageView(allElementObjects) {
  const storedPassword = localStorage.getItem(localStoragePasswordKey);
  
  if (storedPassword) {
    allElementObjects.page2Element.style.display = 'block';
  } else {
    allElementObjects.page0Element.style.display = 'block';
  }
}