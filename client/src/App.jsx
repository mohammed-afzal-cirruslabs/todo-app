import React, { useState, useEffect, useRef } from 'react';
import { fetchTodos, createTodo, toggleTodo, deleteTodo } from './api';
import { TodoItem } from './TodoItem';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchTodos()
      .then(setTodos)
      .catch(() => setError('Could not load todos.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    const title = input.trim();
    if (!title) return;
    try {
      const todo = await createTodo(title);
      setTodos((prev) => [...prev, todo]);
      setInput('');
      setError('');
      inputRef.current?.focus();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(todo) {
    try {
      const updated = await toggleTodo(todo.id, !todo.completed);
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError('Could not update todo.');
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('Could not delete todo.');
    }
  }

  const visible = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div className="app">
      <h1>Todos</h1>

      <form onSubmit={handleAdd} className="add-form">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          aria-label="New todo"
          className="add-input"
        />
        <button type="submit" className="add-btn">Add</button>
      </form>

      {error && <p role="alert" className="error">{error}</p>}

      {loading ? (
        <p className="loading">Loading…</p>
      ) : (
        <>
          <ul className="todo-list" aria-label="Todo list">
            {visible.length === 0 && (
              <li className="empty">Nothing here.</li>
            )}
            {visible.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={(_id, _newCompleted) => handleToggle(todo)}
                onDelete={handleDelete}
              />
            ))}
          </ul>

          <footer className="footer">
            <span>{remaining} item{remaining !== 1 ? 's' : ''} left</span>
            <div className="filters" role="group" aria-label="Filter todos">
              {['all', 'active', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`filter-btn${filter === f ? ' active' : ''}`}
                  aria-pressed={filter === f}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
