const express = require('express');
const tasks = require('./tasks');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ name: 'Task API', version: '1.0', endpoints: ['/tasks'] });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/tasks', (req, res) => {
  res.json(tasks.getAll());
});

app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.getById(id);
  if (!task) return res.status(404).json({ error: `Task ${id} not found` });
  res.json(task);
});

app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required and must be a non-empty string' });
  }
  const created = tasks.create(title);
  res.status(201).json(created);
});

app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = tasks.getById(id);
  if (!existing) return res.status(404).json({ error: `Task ${id} not found` });

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

  const updated = tasks.update(id, { title, done });
  res.json(updated);
});

app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const ok = tasks.remove(id);
  if (!ok) return res.status(404).json({ error: `Task ${id} not found` });
  res.status(204).end();
});

app.listen(3000, () => console.log('Task API listening on http://localhost:3000'));
