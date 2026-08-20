import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerStepDetailsToggle } from './PlayerStepDetailsToggle';

describe('PlayerStepDetailsToggle', () => {
  it('exposes expanded state and toggles', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { rerender } = render(
      <PlayerStepDetailsToggle isVisible onToggle={onToggle} />,
    );

    expect(screen.getByRole('button', { name: 'Hide step details' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await user.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledOnce();

    rerender(<PlayerStepDetailsToggle isVisible={false} onToggle={onToggle} />);
    expect(screen.getByRole('button', { name: 'Show step details' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
