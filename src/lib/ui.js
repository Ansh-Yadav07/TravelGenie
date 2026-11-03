/** Small UI helpers shared by components (kept out of .jsx files for Fast Refresh). */

/** Join class names, skipping falsy values. */
export const cx = (...c) => c.filter(Boolean).join(' ');

/** Apple-like springs used across the app. */
export const spring = { type: 'spring', stiffness: 380, damping: 34, mass: 0.9 };
export const softSpring = { type: 'spring', stiffness: 220, damping: 30 };

/** Ease used for scroll reveals and page content. */
export const easeOut = [0.16, 1, 0.3, 1];

/** A destination photo URL at each width a full-bleed header might need. */
export function photoSources(url, widths = [640, 1000, 1600]) {
  const sized = (w) => url.replace(/([?&])w=\d+/, `$1w=${w}`);
  return { src: sized(widths[widths.length - 1]), srcSet: widths.map((w) => `${sized(w)} ${w}w`).join(', '), sizes: '100vw' };
}
