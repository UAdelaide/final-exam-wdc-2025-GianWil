const express = require('express');
const pool = require('./db');

const app = express();
const PORT = 8080;

app.use(express.json());

async function insertSampleData() {
  const conn = await pool.getConnection();
  try {
    await conn.query('DROP DATABASE IF EXISTS DogWalkService');
    await conn.query('CREATE DATABASE DogWalkService');
    await conn.query('USE DogWalkService');


    const fs = require('fs');
    const schema = fs.readFileSync('./dogwalks.sql', 'utf8');
    await conn.query(schema);
  } catch (err) {
    console.error('Error seeding database:', err.message);
  } finally {
    conn.release();
  }
}


app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT wr.request_id, d.name AS dog_name, wr.requested_time, wr.duration_minutes, wr.location, u.username AS owner_username
      FROM WalkRequests wr
      JOIN Dogs d ON wr.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
          SELECT COUNT(*) FROM WalkRequests wr
          JOIN WalkApplications wa ON wa.request_id = wr.request_id
          WHERE wa.walker_id = u.user_id AND wr.status = 'completed' AND wa.status = 'accepted'
        ) AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings r ON r.walker_id = u.user_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, async () => {
  await insertSampleData();
  console.log(`Server running at http://localhost:${PORT}`);
});