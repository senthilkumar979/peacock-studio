import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from './test/pageTestUtils';

vi.mock('@/hooks/useKeyboard', () => ({ useKeyboard: vi.fn() }));

vi.mock('@/components/AppHeader', () => ({
  AppHeader: ({ title }: { title?: string }) => <header>{title ?? 'Compare'}</header>,
}));

vi.mock('@/player/CompareDocumentPane', () => ({
  CompareDocumentPane: ({ label }: { label: string }) => <div>pane:{label}</div>,
}));

vi.mock('@/services/flowLibraryService', () => ({
  listFlowSummaries: vi.fn(async () => [
    { id: 'a', title: 'Doc A', updatedAt: 1 },
    { id: 'b', title: 'Doc B', updatedAt: 2 },
  ]),
  getFlowDocument: vi.fn(async () => null),
}));

import { CompareDocs } from './CompareDocs';

describe('CompareDocs', () => {
  it('renders compare panes after library loads', async () => {
    renderWithRouter(<CompareDocs />);
    await waitFor(() => {
      expect(screen.getByText('pane:Left document')).toBeInTheDocument();
    });
    expect(screen.getByText('pane:Right document')).toBeInTheDocument();
  });
});
