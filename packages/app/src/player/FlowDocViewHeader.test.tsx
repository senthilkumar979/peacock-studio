import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlowDocViewHeader } from './FlowDocViewHeader';

vi.mock('@/hooks/useDocumentShareModal', () => ({
  useDocumentShareModal: () => ({
    openShare: vi.fn(),
    shareModal: null,
  }),
}));

vi.mock('@/components/onboarding/HintAnchor', () => ({
  HintAnchor: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('FlowDocViewHeader', () => {
  it('smoke-renders title and mode badge', () => {
    render(
      <MemoryRouter>
        <FlowDocViewHeader
          documentId="doc-1"
          title="Onboarding"
          viewMode="doc"
          onViewModeChange={() => undefined}
          editHref="/docs/doc-1/edit"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Guide')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Doc' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cinematic walkthrough' })).not.toBeInTheDocument();
  });

  it('toggles cinematic from the player chrome', async () => {
    const onToggleCinematic = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <FlowDocViewHeader
          documentId="doc-1"
          title="Onboarding"
          viewMode="player"
          onViewModeChange={() => undefined}
          editHref="/docs/doc-1/edit"
          isCinematic={false}
          onToggleCinematic={onToggleCinematic}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('tab', { name: 'Player' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cinematic walkthrough' }));
    expect(onToggleCinematic).toHaveBeenCalledTimes(1);
  });
});
