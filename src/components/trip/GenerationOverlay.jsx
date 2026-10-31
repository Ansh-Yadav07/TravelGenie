import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '../ui';
import { spring } from '../../lib/ui';
import { formatDuration } from '../../lib/format';

const STAGES = [
  { id: 'overview', label: 'Understanding your trip' },
  { id: 'stays', label: 'Finding places to stay' },
  { id: 'transport', label: 'Comparing ways to get around' },
  { id: 'days', label: 'Planning each day' },
  { id: 'tips', label: 'Adding local tips' },
];
const ORDER = ['connecting', 'thinking', ...STAGES.map((s) => s.id), 'finalizing'];

/**
 * Full-screen, honest progress sheet for a running generation.
 * Pass the object returned by useTripGeneration().
 */
export default function GenerationOverlay({ generation }) {
  const { status, progress, error, request, cancel, retry } = generation;
  const open = status === 'running' || status === 'error';
  const elapsed = useElapsed(status === 'running');

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') cancel(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, cancel]);

  const stageIndex = ORDER.indexOf(progress?.stage ?? 'connecting');
  const percent = Math.max(3, Math.min(100, progress?.percent ?? 3));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-center justify-center p-5 no-print"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gen-title"
        >
          <div className="absolute inset-0 material" style={{ background: 'color-mix(in srgb, var(--bg) 70%, transparent)' }} />
          <motion.div
            className="relative w-full max-w-[440px] card p-7 md:p-8"
            style={{ boxShadow: 'var(--shadow-lg)' }}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={spring}
          >
            {status === 'error' ? (
              <div className="text-center">
                <div className="w-14 h-14 rounded-[18px] mx-auto mb-5 flex items-center justify-center" style={{ background: 'var(--red-soft)', color: 'var(--red)' }}>
                  <AlertCircle size={28} strokeWidth={2} aria-hidden />
                </div>
                <h2 id="gen-title" className="t-title-3 mb-2">We couldn't finish your plan</h2>
                <p className="t-callout t-secondary mb-7">{error?.message || 'Something went wrong. Please try again.'}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {error?.retryable !== false && <Button icon={RotateCcw} onClick={retry}>Try again</Button>}
                  <Button variant="secondary" onClick={cancel}>Close</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="relative w-12 h-12 shrink-0 rounded-[15px] flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                    <motion.span
                      animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.08, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                      className="flex"
                    >
                      <Sparkles size={22} color="#fff" strokeWidth={2} aria-hidden />
                    </motion.span>
                  </div>
                  <div className="min-w-0">
                    <h2 id="gen-title" className="t-headline truncate">
                      Planning {request?.destination || 'your trip'}
                    </h2>
                    <p className="t-footnote t-secondary">
                      {request ? `${formatDuration(request.duration, request.plan_mode)} · ${request.travelers} ${request.travelers === 1 ? 'traveler' : 'travelers'}` : ''}
                    </p>
                  </div>
                </div>

                <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--fill)' }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
                  <motion.div className="h-full rounded-full" style={{ background: 'var(--accent)' }} animate={{ width: `${percent}%` }} transition={{ type: 'spring', stiffness: 60, damping: 20 }} />
                </div>
                <div className="flex justify-between t-caption t-tertiary mb-6 tabular">
                  <span aria-live="polite">{progress?.message || 'Working…'}</span>
                  <span>{elapsed}s</span>
                </div>

                <ol className="space-y-3 mb-7">
                  {STAGES.map((s) => {
                    const idx = ORDER.indexOf(s.id);
                    const done = stageIndex > idx;
                    const active = stageIndex === idx;
                    const label = s.id === 'days' && active && progress?.day && progress?.total_days
                      ? `Planning day ${progress.day} of ${progress.total_days}`
                      : s.label;
                    return (
                      <li key={s.id} className="flex items-center gap-3 t-subhead" style={{ color: done || active ? 'var(--text)' : 'var(--text-3)' }}>
                        <span className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center" style={{ background: done ? 'var(--green)' : active ? 'var(--accent-soft)' : 'var(--fill)' }}>
                          {done ? (
                            <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden><path d="M2.5 6.2l2.3 2.3 4.7-5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          ) : active ? (
                            <motion.span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                          ) : null}
                        </span>
                        <span className={active ? 'font-medium' : undefined}>{label}</span>
                      </li>
                    );
                  })}
                </ol>

                <div className="flex items-center justify-between gap-3">
                  <p className="t-caption t-tertiary">Powered by Google Gemini</p>
                  <Button variant="secondary" size="sm" onClick={cancel}>Cancel</Button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function useElapsed(running) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return undefined;
    const start = Date.now();
    const id = window.setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => { window.clearInterval(id); setSeconds(0); };
  }, [running]);
  return seconds;
}
