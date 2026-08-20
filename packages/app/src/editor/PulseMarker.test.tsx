import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PulseMarker } from './PulseMarker';

vi.mock('framer-motion', () => ({
  motion: { div: 'div', button: 'button', span: 'span' },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe('PulseMarker', () => {
  it('smoke-renders the marker shell', () => {
    const { container } = render(<PulseMarker />);
    expect(container.firstChild).toHaveClass('relative', 'h-6', 'w-6');
  });
});
