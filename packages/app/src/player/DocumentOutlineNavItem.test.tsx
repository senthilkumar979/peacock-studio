import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentOutlineNavItem } from './DocumentOutlineNavItem';

const handlers = {
  onSelectOverview: vi.fn(),
  onSelectStep: vi.fn(),
  onSelectSection: vi.fn(),
  onSelectBranch: vi.fn(),
  onSelectLinkedPath: vi.fn(),
};

describe('DocumentOutlineNavItem', () => {
  it('renders overview, section, branch, and step variants', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <DocumentOutlineNavItem
        item={{ type: 'overview', anchorId: 'a', itemId: 'flow-details', title: 'Details' }}
        isActive
        {...handlers}
      />,
    );
    await user.click(screen.getByRole('button', { name: /Details/i }));
    expect(handlers.onSelectOverview).toHaveBeenCalledWith('a', 'flow-details');

    rerender(
      <DocumentOutlineNavItem
        item={{ type: 'section', anchorId: 's', sectionId: 'sec-1', title: 'Setup' }}
        isActive={false}
        {...handlers}
      />,
    );
    expect(screen.getByText('Chapter')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Setup/i }));
    expect(handlers.onSelectSection).toHaveBeenCalledWith('s', 'sec-1');

    rerender(
      <DocumentOutlineNavItem
        item={{ type: 'branch', anchorId: 'b', branchId: 'br-1', title: 'Role' }}
        isActive
        {...handlers}
      />,
    );
    expect(screen.getByText('Branch point')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Role/i }));
    expect(handlers.onSelectBranch).toHaveBeenCalledWith('b', 'br-1');

    rerender(
      <DocumentOutlineNavItem
        item={{ type: 'step', anchorId: 'st', stepId: 'step-1', stepNumber: 2, title: 'Save' }}
        isActive={false}
        {...handlers}
      />,
    );
    expect(screen.getByText('2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Save/i }));
    expect(handlers.onSelectStep).toHaveBeenCalledWith('st', 'step-1');
  });

  it('returns null for linkedPath items', () => {
    const { container } = render(
      <DocumentOutlineNavItem
        item={{
          type: 'linkedPath',
          anchorId: 'p',
          branchId: 'br',
          pathId: 'path-1',
          itemId: 'path:path-1',
          pathLabel: 'Admin',
          fullPathLabel: 'Admin',
        }}
        isActive={false}
        {...handlers}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
