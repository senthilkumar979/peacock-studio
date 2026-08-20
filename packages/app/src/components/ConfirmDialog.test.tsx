import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmDialog isOpen={false} title="Delete?" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows title, description, and fires confirm/cancel', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        isOpen
        title="Delete item?"
        description="This cannot be undone."
        confirmLabel="Delete"
        isDestructive
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Delete item?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('renders children instead of description and shows loading label', () => {
    render(
      <ConfirmDialog
        isOpen
        title="Confirm"
        isConfirmLoading
        confirmLoadingLabel="Working…"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      >
        <p>Custom body</p>
      </ConfirmDialog>,
    );

    expect(screen.getByText('Custom body')).toBeInTheDocument();
    expect(screen.getByText('Working…')).toBeInTheDocument();
  });
});
