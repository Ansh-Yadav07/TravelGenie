import { Reveal, SectionHeader } from '../ui';

const STEPS = [
  {
    title: 'Tell us the basics',
    body: 'Where, how long and who’s coming. Set your own budget, food and stay preferences if you like.',
  },
  {
    title: 'Watch it come together',
    body: 'Stays, transport and each day appear as they’re planned. Cancel any time.',
  },
  {
    title: 'Go',
    body: 'Follow each day’s route in Google Maps, tick off your packing list and keep the plan on your device.',
  },
];

/** Three stops on a route. */
export default function HowItWorks() {
  return (
    <section className="section" aria-labelledby="how-title">
      <div className="container-x">
        <SectionHeader eyebrow="How it works" title={<span id="how-title">Three stops to a full itinerary.</span>} />
        <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          <span className="hidden md:block absolute left-0 right-[33%] top-[19px] border-t-2 border-dashed" style={{ borderColor: 'var(--separator-strong)' }} aria-hidden />
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.08} className="relative">
              <span className="w-10 h-10 rounded-full flex items-center justify-center t-headline tabular" style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }} aria-hidden>{i + 1}</span>
              <h3 className="t-title-2 mt-4">
                <span className="sr-only">Step {i + 1}: </span>
                {s.title}
              </h3>
              <p className="t-callout t-secondary mt-2 max-w-[320px]">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
