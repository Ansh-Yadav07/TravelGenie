import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronLeft, Clock, Compass, IndianRupee, MapPin, Sparkles } from 'lucide-react';

import { Button, ChevronLink, EmptyState, Reveal, SmartImage } from '../components/ui';
import DestinationCard from '../components/explore/DestinationCard';
import StayCard from '../components/explore/StayCard';
import { planLink, regionLabel, relatedDestinations } from '../components/explore/helpers';
import { destinations, getDestination } from '../data/destinations';
import { stays } from '../data/stays';
import { INTERESTS, labelOf } from '../lib/planner';
import { formatINR, mapsUrl, pluralize } from '../lib/format';
import { easeOut } from '../lib/ui';

const SCRIM = 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.35) 62%, rgba(0,0,0,0.78) 100%)';
const hiRes = (url) => (url ? url.replace(/([?&])w=\d+/, '$1w=2000') : url);

export default function DestinationDetails() {
  const { slug } = useParams();
  const d = getDestination(slug);

  useEffect(() => {
    document.title = d ? `${d.name} · Explore · TravelGenie` : 'Destination not found · TravelGenie';
  }, [d]);

  if (!d) return <UnknownDestination slug={slug} />;

  const localStays = stays.filter((s) => s.destinationSlug === d.slug);
  const related = relatedDestinations(d, destinations, 3);
  const days = d.idealDays;

  return (
    <article className="pb-24">
      <Hero d={d} />

      {/* Facts */}
      <section aria-label="At a glance" className="container-x mt-10 md:mt-14">
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 pb-10 md:pb-14 hairline-b">
          <Fact icon={CalendarDays} label="Best time to go" value={d.bestTime} />
          <Fact icon={Clock} label="Ideal trip" value={pluralize(days, 'day')} />
          <Fact
            icon={IndianRupee}
            label="From, per person"
            value={formatINR(d.startingPrice)}
            note={`${days} days, moderate budget, excl. travel there`}
          />
          <Fact
            icon={Compass}
            label="Good for"
            value={d.tags.slice(0, 3).map((t) => labelOf(INTERESTS, t)).join(', ')}
          />
        </dl>
      </section>

      {/* About + plan card */}
      <section className="container-x mt-12 md:mt-16 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16 items-start">
        <Reveal>
          <h2 className="t-title-1">About {d.name}</h2>
          <p className="mt-5 text-[19px] md:text-[21px] leading-[1.45] tracking-[-0.015em] t-secondary max-w-[640px]">
            {d.description}
          </p>
          <ul className="flex flex-wrap gap-2 mt-7" aria-label="Interests">
            {d.tags.map((t) => (
              <li key={t}>
                <Link to={`/explore?interests=${t}`} className="chip">{labelOf(INTERESTS, t)}</Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.08} className="lg:sticky lg:top-[calc(var(--nav-height)+24px)]">
          <div className="card p-6 md:p-7 rounded-[24px]">
            <span className="w-11 h-11 rounded-[14px] flex items-center justify-center" style={{ background: 'var(--accent-soft)', color: 'var(--accent-text)' }}>
              <Sparkles size={22} strokeWidth={1.9} aria-hidden />
            </span>
            <h2 className="t-title-2 mt-4">Plan a trip to {d.name}</h2>
            <p className="t-callout t-secondary mt-2">
              Tell us your dates, budget and pace. Gemini builds a day-by-day plan with real places, stays and costs.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Button to={planLink(d.name)} size="lg" iconRight={ArrowRight} className="w-full !whitespace-normal text-center py-3">Plan a trip to {d.name}</Button>
              <Button to={planLink(d.name, { days })} variant="secondary" className="w-full">Plan a {days}-day trip</Button>
            </div>
            <p className="t-footnote t-tertiary mt-4 text-center">Free. No account. Nothing is booked.</p>
          </div>
        </Reveal>
      </section>

      {/* Highlights */}
      <section aria-labelledby="highlights-title" className="container-x mt-20 md:mt-28">
        <Reveal>
          <h2 id="highlights-title" className="t-title-1">Highlights</h2>
          <p className="t-body t-secondary mt-2">Three things not to miss.</p>
        </Reveal>
        <ol className="mt-8 md:mt-10 grid gap-4 md:grid-cols-3">
          {d.highlights.map((h, i) => (
            <Reveal as="li" key={h.name} delay={i * 0.06} className="card-inset rounded-[20px] p-6 md:p-7 flex flex-col">
              <span className="t-title-2 tabular" style={{ color: 'var(--text-3)' }} aria-hidden>{String(i + 1).padStart(2, '0')}</span>
              <h3 className="t-title-3 mt-6">{h.name}</h3>
              <p className="t-callout t-secondary mt-2 flex-1">{h.description}</p>
              <a
                href={mapsUrl(`${h.name}, ${d.name}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="link t-subhead mt-5 self-start min-h-[44px] -mb-3 items-center"
                aria-label={`${h.name} on Google Maps (opens in a new tab)`}
              >
                <MapPin size={14} strokeWidth={2} aria-hidden className="mr-1" />
                View on Maps
              </a>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Stays */}
      {localStays.length > 0 && (
        <section aria-labelledby="stays-title" className="container-x mt-20 md:mt-28">
          <Reveal className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="stays-title" className="t-title-1">Where to stay</h2>
              <p className="t-body t-secondary mt-2">A memorable place to spend the night in {d.name}.</p>
            </div>
            <ChevronLink to="/stays" className="t-callout shrink-0">All stays</ChevronLink>
          </Reveal>
          <ul className="mt-8 md:mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {localStays.map((s) => (
              <li key={s.id}><StayCard stay={s} /></li>
            ))}
          </ul>
          <p className="t-footnote t-tertiary mt-4">Indicative prices. Your trip plan suggests stays for your own budget.</p>
        </section>
      )}

      {/* More like this */}
      {related.length > 0 && (
        <section aria-labelledby="related-title" className="container-x mt-20 md:mt-28">
          <Reveal className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 id="related-title" className="t-title-1">More like this</h2>
            <ChevronLink to="/explore" className="t-callout shrink-0">All destinations</ChevronLink>
          </Reveal>
          <ul className="mt-8 md:mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <Reveal as="li" key={r.slug} delay={i * 0.06} className={i === 2 ? 'sm:hidden lg:block' : undefined}>
                <DestinationCard destination={r} size="sm" />
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function Hero({ d }) {
  const reduce = useReducedMotion();
  return (
    <header className="pt-[var(--nav-height)]">
      <div className="mx-auto max-w-[1440px] px-3 md:px-4 pt-3">
        <div className="relative isolate overflow-hidden rounded-[28px] h-[min(78vh,760px)] min-h-[460px]">
          <motion.div
            className="absolute inset-0 -z-10"
            initial={reduce ? false : { scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: easeOut }}
          >
            <SmartImage src={hiRes(d.image)} alt={`${d.name}, ${regionLabel(d)}`} loading="eager" className="w-full h-full" />
          </motion.div>
          <div className="absolute inset-0 -z-10" style={{ background: SCRIM }} aria-hidden />

          <Link
            to="/explore"
            className="badge badge-on-image absolute top-4 left-4 md:top-6 md:left-6 !text-[14px] !font-medium !px-3.5 min-h-[36px] !gap-1"
          >
            <ChevronLeft size={16} strokeWidth={2.25} aria-hidden className="-ml-1" />
            Explore
          </Link>

          <motion.div
            className="absolute inset-x-0 bottom-0 px-6 pb-8 md:px-12 md:pb-14"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
          >
            <p className="t-headline" style={{ color: 'rgba(255,255,255,0.85)' }}>{regionLabel(d)}</p>
            <h1 className="t-hero mt-1" style={{ color: '#fff' }}>{d.name}</h1>
            <p className="mt-3 text-[19px] md:text-[24px] leading-[1.3] tracking-[-0.015em] max-w-[620px]" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {d.tagline}
            </p>
          </motion.div>
        </div>
      </div>
    </header>
  );
}

function Fact({ icon: Icon, label, value, note }) {
  return (
    <div className="min-w-0">
      <dt className="t-footnote t-secondary flex items-center gap-1.5">
        <Icon size={15} strokeWidth={2} aria-hidden />
        {label}
      </dt>
      <dd className="t-title-3 mt-2 tabular">{value}</dd>
      {note && <dd className="t-footnote t-tertiary mt-1">{note}</dd>}
    </div>
  );
}

function UnknownDestination({ slug }) {
  const guess = String(slug || '').replace(/[-_]+/g, ' ').trim();
  const name = guess ? guess.replace(/\b\w/g, (c) => c.toUpperCase()) : '';
  return (
    <div className="page-top pb-24 container-x min-h-[70vh] flex items-center justify-center">
      <EmptyState
        icon={MapPin}
        title="We don’t have a guide for this place"
        message={name
          ? `There’s no curated page for “${name}” — but you can still plan a trip there.`
          : 'This destination doesn’t exist, or the link is out of date.'}
        action={
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button to="/explore" variant="secondary">Back to Explore</Button>
            {name && <Button to={planLink(name)} icon={Sparkles} className="!whitespace-normal max-w-full text-center py-2.5">Plan a trip to {name}</Button>}
          </div>
        }
      />
    </div>
  );
}
