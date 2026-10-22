import { http, HttpResponse } from 'msw';

let nextId = 1;
let todos = [];

export function resetStore() {
  nextId = 1;
  todos = [];
}

export const handlers = [
  http.get('/todos', () => HttpResponse.json(todos)),

  http.post('/todos', async ({ request }) => {
    const body = await request.json();
    const title = (body.title || '').trim();
    if (!title) {
      return HttpResponse.json({ error: 'title is required' }, { status: 400 });
    }
    const todo = { id: nextId++, title, completed: false, createdAt: new Date().toISOString() };
    todos.push(todo);
    return HttpResponse.json(todo, { status: 201 });
  }),

  http.patch('/todos/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    const body = await request.json();
    if (body.completed !== undefined) todos[idx] = { ...todos[idx], completed: body.completed };
    if (body.title !== undefined) todos[idx] = { ...todos[idx], title: body.title.trim() };
    return HttpResponse.json(todos[idx]);
  }),

  http.delete('/todos/:id', ({ params }) => {
    const id = Number(params.id);
    const idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    todos.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
