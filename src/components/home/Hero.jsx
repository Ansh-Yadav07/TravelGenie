import { motion, useReducedMotion } from 'framer-motion';
import PlannerForm from './PlannerForm';
import { easeOut } from '../../lib/ui';

export default function Hero() {
  const reduce = useReducedMotion();
  const enter = (delay) => (reduce
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: easeOut } });

  return (
    <section className="page-top pb-14 md:pb-16" aria-labelledby="hero-title">
      <div className="container-x text-center pt-6 md:pt-14">
        <motion.p className="t-eyebrow mb-4" {...enter(0)}>AI trip planner for India</motion.p>
        <motion.h1 id="hero-title" className="t-hero" {...enter(0.05)}>
          Plan less.
          <br />
          <span className="t-gradient">Travel more.</span>
        </motion.h1>
        <motion.p
          className="mt-6 mx-auto max-w-[640px] text-[19px] md:text-[21px] leading-[1.4] tracking-[-0.015em] t-secondary"
          {...enter(0.12)}
        >
          Tell us where you’re headed. Google Gemini plans every day with real places, real stays
          and a budget that actually adds up.
        </motion.p>
      </div>

      <motion.div id="planner" className="container-x mt-12 md:mt-16 scroll-mt-24" {...enter(0.2)}>
        <div className="card mx-auto max-w-[980px] p-5 sm:p-7 md:p-9 rounded-[28px]" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <PlannerForm variant="hero" />
        </div>
      </motion.div>
    </section>
  );
}
