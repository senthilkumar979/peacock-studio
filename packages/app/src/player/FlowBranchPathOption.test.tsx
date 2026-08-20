import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { LinkedPeacockPath } from '@peacock/shared';
import { FlowBranchPathOption } from './FlowBranchPathOption';

const path: LinkedPeacockPath = {
  id: 'path-1',
  label: 'Admin path',
  targetDocumentId: 'doc-2',
  targetTitle: 'Admin guide',
  targetDescription: 'For admins',
  fromStepId: 'a',
  toStepId: 'b',
  order: 0,
};

describe('FlowBranchPathOption', () => {
  it('renders column layout with loading meta and selection', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ul>
        <FlowBranchPathOption
          path={path}
          index={0}
          isSelected={false}
          layout="column"
          onSelect={onSelect}
        />
      </ul>,
    );

    expect(screen.getByText('Admin path')).toBeInTheDocument();
    expect(screen.getByText('Admin guide')).toBeInTheDocument();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    await user.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('renders row layout with ready meta when selected', () => {
    render(
      <ul>
        <FlowBranchPathOption
          path={path}
          index={1}
          meta={{ pathId: 'path-1', rangeLabel: 'Steps 1–3', stepCount: 3 }}
          isSelected
          layout="row"
          onSelect={() => undefined}
        />
      </ul>,
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('3 steps')).toBeInTheDocument();
    expect(screen.getByText('Steps 1–3')).toBeInTheDocument();
    expect(screen.getByText('For admins')).toBeInTheDocument();
  });
});
