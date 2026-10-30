import { motion, useReducedMotion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import { SmartImage } from '../ui';
import { cx, easeOut } from '../../lib/ui';
import { findDestinationByName } from '../../data/destinations';
import { dayDate, formatDate, formatDuration, pluralize } from '../../lib/format';
import { tierLabel } from './tripModel';

/**
 * Full-bleed trip header. Uses the curated destination photo (with a scrim)
 * when we have one, otherwise a calm tinted material. Prints as plain text.
 */
export default function TripHero({ trip, children }) {
  const reduce = useReducedMotion();
  const { request, overview, meta } = trip;
  const dest = findDestinationByName(request.destination);
  const photo = Boolean(dest?.image);

  const dates = request.start_date && !trip.isHours
    ? `${formatDate(request.start_date)} – ${dayDate(request.start_date, request.duration)}`
    : request.start_date
      ? formatDate(request.start_date)
      : '';
  const eyebrow = [
    formatDuration(request.duration, request.plan_mode),
    dates,
    pluralize(request.travelers, 'traveler'),
    tierLabel(trip.budget.tier),
  ].filter(Boolean);

  const anim = (delay) => (reduce ? {} : {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: easeOut },
  });

  return (
    <div className="container-x pt-[calc(var(--nav-height)+12px)] md:pt-[calc(var(--nav-height)+20px)] print:pt-0">
    <header
      className={cx(
        'relative isolate overflow-hidden rounded-[var(--radius-lg)] md:rounded-[var(--radius-xl)] print:rounded-none',
        photo ? 'text-white print:text-black' : '',
      )}
      style={photo ? undefined : { border: '1px solid var(--separator)' }}
    >
      {photo ? (
        <div className="absolute inset-0 -z-10 print:hidden" aria-hidden>
          <SmartImage src={dest.image} alt="" loading="eager" className="absolute inset-0 h-full" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.14) 32%, rgba(0,0,0,0.5) 56%, rgba(0,0,0,0.82) 100%)' }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 -z-10 print:hidden"
          aria-hidden
          style={{
            background:
              'radial-gradient(120% 90% at 0% 0%, var(--accent-soft) 0%, transparent 55%), radial-gradient(90% 80% at 100% 10%, var(--purple-soft) 0%, transparent 60%), var(--bg-grouped)',
          }}
        />
      )}

      <div
        className={cx(
          'relative flex flex-col justify-end px-6 pt-24 pb-7 md:px-12 md:pb-11 print:p-0! print:min-h-0!',
          photo ? 'min-h-[300px] md:min-h-[min(72vh,560px)]' : 'min-h-[300px] md:min-h-[380px]',
        )}
      >
        <motion.div {...anim(0)} className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mb-3">
          <p className={cx('t-eyebrow', photo && 'text-white print:text-black')}>
            {eyebrow.map((part, i) => (
              <span key={part} className="whitespace-nowrap">
                {i > 0 && <span aria-hidden className="mx-1.5 opacity-60">·</span>}
                {part}
              </span>
            ))}
          </p>
          {meta.demo && (
            <span className={cx('badge', photo ? 'badge-on-image' : 'badge-orange')} title="Generated without a Gemini API key — sample content">
              <FlaskConical size={12} strokeWidth={2.5} aria-hidden />
              Demo plan
            </span>
          )}
        </motion.div>

        <motion.h1
          {...anim(0.05)}
          id="trip-title"
          className={cx('t-display max-w-[18ch] print:[text-shadow:none]!', photo && 'text-white print:text-black')}
          style={photo ? { textShadow: '0 2px 24px rgba(0,0,0,0.25)' } : undefined}
        >
          {overview.title}
        </motion.h1>

        {/* On phones the copy sits under the photo so the image stays an image. */}
        <div className={photo ? 'hidden md:block print:block' : undefined}>
          <Copy overview={overview} onPhoto={photo} inCard anim={anim} />
        </div>

        {children}
      </div>
    </header>
    {photo && (
      <div className="md:hidden print:hidden pt-5">
        <Copy overview={overview} anim={anim} />
      </div>
    )}
    </div>
  );
}

function Copy({ overview, onPhoto = false, inCard = false, anim }) {
  return (
    <>
      {overview.summary && (
        <motion.p {...anim(0.1)} className={cx('t-body max-w-[62ch]', inCard && 'mt-4', onPhoto ? 'text-white/85 print:text-black' : 't-secondary')}>
          {overview.summary}
        </motion.p>
      )}
      {overview.highlights.length > 0 && (
        <motion.ul {...anim(0.15)} className={cx('flex flex-wrap gap-2', overview.summary || inCard ? 'mt-5 md:mt-6' : '')} aria-label="Highlights">
          {overview.highlights.map((h) => (
            <li
              key={h}
              className={cx(
                'inline-flex items-center min-h-[32px] px-3.5 rounded-full t-footnote font-medium',
                onPhoto ? 'badge-on-image print:bg-transparent print:text-black print:border print:border-neutral-300' : '',
              )}
              style={onPhoto ? undefined : { background: 'var(--fill)', color: 'var(--text)' }}
            >
              {h}
            </li>
          ))}
        </motion.ul>
      )}
    </>
  );
}
