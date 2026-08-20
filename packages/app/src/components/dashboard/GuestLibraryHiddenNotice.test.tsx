import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuestLibraryHiddenNotice } from './GuestLibraryHiddenNotice';
import { renderWithProviders } from '@/test/renderWithProviders';

const isDismissed = vi.fn(() => true);
const dismissIntro = vi.fn();

vi.mock('@/constants/guestLibraryIntro', () => ({
  isGuestLibraryIntroDismissed: () => isDismissed(),
  dismissGuestLibraryIntro: () => dismissIntro(),
}));

vi.mock('@/components/dashboard/GuestLibraryIntroModal', () => ({
  GuestLibraryIntroModal: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) => (isOpen ? <button type="button" onClick={onClose}>Close intro</button> : null),
}));

describe('GuestLibraryHiddenNotice', () => {
  beforeEach(() => {
    isDismissed.mockReturnValue(true);
    dismissIntro.mockClear();
  });

  it('renders nothing when nothing is hidden', () => {
    const onIntroSettled = vi.fn();
    const { container } = renderWithProviders(
      <GuestLibraryHiddenNotice visibleCount={3} totalCount={3} onIntroSettled={onIntroSettled} />,
    );
    expect(container).toBeEmptyDOMElement();
    expect(onIntroSettled).toHaveBeenCalled();
  });

  it('shows hidden count and auth links', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <GuestLibraryHiddenNotice visibleCount={2} totalCount={5} />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(/3 recordings are hidden/i);
    expect(screen.getByRole('link', { name: /Sign up to see all 5/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign in/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Why?' }));
    expect(screen.getByRole('button', { name: 'Close intro' })).toBeInTheDocument();
  });
});
