import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';
import { AppFooter } from '@/components/AppFooter';
import { pageTransitionTiming, pageTransitionVariants } from '@/components/motion/pageMotion';
import { LibraryNav } from '@/components/library/LibraryNav';

export const LibraryLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-screen flex-col bg-slate-100/80">
      <LibraryNav />
      <div className="flex-1 overflow-x-hidden">
        {shouldReduceMotion ? (
          <div className="h-full">{outlet}</div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={pageTransitionVariants.initial}
              animate={pageTransitionVariants.animate}
              exit={pageTransitionVariants.exit}
              transition={pageTransitionTiming}
              className="h-full"
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      <AppFooter />
    </div>
  );
};
