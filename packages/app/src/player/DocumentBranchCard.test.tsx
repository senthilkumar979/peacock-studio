import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FlowBranch } from '@peacock/shared';
import { DocumentBranchCard } from './DocumentBranchCard';

vi.mock('./useBranchPathMetadata', () => ({
  useBranchPathMetadata: () => ({}),
}));

const branch: FlowBranch = {
  id: 'br-1',
  kind: 'branch',
  title: 'Choose role',
  description: 'Pick a persona',
  paths: [
    {
      id: 'path-1',
      label: 'Admin',
      targetDocumentId: 'doc-2',
      targetTitle: 'Admin doc',
      targetDescription: '',
      fromStepId: 'a',
      toStepId: 'b',
      order: 0,
    },
  ],
};

describe('DocumentBranchCard', () => {
  it('smoke-renders branch title and paths', () => {
    render(
      <DocumentBranchCard
        branch={branch}
        anchorId="branch-br-1"
        isActive
        selectedPathId="path-1"
        onSelectPath={() => undefined}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Choose role' })).toBeInTheDocument();
    expect(screen.getByText('Pick a persona')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows empty-path copy when no paths exist', () => {
    render(
      <DocumentBranchCard
        branch={{ ...branch, paths: [] }}
        anchorId="branch-br-1"
        isActive={false}
        selectedPathId={null}
        onSelectPath={() => undefined}
      />,
    );
    expect(
      screen.getByText('No paths are configured for this branch yet.'),
    ).toBeInTheDocument();
  });
});
