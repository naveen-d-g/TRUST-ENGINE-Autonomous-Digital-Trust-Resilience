export const motion = {
  duration: {
    fast: 150,
    medium: 300,
    slow: 500,
  },
  ease: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  animations: {
    fadeIn: "animate-in fade-in duration-300",
    slideInRight: "animate-in slide-in-from-right duration-300",
    pulse: "animate-pulse",
    spin: "animate-spin",
  }
}
