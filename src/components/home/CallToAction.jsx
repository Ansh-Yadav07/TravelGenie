import { ArrowUp } from 'lucide-react';
import { Button, ChevronLink, Reveal } from '../ui';

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
    <section className="section" style={{ background: 'var(--bg-grouped)' }} aria-labelledby="cta-title">
      <Reveal className="container-x text-center">
        <h2 id="cta-title" className="t-display mx-auto max-w-[720px]">Your next trip is a sentence away.</h2>
        <p className="t-body t-secondary mt-4 mx-auto max-w-[520px]">
          Type a destination, pick how long, and let Gemini do the rest.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Button size="lg" icon={ArrowUp} onClick={focusPlanner}>Start planning</Button>
          <ChevronLink to="/explore" className="t-callout">Browse destinations</ChevronLink>
        </div>
      </Reveal>
    </section>
  );
}
