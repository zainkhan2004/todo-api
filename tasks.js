// tasks.js — the "database" (just an array in memory, per Stage 2)
let tasks = [];
let nextId = 1;

function seed() {
  tasks = [
    { id: 1, title: 'Buy milk', done: false },
    { id: 2, title: 'Walk the dog', done: false },
    { id: 3, title: 'Write README', done: true },
  ];
  nextId = 4;
}
seed();

function getAll() {
  return tasks;
}

function getById(id) {
  return tasks.find((t) => t.id === id);
}

function create(title) {
  const task = { id: nextId++, title, done: false };
  tasks.push(task);
  return task;
}

function update(id, changes) {
  const task = getById(id);
  if (!task) return null;
  if (changes.title !== undefined) task.title = changes.title;
  if (changes.done !== undefined) task.done = changes.done;
  return task;
}

function remove(id) {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  return true;
}

function reset() {
  seed();
  return tasks;
}

module.exports = { getAll, getById, create, update, remove, reset };
