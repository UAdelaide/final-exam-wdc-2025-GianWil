const express = require('express');
const path = require('path');
const app = express();

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

app.listen(8080, () => {
  console.log('Server running at http://localhost:8080');
});
// Added to Vue methods
async login() {
  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: this.username,
      password: this.password
    })
  });

  const result = await response.json();

  if (response.ok) {
    if (result.role === 'owner') {
      window.location.href = '/owner-dashboard.html';
    } else if (result.role === 'walker') {
      window.location.href = '/walker-dashboard.html';
    }
  } else {
    this.errorMessage = result.error || 'Login failed';
  }
}


