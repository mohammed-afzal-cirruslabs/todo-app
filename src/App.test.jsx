import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

describe('Todo App', () => {
  // Todos now persist to localStorage, which jsdom shares across tests in a
  // file — clear it so each test starts from an empty list.
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /todos/i })).toBeInTheDocument()
  })

  it('shows empty state when no todos', () => {
    render(<App />)
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument()
  })

  it('adds a todo', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByPlaceholderText(/what needs to be done/i), 'Buy milk')
    await user.click(screen.getByRole('button', { name: /add todo/i }))
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('does not add an empty or whitespace-only todo', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByPlaceholderText(/what needs to be done/i)
    await user.type(input, '   ')
    expect(screen.getByRole('button', { name: /add todo/i })).toBeDisabled()
  })

  it('clears the input after adding', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByPlaceholderText(/what needs to be done/i)
    await user.type(input, 'Walk the dog')
    await user.click(screen.getByRole('button', { name: /add todo/i }))
    expect(input).toHaveValue('')
  })

  it('toggles a todo as completed', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByPlaceholderText(/what needs to be done/i), 'Read a book')
    await user.click(screen.getByRole('button', { name: /add todo/i }))
    const checkbox = screen.getByRole('checkbox', { name: /mark "read a book"/i })
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    expect(screen.getByText('Read a book')).toHaveClass('todo-item__text')
    // parent li should have done class
    expect(checkbox.closest('li')).toHaveClass('todo-item--done')
  })

  it('deletes a todo', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByPlaceholderText(/what needs to be done/i), 'Delete me')
    await user.click(screen.getByRole('button', { name: /add todo/i }))
    await user.click(screen.getByRole('button', { name: /delete "delete me"/i }))
    expect(screen.queryByText('Delete me')).not.toBeInTheDocument()
  })

  it('filters active todos', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByPlaceholderText(/what needs to be done/i)
    await user.type(input, 'Active task')
    await user.click(screen.getByRole('button', { name: /add todo/i }))
    await user.type(input, 'Done task')
    await user.click(screen.getByRole('button', { name: /add todo/i }))
    // complete the second
    await user.click(screen.getByRole('checkbox', { name: /mark "done task"/i }))
    // switch to Active filter
    const filterNav = screen.getByRole('navigation', { name: /filter todos/i })
    await user.click(within(filterNav).getByRole('button', { name: /active/i }))
    expect(screen.getByText('Active task')).toBeInTheDocument()
    expect(screen.queryByText('Done task')).not.toBeInTheDocument()
  })

  it('filters completed todos', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByPlaceholderText(/what needs to be done/i)
    await user.type(input, 'Keep me')
    await user.click(screen.getByRole('button', { name: /add todo/i }))
    await user.type(input, 'Finish me')
    await user.click(screen.getByRole('button', { name: /add todo/i }))
    await user.click(screen.getByRole('checkbox', { name: /mark "finish me"/i }))
    const filterNav2 = screen.getByRole('navigation', { name: /filter todos/i })
    await user.click(within(filterNav2).getByRole('button', { name: /completed/i }))
    expect(screen.getByText('Finish me')).toBeInTheDocument()
    expect(screen.queryByText('Keep me')).not.toBeInTheDocument()
  })

  it('clears completed todos', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByPlaceholderText(/what needs to be done/i)
    await user.type(input, 'Stay')
    await user.click(screen.getByRole('button', { name: /add todo/i }))
    await user.type(input, 'Go away')
    await user.click(screen.getByRole('button', { name: /add todo/i }))
    await user.click(screen.getByRole('checkbox', { name: /mark "go away"/i }))
    await user.click(screen.getByRole('button', { name: /clear completed/i }))
    expect(screen.getByText('Stay')).toBeInTheDocument()
    expect(screen.queryByText('Go away')).not.toBeInTheDocument()
  })

  it('shows correct item count', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByPlaceholderText(/what needs to be done/i)
    await user.type(input, 'One')
    await user.click(screen.getByRole('button', { name: /add todo/i }))
    await user.type(input, 'Two')
    await user.click(screen.getByRole('button', { name: /add todo/i }))
    expect(screen.getByText(/2 items left/i)).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: /mark "one"/i }))
    expect(screen.getByText(/1 item left/i)).toBeInTheDocument()
  })
})
