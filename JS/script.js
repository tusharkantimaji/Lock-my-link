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
      descriptionMessage: 'To unlock this URL, Click the Unlock Button'
    }
  } else {
    homePageInfo = {
      buttonText: 'Lock',
      buttonColor: 'red',
      descriptionMessage: 'To lock this URL, Click the Lock Button'
    }
  }
  allElementObjects.lockOrUnlockBtnElement.innerHTML = homePageInfo.buttonText;
  allElementObjects.lockOrUnlockBtnElement.style.backgroundColor = homePageInfo.buttonColor;
  allElementObjects.areYouSureElement.innerHTML = homePageInfo.descriptionMessage;
  allElementObjects.areYouSureElement.style.color = homePageInfo.buttonColor;
  allElementObjects.areYouSureElement.style.color = homePageInfo.buttonColor;
}

async function getCurrentTabUrl() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);

  const currentUrl = tab.url;

  const urlObject = new URL(currentUrl);
  const urlBeforeSearchParam = urlObject.origin + urlObject.pathname;

  return urlBeforeSearchParam;
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
  const updateDataSectionElement = document.getElementById('updateDataSection');

  return {
    page0Element,
    page1Element,
    page2Element,
    page3Element,
    page4Element,
    currentTabUrlElement,
    lockOrUnlockBtnElement,
    areYouSureElement,
    updateDataSectionElement
  };
}

async function handleSetPasswordClick(allElementObjects) {
  const password = prompt('Enter password:');
  if (password !== null) {
    await storePassword(password);
    allElementObjects.page0Element.style.display = 'none';
    allElementObjects.page1Element.style.display = 'block';
    allElementObjects.updateDataSectionElement.style.display = 'block';
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
  allElementObjects.page2Element.style.display = 'block'; //TODO: GRID
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
  updateRules(Object.keys(lockedUrlsObj).length - 1, lockedUrlsObj);
}

function unlockUrl(currentUrl) {
  const lockedUrls = localStorage.getItem(localStorageLockedUrlsKey);
  const lockedUrlsObj = lockedUrls ? JSON.parse(lockedUrls) : {};
  delete lockedUrlsObj[currentUrl];
  updateRules(Object.keys(lockedUrlsObj).length + 1, lockedUrlsObj);
}

function updateRules(currentRulesLength, updatedRules){
  chrome.runtime.sendMessage({ action: 'updateRules', currentRulesLength, updatedRules }, (response) => {
  if (response.success) {
    localStorage.setItem(localStorageLockedUrlsKey, JSON.stringify(updatedRules));
    console.log('Rules updated successfully');
  } else {
    console.error('Error updating rules');
  }
});
}

function decideLandingPageView(allElementObjects) {
  const storedPassword = localStorage.getItem(localStoragePasswordKey);
  
  if (storedPassword) {
    allElementObjects.page2Element.style.display = 'block'; // TODO: GRID
  } else {
    allElementObjects.page0Element.style.display = 'block';
    allElementObjects.updateDataSectionElement.style.display = 'none';
  }
}