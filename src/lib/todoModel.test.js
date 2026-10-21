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

describe('todoModel — pure operations', () => {
  it('createTodo trims text and starts incomplete with a unique id', () => {
    const a = createTodo('  Buy milk  ')
    const b = createTodo('Buy milk')
    expect(a).toMatchObject({ text: 'Buy milk', completed: false })
    expect(typeof a.id).toBe('string')
    expect(a.id).not.toBe(b.id)
  })

  it('createTodo returns null for blank or whitespace-only text', () => {
    expect(createTodo('')).toBeNull()
    expect(createTodo('   ')).toBeNull()
    expect(createTodo(null)).toBeNull()
    expect(createTodo(undefined)).toBeNull()
  })

  it('addTodo appends immutably and ignores blank input', () => {
    const start = []
    const one = addTodo(start, 'First')
    expect(one).toHaveLength(1)
    expect(start).toHaveLength(0) // original untouched
    expect(addTodo(one, '   ')).toBe(one) // blank is a no-op, same ref
  })

  it('toggleTodo flips only the matching todo', () => {
    const todos = [
      { id: '1', text: 'a', completed: false },
      { id: '2', text: 'b', completed: false },
    ]
    const next = toggleTodo(todos, '1')
    expect(next[0].completed).toBe(true)
    expect(next[1].completed).toBe(false)
    expect(todos[0].completed).toBe(false) // immutable
    expect(toggleTodo(next, '1')[0].completed).toBe(false) // toggles back
  })

  it('deleteTodo removes only the matching todo', () => {
    const todos = [
      { id: '1', text: 'a', completed: false },
      { id: '2', text: 'b', completed: false },
    ]
    const next = deleteTodo(todos, '1')
    expect(next).toHaveLength(1)
    expect(next[0].id).toBe('2')
    expect(todos).toHaveLength(2) // immutable
  })

  it('clearCompleted keeps only active todos', () => {
    const todos = [
      { id: '1', text: 'a', completed: true },
      { id: '2', text: 'b', completed: false },
      { id: '3', text: 'c', completed: true },
    ]
    const next = clearCompleted(todos)
    expect(next).toEqual([{ id: '2', text: 'b', completed: false }])
  })
})

describe('todoModel — persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saveTodos then loadTodos round-trips the list', () => {
    const todos = [{ id: '1', text: 'a', completed: false }]
    saveTodos(todos)
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(todos))
    expect(loadTodos()).toEqual(todos)
  })

  it('loadTodos returns [] when nothing is stored', () => {
    expect(loadTodos()).toEqual([])
  })

  it('loadTodos returns [] on malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json')
    expect(loadTodos()).toEqual([])
  })

  it('loadTodos returns [] when stored value is not an array', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }))
    expect(loadTodos()).toEqual([])
  })

  it('loadTodos drops entries that are not well-formed todos', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: '1', text: 'good', completed: false },
        { id: 2, text: 'bad id', completed: false },
        { id: '3', text: 'missing completed' },
        'nonsense',
      ]),
    )
    expect(loadTodos()).toEqual([{ id: '1', text: 'good', completed: false }])
  })

  it('saveTodos does not throw when storage write fails', () => {
    const throwing = {
      setItem() {
        throw new Error('QuotaExceeded')
      },
    }
    expect(() =>
      saveTodos([{ id: '1', text: 'a', completed: false }], throwing),
    ).not.toThrow()
  })
})
