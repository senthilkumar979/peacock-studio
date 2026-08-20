import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentOutlineLinkedPathGroup } from './DocumentOutlineLinkedPathGroup';

describe('DocumentOutlineLinkedPathGroup', () => {
  it('renders path label and steps', () => {
    render(
      <DocumentOutlineLinkedPathGroup
        group={{
          type: 'linkedPathGroup',
          pathId: 'path-1',
          pathItem: {
            type: 'linkedPath',
            pathId: 'path-1',
            pathLabel: 'Happy path',
            fullPathLabel: 'Happy path',
            anchorId: 'path-anchor',
            branchId: 'branch-1',
            itemId: 'path:path-1',
          },
          steps: [
            {
              type: 'step',
              stepId: 's1',
              stepNumber: 1,
              title: 'First',
              anchorId: 'a1',
              pathId: 'path-1',
              isLinkedPathStep: true,
            },
          ],
        }}
        activeItemId={null}
        isGroupActive={false}
        onSelectLinkedPath={vi.fn()}
        onSelectStep={vi.fn()}
      />,
    );
    expect(screen.getByText('Happy path')).toBeInTheDocument();
    expect(screen.getByText('First')).toBeInTheDocument();
  });
});
