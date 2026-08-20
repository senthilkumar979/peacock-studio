import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileText } from 'lucide-react';
import { LibraryPageHeader } from './LibraryPageHeader';
import { LibraryGuideInfoButton } from './LibraryGuideInfoButton';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('library chrome', () => {
  it('LibraryPageHeader renders title, description, and action', () => {
    renderWithProviders(
      <LibraryPageHeader
        title="Flow docs"
        description="Your recorded guides"
        icon={FileText}
        action={<button type="button">New</button>}
      />,
    );
    expect(screen.getByRole('heading', { name: /Flow docs/i })).toBeInTheDocument();
    expect(screen.getByText('Your recorded guides')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
  });

  it('LibraryGuideInfoButton toggles label and fires onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = renderWithProviders(
      <LibraryGuideInfoButton isOpen={false} onClick={onClick} />,
    );
    expect(screen.getByRole('button', { name: 'How it works' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await user.click(screen.getByRole('button', { name: 'How it works' }));
    expect(onClick).toHaveBeenCalledOnce();

    rerender(<LibraryGuideInfoButton isOpen onClick={onClick} />);
    expect(screen.getByRole('button', { name: 'Hide guide' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
