const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, passwAord, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login (dummy version)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE email = ? AND password_hash = ?
    `, [email, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;

<!-- Apply -->
<button type="button" class="btn btn-outline-success"
@click="applyToWalk(walk.request_id)">
Apply
</button>
</div>


onMounted(async () => {
user.value = await getCurrentUser(); // fetches user and assigns
await loadWalkRequests() // waits until user is ready


});

<script>
const { createApp, ref, onMounted } = Vue;


createApp({
setup() {
const walks = ref([]);
const message = ref('');
const error = ref('');
const user = ref(null);


// get currently loggedin user
async function getCurrentUser() {
try {
const res = await fetch('/api/users/me');
if (!res.ok) throw new Error('Failed to fetch current user');
const data = await res.json();
return data.user_id;
} catch (err) {
console.error('getCurrentUser() failed:', err.message);
return null;
}
}


async function loadWalkRequests() {
try {
const res = await fetch('/api/walks');
if (!res.ok) throw new Error('Failed to load walk requests');
walks.value = await res.json();
} catch (err) {
error.value = err.message;
}
}


async function applyToWalk(requestId) {
try {
if (!user.value) throw new Error('User ID not loaded');


const res = await fetch(/api/walks/${requestId}/apply, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ walker_id: user.value })
});


const result = await res.json();
if (!res.ok) throw new Error(result.error || 'Application failed');
message.value = result.message;
error.value = '';
await loadWalkRequests();
} catch (err) {
error.value = err.message;
message.value = '';
}
}


onMounted(async () => {
const currentUser = await getCurrentUser();
if (currentUser) {
user.value = currentUser;
} else {
error.value = 'Failed to load user.';
}


await loadWalkRequests();
});


return {
walks,
message,
error,
applyToWalk
};
}
}).mount('#app');
 </script>