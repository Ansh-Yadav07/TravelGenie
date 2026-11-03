import { motion, useReducedMotion } from 'framer-motion';
import { easeOut, photoSources } from '../../lib/ui';

/** Full-bleed photo header for inner pages. `image` is a destination photo URL. */
export default function PageHero({ image, eyebrow, title, subtitle, children }) {
  const reduce = useReducedMotion();
  return (
    <header className="relative isolate overflow-hidden on-photo print:hidden" style={{ background: '#2a211a' }}>
      {image && <img {...photoSources(image)} alt="" fetchPriority="high" decoding="async" className="absolute inset-0 -z-20 w-full h-full object-cover push-in" />}
      <div className="absolute inset-0 -z-10 photo-scrim" aria-hidden />
      <motion.div
        className="container-x flex flex-col justify-end min-h-[340px] md:min-h-[420px] pt-[calc(var(--nav-height)+32px)] pb-9 md:pb-12"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
      >
        {eyebrow && <p className="t-eyebrow mb-3">{eyebrow}</p>}
        <h1 className="t-display max-w-[760px]">{title}</h1>
        {subtitle && <p className="mt-3 max-w-[640px] text-[18px] md:text-[20px] leading-[1.4] tracking-[-0.012em] t-secondary">{subtitle}</p>}
        {children}
      </motion.div>
    </header>
  );
}
