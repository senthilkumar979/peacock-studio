import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlowDetailsGuideHints } from './FlowDetailsGuideHints';

describe('FlowDetailsGuideHints', () => {
  it('renders doc variant copy and step count singular', () => {
    render(<FlowDetailsGuideHints variant="doc" stepCount={1} />);
    expect(screen.getByText('How to use this guide')).toBeInTheDocument();
    expect(screen.getByText('1 interactive step in this walkthrough')).toBeInTheDocument();
    expect(screen.getByText('Scroll the guide')).toBeInTheDocument();
  });

  it('renders player and hub variants', () => {
    const { rerender } = render(<FlowDetailsGuideHints variant="player" stepCount={3} />);
    expect(screen.getByText('Before you start')).toBeInTheDocument();
    expect(screen.getByText('3 interactive steps in this walkthrough')).toBeInTheDocument();
    expect(screen.getByText('Step-by-step playback')).toBeInTheDocument();

    rerender(<FlowDetailsGuideHints variant="hub" />);
    expect(screen.getByText('What you can do here')).toBeInTheDocument();
    expect(screen.getByText('Guide mode')).toBeInTheDocument();
    expect(screen.queryByText(/interactive/)).not.toBeInTheDocument();
  });
});
