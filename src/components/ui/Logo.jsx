import { cx } from '../../lib/ui';

/**
 * TravelGenie mark: a navigation arrow on a rounded tile. Drawn in the
 * label colour so it inverts with the theme (dark tile in light mode,
 * light tile in dark mode).
 */
export default function Logo({ size = 28, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={cx('shrink-0', className)} aria-hidden>
      <rect width="64" height="64" rx="15" fill="var(--text)" />
      <path
        d="M47.4 16.6 L32.9 51.6 L28 36 L12.4 31.1 Z"
        fill="var(--bg)"
        stroke="var(--bg)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
