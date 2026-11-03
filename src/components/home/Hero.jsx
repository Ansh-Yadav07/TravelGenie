import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MapPin, Pause, Play } from 'lucide-react';
import PlannerForm from './PlannerForm';
import { getDestination } from '../../data/destinations';
import { easeOut, photoSources } from '../../lib/ui';

const SLIDES = [
  { slug: 'udaipur', place: 'Lake Pichola, Udaipur', coords: '24.57° N, 73.68° E' },
  { slug: 'ladakh', place: 'Ladakh', coords: '34.15° N, 77.58° E' },
  { slug: 'kerala', place: 'Backwaters, Kerala', coords: '9.50° N, 76.34° E' },
  { slug: 'varanasi', place: 'Ghats of Varanasi', coords: '25.31° N, 83.01° E' },
].map((s) => ({ ...s, photo: photoSources(getDestination(s.slug)?.image || '') }));

const SLIDE_MS = 7000;

export default function Hero() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const playing = !reduce && !paused;
  const slide = SLIDES[index];

  useEffect(() => {
    if (!playing) return undefined;
    // Load the next photo ahead of time so the crossfade never shows a blank frame.
    const next = new Image();
    const { sizes, srcSet } = SLIDES[(index + 1) % SLIDES.length].photo;
    next.sizes = sizes;
    next.srcset = srcSet;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [index, playing]);

  const enter = (delay) => (reduce
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: easeOut } });

  return (
    <section className="pb-14 md:pb-16" aria-labelledby="hero-title">
      <div className="relative isolate overflow-hidden on-photo min-h-[640px] h-[88vh] max-h-[860px] flex flex-col" style={{ background: '#2a211a' }}>
        <AnimatePresence initial={false}>
          <motion.img
            key={slide.slug}
            {...slide.photo}
            alt=""
            fetchPriority={index === 0 ? 'high' : undefined}
            className="absolute inset-0 -z-20 w-full h-full object-cover push-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 1.4, ease: 'easeInOut' }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 -z-10 photo-scrim" aria-hidden />

        <div className="container-x flex-1 flex flex-col justify-center pt-[var(--nav-height)] pb-44 md:pb-52">
          <motion.p className="t-eyebrow mb-4" {...enter(0)}>AI trip planner for India</motion.p>
          <motion.h1 id="hero-title" className="t-hero" {...enter(0.05)}>
            Plan less.
            <br />
            Travel more.
          </motion.h1>
          <motion.p className="mt-5 max-w-[560px] text-[19px] md:text-[21px] leading-[1.4] tracking-[-0.015em] t-secondary" {...enter(0.12)}>
            Tell us where you’re headed and what you can spend. We’ll plan every day with real places, real stays and a
            budget that adds up.
          </motion.p>
        </div>

        <div className="absolute right-0 bottom-36 md:bottom-44 container-x !mx-0 !w-auto !max-w-none flex items-center gap-2 t-footnote t-secondary">
          <MapPin size={14} strokeWidth={2} aria-hidden />
          <span aria-live="off">
            {slide.place}
            <span className="hidden sm:inline t-tertiary tabular"> · {slide.coords}</span>
          </span>
          {!reduce && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? 'Play photo slideshow' : 'Pause photo slideshow'}
              className="ml-1 w-11 h-11 -my-3 -mr-3 flex items-center justify-center rounded-full"
            >
              {paused ? <Play size={14} strokeWidth={2} aria-hidden /> : <Pause size={14} strokeWidth={2} aria-hidden />}
            </button>
          )}
        </div>
      </div>

      <motion.div id="planner" className="relative container-x -mt-32 md:-mt-40 scroll-mt-24" {...enter(0.2)}>
        <div className="card mx-auto p-5 sm:p-7 md:p-9 rounded-[28px]" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <PlannerForm variant="hero" />
        </div>
      </motion.div>
    </section>
  );
}
