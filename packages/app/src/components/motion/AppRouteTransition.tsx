import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { shellFadeTiming } from '@/components/motion/pageMotion';
import { isLibraryShellRoute } from '@/constants/libraryRoutePaths';

interface AppRouteTransitionProps {
  children: ReactNode;
}

export const AppRouteTransition = ({ children }: AppRouteTransitionProps) => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const skipShellTransition = isLibraryShellRoute(location.pathname);

  if (shouldReduceMotion || skipShellTransition) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={shellFadeTiming}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
