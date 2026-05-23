import { motion } from 'framer-motion';
import { PEACOCK_LOGO_SRC } from '@/constants/branding';

interface PeacockStudioLoaderProps {
  size?: number;
  className?: string;
}

const EASE = [0.45, 0, 0.55, 1] as const;

export const PeacockStudioLoader = ({ size = 140, className = '' }: PeacockStudioLoaderProps) => (
  <div
    className={`inline-flex items-center justify-center ${className}`}
    role="status"
    aria-label="Loading Peacock Studio"
  >
    <motion.img
      src={PEACOCK_LOGO_SRC}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className="object-contain drop-shadow-md"
      style={{ width: size, height: size }}
      animate={{ scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: EASE }}
    />
  </div>
);
