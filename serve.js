/**
 * Combined server: Express API + static React build.
 * Run from the todo-app/ root: node serve.js
 * Serves the API under /todos and /health, and the React SPA for everything else.
 */
const path = require('path');
// Resolve server deps from their own node_modules
const serverRoot = path.join(__dirname, 'server');
const { createApp } = require(path.join(serverRoot, 'src', 'app'));
const express = require(path.join(serverRoot, 'node_modules', 'express'));

const app = createApp();

// Serve the React production build
const DIST = path.join(__dirname, 'client', 'dist');
app.use(express.static(DIST));

// SPA fallback - any non-API route returns index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Todo app listening on :${PORT}`);
});
