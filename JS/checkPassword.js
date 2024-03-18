document.getElementById('submitButton').addEventListener('click', function() {
  const password = document.getElementById('passwordInput').value;
  chrome.runtime.sendMessage({ type: 'checkPassword', password: password }, function(response) {
    if (response.success) {
      document.getElementById('statusMessage').textContent = 'Password correct! You can access blocked sites.';
    } else {
      document.getElementById('statusMessage').textContent = 'Incorrect password! Access denied.';
    }
  });
});
