function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item${todo.completed ? ' todo-item--done' : ''}`}>
      <label className="todo-item__label">
        <input
          type="checkbox"
          className="todo-item__checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-label={`Mark "${todo.text}" as ${todo.completed ? 'active' : 'completed'}`}
        />
        <span className="todo-item__text">{todo.text}</span>
      </label>
      <button
        className="todo-item__delete"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.text}"`}
      >
        ✕
      </button>
    </li>
  )
}

export default TodoItem
