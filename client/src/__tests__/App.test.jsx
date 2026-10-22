import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import App from '../App';
import { handlers, resetStore } from './handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { server.resetHandlers(); resetStore(); });
afterAll(() => server.close());

function renderApp() {
  return render(<App />);
}

describe('App — initial render', () => {
  it('shows the heading', async () => {
    renderApp();
    expect(screen.getByRole('heading', { name: /todos/i })).toBeInTheDocument();
  });

  it('shows empty list message after load', async () => {
    renderApp();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());
    expect(screen.getByText(/nothing here/i)).toBeInTheDocument();
  });

  it('shows "0 items left" footer', async () => {
    renderApp();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());
    expect(screen.getByText(/0 items left/i)).toBeInTheDocument();
  });
});

describe('App — adding todos', () => {
  it('adds a todo and shows it in the list', async () => {
    const user = userEvent.setup();
    renderApp();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    await user.type(screen.getByRole('textbox', { name: /new todo/i }), 'Buy milk');
    await user.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => expect(screen.getByText('Buy milk')).toBeInTheDocument());
    expect(screen.getByText(/1 item left/i)).toBeInTheDocument();
  });

  it('clears the input after adding', async () => {
    const user = userEvent.setup();
    renderApp();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    const input = screen.getByRole('textbox', { name: /new todo/i });
    await user.type(input, 'Walk dog');
    await user.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => expect(screen.getByText('Walk dog')).toBeInTheDocument());
    expect(input.value).toBe('');
  });

  it('does not add a todo with empty input', async () => {
    const user = userEvent.setup();
    renderApp();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByText(/nothing here/i)).toBeInTheDocument();
  });
});

describe('App — completing todos', () => {
  it('toggles a todo to completed', async () => {
    const user = userEvent.setup();
    renderApp();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    await user.type(screen.getByRole('textbox', { name: /new todo/i }), 'Read book');
    await user.click(screen.getByRole('button', { name: /add/i }));
    await waitFor(() => expect(screen.getByText('Read book')).toBeInTheDocument());

    const checkbox = screen.getByRole('checkbox', { name: /mark "read book"/i });
    await user.click(checkbox);

    await waitFor(() => expect(checkbox).toBeChecked());
    expect(screen.getByText(/0 items left/i)).toBeInTheDocument();
  });
});

describe('App — deleting todos', () => {
  it('removes a todo when delete is clicked', async () => {
    const user = userEvent.setup();
    renderApp();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    await user.type(screen.getByRole('textbox', { name: /new todo/i }), 'Go shopping');
    await user.click(screen.getByRole('button', { name: /add/i }));
    await waitFor(() => expect(screen.getByText('Go shopping')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /delete "go shopping"/i }));
    await waitFor(() => expect(screen.queryByText('Go shopping')).not.toBeInTheDocument());
  });
});

describe('App — filter tabs', () => {
  it('filters to active todos only', async () => {
    const user = userEvent.setup();
    renderApp();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    // Add two todos
    const input = screen.getByRole('textbox', { name: /new todo/i });
    await user.type(input, 'Task A');
    await user.click(screen.getByRole('button', { name: /add/i }));
    await waitFor(() => expect(screen.getByText('Task A')).toBeInTheDocument());

    await user.type(input, 'Task B');
    await user.click(screen.getByRole('button', { name: /add/i }));
    await waitFor(() => expect(screen.getByText('Task B')).toBeInTheDocument());

    // Complete Task A
    await user.click(screen.getByRole('checkbox', { name: /mark "task a"/i }));
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /mark "task a"/i })).toBeChecked());

    // Filter to Active
    await user.click(screen.getByRole('button', { name: /active/i }));
    expect(screen.queryByText('Task A')).not.toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
  });

  it('filters to completed todos only', async () => {
    const user = userEvent.setup();
    renderApp();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    const input = screen.getByRole('textbox', { name: /new todo/i });
    await user.type(input, 'Done thing');
    await user.click(screen.getByRole('button', { name: /add/i }));
    await waitFor(() => expect(screen.getByText('Done thing')).toBeInTheDocument());

    await user.click(screen.getByRole('checkbox', { name: /mark "done thing"/i }));
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /mark "done thing"/i })).toBeChecked());

    await user.click(screen.getByRole('button', { name: /completed/i }));
    expect(screen.getByText('Done thing')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /active/i }));
    expect(screen.queryByText('Done thing')).not.toBeInTheDocument();
  });
});
