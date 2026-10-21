/**
 * Unit tests for the pure todo model functions.
 *
 * These run without a DOM — every function is a plain data transform.
 * Coverage: createTodo, addTodo, toggleTodo, deleteTodo, clearCompleted,
 *           loadTodos, saveTodos (including validation and error paths).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  STORAGE_KEY,
  createTodo,
  addTodo,
  toggleTodo,
  deleteTodo,
  clearCompleted,
  loadTodos,
  saveTodos,
} from './todoModel.js'

// ---------------------------------------------------------------------------
// createTodo
// ---------------------------------------------------------------------------
describe('createTodo', () => {
  it('returns a todo with the trimmed text and completed=false', () => {
    const todo = createTodo('  Buy milk  ')
    expect(todo).toMatchObject({ text: 'Buy milk', completed: false })
    expect(typeof todo.id).toBe('string')
    expect(todo.id.length).toBeGreaterThan(0)
  })

  it('returns null for an empty string', () => {
    expect(createTodo('')).toBeNull()
  })

  it('returns null for a whitespace-only string', () => {
    expect(createTodo('   ')).toBeNull()
  })

  it('returns null for null/undefined input', () => {
    expect(createTodo(null)).toBeNull()
    expect(createTodo(undefined)).toBeNull()
  })

  it('generates unique ids for each call', () => {
    const a = createTodo('A')
    const b = createTodo('B')
    expect(a.id).not.toBe(b.id)
  })
})

// ---------------------------------------------------------------------------
// addTodo
// ---------------------------------------------------------------------------
describe('addTodo', () => {
  it('appends a new todo to the list', () => {
    const result = addTodo([], 'Walk the dog')
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Walk the dog')
  })

  it('returns the same array reference when text is blank', () => {
    const original = [{ id: '1', text: 'Existing', completed: false }]
    const result = addTodo(original, '   ')
    expect(result).toBe(original)
  })

  it('does not mutate the original array', () => {
    const original = []
    const result = addTodo(original, 'New')
    expect(original).toHaveLength(0)
    expect(result).toHaveLength(1)
  })

  it('preserves existing todos', () => {
    const first = addTodo([], 'First')
    const second = addTodo(first, 'Second')
    expect(second).toHaveLength(2)
    expect(second[0].text).toBe('First')
    expect(second[1].text).toBe('Second')
  })
})

// ---------------------------------------------------------------------------
// toggleTodo
// ---------------------------------------------------------------------------
describe('toggleTodo', () => {
  it('flips completed from false to true', () => {
    const todos = [{ id: 'abc', text: 'Read', completed: false }]
    const result = toggleTodo(todos, 'abc')
    expect(result[0].completed).toBe(true)
  })

  it('flips completed from true to false', () => {
    const todos = [{ id: 'abc', text: 'Read', completed: true }]
    const result = toggleTodo(todos, 'abc')
    expect(result[0].completed).toBe(false)
  })

  it('only toggles the targeted todo', () => {
    const todos = [
      { id: '1', text: 'A', completed: false },
      { id: '2', text: 'B', completed: false },
    ]
    const result = toggleTodo(todos, '1')
    expect(result[0].completed).toBe(true)
    expect(result[1].completed).toBe(false)
  })

  it('does not mutate the original array', () => {
    const todos = [{ id: '1', text: 'A', completed: false }]
    toggleTodo(todos, '1')
    expect(todos[0].completed).toBe(false)
  })

  it('returns the same length array', () => {
    const todos = [
      { id: '1', text: 'A', completed: false },
      { id: '2', text: 'B', completed: true },
    ]
    expect(toggleTodo(todos, '1')).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// deleteTodo
// ---------------------------------------------------------------------------
describe('deleteTodo', () => {
  it('removes the todo with the given id', () => {
    const todos = [
      { id: '1', text: 'Keep', completed: false },
      { id: '2', text: 'Remove', completed: false },
    ]
    const result = deleteTodo(todos, '2')
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Keep')
  })

  it('returns an empty array when the only todo is deleted', () => {
    const todos = [{ id: '1', text: 'Only', completed: false }]
    expect(deleteTodo(todos, '1')).toHaveLength(0)
  })

  it('does not mutate the original array', () => {
    const todos = [{ id: '1', text: 'A', completed: false }]
    deleteTodo(todos, '1')
    expect(todos).toHaveLength(1)
  })

  it('is a no-op when the id does not exist', () => {
    const todos = [{ id: '1', text: 'A', completed: false }]
    const result = deleteTodo(todos, 'nonexistent')
    expect(result).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// clearCompleted
// ---------------------------------------------------------------------------
describe('clearCompleted', () => {
  it('removes all completed todos', () => {
    const todos = [
      { id: '1', text: 'Keep', completed: false },
      { id: '2', text: 'Gone', completed: true },
      { id: '3', text: 'Also gone', completed: true },
    ]
    const result = clearCompleted(todos)
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Keep')
  })

  it('returns the same array when nothing is completed', () => {
    const todos = [{ id: '1', text: 'Active', completed: false }]
    // Not same reference (filter always returns new), but same content
    expect(clearCompleted(todos)).toHaveLength(1)
  })

  it('returns an empty array when all todos are completed', () => {
    const todos = [
      { id: '1', text: 'A', completed: true },
      { id: '2', text: 'B', completed: true },
    ]
    expect(clearCompleted(todos)).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// loadTodos / saveTodos — localStorage round-trip
// ---------------------------------------------------------------------------
describe('loadTodos + saveTodos', () => {
  // Use a fresh in-memory storage stub for each test so tests are isolated
  // and do not depend on jsdom's shared localStorage.
  let store

  beforeEach(() => {
    store = (() => {
      const data = {}
      return {
        getItem: (k) => data[k] ?? null,
        setItem: (k, v) => { data[k] = v },
        removeItem: (k) => { delete data[k] },
      }
    })()
  })

  it('returns [] when storage is empty', () => {
    expect(loadTodos(store)).toEqual([])
  })

  it('round-trips a list of todos through save then load', () => {
    const todos = [
      { id: '1', text: 'Buy milk', completed: false },
      { id: '2', text: 'Walk dog', completed: true },
    ]
    saveTodos(todos, store)
    expect(loadTodos(store)).toEqual(todos)
  })

  it('returns [] when stored value is not valid JSON', () => {
    store.setItem(STORAGE_KEY, 'not-json{{{')
    expect(loadTodos(store)).toEqual([])
  })

  it('returns [] when stored value is a JSON non-array', () => {
    store.setItem(STORAGE_KEY, JSON.stringify({ id: '1' }))
    expect(loadTodos(store)).toEqual([])
  })

  it('filters out malformed entries and keeps valid ones', () => {
    const mixed = [
      { id: '1', text: 'Good', completed: false },
      { id: 2, text: 'Bad id (number)', completed: false },   // id not string
      { text: 'No id', completed: false },                    // missing id
      { id: '3', completed: false },                          // missing text
      { id: '4', text: 'Bad completed', completed: 'yes' },  // completed not bool
      null,
    ]
    store.setItem(STORAGE_KEY, JSON.stringify(mixed))
    const loaded = loadTodos(store)
    expect(loaded).toHaveLength(1)
    expect(loaded[0].text).toBe('Good')
  })

  it('saveTodos swallows a storage error without throwing', () => {
    const brokenStore = {
      setItem: () => { throw new Error('QuotaExceededError') },
    }
    expect(() => saveTodos([{ id: '1', text: 'X', completed: false }], brokenStore)).not.toThrow()
  })

  it('loadTodos returns [] when storage.getItem throws', () => {
    const brokenStore = {
      getItem: () => { throw new Error('SecurityError') },
    }
    expect(loadTodos(brokenStore)).toEqual([])
  })

  it('loadTodos returns [] when storage is null', () => {
    expect(loadTodos(null)).toEqual([])
  })
})
