import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlowDetailsIntro } from './FlowDetailsIntro';

describe('FlowDetailsIntro', () => {
  it('renders title and stats', () => {
    render(
      <FlowDetailsIntro
        title="Checkout Guide"
        description="<p>How to checkout</p>"
        version="1.2.0"
        createdAt={Date.now()}
        stepCount={4}
        sectionCount={1}
        branchCount={1}
        resourceCount={2}
        tags={['ops']}
        variant="doc"
      />,
    );
    expect(screen.getByText('Checkout Guide')).toBeInTheDocument();
    expect(screen.getByText(/flow details/i)).toBeInTheDocument();
    expect(screen.getByText('ops')).toBeInTheDocument();
  });
});
