const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();

// Session middleware
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Example login route (replace with real authentication logic)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Placeholder login check — replace with actual DB validation
  if ((username === 'alice123' || username === 'carol123') && password === 'test') {
    req.session.user = { username, role: 'owner' };
    res.json({ role: 'owner' });
  } else if (username === 'bobwalker' && password === 'test') {
    req.session.user = { username, role: 'walker' };
    res.json({ role: 'walker' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// Start server
app.listen(8080, () => {
  console.log('Server running at http://localhost:8080');
});
