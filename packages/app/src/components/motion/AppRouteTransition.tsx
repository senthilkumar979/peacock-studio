import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { shellFadeTiming } from '@/components/motion/pageMotion';
import { isLibraryShellRoute } from '@/constants/libraryRoutePaths';
import { LANDING_PATH } from '@/constants/routes';

interface AppRouteTransitionProps {
  children: ReactNode;
}

/**
 * Soft route fades for in-app navigation. Skips opacity-from-0 on the initial
 * document paint and on the marketing landing page so FCP/LCP are not delayed
 * waiting for Framer Motion.
 */
export const AppRouteTransition = ({ children }: AppRouteTransitionProps) => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const isInitialPaintRef = useRef(true);
  const skipShellTransition =
    isLibraryShellRoute(location.pathname) || location.pathname === LANDING_PATH;

  useEffect(() => {
    isInitialPaintRef.current = false;
  }, []);

  if (shouldReduceMotion || skipShellTransition || isInitialPaintRef.current) {
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
