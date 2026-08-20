import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentStepIndex } from './DocumentStepIndex';
import type { DocumentStepIndexItem } from './documentStepIndexTypes';

const items: DocumentStepIndexItem[] = [
  { type: 'overview', anchorId: 'overview', itemId: 'flow-details', title: 'Overview' },
  { type: 'section', anchorId: 'sec', sectionId: 'sec-1', title: 'Setup' },
  { type: 'step', anchorId: 'step', stepId: 'step-1', stepNumber: 1, title: 'Open app' },
  { type: 'branch', anchorId: 'branch', branchId: 'br-1', title: 'Role' },
  {
    type: 'linkedPath',
    anchorId: 'path',
    branchId: 'br-1',
    pathId: 'path-1',
    itemId: 'path:path-1',
    pathLabel: 'Admin',
    fullPathLabel: 'Admin path',
  },
];

describe('DocumentStepIndex', () => {
  it('renders outline items and overview CTA', async () => {
    const user = userEvent.setup();
    const onOpenOverview = vi.fn();
    const onSelectOverview = vi.fn();
    const onSelectStep = vi.fn();
    const onSelectSection = vi.fn();
    const onSelectBranch = vi.fn();
    const onSelectLinkedPath = vi.fn();

    render(
      <DocumentStepIndex
        items={items}
        activeItemId="step-1"
        onOpenOverview={onOpenOverview}
        onSelectOverview={onSelectOverview}
        onSelectStep={onSelectStep}
        onSelectSection={onSelectSection}
        onSelectBranch={onSelectBranch}
        onSelectLinkedPath={onSelectLinkedPath}
      />,
    );

    expect(screen.getByText('Outline')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Flow overview/i }));
    expect(onOpenOverview).toHaveBeenCalled();
    expect(screen.getByText('Setup')).toBeInTheDocument();
    expect(screen.getByText('Open app')).toBeInTheDocument();
  });

  it('omits overview button when handler missing', () => {
    render(
      <DocumentStepIndex
        items={items}
        activeItemId={null}
        onSelectOverview={vi.fn()}
        onSelectStep={vi.fn()}
        onSelectSection={vi.fn()}
        onSelectBranch={vi.fn()}
        onSelectLinkedPath={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: /Flow overview/i })).not.toBeInTheDocument();
  });
});
