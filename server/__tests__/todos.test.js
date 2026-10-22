/**
 * Integration tests for the Todos REST API.
 * Uses an in-memory SQLite DB (DB_PATH=:memory:) so each test file is isolated.
 */

process.env.DB_PATH = ':memory:';

const request = require('supertest');
const { createApp } = require('../src/app');
const { closeDb } = require('../src/db');

const app = createApp();

afterAll(() => closeDb());

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('Todos CRUD', () => {
  let createdId;

  it('GET /todos — empty list initially', async () => {
    const res = await request(app).get('/todos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /todos — creates a todo', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ title: 'Buy milk' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Buy milk', completed: false });
    expect(typeof res.body.id).toBe('number');
    createdId = res.body.id;
  });

  it('POST /todos — trims whitespace', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ title: '  Walk dog  ' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Walk dog');
  });

  it('POST /todos — rejects empty title', async () => {
    const res = await request(app).post('/todos').send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  it('POST /todos — rejects missing title', async () => {
    const res = await request(app).post('/todos').send({});
    expect(res.status).toBe(400);
  });

  it('GET /todos — lists created todos', async () => {
    const res = await request(app).get('/todos');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('PATCH /todos/:id — marks completed', async () => {
    const res = await request(app)
      .patch(`/todos/${createdId}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('PATCH /todos/:id — updates title', async () => {
    const res = await request(app)
      .patch(`/todos/${createdId}`)
      .send({ title: 'Buy oat milk' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Buy oat milk');
  });

  it('PATCH /todos/:id — rejects empty title', async () => {
    const res = await request(app)
      .patch(`/todos/${createdId}`)
      .send({ title: '' });
    expect(res.status).toBe(400);
  });

  it('PATCH /todos/:id — 404 on missing id', async () => {
    const res = await request(app)
      .patch('/todos/999999')
      .send({ completed: true });
    expect(res.status).toBe(404);
  });

  it('DELETE /todos/:id — deletes the todo', async () => {
    const res = await request(app).delete(`/todos/${createdId}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /todos/:id — 404 after deletion', async () => {
    const res = await request(app).delete(`/todos/${createdId}`);
    expect(res.status).toBe(404);
  });

  it('GET /todos — deleted item no longer present', async () => {
    const res = await request(app).get('/todos');
    const ids = res.body.map((t) => t.id);
    expect(ids).not.toContain(createdId);
  });
});
