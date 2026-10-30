import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { ChevronLink } from '../ui';
import { formatDuration, formatINR, formatRelative, pluralize } from '../../lib/format';
import { useSavedTrips } from './hooks';

const MAX = 8;

/** "Pick up where you left off" — only rendered when trips are saved on this device. */
export default function RecentTrips() {
  const trips = useSavedTrips();
  if (!trips.length) return null;

  return (
    <section aria-labelledby="recent-title" className="pb-16 md:pb-24">
      <div className="container-x">
        <div className="flex items-end justify-between gap-4 mb-5">
          <h2 id="recent-title" className="t-title-2">Pick up where you left off</h2>
          <ChevronLink to="/trips" className="t-subhead shrink-0">See all</ChevronLink>
        </div>
      </div>
      <div className="container-x !px-0 md:!px-8">
        <ul className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-[22px] scroll-px-[22px] md:px-0 md:scroll-px-0 pb-4 pt-1 -mb-4">
          {trips.slice(0, MAX).map((t) => {
            const r = t.request || {};
            return (
              <li key={t.id} className="snap-start shrink-0 w-[260px] sm:w-[280px]">
                <Link to={`/trip/${t.id}`} className="card-flat card-interactive group flex flex-col h-full p-5 rounded-[20px]">
                  <div className="flex items-start justify-between gap-3">
                    <p className="t-headline truncate">{r.destination || t.overview?.title || 'Trip'}</p>
                    <ArrowUpRight size={18} strokeWidth={2} aria-hidden className="shrink-0 t-tertiary transition-colors group-hover:text-accent-text" />
                  </div>
                  <p className="t-footnote t-secondary mt-1 line-clamp-2 min-h-[2.76em]">{t.overview?.title}</p>
                  <p className="t-footnote t-secondary mt-4 tabular">
                    {formatDuration(r.duration, r.plan_mode)} · {pluralize(r.travelers || 1, 'traveler')}
                    {t.budget?.total ? ` · ${formatINR(t.budget.total)}` : ''}
                  </p>
                  <p className="t-caption t-tertiary mt-1">{formatRelative(t.created_at)}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
