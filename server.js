const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
const tasks = require('./tasks');

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
  let result = tasks.getAll();
  if (req.query.done !== undefined) {
    result = result.filter((t) => String(t.done) === req.query.done);
  }
  if (req.query.search) {
    const term = req.query.search.toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(term));
  }
  res.json(result);
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

app.post('/reset', (req, res) => {
  res.json(tasks.reset());
});

app.get('/stats', (req, res) => {
  const all = tasks.getAll();
  const done = all.filter((t) => t.done).length;
  res.json({ total: all.length, done, open: all.length - done });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Task API listening on http://localhost:${PORT}`));
