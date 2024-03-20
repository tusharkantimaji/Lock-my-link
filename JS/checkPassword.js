const localStoragePasswordKey = "lockMyLinkPassword";

document.getElementById('submitButton').addEventListener('click', function() {
  const password = document.getElementById('passwordInput').value;
  const storedPassword = localStorage.getItem(localStoragePasswordKey);
  document.getElementById('beforeCheck').textContent = `given pass = ${password} and Stored pass = ${storedPassword}`;
  chrome.runtime.sendMessage({ type: 'checkPassword', password: password }, function(response) {
    if (password === storedPassword) {
      document.getElementById('statusMessage').textContent = 'Password correct! You can access blocked sites.';
    } else {
      document.getElementById('statusMessage').textContent = 'Incorrect password! Access denied.';
    }
  });
});
