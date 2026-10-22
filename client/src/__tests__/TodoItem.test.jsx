import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TodoItem } from '../TodoItem';

const todo = { id: '1', title: 'Test task', completed: false };

describe('TodoItem', () => {
  it('renders the title', () => {
    render(<TodoItem todo={todo} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('calls onToggle when checkbox clicked', () => {
    const onToggle = vi.fn();
    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={() => {}} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('1', true);
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<TodoItem todo={todo} onToggle={() => {}} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('applies completed class when done', () => {
    const { container } = render(
      <TodoItem todo={{ ...todo, completed: true }} onToggle={() => {}} onDelete={() => {}} />
    );
    expect(container.querySelector('.todo-item')).toHaveClass('completed');
  });
});
