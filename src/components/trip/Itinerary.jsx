import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Clock3, MapPin } from 'lucide-react';
import { Reveal } from '../ui';
import { cx } from '../../lib/ui';
import { formatINR, formatMinutes, formatTime, mapsUrl, pluralize } from '../../lib/format';
import { activityMapsQuery, categoryMeta, dayLabel, hourRange } from './tripModel';

const NAV_OFFSET = 52 + 64; // fixed nav + sticky day pills

/** Day-by-day itinerary with a sticky, scroll-spying day selector. */
export default function Itinerary({ trip }) {
  const days = trip.days;
  const [active, setActive] = useState(days[0]?.day ?? 1);
  const sections = useRef(new Map());
  const pills = useRef(new Map());
  const scroller = useRef(null);
  const visible = useRef(new Map());
  const lockUntil = useRef(0);
  const showNav = !trip.isHours && days.length > 1;

  // Scroll-spy: the first day whose section crosses the band under the pills wins.
  useEffect(() => {
    if (!showNav || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.current.set(Number(e.target.dataset.day), e.isIntersecting);
        if (performance.now() < lockUntil.current) return;
        const first = days.find((d) => visible.current.get(d.day));
        if (first) setActive(first.day);
      },
      { rootMargin: `-${NAV_OFFSET + 8}px 0px -55% 0px`, threshold: 0 },
    );
    sections.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [days, showNav]);

  // Keep the active pill visible inside the horizontal scroller.
  useEffect(() => {
    const el = pills.current.get(active);
    const sc = scroller.current;
    if (!el || !sc) return;
    const left = el.offsetLeft - sc.clientWidth / 2 + el.offsetWidth / 2;
    sc.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [active]);

  const goTo = (day, event) => {
    const el = sections.current.get(day);
    if (!el) return;
    setActive(day);
    // event.timeStamp shares performance.now()'s clock.
    lockUntil.current = (event?.timeStamp ?? 0) + 900;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET - 8;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    el.focus({ preventScroll: true });
  };

  return (
    <section aria-labelledby="itinerary-title" className="min-w-0">
      <h2 id="itinerary-title" className="t-title-2 mb-3">Itinerary</h2>

      {showNav && (
        <nav
          aria-label="Days"
          className="no-print sticky top-[var(--nav-height)] z-20 -mx-[22px] md:-mx-8 lg:mx-0 material hairline-b"
        >
          <div ref={scroller} className="flex gap-1 overflow-x-auto scrollbar-none px-[22px] md:px-8 lg:px-0 py-2.5 lg:py-2.5 scroll-px-6">
            {days.map((d) => {
              const { short, date } = dayLabel(trip, d);
              const isActive = d.day === active;
              return (
                <button
                  key={d.day}
                  ref={(el) => { if (el) pills.current.set(d.day, el); else pills.current.delete(d.day); }}
                  type="button"
                  onClick={(e) => goTo(d.day, e)}
                  aria-current={isActive ? 'true' : undefined}
                  className="shrink-0 min-h-[44px] flex items-center rounded-full"
                >
                  <span
                    className={cx(
                      'inline-flex items-center h-9 px-4 rounded-full t-subhead font-medium whitespace-nowrap transition-colors duration-200',
                      !isActive && 'hover:bg-[var(--fill-2)]',
                    )}
                    style={isActive
                      ? { background: 'var(--text)', color: 'var(--bg)' }
                      : { background: 'var(--fill)', color: 'var(--text)' }}
                  >
                    {short}
                    {date && <span className={cx('ml-1.5', isActive ? 'opacity-70' : 't-secondary')}>· {date}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <div className={cx('flex flex-col gap-4 md:gap-5', showNav ? 'mt-4 md:mt-5' : 'mt-2')}>
        {days.map((d, i) => (
          <Reveal key={d.day} y={16} delay={i === 0 ? 0.05 : 0} className="print:opacity-100! print:transform-none!">
            <DaySection
              trip={trip}
              day={d}
              sectionRef={(el) => { if (el) sections.current.set(d.day, el); else sections.current.delete(d.day); }}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function DaySection({ trip, day, sectionRef }) {
  const { short, date } = dayLabel(trip, day);
  const headingId = `day-${day.day}-title`;
  const range = trip.isHours ? hourRange(day.activities) : '';
  const stops = day.activities.filter((a) => a.category !== 'transit' && a.category !== 'stay').length;

  return (
    <section
      ref={sectionRef}
      id={`day-${day.day}`}
      data-day={day.day}
      tabIndex={-1}
      aria-labelledby={headingId}
      className="card p-5 sm:p-6 md:p-7 outline-none print:break-inside-auto! print:p-0! print:border-0!"
      style={{ scrollMarginTop: NAV_OFFSET + 8 }}
    >
      <header className="flex items-start justify-between gap-4 mb-6 print:mb-3">
        <div className="min-w-0">
          <p className="t-eyebrow">
            {trip.isHours ? (trip.request.start_date ? `Your outing · ${dayLabel(trip, day).date}` : 'Your outing') : (
              <>
                {short}
                {date && <span className="t-secondary font-medium"> · {date}</span>}
              </>
            )}
          </p>
          <h3 id={headingId} className="t-title-3 mt-1">
            {trip.isHours ? range || day.title || 'Itinerary' : day.title || short}
          </h3>
          {trip.isHours && range && day.title && <p className="t-subhead t-secondary mt-1">{day.title}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="t-headline tabular">{formatINR(day.total_cost)}</p>
          <p className="t-caption t-tertiary">{pluralize(stops, 'stop')}</p>
        </div>
      </header>

      {day.activities.length ? (
        <ol>
          {day.activities.map((a, i) => (
            <ActivityItem
              key={`${a.time}-${a.title}-${i}`}
              activity={a}
              destination={trip.request.destination}
              first={i === 0}
              last={i === day.activities.length - 1}
            />
          ))}
        </ol>
      ) : (
        <p className="t-subhead t-secondary">A free day — explore at your own pace.</p>
      )}
    </section>
  );
}

function ActivityItem({ activity: a, destination, first, last }) {
  const cat = categoryMeta(a.category);
  const Icon = cat.Icon;
  const time = formatTime(a.time);
  const dur = formatMinutes(a.duration_minutes);
  const logistics = a.category === 'transit' || a.category === 'stay';
  const cost = a.cost > 0
    ? <span className="badge tabular shrink-0">{formatINR(a.cost)}</span>
    : !logistics ? <span className="badge badge-green shrink-0">Free</span> : null;

  return (
    <li className="relative grid grid-cols-[2rem_minmax(0,1fr)] sm:grid-cols-[4.25rem_2rem_minmax(0,1fr)] gap-x-3.5 sm:gap-x-4 break-inside-avoid">
      <div className="hidden sm:block pt-[7px] text-right">
        {time && <time className="t-footnote font-semibold tabular whitespace-nowrap">{time}</time>}
      </div>

      <div className="relative flex justify-center" aria-hidden>
        {!(first && last) && (
          <span
            className="absolute left-1/2 -translate-x-1/2 w-px"
            style={{ background: 'var(--separator)', top: first ? 16 : 0, ...(last ? { height: 16 } : { bottom: 0 }) }}
          />
        )}
        <span
          className="relative w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${cat.color} 15%, var(--surface))`, color: cat.color }}
        >
          <Icon size={15} strokeWidth={2} />
        </span>
      </div>

      <div className={cx('min-w-0 pt-[3px]', !last && 'pb-7')}>
        {(time || cost) && (
          <div className="sm:hidden flex items-center justify-between gap-3 mb-0.5">
            <p className="t-footnote font-semibold tabular t-secondary">{time}</p>
            {cost}
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <h4 className="t-headline">
            {a.title}
            <span className="sr-only"> ({cat.label})</span>
          </h4>
          {cost && <span className="hidden sm:inline-flex mt-0.5 shrink-0">{cost}</span>}
        </div>
        {a.description && <p className="t-subhead t-secondary mt-1">{a.description}</p>}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-0 mt-1.5 t-footnote t-tertiary">
          {a.area && (
            <span className="inline-flex items-center gap-1 min-h-[28px]">
              <MapPin size={13} strokeWidth={2} aria-hidden />
              {a.area}
            </span>
          )}
          {dur && (
            <span className="inline-flex items-center gap-1 min-h-[28px]">
              <Clock3 size={13} strokeWidth={2} aria-hidden />
              <span><span className="sr-only">Duration </span>{dur}</span>
            </span>
          )}
          {!logistics || a.maps_query ? (
            <a
              href={mapsUrl(activityMapsQuery(a, destination))}
              target="_blank"
              rel="noopener noreferrer"
              className="link no-print inline-flex items-center gap-0.5 min-h-[44px] -my-2 font-medium"
              aria-label={`Open ${a.title} in Maps (opens in a new tab)`}
            >
              Open in Maps
              <ArrowUpRight size={13} strokeWidth={2.25} aria-hidden />
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}
