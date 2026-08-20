import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmbedErrorPanel } from './EmbedErrorPanel';

describe('EmbedErrorPanel', () => {
  it('renders defaults and refresh action when no retry', () => {
    const reload = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload });

    render(<EmbedErrorPanel />);
    expect(screen.getByRole('heading', { name: 'This guide is unavailable' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it('shows detail and calls onRetry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <EmbedErrorPanel title="Failed" description="Try again" detail="boom" onRetry={onRetry} />,
    );

    expect(screen.getByText('Technical details')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
