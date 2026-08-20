import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ClickMarker } from './ClickMarker';

vi.mock('framer-motion', () => ({
  motion: { div: 'div', button: 'button', span: 'span' },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ClickMarker', () => {
  it('smoke-renders a pulse marker positioned from the image ref', () => {
    const imageRef = createRef<HTMLImageElement>();
    const { container } = render(
      <>
        <img ref={imageRef} alt="step" width={200} height={100} />
        <ClickMarker xPercent={0.5} yPercent={0.25} imageRef={imageRef} />
      </>,
    );

    expect(container.querySelector('.relative.h-6.w-6')).toBeTruthy();
  });
});
