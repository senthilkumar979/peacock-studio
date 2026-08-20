import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FlowBranch } from '@peacock/shared';

vi.mock('./useBranchPathMetadata', () => ({
  useBranchPathMetadata: () => ({
    p1: { pathId: 'p1', rangeLabel: 'Steps 1–2', stepCount: 2 },
  }),
}));

vi.mock('./FlowBranchPathOption', () => ({
  FlowBranchPathOption: ({ path }: { path: { label: string } }) => <div>{path.label}</div>,
}));

import { FlowBranchChoicePanel } from './FlowBranchChoicePanel';

const branch: FlowBranch = {
  id: 'b1',
  kind: 'branch',
  title: 'Pick a path',
  description: 'Choose carefully',
  paths: [
    {
      id: 'p1',
      label: 'Happy path',
      targetDocumentId: 'doc-2',
      targetTitle: 'Alt',
      targetDescription: '',
      fromStepId: 's1',
      toStepId: 's2',
      order: 0,
    },
  ],
};

describe('FlowBranchChoicePanel', () => {
  it('renders branch title and paths', () => {
    render(
      <FlowBranchChoicePanel
        branch={branch}
        selectedPathId="p1"
        onSelectedPathChange={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('Pick a path')).toBeInTheDocument();
    expect(screen.getByText('Happy path')).toBeInTheDocument();
  });
});
