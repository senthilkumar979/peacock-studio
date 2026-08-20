import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlowTagList } from './FlowTagList';

describe('FlowTagList', () => {
  it('returns null when there are no tags', () => {
    const { container } = render(<FlowTagList tags={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders hash-prefixed tags and optional remove actions', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<FlowTagList tags={['updated-admin-flow']} onRemove={onRemove} />);

    expect(screen.getByText('updated-admin-flow')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove tag updated-admin-flow' }));
    expect(onRemove).toHaveBeenCalledWith('updated-admin-flow');
  });
});
