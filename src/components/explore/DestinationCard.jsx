import { Link } from 'react-router-dom';
import { SmartImage } from '../ui';
import { formatINR } from '../../lib/format';
import { cx } from '../../lib/ui';
import { regionLabel } from './helpers';

const SCRIM = 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.32) 58%, rgba(0,0,0,0.8) 100%)';

/**
 * Photo card for a curated destination. The whole card is one link.
 * size: 'lg' (Explore grid) | 'sm' (rails such as "More like this").
 */
export default function DestinationCard({ destination: d, size = 'lg', eager = false, className }) {
  const lg = size === 'lg';
  return (
    <Link
      to={`/explore/${d.slug}`}
      className={cx(
        'group card-interactive relative block overflow-hidden isolate rounded-[24px]',
        lg ? 'aspect-[1/1] sm:aspect-[4/5]' : 'aspect-[4/3] sm:aspect-[3/4]',
        className,
      )}
      style={{ boxShadow: 'var(--shadow-md)' }}
      aria-label={`${d.name}, ${regionLabel(d)}. ${d.tagline} Best time ${d.bestTime}. From ${formatINR(d.startingPrice)} per person.`}
    >
      <SmartImage
        src={d.image}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        fallbackLabel=""
        className="absolute inset-0 -z-10"
        imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 -z-10" style={{ background: SCRIM }} aria-hidden />

      <div className={cx('absolute inset-x-0 bottom-0', lg ? 'p-6' : 'p-5')} style={{ color: '#fff' }} aria-hidden>
        <p className="t-caption uppercase tracking-[0.06em]" style={{ color: 'rgba(255,255,255,0.78)' }}>{regionLabel(d)}</p>
        <h3 className={cx(lg ? 't-title-2' : 't-title-3', 'mt-1')} style={{ color: '#fff' }}>{d.name}</h3>
        <p className={cx(lg ? 't-subhead' : 't-footnote', 'mt-1')} style={{ color: 'rgba(255,255,255,0.86)' }}>{d.tagline}</p>
        {lg && (
          <div
            className="mt-4 pt-3 flex items-center justify-between gap-3 t-footnote"
            style={{ borderTop: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.86)' }}
          >
            <span>Best {d.bestTime}</span>
            <span className="tabular whitespace-nowrap">From {formatINR(d.startingPrice)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
