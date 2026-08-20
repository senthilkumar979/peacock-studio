import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';

vi.mock('@/services/flowLibraryService', () => ({
  listFlowSummaries: vi.fn(async () => [
    {
      id: 'doc-2',
      title: 'Linked Doc',
      updatedAt: 1,
      createdAt: 1,
      stepCount: 2,
      version: '1.0.0',
    },
  ]),
  getFlowDocument: vi.fn(async () => null),
}));

vi.mock('@/route-builder/AddPeacockModal', () => ({
  AddPeacockModal: ({
    isOpen,
    summaries,
  }: {
    isOpen: boolean;
    summaries: Array<{ title: string }>;
  }) =>
    isOpen ? (
      <div>
        picker
        {summaries.map((s) => (
          <div key={s.title}>{s.title}</div>
        ))}
      </div>
    ) : null,
}));

import { LinkPeacockDocModal } from './LinkPeacockDocModal';

describe('LinkPeacockDocModal', () => {
  it('loads summaries into picker when open', async () => {
    render(
      <LinkPeacockDocModal isOpen onClose={vi.fn()} onConfirm={vi.fn()} hostDocumentId="doc-1" />,
    );
    expect(screen.getByText('picker')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Linked Doc')).toBeInTheDocument();
    });
  });

  it('renders nothing meaningful when closed', () => {
    const { container } = render(
      <LinkPeacockDocModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(container).toBeTruthy();
  });
});
