import { useState } from 'react'

function TodoInput({ onAdd }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd(value)
    setValue('')
  }

  return (
    <form className="todo-input-form" onSubmit={handleSubmit}>
      <input
        className="todo-input"
        type="text"
        placeholder="What needs to be done?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="New todo"
        autoFocus
      />
      <button
        className="todo-add-btn"
        type="submit"
        disabled={!value.trim()}
        aria-label="Add todo"
      >
        Add
      </button>
    </form>
  )
}

export default TodoInput
