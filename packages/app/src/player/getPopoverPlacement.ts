export type PopoverArrowSide = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverPlacement {
  wrapperClassName: string;
  arrowSide: PopoverArrowSide;
}

const BOTTOM_THRESHOLD = 0.72;
const LEFT_THRESHOLD = 0.28;
const RIGHT_THRESHOLD = 0.72;

export function getPopoverPlacement(xPercent: number, yPercent: number): PopoverPlacement {
  const isBottom = yPercent >= BOTTOM_THRESHOLD;
  const isLeft = xPercent <= LEFT_THRESHOLD;
  const isRight = xPercent >= RIGHT_THRESHOLD;

  if (isBottom && isLeft) {
    return {
      wrapperClassName: 'absolute bottom-full left-full mb-6 ml-6',
      arrowSide: 'left',
    };
  }

  if (isBottom && isRight) {
    return {
      wrapperClassName: 'absolute bottom-full right-full mb-6 mr-6',
      arrowSide: 'right',
    };
  }

  if (isBottom) {
    return {
      wrapperClassName: 'absolute bottom-full left-1/2 mb-6 -translate-x-1/2',
      arrowSide: 'bottom',
    };
  }

  if (isLeft) {
    return {
      wrapperClassName: 'absolute left-full top-1/2 ml-6 -translate-y-1/2',
      arrowSide: 'left',
    };
  }

  if (isRight) {
    return {
      wrapperClassName: 'absolute right-full top-1/2 mr-6 -translate-y-1/2',
      arrowSide: 'right',
    };
  }

  return {
    wrapperClassName: 'absolute left-1/2 top-full mt-6 -translate-x-1/2',
    arrowSide: 'top',
  };
}
