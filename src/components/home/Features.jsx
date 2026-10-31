import { BedDouble, CalendarDays, Lock, MapPin, SlidersHorizontal, Wallet } from 'lucide-react';
import { Reveal, SectionHeader } from '../ui';
import { features } from '../../data/features';
import { MOODS, computeBudget } from '../../lib/planner';
import { formatINR } from '../../lib/format';
import { cx } from '../../lib/ui';
import { BudgetBar } from './BudgetPreview';
import { describeBudget } from './budget';
import { withIcons } from './icons';

const MOOD_OPTIONS = withIcons(MOODS);

const ICONS = { BedDouble, CalendarDays, Lock, MapPin, SlidersHorizontal, Wallet };

export default function Features() {
  return (
    <section className="section surface-grouped" aria-labelledby="features-title">
      <div className="container-x">
        <SectionHeader
          eyebrow="Why TravelGenie"
          title={<span id="features-title">A plan you can actually use.</span>}
          subtitle="Generic lists are easy. TravelGenie plans around your dates, your people and your money — and shows its working."
        />
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = ICONS[f.icon] || MapPin;
            const span = f.layout === 'wide' ? 'md:col-span-2' : f.layout === 'wide-lg' ? 'lg:col-span-2' : '';
            return (
              <Reveal
                as="li"
                key={f.id}
                delay={(i % 3) * 0.05}
                className={cx('card p-7 md:p-8 rounded-[24px] flex flex-col', span)}
              >
                <span className="w-11 h-11 rounded-[13px] flex items-center justify-center" style={{ background: 'var(--accent-soft)', color: 'var(--accent-text)' }}>
                  <Icon size={22} strokeWidth={1.9} aria-hidden />
                </span>
                <h3 className="t-title-3 mt-5">{f.title}</h3>
                <p className="t-callout t-secondary mt-2">{f.description}</p>
                {f.visual === 'itinerary' && <ItineraryVisual />}
                {f.visual === 'budget' && <BudgetVisual />}
                {f.visual === 'vibe' && <VibeVisual />}
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* Small illustrations. They are labelled as examples — not real data. */

const SAMPLE_STOPS = [
  { time: '9:00 AM', title: 'Breakfast at Artjuna', area: 'Anjuna' },
  { time: '11:30 AM', title: 'Chapora Fort', area: 'Vagator' },
  { time: '5:45 PM', title: 'Sunset at Ashwem Beach', area: 'Mandrem' },
];

function ItineraryVisual() {
  return (
    <div className="mt-6 card-inset p-4 md:p-5" aria-label="Example: a day in Goa" role="img">
      <p className="t-caption t-tertiary mb-3">Example · Day 1 in Goa</p>
      <ol className="space-y-3" aria-hidden>
        {SAMPLE_STOPS.map((s) => (
          <li key={s.title} className="flex items-center gap-3">
            <span className="w-[68px] shrink-0 t-footnote t-secondary tabular">{s.time}</span>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
            <span className="min-w-0 flex-1 t-subhead truncate">
              <span className="font-medium">{s.title}</span>
              <span className="t-tertiary"> · {s.area}</span>
            </span>
            <MapPin size={15} strokeWidth={2} className="shrink-0" style={{ color: 'var(--accent-text)' }} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function VibeVisual() {
  return (
    <div className="mt-auto pt-6 hidden lg:block" aria-hidden>
      <div className="flex flex-wrap gap-2">
        {MOOD_OPTIONS.map((m) => (
          <span key={m.id} className="chip pointer-events-none" aria-pressed={m.id === 'cultural'}>
            {m.icon && <m.icon size={15} strokeWidth={2} />}
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const SAMPLE_REQUEST = { budget: 'moderate', plan_mode: 'days', duration: 4, travelers: 2, origin: 'Delhi' };

function BudgetVisual() {
  const b = describeBudget(SAMPLE_REQUEST);
  const { total } = computeBudget(SAMPLE_REQUEST);
  return (
    <div className="mt-6 card-inset p-4 md:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="t-caption t-tertiary">Example · 4 days, 2 people from Delhi, moderate</p>
        <p className="t-headline tabular">{formatINR(total)}</p>
      </div>
      <BudgetBar parts={b.parts} total={total} className="mt-3" />
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 t-caption t-secondary">
        {b.parts.map((p) => (
          <li key={p.id} className="flex items-center gap-1.5 tabular">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} aria-hidden />
            {p.label} {formatINR(p.value)}
          </li>
        ))}
      </ul>
    </div>
  );
}
