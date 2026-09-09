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

module.exports = { getAll, getById, seed };
