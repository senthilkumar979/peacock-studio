import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlowDocModeChooser } from './FlowDocModeChooser';

describe('FlowDocModeChooser', () => {
  it('offers guide and player modes', async () => {
    const user = userEvent.setup();
    const onSelectMode = vi.fn();
    render(<FlowDocModeChooser onSelectMode={onSelectMode} />);

    expect(screen.getByRole('heading', { name: 'Choose how to explore' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Open guide/i }));
    expect(onSelectMode).toHaveBeenCalledWith('doc');
    await user.click(screen.getByRole('button', { name: /Start player/i }));
    expect(onSelectMode).toHaveBeenCalledWith('player');
  });
});
