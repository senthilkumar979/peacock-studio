import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlowDetailsDrawer } from './FlowDetailsDrawer';

vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
    aside: 'aside',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/components/editor/MinimalRichTextEditor', () => ({
  MinimalRichTextEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (next: string) => void;
  }) => (
    <textarea
      aria-label="Description"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

vi.mock('@/components/TagInput', () => ({
  TagInput: () => <div data-testid="tag-input" />,
}));

describe('FlowDetailsDrawer', () => {
  it('smoke-renders open drawer fields', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <FlowDetailsDrawer
        isOpen
        initialTitle="Onboarding"
        initialDescription=""
        initialVersion="1.0.0"
        onSave={() => undefined}
        onClose={onClose}
      />,
    );

    expect(screen.getByDisplayValue('Onboarding')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1.0.0')).toBeInTheDocument();
    expect(screen.getByTestId('tag-input')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close flow details' }));
    expect(onClose).toHaveBeenCalled();
  });
});
