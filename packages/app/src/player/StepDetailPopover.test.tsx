import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepDetailPopover } from './StepDetailPopover';

describe('StepDetailPopover', () => {
  it('renders step number and description', () => {
    render(
      <StepDetailPopover
        stepNumber={2}
        title="Open settings"
        description="Use the gear icon"
        showArrow
        arrowSide="top"
      />,
    );
    expect(screen.getByText(/open settings/i)).toBeInTheDocument();
    expect(screen.getByText(/use the gear icon/i)).toBeInTheDocument();
  });
});
