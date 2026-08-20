import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SharedViewToggle } from './SharedViewToggle';

describe('SharedViewToggle', () => {
  it('marks the active mode and notifies on change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SharedViewToggle mode="doc" onChange={onChange} />);

    expect(screen.getByRole('tab', { name: 'Doc' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Player' })).toHaveAttribute('aria-selected', 'false');

    await user.click(screen.getByRole('tab', { name: 'Player' }));
    expect(onChange).toHaveBeenCalledWith('player');
  });
});
