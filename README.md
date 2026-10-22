# Todo App

A full-stack Todo application built with **React + Vite** (frontend) and **Node/Express + SQLite** (backend).

## Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, Vite, CSS (no framework)      |
| Backend  | Node 20, Express 4, better-sqlite3      |
| Tests    | Vitest + React Testing Library (client) |
|          | Jest + Supertest (server)               |
| CI       | GitHub Actions                          |

## Project layout

```
todo-app/
├── client/          # React SPA (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── TodoItem.jsx
│   │   ├── api.js
│   │   └── __tests__/
│   └── package.json
├── server/          # Express REST API
│   ├── src/
│   │   ├── app.js
│   │   ├── db.js
│   │   ├── index.js
│   │   └── todos.js
│   ├── __tests__/
│   └── package.json
├── serve.js         # Combined server (API + static SPA)
└── .github/
    └── workflows/ci.yml
```

## API

| Method | Path         | Description          |
|--------|--------------|----------------------|
| GET    | /health      | Health check         |
| GET    | /todos       | List all todos       |
| POST   | /todos       | Create a todo        |
| PATCH  | /todos/:id   | Update title/status  |
| DELETE | /todos/:id   | Delete a todo        |

## Development

### Prerequisites

- Node 20+

### Install

```bash
cd server && npm install
cd ../client && npm install
```

### Run (development)

```bash
# Terminal 1 — API server on :3001
cd server && node src/index.js

# Terminal 2 — Vite dev server on :5173 (proxies /todos -> :3001)
cd client && npm run dev
```

### Run (production build)

```bash
cd client && npm run build
cd .. && node serve.js          # serves API + SPA on :3000
```

Set `PORT` to override the port. Set `DB_PATH` to override the SQLite file path (use `:memory:` for tests).

### Test

```bash
# Server (Jest + Supertest)
cd server && npm test

# Client (Vitest + React Testing Library)
cd client && npm test
```

## Environment variables

| Variable | Default                  | Description                    |
|----------|--------------------------|--------------------------------|
| PORT     | 3000                     | Port the combined server binds |
| DB_PATH  | server/todos.db          | SQLite database file path      |

## CI

GitHub Actions runs on every push and pull request:

1. **Server tests** — `cd server && npm ci && npm test`
2. **Client tests** — `cd client && npm ci && npm test`
3. **Production build** — `cd client && npm run build` (runs after both test jobs pass)
