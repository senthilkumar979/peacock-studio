import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmbedGrowthCta } from './EmbedGrowthCta';
import { PeacockEmbedWatermark } from './PeacockEmbedWatermark';

vi.mock('@/cloud/planLimits', () => ({
  shouldShowEmbedWatermark: vi.fn((plan?: string | null) => {
    const normalized = (plan ?? 'free').trim().toLowerCase();
    return normalized !== 'pro' && normalized !== 'team';
  }),
}));

describe('embed attribution', () => {
  it('EmbedGrowthCta shows for free plans and hides for paid', () => {
    const { rerender } = render(<EmbedGrowthCta />);
    expect(screen.getByText(/Would you like to create a flow doc like this/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start free/i })).toBeInTheDocument();

    rerender(<EmbedGrowthCta plan="pro" />);
    expect(screen.queryByText(/Would you like to create a flow doc like this/i)).not.toBeInTheDocument();
  });

  it('PeacockEmbedWatermark shows attribution for free plans', () => {
    const { rerender } = render(<PeacockEmbedWatermark />);
    expect(screen.getByRole('link', { name: /Loaded from Peacock Studio/i })).toBeInTheDocument();

    rerender(<PeacockEmbedWatermark plan="team" />);
    expect(screen.queryByRole('link', { name: /Loaded from Peacock Studio/i })).not.toBeInTheDocument();
  });
});
