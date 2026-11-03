import { BedDouble, CalendarDays, Lock, MapPin, SlidersHorizontal, Wallet } from 'lucide-react';
import { Reveal, SmartImage } from '../ui';
import { getDestination } from '../../data/destinations';
import { features } from '../../data/features';

const ICONS = { BedDouble, CalendarDays, Lock, MapPin, SlidersHorizontal, Wallet };
const PHOTO = (getDestination('hampi')?.image || '').replace(/([?&])w=\d+/, '$1w=1400');

const SAMPLE_STOPS = [
  { time: '9:00 AM', title: 'Breakfast at Artjuna', area: 'Anjuna' },
  { time: '11:30 AM', title: 'Chapora Fort', area: 'Vagator' },
  { time: '5:45 PM', title: 'Sunset at Ashwem Beach', area: 'Mandrem' },
];

export default function Features() {
  return (
    <section className="section surface-grouped topo-band" aria-labelledby="features-title">
      <div className="container-x grid gap-12 lg:gap-16 lg:grid-cols-2 items-center">
        <Reveal className="relative pb-20 sm:pb-16">
          <SmartImage src={PHOTO} alt="Boulders and temples at Hampi" className="rounded-[24px] aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]" style={{ boxShadow: 'var(--shadow-lg)' }} />
          <SampleDay />
        </Reveal>

        <div>
          <Reveal>
            <p className="t-eyebrow mb-2">Why TravelGenie</p>
            <h2 id="features-title" className="t-display">A plan you can actually use.</h2>
          </Reveal>
          <ul className="mt-8">
            {features.map((f, i) => {
              const Icon = ICONS[f.icon] || MapPin;
              return (
                <Reveal as="li" key={f.id} delay={i * 0.04} className="flex gap-4 py-5 hairline-t">
                  <Icon size={21} strokeWidth={1.8} aria-hidden className="mt-0.5 shrink-0" style={{ color: 'var(--accent-text)' }} />
                  <div>
                    <h3 className="t-headline">{f.title}</h3>
                    <p className="t-subhead t-secondary mt-1">{f.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** An illustration, labelled as an example rather than real data. */
function SampleDay() {
  return (
    <div className="card absolute left-4 right-4 sm:left-auto sm:right-6 sm:w-[340px] bottom-0 p-5" style={{ boxShadow: 'var(--shadow-lg)' }} role="img" aria-label="Example: a day in Goa">
      <p className="t-caption t-tertiary mb-3">Example · Day 1 in Goa</p>
      <ol className="space-y-3" aria-hidden>
        {SAMPLE_STOPS.map((s) => (
          <li key={s.title} className="flex items-center gap-3">
            <span className="w-[62px] shrink-0 t-footnote t-secondary tabular">{s.time}</span>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
            <span className="min-w-0 flex-1 t-footnote truncate"><span className="font-semibold">{s.title}</span></span>
          </li>
        ))}
      </ol>
    </div>
  );
}
