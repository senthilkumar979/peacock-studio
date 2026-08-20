import { describe, expect, it } from 'vitest';
import { getPopoverPlacement } from './getPopoverPlacement';

describe('getPopoverPlacement', () => {
  it('places bottom-left corner above and to the right', () => {
    expect(getPopoverPlacement(0.1, 0.8)).toEqual({
      wrapperClassName: 'absolute bottom-full left-full mb-6 ml-6',
      arrowSide: 'left',
    });
  });

  it('places bottom-right corner above and to the left', () => {
    expect(getPopoverPlacement(0.9, 0.8)).toEqual({
      wrapperClassName: 'absolute bottom-full right-full mb-6 mr-6',
      arrowSide: 'right',
    });
  });

  it('places bottom-center above the marker', () => {
    expect(getPopoverPlacement(0.5, 0.8)).toEqual({
      wrapperClassName: 'absolute bottom-full left-1/2 mb-6 -translate-x-1/2',
      arrowSide: 'bottom',
    });
  });

  it('places left-edge to the right of the marker', () => {
    expect(getPopoverPlacement(0.1, 0.5)).toEqual({
      wrapperClassName: 'absolute left-full top-1/2 ml-6 -translate-y-1/2',
      arrowSide: 'left',
    });
  });

  it('places right-edge to the left of the marker', () => {
    expect(getPopoverPlacement(0.9, 0.5)).toEqual({
      wrapperClassName: 'absolute right-full top-1/2 mr-6 -translate-y-1/2',
      arrowSide: 'right',
    });
  });

  it('defaults to below-center for mid-screen markers', () => {
    expect(getPopoverPlacement(0.5, 0.5)).toEqual({
      wrapperClassName: 'absolute left-1/2 top-full mt-6 -translate-x-1/2',
      arrowSide: 'top',
    });
  });

  it('uses inclusive thresholds at 0.28 / 0.72', () => {
    expect(getPopoverPlacement(0.28, 0.5).arrowSide).toBe('left');
    expect(getPopoverPlacement(0.72, 0.5).arrowSide).toBe('right');
    expect(getPopoverPlacement(0.5, 0.72).arrowSide).toBe('bottom');
  });
});
