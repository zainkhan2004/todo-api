const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
const db = require('./db');

function toClient(row) {
  return { id: row.id, title: row.title, done: !!row.done };
}

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ name: 'Task API', version: '1.0', endpoints: ['/tasks'] });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.get('/tasks', (req, res) => {
  let sql = 'SELECT * FROM tasks';
  const clauses = [];
  const params = [];
  if (req.query.done !== undefined) {
    clauses.push('done = ?');
    params.push(req.query.done === 'true' ? 1 : 0);
  }
  if (req.query.search) {
    clauses.push('title LIKE ?');
    params.push(`%${req.query.search}%`);
  }
  if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
  sql += ' ORDER BY id';
  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(toClient));
});

app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Task not found' });
  res.json(toClient(row));
});

app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required and must be a non-empty string' });
  }
  const result = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)').run(title, 0);
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(Number(result.lastInsertRowid));
  res.status(201).json(toClient(row));
});

app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
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
  const newDone = done !== undefined ? (done ? 1 : 0) : existing.done;
  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(newTitle, newDone, id);
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json(toClient(row));
});

app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.status(204).end();
});

app.get('/stats', (req, res) => {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM tasks').get();
  const { done } = db.prepare('SELECT COUNT(*) AS done FROM tasks WHERE done = 1').get();
  res.json({ total, done, open: total - done });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Task API listening on http://localhost:${PORT}`));
