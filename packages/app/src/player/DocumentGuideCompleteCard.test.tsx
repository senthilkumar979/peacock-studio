import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentGuideCompleteCard } from './DocumentGuideCompleteCard';

vi.mock('@/components/embed/EmbedGrowthCta', () => ({
  EmbedGrowthCta: () => <div data-testid="embed-cta" />,
}));

describe('DocumentGuideCompleteCard', () => {
  it('renders fallback copy and view-from-beginning action', async () => {
    const user = userEvent.setup();
    const onViewFromBeginning = vi.fn();
    render(
      <DocumentGuideCompleteCard
        title="Finished"
        stepCount={5}
        sectionCount={2}
        branchCount={1}
        onViewFromBeginning={onViewFromBeginning}
      />,
    );

    expect(screen.getByText('Guide complete')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Finished' })).toBeInTheDocument();
    expect(
      screen.getByText('You have reached the end of this flow documentation.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /View from beginning/i }));
    expect(onViewFromBeginning).toHaveBeenCalledOnce();
  });

  it('renders description and embed CTA', () => {
    render(
      <DocumentGuideCompleteCard
        title="Done"
        description="<p>Nice work</p>"
        stepCount={1}
        sectionCount={0}
        branchCount={0}
        onViewFromBeginning={() => undefined}
        isEmbed
      />,
    );
    expect(screen.getByText('Nice work')).toBeInTheDocument();
    expect(screen.getByTestId('embed-cta')).toBeInTheDocument();
  });
});
