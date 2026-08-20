import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FirstTimeTooltip } from './FirstTimeTooltip';
import { HintAnchor, isPageHintActive } from './HintAnchor';

describe('isPageHintActive', () => {
  it('matches active hint ids', () => {
    expect(isPageHintActive(undefined, 'a')).toBe(false);
    expect(
      isPageHintActive(
        {
          activeHintId: 'a',
          hintStep: () => '1',
          dismissHint: vi.fn(),
        },
        'a',
      ),
    ).toBe(true);
    expect(
      isPageHintActive(
        {
          activeHintId: 'b',
          hintStep: () => '1',
          dismissHint: vi.fn(),
        },
        'a',
      ),
    ).toBe(false);
  });
});

describe('FirstTimeTooltip', () => {
  it('renders children and dismisses when open', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const onSkipAll = vi.fn();

    render(
      <FirstTimeTooltip
        isOpen
        title="Tip title"
        description="Tip body"
        stepLabel="Tip 1"
        onDismiss={onDismiss}
        onSkipAll={onSkipAll}
      >
        <button type="button">Anchor</button>
      </FirstTimeTooltip>,
    );

    expect(screen.getByRole('button', { name: 'Anchor' })).toBeInTheDocument();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Tip title');
    expect(screen.getByText('Tip body')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onDismiss).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Skip tips' }));
    expect(onSkipAll).toHaveBeenCalledOnce();
  });
});

describe('HintAnchor', () => {
  it('opens tooltip when hint is active', async () => {
    const dismissHint = vi.fn();
    render(
      <HintAnchor
        hintId="record"
        title="Record tip"
        description="Click record"
        hints={{
          activeHintId: 'record',
          hintStep: () => 'Tip 2 of 3',
          dismissHint,
        }}
      >
        <span>Target</span>
      </HintAnchor>,
    );

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Record tip');
  });
});
