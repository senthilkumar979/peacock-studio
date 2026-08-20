import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FlowBranch } from '@peacock/shared';
import { BranchPanel } from './BranchPanel';

const state = {
  updateBranchTitle: vi.fn(),
  updateBranchDescription: vi.fn(),
  updateBranchPresentation: vi.fn(),
  updatePathLabel: vi.fn(),
  removePathFromBranch: vi.fn(),
  deleteOutlineItem: vi.fn(),
};

vi.mock('@/store/flowStore', () => ({
  useFlowStore: vi.fn((selector: (s: typeof state) => unknown) => selector(state)),
}));

vi.mock('@/services/flowLibraryService', () => ({
  getFlowDocument: vi.fn().mockResolvedValue(null),
}));

const branch: FlowBranch = {
  id: 'br-1',
  kind: 'branch',
  title: 'Choose path',
  description: 'Pick one',
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

describe('BranchPanel', () => {
  it('smoke-renders branch editor fields', () => {
    render(<BranchPanel branch={branch} onAddPath={() => undefined} />);
    expect(screen.getByDisplayValue('Choose path')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pick one')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Admin')).toBeInTheDocument();
  });
});
