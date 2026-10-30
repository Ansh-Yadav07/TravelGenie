import { ArrowUpRight, BedDouble, Lightbulb, Route, Sparkles, Star } from 'lucide-react';
import { cx } from '../../lib/ui';
import { directionsUrl, formatINR, formatRelative, mapsUrl } from '../../lib/format';
import { modeMeta } from './tripModel';

function Panel({ icon: Icon, title, id, children, className }) {
  return (
    <section aria-labelledby={id} className={cx('card p-5 md:p-6 print:p-0! print:border-0!', className)}>
      <h2 id={id} className="flex items-center gap-2 t-headline mb-1">
        <Icon size={18} strokeWidth={2} aria-hidden style={{ color: 'var(--text-2)' }} />
        {title}
      </h2>
      {children}
    </section>
  );
}

function OutLink({ href, children, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="link no-print t-footnote font-medium inline-flex items-center gap-0.5 min-h-[44px] -my-2.5"
    >
      {children}
      <ArrowUpRight size={13} strokeWidth={2.25} aria-hidden />
    </a>
  );
}

function Rating({ value }) {
  if (value == null || value <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 t-footnote tabular" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      <Star size={13} strokeWidth={0} fill="var(--orange)" aria-hidden />
      <span style={{ color: 'var(--text)' }} className="font-semibold">{value.toFixed(1)}</span>
    </span>
  );
}

export function StaysPanel({ trip }) {
  if (!trip.stays.length) return null;
  const nights = trip.budget.nights;
  return (
    <Panel icon={BedDouble} title="Where to stay" id="stays-title">
      <p className="t-footnote t-tertiary mb-1">
        {nights ? `${nights} ${nights === 1 ? 'night' : 'nights'} · ` : ''}totals for your group
      </p>
      <ul>
        {trip.stays.map((s, i) => (
          <li key={`${s.name}-${i}`} className={cx('py-4 break-inside-avoid', i > 0 && 'hairline-t')}>
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {s.recommended && <span className="badge badge-accent">Recommended</span>}
              {s.over_budget && <span className="badge badge-orange">Over budget</span>}
            </div>
            <h3 className="t-headline">{s.name}</h3>
            <p className="t-footnote t-secondary mt-0.5 flex flex-wrap items-center gap-x-1.5">
              {[s.type, s.area].filter(Boolean).join(' · ')}
              {s.rating != null && s.rating > 0 && (s.type || s.area) && <span aria-hidden>·</span>}
              <Rating value={s.rating} />
            </p>
            {s.highlight && <p className="t-subhead t-secondary mt-1.5">{s.highlight}</p>}
            <div className="flex items-end justify-between gap-3 mt-2.5">
              <p className="tabular">
                <span className="t-headline">{formatINR(s.price_per_night)}</span>
                <span className="t-footnote t-tertiary"> / night</span>
                {s.total_cost > 0 && <span className="block t-footnote t-secondary">{formatINR(s.total_cost)} total</span>}
              </p>
              <OutLink
                href={mapsUrl([s.name, s.area, trip.request.destination].filter(Boolean).join(', '))}
                label={`Open ${s.name} in Maps (opens in a new tab)`}
              >
                Maps
              </OutLink>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function TransportPanel({ trip }) {
  if (!trip.transport.length) return null;
  const intercity = trip.transport_scope === 'intercity';
  const { origin, destination } = trip.request;
  return (
    <Panel icon={Route} title={intercity ? 'Getting there' : 'Getting around'} id="transport-title">
      {intercity && origin && (
        <p className="t-footnote t-tertiary mb-1">{origin} → {destination} · round trip for your group</p>
      )}
      <ul>
        {trip.transport.map((t, i) => {
          const m = modeMeta(t.mode);
          const canDirect = intercity && origin && m.travelmode;
          return (
            <li key={`${t.title}-${i}`} className={cx('py-4 flex gap-3.5 break-inside-avoid', i > 0 && 'hairline-t')}>
              <span
                className="w-10 h-10 shrink-0 rounded-[11px] flex items-center justify-center"
                style={t.recommended ? { background: 'var(--accent-soft)', color: 'var(--accent-text)' } : { background: 'var(--fill)', color: 'var(--text-2)' }}
                aria-hidden
              >
                <m.Icon size={19} strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  {t.mode !== 'other' && <span className="t-caption t-secondary uppercase tracking-wide">{m.label}</span>}
                  {t.recommended && <span className="badge badge-accent">Best option</span>}
                  {t.over_budget && <span className="badge badge-orange">Over budget</span>}
                </div>
                <h3 className="t-headline">{t.title}</h3>
                {t.details && <p className="t-footnote t-secondary mt-1">{t.details}</p>}
                <div className="flex items-end justify-between gap-3 mt-2">
                  <p className="t-footnote tabular">
                    <span className="t-headline">{t.total_cost > 0 ? formatINR(t.total_cost) : 'Free'}</span>
                    {t.duration && <span className="t-tertiary"> · {t.duration}</span>}
                  </p>
                  {canDirect && (
                    <OutLink href={directionsUrl(origin, destination, m.travelmode)} label={`Directions from ${origin} to ${destination} (opens in a new tab)`}>
                      Directions
                    </OutLink>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

export function TipsPanel({ trip }) {
  if (!trip.tips.length) return null;
  return (
    <Panel icon={Lightbulb} title="Local tips" id="tips-title">
      <ol className="mt-3 space-y-3.5">
        {trip.tips.map((tip, i) => (
          <li key={i} className="flex gap-3 break-inside-avoid">
            <span
              className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center t-caption font-semibold tabular mt-px"
              style={{ background: 'var(--fill)', color: 'var(--text-2)' }}
              aria-hidden
            >
              {i + 1}
            </span>
            <p className="t-subhead">{tip}</p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export function GeneratedNote({ trip }) {
  const when = formatRelative(trip.created_at);
  return (
    <div className="px-1 t-footnote t-tertiary">
      <p className="flex items-center gap-1.5">
        <Sparkles size={13} strokeWidth={2} aria-hidden />
        {trip.meta.demo ? 'Demo plan' : `Generated by Gemini${trip.meta.model ? ` ${trip.meta.model.replace(/^gemini-/i, '')}` : ''}`}
        {when && <span> · {when}</span>}
      </p>
      <p className="mt-1.5">
        Prices, timings and opening hours are AI estimates. Please verify them before you book.
      </p>
    </div>
  );
}
