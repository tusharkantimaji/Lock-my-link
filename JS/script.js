const localStoragePasswordKey = "lockMyLinkPassword";
const localStorageLockedUrlsKey = "lockMyLinkLockedUrls";

document.addEventListener("DOMContentLoaded", async () => {
  const allElementObjects = getAllElementObjects();

  decideLandingPageView(allElementObjects);

  const urlBeforeSearchParam = await getCurrentTabUrl();
  let isCurrentUrlLockedObj = isUrlLocked(urlBeforeSearchParam);

  document.getElementById('currentTabUrl').innerHTML = urlBeforeSearchParam;
  await updateLockAndUnlockButton(isCurrentUrlLockedObj);

  document.getElementById('setPasswordBtn').addEventListener('click', () => handleSetPasswordClick(allElementObjects));

  document.getElementById('updatePassBtn').addEventListener('click', () => handleUpdatePassButtonClick(allElementObjects));
  document.getElementById('forgotPassBtn').addEventListener('click', () => handleForgotPassButtonClick(allElementObjects));

  document.getElementById('unlockAllLinksBtn').addEventListener('click', () => handleUnlockAllLinksBtnClick(allElementObjects));
  document.getElementById('reinstallBtn').addEventListener('click', () => handleReinstallBtnClick(allElementObjects));

  const goHomeButtons = document.querySelectorAll('.goHomeBtn');
  goHomeButtons.forEach(button => {
    button.addEventListener('click', () => handleGoHomeClick(allElementObjects));
  });

  document.getElementById('lockOrUnlockBtn').addEventListener('click', () => lockOrUnlockBtnClick(urlBeforeSearchParam, isCurrentUrlLockedObj, allElementObjects));
});

async function handleForgotPassButtonClick(allElementObjects) {
  deactivateAllPages(allElementObjects);
  chrome.identity.getProfileUserInfo(function(userInfo) {
    if (userInfo.email) {
      const email = userInfo.email;
      const storedPassword = localStorage.getItem(localStoragePasswordKey);
      sendForgotPassEmail(email, storedPassword);
      document.getElementById('successMessageText').innerHTML = "Password has been shared with the below email" + "<br/>" + "Email: " + email;
      allElementObjects.page1Element.style.display = 'block';
      return;
    }
    document.getElementById('errorMessageText').innerHTML = "Please login to your Google account!";
    allElementObjects.page3Element.style.display = 'block';
  });
}

function handleUpdatePassButtonClick(allElementObjects) {
  if (!matchPassword()) {
    document.getElementById('errorMessageText').innerHTML = "Password doesn't match!";
    deactivateAllPages(allElementObjects);
    allElementObjects.page3Element.style.display = 'block';
    return;
  }
  const newPassword = prompt('Enter new password:');
  if (newPassword !== null && newPassword !== "") {
    storePassword(newPassword);
    document.getElementById('successMessageText').innerHTML = "Password updated successfully!";
    deactivateAllPages(allElementObjects);
    allElementObjects.page1Element.style.display = 'block';
  }
}

function matchPassword() {
  const storedPassword = localStorage.getItem(localStoragePasswordKey);
  const password = prompt('Enter password:');
  if (password !== null && storedPassword === password) {
    return true;
  }
  return false;
}

function handleReinstallBtnClick(allElementObjects) {
  if (!matchPassword()) {
    document.getElementById('errorMessageText').innerHTML = "Password doesn't match!";
    deactivateAllPages(allElementObjects);
    allElementObjects.page3Element.style.display = 'block';
    return;
  }
  const idToRemove = getLockedUrlsIds();
  updateRules(idToRemove, {});
  localStorage.removeItem(localStoragePasswordKey);
  localStorage.removeItem(localStorageLockedUrlsKey);
  deactivateAllPages(allElementObjects);
  allElementObjects.page0Element.style.display = 'block';
  document.getElementById('updateDataSection').style.display = 'none';
}

function getLockedUrlsIds() {
  const lockedUrls = localStorage.getItem(localStorageLockedUrlsKey);
  const lockedUrlsObj = lockedUrls ? JSON.parse(lockedUrls) : {};
  const lockedUrlsKeys = Object.keys(lockedUrlsObj);
  const idToRemove = [];
  lockedUrlsKeys.forEach(url => {
    idToRemove.push(lockedUrlsObj[url]);
  });

  return idToRemove;
}

function handleUnlockAllLinksBtnClick(allElementObjects) {
  if (!matchPassword()) {
    document.getElementById('errorMessageText').innerHTML = "Password doesn't match!";
    deactivateAllPages(allElementObjects);
    allElementObjects.page3Element.style.display = 'block';
    return;
  }
  const lockedUrls = localStorage.getItem(localStorageLockedUrlsKey);
  const lockedUrlsObj = lockedUrls ? JSON.parse(lockedUrls) : {};
  const lockedUrlsKeys = Object.keys(lockedUrlsObj);
  const idToRemove = [];
  lockedUrlsKeys.forEach(url => {
    idToRemove.push(lockedUrlsObj[url]);
    delete lockedUrlsObj[url];
  });
  updateRules(idToRemove, lockedUrlsObj);
  deactivateAllPages(allElementObjects);
  document.getElementById('successMessageText').innerHTML = "All URLs unlocked successfully!";
  allElementObjects.page1Element.style.display = 'block';
}

function deactivateAllPages(allElementObjects) {
  allElementObjects.page0Element.style.display = 'none';
  allElementObjects.page1Element.style.display = 'none';
  allElementObjects.page2Element.style.display = 'none';
  allElementObjects.page3Element.style.display = 'none';
}

function isUrlLocked(url) {
  const lockedUrls = localStorage.getItem(localStorageLockedUrlsKey);
  const lockedUrlsObj = lockedUrls ? JSON.parse(lockedUrls) : {};
  return lockedUrlsObj[url] ? {isCurrentUrlLocked: true} : {isCurrentUrlLocked: false};
}

async function updateLockAndUnlockButton() {
  const urlBeforeSearchParam = await getCurrentTabUrl();
  let isCurrentUrlLockedObj = isUrlLocked(urlBeforeSearchParam);

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

  return {
    page0Element,
    page1Element,
    page2Element,
    page3Element,
  };
}

async function handleSetPasswordClick(allElementObjects) {
  const password = prompt('Enter password:');
  if (password !== null && password !== "") {
    await storePassword(password);
    localStorage.setItem(localStorageLockedUrlsKey, JSON.stringify({}));
    document.getElementById('successMessageText').innerHTML = "Password set successfully!";
    allElementObjects.page0Element.style.display = 'none';
    allElementObjects.page1Element.style.display = 'block';
    document.getElementById('updateDataSection').style.display = 'flex';
  }
}

async function storePassword(password) {
  localStorage.setItem(localStoragePasswordKey, password);
}

async function handleGoHomeClick(allElementObjects) {
  deactivateAllPages(allElementObjects);
  await updateLockAndUnlockButton()
  allElementObjects.page2Element.style.display = 'block';
}

async function lockOrUnlockBtnClick(currentUrl, isCurrentUrlLockedObj, allElementObjects) {
  let successfulUpdate = false;
  let successMessage = "";
  if (isCurrentUrlLockedObj.isCurrentUrlLocked) {
    if (!matchPassword()) {
      document.getElementById('errorMessageText').innerHTML = "Password doesn't match!";
      deactivateAllPages(allElementObjects);
      allElementObjects.page3Element.style.display = 'block';
      return;
    }
    unlockUrl(currentUrl);
    successfulUpdate = true;
    successMessage = "Link Unlocked successfully!";
  }
  else {
    lockUrl(currentUrl);
    successfulUpdate = true;
    successMessage = "Link Locked successfully!";
  }

  if (successfulUpdate) {
    document.getElementById('successMessageText').innerHTML = successMessage;
    allElementObjects.page1Element.style.display = 'block';
    isCurrentUrlLockedObj.isCurrentUrlLocked = !isCurrentUrlLockedObj.isCurrentUrlLocked;
    await updateLockAndUnlockButton();
  }
  else {
    allElementObjects.page3Element.style.display = 'block';
  }
  
  allElementObjects.page2Element.style.display = 'none';
}

function lockUrl(currentUrl) {
  const lockedUrls = localStorage.getItem(localStorageLockedUrlsKey);
  const lockedUrlsObj = lockedUrls ? JSON.parse(lockedUrls) : {};
  const idToRemove = Object.keys(lockedUrlsObj).map((url) => {
    return lockedUrlsObj[url];
  });
  lockedUrlsObj[currentUrl] = getCurrentDateTimeAsInt();
  updateRules(idToRemove, lockedUrlsObj);
}

function unlockUrl(currentUrl) {
  const lockedUrls = localStorage.getItem(localStorageLockedUrlsKey);
  const lockedUrlsObj = lockedUrls ? JSON.parse(lockedUrls) : {};
  const idToRemove = Object.keys(lockedUrlsObj).map((url) => {
    return lockedUrlsObj[url];
  });
  delete lockedUrlsObj[currentUrl];
  updateRules(idToRemove, lockedUrlsObj);
}

function updateRules(idToRemove, updatedRules){
  chrome.runtime.sendMessage({ action: 'updateRules', idToRemove, updatedRules }, (response) => {
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
    allElementObjects.page2Element.style.display = 'block';
  } else {
    allElementObjects.page0Element.style.display = 'block';
    document.getElementById('updateDataSection').style.display = 'none';
  }
}

function getCurrentDateTimeAsInt() {
  const currentDate = new Date();

  const timestamp = currentDate.getTime();

  const timestampInSeconds = Math.floor(timestamp / 1000);
  return parseInt(timestampInSeconds);
}

function sendForgotPassEmail(email, password) {
  // TODO: Implement email sending functionality
}