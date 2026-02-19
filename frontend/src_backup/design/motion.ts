import { Transition, Variants } from 'framer-motion';

/**
 * SOC Standard Motion Presets
 * Ensures consistent animation feel across the dashboard.
 */

export const Transitions = {
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 30
  } as Transition,
  
  smooth: {
    type: 'spring',
    stiffness: 260,
    damping: 20
  } as Transition,

  gentle: {
    duration: 0.5,
    ease: [0.32, 0, 0.67, 0]
  } as Transition,

  pulse: (duration: number = 2) => ({
    scale: [1, 1.02, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration,
      repeat: Infinity,
      ease: "easeInOut"
    }
  })
};

export const UIAutoVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: Transitions.smooth },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export const ListTransition: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const ItemSlide: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};
