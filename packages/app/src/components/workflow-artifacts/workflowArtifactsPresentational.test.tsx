import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyToClipboardButton } from './CopyToClipboardButton';
import { ArtifactMarkdownViewer } from './ArtifactMarkdownViewer';

const copy = vi.fn(async () => true);

vi.mock('@/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({
    copy,
    isCopied: false,
  }),
}));

describe('workflow artifact helpers', () => {
  it('CopyToClipboardButton invokes copy', async () => {
    const user = userEvent.setup();
    copy.mockClear();
    render(<CopyToClipboardButton content="hello" />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    expect(copy).toHaveBeenCalledWith('hello');
  });

  it('ArtifactMarkdownViewer shows content', () => {
    render(<ArtifactMarkdownViewer content="# Heading\nbody" />);
    expect(screen.getByText(/# Heading/)).toBeInTheDocument();
  });
});
