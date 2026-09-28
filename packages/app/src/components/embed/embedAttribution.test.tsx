import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmbedGrowthCta } from './EmbedGrowthCta';
import { PeacockEmbedWatermark } from './PeacockEmbedWatermark';

vi.mock('@/cloud/planLimits', () => ({
  shouldShowEmbedWatermark: vi.fn(() => true),
}));

describe('embed attribution', () => {
  it('EmbedGrowthCta is the same for every account', () => {
    const { rerender } = render(<EmbedGrowthCta />);
    expect(screen.getByText(/Would you like to create a flow doc like this/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start free/i })).toBeInTheDocument();

    rerender(<EmbedGrowthCta plan="pro" />);
    expect(screen.getByText(/Would you like to create a flow doc like this/i)).toBeInTheDocument();
  });

  it('PeacockEmbedWatermark shows attribution for every account', () => {
    const { rerender } = render(<PeacockEmbedWatermark />);
    expect(screen.getByRole('link', { name: /Loaded from Peacock Studio/i })).toBeInTheDocument();

    rerender(<PeacockEmbedWatermark plan="team" />);
    expect(screen.getByRole('link', { name: /Loaded from Peacock Studio/i })).toBeInTheDocument();
  });
});
