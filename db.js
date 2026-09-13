const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT false
    )
  `);
  const { rows } = await pool.query('SELECT COUNT(*) FROM tasks');
  if (Number(rows[0].count) === 0) {
    try {
      await pool.query('BEGIN');
      await pool.query('INSERT INTO tasks (title, done) VALUES ($1,$2)', ['Buy milk', false]);
      await pool.query('INSERT INTO tasks (title, done) VALUES ($1,$2)', ['Walk the dog', false]);
      await pool.query('INSERT INTO tasks (title, done) VALUES ($1,$2)', ['Write README', true]);
      await pool.query('COMMIT');
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  }
}

module.exports = { pool, init };
