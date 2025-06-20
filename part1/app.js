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

    console.log(' Database seeded successfully.');
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

// /api/walkrequests/open route
app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        wr.request_id,
        d.name AS dog_name,
        wr.requested_time,
        wr.duration_minutes,
        wr.location,
        u.username AS owner_username
      FROM WalkRequests wr
      JOIN Dogs d ON wr.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to retrieve open walk requests',
      details: err.message
    });
  }
});


app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.username AS walker_username,
        COUNT(r.rating_id) AS total_ratings,
        ROUND(AVG(r.rating), 1) AS average_rating,
        (
          SELECT COUNT(*)
          FROM WalkRequests wr
          JOIN WalkApplications wa ON wa.request_id = wr.request_id
          WHERE wa.walker_id = u.user_id
            AND wr.status = 'completed'
            AND wa.status = 'accepted'
        ) AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings r ON r.walker_id = u.user_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to retrieve walker summaries',
      details: err.message
    });
  }
});


insertSampleData().then(() => {
  app.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
  });
});
