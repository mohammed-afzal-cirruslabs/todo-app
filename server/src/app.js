const express = require('express');
const cors = require('cors');
const todosRouter = require('./todos');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/todos', todosRouter);

  return app;
}

module.exports = { createApp };
