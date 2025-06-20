// server.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const mysql = require('mysql2/promise');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: 'exam-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // secure: true only if using HTTPS
}));

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DogWalkService'
});

// Login route (example)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    // Here you would normally compare password hashes
    if (user.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set session
    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      role: user.role
    };

    res.json({ message: 'Login successful', role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
app.get('/api/users/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    user_id: req.session.user.user_id,
    username: req.session.user.username,
    role: req.session.user.role
  });
});

app.listen(8080, () => {
  console.log('Server running at http://localhost:8080');
});
