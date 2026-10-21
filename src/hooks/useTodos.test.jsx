import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useTodos from './useTodos.js'
import { STORAGE_KEY } from '../lib/todoModel.js'

describe('useTodos', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts empty when nothing is persisted', () => {
    const { result } = renderHook(() => useTodos())
    expect(result.current.todos).toEqual([])
  })

  it('adds, toggles and deletes a todo', () => {
    const { result } = renderHook(() => useTodos())

    act(() => result.current.addTodo('Buy milk'))
    expect(result.current.todos).toHaveLength(1)
    const { id } = result.current.todos[0]
    expect(result.current.todos[0]).toMatchObject({
      text: 'Buy milk',
      completed: false,
    })

    act(() => result.current.toggleTodo(id))
    expect(result.current.todos[0].completed).toBe(true)

    act(() => result.current.deleteTodo(id))
    expect(result.current.todos).toEqual([])
  })

  it('ignores blank input', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.addTodo('   '))
    expect(result.current.todos).toEqual([])
  })

  it('clears completed todos', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.addTodo('keep'))
    act(() => result.current.addTodo('drop'))
    const dropId = result.current.todos[1].id
    act(() => result.current.toggleTodo(dropId))
    act(() => result.current.clearCompleted())
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].text).toBe('keep')
  })

  it('persists to localStorage so a remount reloads the todos', () => {
    const first = renderHook(() => useTodos())
    act(() => first.result.current.addTodo('Survive reload'))
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toHaveLength(1)

    // A fresh hook instance == a page reload: it loads from storage.
    const second = renderHook(() => useTodos())
    expect(second.result.current.todos).toHaveLength(1)
    expect(second.result.current.todos[0].text).toBe('Survive reload')
  })
})
