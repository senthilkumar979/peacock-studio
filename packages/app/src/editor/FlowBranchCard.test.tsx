import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FlowBranch } from '@peacock/shared';
import { FlowBranchCard } from './FlowBranchCard';

const branch: FlowBranch = {
  id: 'b1',
  kind: 'branch',
  title: 'Choose environment',
  description: 'Prod or staging',
  paths: [
    {
      id: 'p1',
      label: 'Production',
      targetDocumentId: 'd1',
      targetTitle: 'Prod doc',
      targetDescription: '',
      fromStepId: 'a',
      toStepId: 'b',
      order: 0,
    },
  ],
};

describe('FlowBranchCard', () => {
  it('renders branch title and path labels', () => {
    render(<FlowBranchCard branch={branch} />);
    expect(screen.getByText('Choose environment')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Prod doc')).toBeInTheDocument();
  });

  it('shows empty paths message', () => {
    render(<FlowBranchCard branch={{ ...branch, paths: [] }} />);
    expect(screen.getByText(/no paths linked yet/i)).toBeInTheDocument();
  });
});
