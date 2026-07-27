import { Variants } from 'framer-motion';

// ── Page-level transitions ────────────────────────────
export const pageVariants: Variants = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -8 },
};

// ── Fade + scale (modals, cards) ─────────────────────
export const fadeScaleVariants: Variants = {
  initial:  { opacity: 0, scale: 0.96 },
  animate:  { opacity: 1, scale: 1 },
  exit:     { opacity: 0, scale: 0.96 },
};

// ── Slide up (drawers, bottom sheets) ───────────────
export const slideUpVariants: Variants = {
  initial:  { opacity: 0, y: 24 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: 24 },
};

// ── Slide from right (sidebar drawers) ──────────────
export const slideRightVariants: Variants = {
  initial:  { opacity: 0, x: 24 },
  animate:  { opacity: 1, x: 0 },
  exit:     { opacity: 0, x: 24 },
};

// ── Stagger container (list parents) ─────────────────
export const staggerContainer: Variants = {
  initial:  {},
  animate:  { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

// ── Stagger children (list items) ────────────────────
export const staggerItem: Variants = {
  initial:  { opacity: 0, y: 16 },
  animate:  { opacity: 1, y: 0 },
};

// ── Backdrop overlay ─────────────────────────────────
export const backdropVariants: Variants = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1 },
  exit:     { opacity: 0 },
};

// ── Sidebar collapse ─────────────────────────────────
export const sidebarVariants = {
  expanded:  { width: 240 },
  collapsed: { width: 64 },
};

// ── Answer card reveal ───────────────────────────────
export const answerRevealVariants: Variants = {
  initial:  { opacity: 0, y: 20, filter: 'blur(4px)' },
  animate:  { opacity: 1, y: 0,  filter: 'blur(0px)' },
};

// ── Source badge stagger ─────────────────────────────
export const sourceBadgeVariants: Variants = {
  initial:  { opacity: 0, scale: 0.8 },
  animate:  { opacity: 1, scale: 1 },
};

// ── Error shake ──────────────────────────────────────
export const shakeVariants: Variants = {
  shake: {
    x: [-8, 8, -6, 6, -4, 4, 0],
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// ── Success bounce ───────────────────────────────────
export const successBounceVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: [0, 1.2, 1], opacity: 1 },
};
