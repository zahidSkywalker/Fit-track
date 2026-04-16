import { Variants } from 'framer-motion';

/**
 * Page transition variants for AnimatePresence wrapping page routes.
 * Each page enters and exits with a subtle slide/fade effect.
 */

/** Standard slide-up page transition */
export const pageSlideUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

/** Fade-only page transition */
export const pageFade: Variants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

/** Scale-in page transition (for modals, detail pages) */
export const pageScaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: 12,
  },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

/** Slide from right (for drill-down navigation) */
export const pageSlideRight: Variants = {
  initial: {
    opacity: 0,
    x: 30,
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/** No animation (instant) */
export const pageInstant: Variants = {
  initial: {},
  enter: {},
  exit: {},
};

/**
 * Get page transition by name.
 */
export function getPageTransition(name: string): Variants {
  const transitions: Record<string, Variants> = {
    slideUp: pageSlideUp,
    fade: pageFade,
    scaleIn: pageScaleIn,
    slideRight: pageSlideRight,
    instant: pageInstant,
  };
  return transitions[name] || pageSlideUp;
}
