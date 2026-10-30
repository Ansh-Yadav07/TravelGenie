/** Small UI helpers shared by components (kept out of .jsx files for Fast Refresh). */

/** Join class names, skipping falsy values. */
export const cx = (...c) => c.filter(Boolean).join(' ');

/** Apple-like springs used across the app. */
export const spring = { type: 'spring', stiffness: 380, damping: 34, mass: 0.9 };
export const softSpring = { type: 'spring', stiffness: 220, damping: 30 };

/** Ease used for scroll reveals and page content. */
export const easeOut = [0.16, 1, 0.3, 1];
