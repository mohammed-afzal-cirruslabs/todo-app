const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const API_PORT = parseInt(process.env.API_PORT || '3001', 10);
const PORT = process.env.PORT || 5173;

// Manual proxy for /todos — forward to backend, preserving path + body
app.use('/todos', (req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: API_PORT,
    path: '/todos' + (req.url === '/' ? '' : req.url),
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${API_PORT}` },
  };

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxy.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.status(502).json({ error: 'Bad gateway' });
  });

  req.pipe(proxy, { end: true });
});

// Serve the React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => console.log(`Frontend server on :${PORT}`));
