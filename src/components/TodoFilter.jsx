const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
]

function TodoFilter({ filter, onFilter, activeCount, completedCount, onClearCompleted }) {
  return (
    <footer className="todo-footer">
      <span className="todo-footer__count">
        {activeCount} item{activeCount !== 1 ? 's' : ''} left
      </span>

      <nav className="todo-footer__filters" aria-label="Filter todos">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            className={`filter-btn${filter === key ? ' filter-btn--active' : ''}`}
            onClick={() => onFilter(key)}
            aria-pressed={filter === key}
          >
            {label}
          </button>
        ))}
      </nav>

      {completedCount > 0 && (
        <button className="todo-footer__clear" onClick={onClearCompleted}>
          Clear completed
        </button>
      )}
    </footer>
  )
}

export default TodoFilter
