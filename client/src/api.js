const BASE = '/todos';

export async function fetchTodos() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

export async function createTodo(title) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to create todo');
  }
  return res.json();
}

export async function toggleTodo(id, completed) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

export async function deleteTodo(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete todo');
}
