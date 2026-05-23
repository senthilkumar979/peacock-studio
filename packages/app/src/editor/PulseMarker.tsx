import { motion } from 'framer-motion';

export const PulseMarker = () => (
  <div className="relative h-6 w-6">
    <motion.div
      className="absolute inset-0 rounded-full bg-blue-500"
      animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    />
    <div className="absolute inset-[6px] rounded-full bg-white ring-2 ring-blue-500" />
  </div>
);
