import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { FlowDocHubHeader } from './FlowDocHubHeader';

vi.mock('@/hooks/useDocumentShareModal', () => ({
  useDocumentShareModal: () => ({
    openShare: vi.fn(),
    shareModal: null,
  }),
}));

describe('FlowDocHubHeader', () => {
  it('smoke-renders overview chrome with owner actions', () => {
    render(
      <MemoryRouter>
        <FlowDocHubHeader
          documentId="doc-1"
          title="Hub title"
          editHref="/docs/doc-1/edit"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Hub title')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Share/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Edit/i })).toBeInTheDocument();
  });
});
