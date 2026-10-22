import React from 'react';

export function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item${todo.completed ? ' done completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id, !todo.completed)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'active' : 'completed'}`}
      />
      <span className="todo-title">{todo.title}</span>
      <button
        onClick={() => onDelete(todo.id)}
        className="delete-btn"
        aria-label={`Delete "${todo.title}"`}
      >
        ✕
      </button>
    </li>
  );
}
