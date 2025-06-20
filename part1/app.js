const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Setup connection for database seeding (must allow multipleStatements)
async function insertSampleData() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      multipleStatements: true
    });

    const schema = fs.readFileSync('./dogwalks.sql', 'utf8');
    await conn.query(schema);

    console.log('✅ Database seeded successfully.');
    await conn.end();
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
}

// Connect app to DogWalkService database
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DogWalkService'
});

app.use(express.json());

// /api/dogs route
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve dogs', details: err.message });
  }
});

// Start server after seeding DB
insertSampleData().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});