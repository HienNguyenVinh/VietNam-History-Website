const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001; // Use a different port than React's default 3000

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

// PostgreSQL connection configuration
const pool = new Pool({
  host: 'localhost',
  port: 5555,
  database: 'lichsu',
  user: 'postgres',
  password: '123456',
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

// Ensure users table exists
const ensureUsersTable = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
    console.log('Ensured users table exists');
  } catch (err) {
    console.error('Error ensuring users table exists', err);
  }
};

ensureUsersTable();

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, password_hash]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    delete user.password_hash;
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Courses endpoint
app.get('/api/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM course');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Events for a given course
app.get('/api/courses/:id/events', async (req, res) => {
  const courseId = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM events WHERE courseid = $1 ORDER BY start ASC', [courseId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching events for course', courseId, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Progress for a course for the authenticated user
app.get('/api/courses/:id/progress', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth token' });
  const token = auth.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const courseId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT
         (SELECT COUNT(DISTINCT event_id) FROM test WHERE userid = $1 AND courseid = $2) AS completed,
         (SELECT COUNT(*) FROM events WHERE courseid = $2) AS total
       `,
      [payload.id, courseId]
    );
    const row = result.rows[0] || { completed: 0, total: 0 };
    const completed = parseInt(row.completed || 0, 10);
    const total = parseInt(row.total || 0, 10);
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    res.json({ completed, total, percent });
  } catch (err) {
    console.error('Error fetching course progress', courseId, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Questions for an event
app.get('/api/events/:id/questions', async (req, res) => {
  const eventId = parseInt(req.params.id);
  try {
    const result = await pool.query('SELECT id, question, event_id, opt1, opt2, opt3, ans FROM question WHERE event_id = $1', [eventId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching questions for event', eventId, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Videos for an event
app.get('/api/events/:id/videos', async (req, res) => {
  const eventId = String(req.params.id);
  try {
    const result = await pool.query('SELECT id, name, description, link, category, eventid FROM video WHERE eventid = $1', [eventId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching videos for event', eventId, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Characters for an event (join nhan_vat_events -> nhan_vat)
app.get('/api/events/:id/characters', async (req, res) => {
  const eventId = String(req.params.id);
  try {
    const result = await pool.query(
      `SELECT nv.* FROM nhan_vat_events nve
       JOIN nhan_vat nv ON nv.id = nve.nhan_vat_id
       WHERE nve.events_id = $1`,
      [eventId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching characters for event', eventId, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get last test for a user & event (requires Authorization header)
app.get('/api/events/:id/last-test', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth token' });
  const token = auth.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const eventId = String(req.params.id);
  try {
    const result = await pool.query('SELECT id, courseid, userid, event_id, result FROM test WHERE userid = $1 AND event_id = $2 ORDER BY id DESC LIMIT 1', [payload.id, eventId]);
    if (result.rows.length === 0) return res.json(null);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching last test for event', eventId, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit test result (requires Authorization header with Bearer token)
app.post('/api/tests', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth token' });
  const token = auth.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { courseid, event_id, result } = req.body;
  if (!event_id || typeof result === 'undefined') return res.status(400).json({ error: 'event_id and result are required' });

  try {
    const insert = await pool.query('INSERT INTO test (courseid, userid, event_id, result) VALUES ($1, $2, $3, $4) RETURNING id, courseid, userid, event_id, result', [courseid || null, payload.id, event_id, result]);
    res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error('Error saving test result', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
