import type { Variants } from "framer-motion";

// Emil Kowalski-style: subtle, purposeful, fast
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const sidebarVariants: Variants = {
  hidden: { x: -12, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// Subtle hover feedback
export const buttonHover = {
  rest: { scale: 1 },
  hover: { scale: 1.01, transition: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] as const } },
};

// Quick tap feedback
export const buttonTap = { 
  scale: 0.98, 
  transition: { duration: 0.1, ease: [0.25, 0.1, 0.25, 1] as const } 
};

// Smooth expand/collapse
export const expandCollapse = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { 
    height: "auto", 
    opacity: 1,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }
  },
};