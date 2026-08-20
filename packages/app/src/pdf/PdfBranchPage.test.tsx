import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FlowBranch, LinkedPeacockPath } from '@peacock/shared';

vi.mock('@react-pdf/renderer', async () => import('./reactPdfTestMock'));

import { PdfBranchPage } from './PdfBranchPage';

const selectedPath: LinkedPeacockPath = {
  id: 'path-selected',
  order: 1,
  label: 'Manager path',
  targetDocumentId: 'doc-mgr',
  targetTitle: 'Manager guide',
  targetDescription: '',
  fromStepId: 'a',
  toStepId: 'b',
};

const otherPath: LinkedPeacockPath = {
  id: 'path-other',
  order: 0,
  label: 'Employee path',
  targetDocumentId: 'doc-emp',
  targetTitle: 'Employee guide',
  targetDescription: '',
  fromStepId: 'c',
  toStepId: 'd',
};

const branch: FlowBranch = {
  id: 'branch-1',
  kind: 'branch',
  title: 'Choose your role',
  description: 'Pick the path that matches your permissions.',
  presentation: 'list',
  paths: [selectedPath, otherPath],
};

describe('PdfBranchPage', () => {
  it('renders branch details, selected path, and other paths', () => {
    render(
      <PdfBranchPage
        branch={branch}
        selectedPath={selectedPath}
        flowTitle="Access flow"
        logoSrc="https://example.com/logo.png"
      />,
    );

    expect(screen.getByText('Access flow')).toBeInTheDocument();
    expect(screen.getByText('Branch point')).toBeInTheDocument();
    expect(screen.getByText('Choose your role')).toBeInTheDocument();
    expect(
      screen.getByText('Pick the path that matches your permissions.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Included in this PDF')).toBeInTheDocument();
    expect(screen.getByText('Manager path')).toBeInTheDocument();
    expect(screen.getByText('From: Manager guide')).toBeInTheDocument();
    expect(screen.getByText('Other paths not included')).toBeInTheDocument();
    expect(screen.getByText('• Employee path')).toBeInTheDocument();
  });

  it('omits optional description, target title, and other-paths box', () => {
    const soloPath: LinkedPeacockPath = {
      ...selectedPath,
      targetTitle: '',
    };
    render(
      <PdfBranchPage
        branch={{
          ...branch,
          description: '',
          paths: [soloPath],
        }}
        selectedPath={soloPath}
        flowTitle="Solo branch flow"
        logoSrc="https://example.com/logo.png"
      />,
    );

    expect(screen.queryByText(/Pick the path/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^From:/)).not.toBeInTheDocument();
    expect(screen.queryByText('Other paths not included')).not.toBeInTheDocument();
  });
});
