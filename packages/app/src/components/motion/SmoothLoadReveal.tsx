import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface SmoothLoadRevealProps {
  isLoading: boolean;
  loading: ReactNode;
  children: ReactNode;
  className?: string;
}

export const SmoothLoadReveal = ({
  isLoading,
  loading,
  children,
  className,
}: SmoothLoadRevealProps) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{isLoading ? loading : children}</div>;
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait" initial={false}>
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {loading}
          </motion.div>
        ) : (
          <motion.div key="content" initial={false}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
