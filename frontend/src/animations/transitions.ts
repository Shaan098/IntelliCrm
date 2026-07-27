// Reusable transition configs for Framer Motion

export const springSmooth = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

export const springBouncy = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 20,
};

export const easeFast = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export const easeSmooth = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export const easeGentle = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

export const pageTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export const modalTransition = {
  duration: 0.22,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export const staggerTransition = (i: number) => ({
  delay: i * 0.06,
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
});
