import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FlowVideoCompositionProps } from './videoBeats';

vi.mock('remotion', () => ({
  AbsoluteFill: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Sequence: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt="" {...props} />,
  interpolate: (_frame: number, _input: number[], output: number[]) => output[0],
  useCurrentFrame: () => 0,
}));

import { FlowVideoComposition } from './FlowVideoComposition';

const props: FlowVideoCompositionProps = {
  beats: [
    {
      kind: 'step',
      stepNumber: 1,
      title: 'Click Save',
      description: 'Click the Save button',
      screenshotUrl: 'blob:shot',
      marker: { x: 0.4, y: 0.5 },
      url: 'https://example.com',
    },
    {
      kind: 'nav',
      stepNumber: 2,
      title: 'Open settings',
      description: '',
      screenshotUrl: null,
      marker: null,
      url: 'https://example.com/settings',
    },
  ],
  title: 'Checkout',
  description: 'Pay for an order',
  version: '1.0',
  logoUrl: '/peacock-logo.png',
  primaryColor: '#2563EB',
  appName: 'Peacock Studio',
};

describe('FlowVideoComposition', () => {
  it('renders cover, step, nav, and end copy', () => {
    render(<FlowVideoComposition {...props} />);
    expect(screen.getByText('Product walkthrough')).toBeInTheDocument();
    expect(screen.getAllByText('Checkout').length).toBeGreaterThan(0);
    expect(screen.getByText('Click Save')).toBeInTheDocument();
    expect(screen.getByText('Open settings')).toBeInTheDocument();
    expect(screen.getByText('End of walkthrough')).toBeInTheDocument();
  });
});
