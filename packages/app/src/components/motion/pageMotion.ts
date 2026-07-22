export const PAGE_EASE = [0.22, 1, 0.36, 1] as const;

export const pageTransitionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const pageTransitionTiming = {
  duration: 0.28,
  ease: PAGE_EASE,
};

export const shellFadeTiming = {
  duration: 0.28,
  ease: PAGE_EASE,
};
