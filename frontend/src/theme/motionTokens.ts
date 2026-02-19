import { TargetAndTransition, Variants } from 'framer-motion';

export const MotionTokens: Record<string, TargetAndTransition | Variants | unknown> = {
  fast: { duration: 0.15, ease: 'easeOut' as const },
  normal: { duration: 0.3, ease: 'easeOut' as const },
  slow: { duration: 0.6, ease: 'easeInOut' as const },

  pulse: {
    scale: [1, 1.04, 1],
    opacity: [0.9, 1, 0.9],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
    }
  } as TargetAndTransition,

  enterUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
  },

  dangerShake: {
    x: [-2, 2, -2, 2, 0],
    transition: { duration: 0.4 }
  },
};
