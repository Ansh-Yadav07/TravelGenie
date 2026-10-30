import { MapPin, Sparkles, Star } from 'lucide-react';
import { Button, SmartImage } from '../ui';
import { formatINR, mapsUrl } from '../../lib/format';
import { cx } from '../../lib/ui';
import { planLink } from './helpers';

/**
 * A stay with honest actions only: open it in Maps, or plan a trip to the
 * destination it belongs to. Nothing here is bookable.
 * `destinationName` is the curated destination's name, if any.
 */
export default function StayCard({ stay, destinationName, compact = false, className }) {
  return (
    <article className={cx('card-flat overflow-hidden flex flex-col h-full', className)}>
      <div className="relative">
        <SmartImage
          src={stay.image}
          alt={`${stay.name}, ${stay.location}`}
          className="aspect-[16/10]"
          fallbackLabel={stay.name}
        />
        <span className="badge badge-on-image absolute top-3 left-3">{stay.type}</span>
      </div>

      <div className={cx('flex flex-col flex-1', compact ? 'p-5' : 'p-5 md:p-6')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="t-headline">{stay.name}</h3>
            <p className="t-subhead t-secondary mt-0.5 flex items-center gap-1">
              <MapPin size={14} strokeWidth={2} aria-hidden className="shrink-0" />
              <span className="truncate">{stay.location}</span>
            </p>
          </div>
          {stay.rating ? (
            <span className="t-footnote t-secondary inline-flex items-center gap-1 tabular shrink-0 mt-0.5" title="Typical guest rating">
              <Star size={13} strokeWidth={2} aria-hidden style={{ color: 'var(--orange)', fill: 'var(--orange)' }} />
              <span className="sr-only">Rated </span>{stay.rating.toFixed(1)}
            </span>
          ) : null}
        </div>

        {!compact && stay.amenities?.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 mt-4" aria-label="Amenities">
            {stay.amenities.map((a) => <li key={a} className="badge">{a}</li>)}
          </ul>
        )}

        <div className="mt-auto pt-5">
          <p className="t-callout">
            <span className="t-secondary">From </span>
            <span className="font-semibold tabular">{formatINR(stay.pricePerNight)}</span>
            <span className="t-secondary"> / night</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              href={mapsUrl(`${stay.name}, ${stay.location}`)}
              icon={MapPin}
              aria-label={`View ${stay.name} on Google Maps (opens in a new tab)`}
            >
              View on Maps
            </Button>
            {destinationName && (
              <Button variant="tinted" size="sm" to={planLink(destinationName)} icon={Sparkles}>
                Plan a trip here
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
