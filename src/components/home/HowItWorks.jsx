import { Reveal, SectionHeader } from '../ui';

const STEPS = [
  {
    title: 'Tell us the basics',
    body: 'Where, how long and who’s coming. Add a budget, vibe and interests if you like — or don’t.',
  },
  {
    title: 'Gemini plans it',
    body: 'Watch the stays, transport and each day come together. Cancel any time.',
  },
  {
    title: 'Go',
    body: 'Open every stop in Google Maps, compare stays and keep the plan on your device.',
  },
];

export default function HowItWorks() {
  return (
    <section className="section" aria-labelledby="how-title">
      <div className="container-x">
        <SectionHeader eyebrow="How it works" title={<span id="how-title">Three steps to a full itinerary.</span>} />
        <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.08} className="hairline-t pt-6">
              <span className="t-title-1 tabular t-tertiary" aria-hidden>{i + 1}</span>
              <h3 className="t-title-3 mt-3">
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
