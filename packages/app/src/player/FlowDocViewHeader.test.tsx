import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
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
  });
});
