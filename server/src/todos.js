const express = require('express');
const { getDb } = require('./db');

const router = express.Router();

// GET /todos
router.get('/', (req, res) => {
  const todos = getDb().prepare('SELECT * FROM todos ORDER BY id ASC').all();
  res.json(todos.map(normalise));
});

// POST /todos
router.post('/', (req, res) => {
  const title = (req.body.title || '').trim();
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  const info = getDb()
    .prepare('INSERT INTO todos (title) VALUES (?)')
    .run(title);
  const todo = getDb()
    .prepare('SELECT * FROM todos WHERE id = ?')
    .get(info.lastInsertRowid);
  res.status(201).json(normalise(todo));
});

// PATCH /todos/:id
router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const todo = getDb().prepare('SELECT * FROM todos WHERE id = ?').get(id);
  if (!todo) return res.status(404).json({ error: 'not found' });

  const fields = [];
  const values = [];

  if (req.body.title !== undefined) {
    const title = req.body.title.trim();
    if (!title) return res.status(400).json({ error: 'title cannot be empty' });
    fields.push('title = ?');
    values.push(title);
  }
  if (req.body.completed !== undefined) {
    fields.push('completed = ?');
    values.push(req.body.completed ? 1 : 0);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'nothing to update' });
  }

  values.push(id);
  getDb()
    .prepare(`UPDATE todos SET ${fields.join(', ')} WHERE id = ?`)
    .run(...values);

  const updated = getDb().prepare('SELECT * FROM todos WHERE id = ?').get(id);
  res.json(normalise(updated));
});

// DELETE /todos/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const info = getDb().prepare('DELETE FROM todos WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

function normalise(row) {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    createdAt: row.created_at,
  };
}

module.exports = router;
