const localStoragePasswordKey = "lockMyLinkPassword";
const localStorageLockedUrlsKey = "lockMyLinkLockedUrls";

document.addEventListener("DOMContentLoaded", async () => {
  const allElementObjects = getAllElementObjects();

  decideLandingPageView(allElementObjects);

  const urlBeforeSearchParam = await getCurrentTabUrl();
  let isCurrentUrlLockedObj = isUrlLocked(urlBeforeSearchParam);

  document.getElementById('currentTabUrl').innerHTML = urlBeforeSearchParam;
  updateLockAndUnlockButton(isCurrentUrlLockedObj, allElementObjects);

  document.getElementById('setPasswordBtn').addEventListener('click', () => handleSetPasswordClick(allElementObjects));

  document.getElementById('deleteAllDataBtn').addEventListener('click', () => handleDeleteDataButtonClick(allElementObjects));
  document.getElementById('deleteLockedUrlsBtn').addEventListener('click', () => handleDeleteLockedUrlsBtnClick(allElementObjects));
  document.getElementById('deletePassBtn').addEventListener('click', () => handleDeletePassBtnClick(allElementObjects));

  const goHomeButtons = document.querySelectorAll('.goHomeBtn');
  goHomeButtons.forEach(button => {
    button.addEventListener('click', () => handleGoHomeClick(allElementObjects));
  });

  document.getElementById('lockOrUnlockBtn').addEventListener('click', () => lockOrUnlockBtnClick(urlBeforeSearchParam, isCurrentUrlLockedObj, allElementObjects));
});

function matchPassword() {
  const storedPassword = localStorage.getItem(localStoragePasswordKey);
  const password = prompt('Enter password:');
  if (password !== null && storedPassword === password) {
    return true;
  }
  return false;
}

function handleDeletePassBtnClick(allElementObjects) {
  if (!matchPassword()) {
    document.getElementById('errorMessageText').innerHTML = "Password doesn't match!";
    deactivateAllPages(allElementObjects);
    allElementObjects.page4Element.style.display = 'block';
    return;
  }
  localStorage.removeItem(localStoragePasswordKey);
  localStorage.removeItem(localStorageLockedUrlsKey);
  deactivateAllPages(allElementObjects);
  allElementObjects.page0Element.style.display = 'block';
  document.getElementById('updateDataSection').style.display = 'none';
}

function handleDeleteLockedUrlsBtnClick(allElementObjects) {
  if (!matchPassword()) {
    document.getElementById('errorMessageText').innerHTML = "Password doesn't match!";
    deactivateAllPages(allElementObjects);
    allElementObjects.page4Element.style.display = 'block';
    return;
  }
  const lockedUrls = localStorage.getItem(localStorageLockedUrlsKey);
  const lockedUrlsObj = lockedUrls ? JSON.parse(lockedUrls) : {};
  const lockedUrlsKeys = Object.keys(lockedUrlsObj);
  lockedUrlsKeys.forEach(url => {
    delete lockedUrlsObj[url];
  });
  updateRules(lockedUrlsKeys.length + 1, lockedUrlsObj);
  deactivateAllPages(allElementObjects);
  document.getElementById('successMessageText').innerHTML = "All URLs unlocked successfully!";
  allElementObjects.page1Element.style.display = 'block';
}

function handleDeleteDataButtonClick(allElementObjects) {
  deactivateAllPages(allElementObjects);
  allElementObjects.page5Element.style.display = 'block';
}

function deactivateAllPages(allElementObjects) {
  allElementObjects.page0Element.style.display = 'none';
  allElementObjects.page1Element.style.display = 'none';
  allElementObjects.page2Element.style.display = 'none';
  // allElementObjects.page3Element.style.display = 'none';
  allElementObjects.page4Element.style.display = 'none';
  allElementObjects.page5Element.style.display = 'none';
}

function isUrlLocked(url) {
  const lockedUrls = localStorage.getItem(localStorageLockedUrlsKey);
  const lockedUrlsObj = lockedUrls ? JSON.parse(lockedUrls) : {};
  return lockedUrlsObj[url] ? {isCurrentUrlLocked: true} : {isCurrentUrlLocked: false};
}

function updateLockAndUnlockButton(isCurrentUrlLockedObj) {
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
      descriptionMessage: 'To unlock this URL, Click the Unlock Button' + "<br/>" + "Password: " + storedPassword + "<br/>" + "Locked URLs: " + lockedUrls
    }
  } else {
    homePageInfo = {
      buttonText: 'Lock',
      buttonColor: 'red',
      descriptionMessage: 'To lock this URL, Click the Lock Button' + "<br/>" + "Password: " + storedPassword + "<br/>" + "Locked URLs: " + lockedUrls
    }
  }
  document.getElementById('lockOrUnlockBtn').innerHTML = homePageInfo.buttonText;
  document.getElementById('lockOrUnlockBtn').style.backgroundColor = homePageInfo.buttonColor;
  document.getElementById('areYouSure').innerHTML = homePageInfo.descriptionMessage;
  document.getElementById('areYouSure').style.color = homePageInfo.buttonColor;
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
  // const page3Element = document.getElementById('page3');
  const page4Element = document.getElementById('page4');
  const page5Element = document.getElementById('page5');

  return {
    page0Element,
    page1Element,
    page2Element,
    // page3Element,
    page4Element,
    page5Element,
  };
}

async function handleSetPasswordClick(allElementObjects) {
  const password = prompt('Enter password:');
  if (password !== null && password !== "") {
    await storePassword(password);
    document.getElementById('successMessageText').innerHTML = "Password set successfully!";
    allElementObjects.page0Element.style.display = 'none';
    allElementObjects.page1Element.style.display = 'block';
    document.getElementById('updateDataSection').style.display = 'flex';
  }
}

async function storePassword(password) {
  localStorage.setItem(localStoragePasswordKey, password);
  localStorage.setItem(localStorageLockedUrlsKey, JSON.stringify({}));
}

function handleGoHomeClick(allElementObjects) {
  deactivateAllPages(allElementObjects);
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
    document.getElementById('successMessageText').innerHTML = "Link Status updated successfully!";
    allElementObjects.page1Element.style.display = 'block';
    isCurrentUrlLockedObj.isCurrentUrlLocked = !isCurrentUrlLockedObj.isCurrentUrlLocked;
    updateLockAndUnlockButton(isCurrentUrlLockedObj);
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
    document.getElementById('updateDataSection').style.display = 'none';
  }
}