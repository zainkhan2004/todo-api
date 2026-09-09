const assert = require('assert');
const tasks = require('./tasks');

// seeded with 3 tasks
assert.strictEqual(tasks.getAll().length, 3, 'should start with 3 seeded tasks');

// read
assert.ok(tasks.getById(1), 'task 1 should exist');
assert.strictEqual(tasks.getById(99), undefined, 'task 99 should not exist');

// create
const created = tasks.create('Buy eggs');
assert.strictEqual(created.id, 4, 'new task should get next free id');
assert.strictEqual(created.done, false, 'new task should default done=false');
assert.strictEqual(tasks.getAll().length, 4, 'list should grow by 1');

// update
const updated = tasks.update(1, { done: true });
assert.strictEqual(updated.done, true, 'update should flip done');
assert.strictEqual(tasks.update(99, { done: true }), null, 'updating unknown id returns null');

// delete
assert.strictEqual(tasks.remove(2), true, 'deleting existing id returns true');
assert.strictEqual(tasks.getById(2), undefined, 'deleted task should be gone');
assert.strictEqual(tasks.remove(999), false, 'deleting unknown id returns false');

// reset
tasks.reset();
assert.strictEqual(tasks.getAll().length, 3, 'reset should restore 3 tasks');

console.log('ALL LOGIC TESTS PASSED ✔');
