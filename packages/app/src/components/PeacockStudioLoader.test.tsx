import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PeacockStudioLoader } from './PeacockStudioLoader';

describe('PeacockStudioLoader', () => {
  it('exposes a loading status label', () => {
    render(<PeacockStudioLoader />);
    expect(screen.getByRole('status', { name: 'Loading Peacock Studio' })).toBeInTheDocument();
  });
});
