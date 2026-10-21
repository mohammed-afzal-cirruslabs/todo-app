import { useState } from 'react'
import useTodos from './hooks/useTodos.js'
import TodoInput from './components/TodoInput.jsx'
import TodoList from './components/TodoList.jsx'
import TodoFilter from './components/TodoFilter.jsx'
import './App.css'

function App() {
  const { todos, addTodo, toggleTodo, deleteTodo, clearCompleted } = useTodos()
  const [filter, setFilter] = useState('all') // all | active | completed

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const activeCount = todos.filter((t) => !t.completed).length
  const completedCount = todos.filter((t) => t.completed).length

  return (
    <div className="app">
      <header className="app-header">
        <h1>todos</h1>
      </header>

      <main className="app-main">
        <TodoInput onAdd={addTodo} />

        {todos.length > 0 && (
          <>
            <TodoList
              todos={filtered}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
            <TodoFilter
              filter={filter}
              onFilter={setFilter}
              activeCount={activeCount}
              completedCount={completedCount}
              onClearCompleted={clearCompleted}
            />
          </>
        )}

        {todos.length === 0 && (
          <p className="empty-state">No todos yet — add one above!</p>
        )}
      </main>
    </div>
  )
}

export default App
