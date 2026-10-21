/*
 * Todo datamodel and pure state operations.
 *
 * A todo is the in-browser source of truth: { id, text, completed }.
 * Every operation returns a NEW array so React state updates stay immutable;
 * none of these touch React or the DOM, so they can be unit-tested directly.
 */

export const STORAGE_KEY = 'todo-app.todos'

/** Build a new todo from raw input. Returns null when the text is blank. */
export function createTodo(text) {
  const trimmed = String(text ?? '').trim()
  if (!trimmed) return null
  return { id: crypto.randomUUID(), text: trimmed, completed: false }
}

/** Append a todo for `text`. No-op (returns the same array) when text is blank. */
export function addTodo(todos, text) {
  const todo = createTodo(text)
  return todo ? [...todos, todo] : todos
}

/** Flip the completed flag on the todo with `id`. */
export function toggleTodo(todos, id) {
  return todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
}

/** Remove the todo with `id`. */
export function deleteTodo(todos, id) {
  return todos.filter((t) => t.id !== id)
}

/** Drop every completed todo. */
export function clearCompleted(todos) {
  return todos.filter((t) => !t.completed)
}

/**
 * A value is a well-formed todo only if it has a string id and text and a
 * boolean completed. Anything stored by an older/corrupt build is discarded
 * rather than crashing the app on load.
 */
function isValidTodo(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.text === 'string' &&
    typeof value.completed === 'boolean'
  )
}

/**
 * Read todos from localStorage. Returns [] when nothing is stored, when the
 * stored value is not valid JSON, or when it is not an array of valid todos —
 * a bad write must never take the app down on the next load.
 */
export function loadTodos(storage = globalThis.localStorage) {
  if (!storage) return []
  let raw
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return []
  }
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidTodo)
  } catch {
    return []
  }
}

/**
 * Persist todos to localStorage. Swallows storage errors (quota exceeded,
 * disabled storage in private mode) so a failed write never breaks the UI —
 * the in-memory state remains the source of truth for the session.
 */
export function saveTodos(todos, storage = globalThis.localStorage) {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch {
    /* storage unavailable or full — keep running from memory */
  }
}
