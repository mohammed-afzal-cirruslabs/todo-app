import { useState, useCallback, useEffect } from 'react'
import * as model from '../lib/todoModel.js'

/**
 * The todo state layer. Loads from localStorage once on mount (lazy initial
 * state, so we read storage exactly once), and writes back whenever the list
 * changes — so todos survive a page reload. This is the single source of truth
 * the UI binds to; there is no server.
 */
export default function useTodos() {
  const [todos, setTodos] = useState(() => model.loadTodos())

  useEffect(() => {
    model.saveTodos(todos)
  }, [todos])

  const addTodo = useCallback((text) => {
    setTodos((prev) => model.addTodo(prev, text))
  }, [])

  const toggleTodo = useCallback((id) => {
    setTodos((prev) => model.toggleTodo(prev, id))
  }, [])

  const deleteTodo = useCallback((id) => {
    setTodos((prev) => model.deleteTodo(prev, id))
  }, [])

  const clearCompleted = useCallback(() => {
    setTodos((prev) => model.clearCompleted(prev))
  }, [])

  return { todos, addTodo, toggleTodo, deleteTodo, clearCompleted }
}
