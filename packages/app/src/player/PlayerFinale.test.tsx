import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerFinale } from './PlayerFinale';

vi.mock('@/components/embed/EmbedGrowthCta', () => ({
  EmbedGrowthCta: () => <div data-testid="embed-cta" />,
}));

describe('PlayerFinale', () => {
  it('renders title, stats, empty description, and replay action', async () => {
    const user = userEvent.setup();
    const onReplay = vi.fn();
    render(
      <PlayerFinale
        title="Onboarding complete"
        description=""
        stepCount={4}
        branchCount={1}
        sectionCount={2}
        onReplay={onReplay}
      />,
    );

    expect(screen.getByText('Guide complete')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Onboarding complete' })).toBeInTheDocument();
    expect(screen.getByText('No description provided.')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Replay from beginning/i }));
    expect(onReplay).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('embed-cta')).not.toBeInTheDocument();
  });

  it('shows embed growth CTA when isEmbed', () => {
    render(
      <PlayerFinale
        title="Done"
        description="<p>Thanks</p>"
        stepCount={1}
        branchCount={0}
        sectionCount={0}
        onReplay={() => undefined}
        isEmbed
      />,
    );
    expect(screen.getByText('Thanks')).toBeInTheDocument();
    expect(screen.getByTestId('embed-cta')).toBeInTheDocument();
  });
});
