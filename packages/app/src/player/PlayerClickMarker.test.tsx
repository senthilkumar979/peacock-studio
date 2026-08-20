import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FlowStep } from '@peacock/shared';
import { PlayerClickMarker } from './PlayerClickMarker';

vi.mock('framer-motion', () => ({
  motion: { div: 'div', button: 'button', span: 'span' },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

const step: FlowStep = {
  id: 'step-1',
  title: 'Click save',
  notes: 'Press the save button',
  generatedTitle: 'Click save',
  generatedDescription: 'Generated',
  screenshotId: 'shot-1',
  event: {
    id: 'ev-1',
    type: 'page-view',
    timestamp: 1,
    url: 'https://example.com',
    title: 'Page',
    viewport: { width: 1, height: 1, scrollX: 0, scrollY: 0, dpr: 1 },
    screenshotId: 'shot-1',
  },
};

describe('PlayerClickMarker', () => {
  it('renders a non-interactive marker with popover details', () => {
    render(
      <PlayerClickMarker step={step} stepNumber={2} xPercent={0.5} yPercent={0.5} />,
    );
    expect(screen.getByText('Click save')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('toggles via interactive marker when onToggle is provided', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <PlayerClickMarker
        step={step}
        stepNumber={1}
        xPercent={0.2}
        yPercent={0.8}
        isDetailsVisible={false}
        onToggle={onToggle}
      />,
    );

    const button = screen.getByRole('button', { name: 'Show step details' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
