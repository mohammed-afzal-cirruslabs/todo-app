import { useState, useCallback } from 'react'
import TodoInput from './components/TodoInput.jsx'
import TodoList from './components/TodoList.jsx'
import TodoFilter from './components/TodoFilter.jsx'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all') // all | active | completed

  const addTodo = useCallback((text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: trimmed, completed: false },
    ])
  }, [])

  const toggleTodo = useCallback((id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }, [])

  const deleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.completed))
  }, [])

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
