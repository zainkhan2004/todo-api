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

app.listen(3000, () => console.log('Task API listening on http://localhost:3000'));
