const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3001; // Use a different port than React's default 3000

// Enable CORS for all routes
app.use(cors());

// PostgreSQL connection configuration
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'lichsu',
  user: 'postgres',
  password: 'hien1972003',
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Route to fetch all videos
app.get('/api/videos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM video');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch all events
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY CASE WHEN id='116' THEN (SELECT start::float FROM events WHERE id='115')+0.1 WHEN id='145' THEN (SELECT start::float FROM events WHERE id='144')+0.1 WHEN start LIKE '%TCN%' THEN -CAST(NULLIF(REGEXP_REPLACE(REPLACE(start,'TCN',''),'[^0-9]','','g'),'') AS INTEGER) WHEN start ~ '^[0-9]+$' THEN CAST(REGEXP_REPLACE(start,'^0+','') AS INTEGER) ELSE NULL END ASC");
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch all nhan_vat
app.get('/api/nhan_vat', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM nhan_vat WHERE birth_year != 'N/A' OR death_year != 'N/A'");
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching nhan_vat:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
