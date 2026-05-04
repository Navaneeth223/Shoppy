/**
 * Framer Motion animation variants and presets for Nexus Commerce.
 * Import these in components for consistent animations.
 */

// ─── Page transitions ─────────────────────────────────────────────────────────

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const pageTransition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1], // ease-out-expo
};

// ─── Fade variants ────────────────────────────────────────────────────────────

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

// ─── Slide variants ───────────────────────────────────────────────────────────

export const slideInRight = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

export const slideInLeft = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
};

export const slideInBottom = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
};

// ─── Scale variants ───────────────────────────────────────────────────────────

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const popIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

// ─── Stagger containers ───────────────────────────────────────────────────────

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ─── Spring configs ───────────────────────────────────────────────────────────

export const springConfig = {
  type: 'spring',
  damping: 25,
  stiffness: 300,
};

export const bouncySpring = {
  type: 'spring',
  damping: 15,
  stiffness: 400,
};

// ─── Hover animations ─────────────────────────────────────────────────────────

export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.15 },
};

export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2 } },
};

// ─── Transition presets ───────────────────────────────────────────────────────

export const easeOutExpo = [0.16, 1, 0.3, 1];
export const easeInOutCubic = [0.65, 0, 0.35, 1];

export const smoothTransition = {
  duration: 0.3,
  ease: easeOutExpo,
};

export const fastTransition = {
  duration: 0.15,
  ease: easeOutExpo,
};
