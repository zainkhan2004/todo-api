const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
const { pool, init } = require('./db');

const app = express();
app.use(express.json());

function toClient(row) {
  return { id: row.id, title: row.title, done: row.done };
}

app.get('/', (req, res) => {
  res.json({ name: 'Task API', version: '3.0', endpoints: ['/tasks'] });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'ok' });
  } catch {
    res.status(500).json({ status: 'ok', db: 'down' });
  }
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.get('/tasks', async (req, res, next) => {
  try {
    let sql = 'SELECT * FROM tasks';
    const clauses = [];
    const params = [];
    if (req.query.done !== undefined) {
      params.push(req.query.done === 'true');
      clauses.push(`done = $${params.length}`);
    }
    if (req.query.search) {
      params.push(`%${req.query.search}%`);
      clauses.push(`title ILIKE $${params.length}`);
    }
    if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
    sql += ' ORDER BY id';
    const { rows } = await pool.query(sql, params);
    res.json(rows.map(toClient));
  } catch (err) { next(err); }
});

app.get('/tasks/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Task not found' });
    res.json(toClient(rows[0]));
  } catch (err) { next(err); }
});

app.post('/tasks', async (req, res, next) => {
  try {
    const { title } = req.body;
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title is required and must be a non-empty string' });
    }
    const { rows } = await pool.query(
      'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
      [title, false]
    );
    res.status(201).json(toClient(rows[0]));
  } catch (err) { next(err); }
});

app.put('/tasks/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rows: existingRows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    const existing = existingRows[0];
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const { title, done } = req.body;
    if (title === undefined && done === undefined) {
      return res.status(400).json({ error: 'provide title and/or done to update' });
    }
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'title must be a non-empty string' });
    }
    if (done !== undefined && typeof done !== 'boolean') {
      return res.status(400).json({ error: 'done must be true or false' });
    }
    const newTitle = title !== undefined ? title : existing.title;
    const newDone = done !== undefined ? done : existing.done;
    const { rows } = await pool.query(
      'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
      [newTitle, newDone, id]
    );
    res.json(toClient(rows[0]));
  } catch (err) { next(err); }
});

app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Task not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});

app.get('/stats', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE done) AS done FROM tasks'
    );
    const total = Number(rows[0].total);
    const done = Number(rows[0].done);
    res.json({ total, done, open: total - done });
  } catch (err) { next(err); }
});

app.get('/public/info', (req, res) => {
  res.json({ message: 'Welcome stranger! This info is public.' });
});

app.get('/protected/profile', async (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ') || !header.slice(7).trim()) {
    return res.status(401).json({ error: 'Access token required' });
  }
  const token = header.slice(7).trim();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  res.json({ id: data.user.id, email: data.user.email, created_at: data.user.created_at });
});

const supabase = require('./supabaseClient');

app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data.user);
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Invalid login credentials' });
  res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});

const PORT = process.env.PORT || 3000;
init()
  .then(() => app.listen(PORT, () => console.log(`Task API listening on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
