import { ArrowUp } from 'lucide-react';
import { Button, ChevronLink, Reveal, SmartImage } from '../ui';
import { getDestination } from '../../data/destinations';

const BACKDROP = getDestination('kerala');

/** Scroll back to the hero planner and put the cursor in "Where to?". */
function focusPlanner() {
  const section = document.getElementById('planner');
  const input = section?.querySelector('input[role="combobox"]');
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  section?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  input?.focus({ preventScroll: true });
}

export default function CallToAction() {
  return (
    <section className="section" aria-labelledby="cta-title">
      <Reveal className="container-x">
        <div className="relative isolate overflow-hidden rounded-[32px] text-center px-6 py-20 md:px-16 md:py-28" style={{ boxShadow: 'var(--shadow-lg)', background: '#1c1c1e' }}>
          <SmartImage src={BACKDROP?.image} alt="" className="!absolute inset-0 -z-10" />
          <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.72) 100%)' }} aria-hidden />
          <h2 id="cta-title" className="t-display mx-auto max-w-[720px] !text-white">Your next trip is a sentence away.</h2>
          <p className="t-body mt-4 mx-auto max-w-[520px] text-white/80">
            Type a destination, pick how long, and let Gemini do the rest.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Button size="lg" icon={ArrowUp} onClick={focusPlanner} className="!bg-white !text-[#1d1d1f] hover:!bg-white/90">Start planning</Button>
            <ChevronLink to="/explore" className="t-callout !text-white">Browse destinations</ChevronLink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
