import { Link } from 'react-router-dom';
import { CalendarDays, Trash2, Users } from 'lucide-react';
import { SmartImage } from '../ui';
import { findDestinationByName } from '../../data/destinations';
import { formatDate, formatDuration, formatINR, formatRelative, pluralize } from '../../lib/format';
import ConfirmPopover from './ConfirmPopover';

/** Saved-trip card for /trips. The whole card links to the trip; delete has an inline confirm. */
export default function TripCard({ trip, onDelete }) {
  const { request, overview, budget } = trip;
  const dest = findDestinationByName(request.destination);
  const when = formatRelative(trip.created_at);
  const date = request.start_date ? formatDate(request.start_date, { day: 'numeric', month: 'short' }) : '';

  return (
    <div className="relative h-full card card-interactive flex flex-col has-[a:focus-visible]:shadow-[var(--ring)]">
      <SmartImage
        src={dest?.image || ''}
        alt=""
        className="aspect-[16/10] rounded-t-[var(--radius)]"
        fallbackLabel={dest ? undefined : request.destination}
      />
      {trip.meta.demo && <span className="badge badge-on-image absolute top-3 left-3">Demo</span>}

      <div className="flex flex-col flex-1 p-5">
        <p className="t-footnote t-secondary truncate">
          {request.destination || 'Trip'}
          {request.origin ? ` from ${request.origin}` : ''}
        </p>
        <h2 className="t-headline mt-1 line-clamp-2">
          <Link
            to={`/trip/${encodeURIComponent(trip.id)}`}
            className="after:absolute after:inset-0 after:rounded-[var(--radius)] after:content-[''] focus-visible:shadow-none"
          >
            {overview.title}
          </Link>
        </h2>

        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <div className="t-footnote t-secondary space-y-0.5 min-w-0">
            <p className="flex items-center gap-1.5">
              <CalendarDays size={13} strokeWidth={2} aria-hidden />
              <span className="truncate">{formatDuration(request.duration, request.plan_mode)}{date ? ` · ${date}` : ''}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Users size={13} strokeWidth={2} aria-hidden />
              {pluralize(request.travelers, 'traveler')}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="t-headline tabular">{formatINR(budget.estimate.total)}</p>
            <p className="t-caption t-tertiary">estimated</p>
          </div>
        </div>
        {when && <p className="t-caption t-tertiary mt-3 pt-3 hairline-t">Planned {/^(Just now|Yesterday)$/.test(when) ? when.toLowerCase() : when}</p>}
      </div>

      <div className="absolute top-2 right-2 z-10">
        <ConfirmPopover
          title="Delete this trip?"
          message={`“${overview.title}” will be removed from this device.`}
          confirmLabel="Delete"
          onConfirm={onDelete}
          renderTrigger={(props) => (
            <button
              type="button"
              {...props}
              className="w-11 h-11 rounded-full flex items-center justify-center"
              aria-label={`Delete ${overview.title}`}
              title="Delete trip"
            >
              <span className="badge-on-image w-8 h-8 rounded-full flex items-center justify-center">
                <Trash2 size={15} strokeWidth={2} aria-hidden />
              </span>
            </button>
          )}
        />
      </div>
    </div>
  );
}
