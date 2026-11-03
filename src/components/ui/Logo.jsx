import { cx } from '../../lib/ui';

/**
 * TravelGenie mark: a navigation arrow on a terracotta tile.
 */
export default function Logo({ size = 28, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={cx('shrink-0', className)} aria-hidden>
      <rect width="64" height="64" rx="15" fill="var(--accent)" />
      <path
        d="M47.4 16.6 L32.9 51.6 L28 36 L12.4 31.1 Z"
        fill="#fff"
        stroke="#fff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
