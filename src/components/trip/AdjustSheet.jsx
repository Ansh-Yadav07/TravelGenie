import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Heart, Landmark, Mountain, Music, Sun, X } from 'lucide-react';
import { Button, Chip, SegmentedControl, Stepper } from '../ui';
import { cx, spring } from '../../lib/ui';
import {
  BUDGETS, INTERESTS, MAX_INTERESTS, MOODS, PACES, computeBudget, modeFor, normalizeRequest,
} from '../../lib/planner';
import { formatINR, pluralize } from '../../lib/format';

const MOOD_ICONS = { Sun, Mountain, Heart, Landmark, Music };
const FIELDS = ['budget', 'mood', 'pace', 'duration', 'travelers', 'interests'];

/**
 * Modal sheet to tweak the main knobs of a trip and regenerate on demand.
 * Bottom sheet on phones, centered dialog from `sm` up. Nothing regenerates
 * until the user taps "Update plan".
 */
export default function AdjustSheet({ open, onClose, trip, onSubmit }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[140] flex items-end sm:items-center justify-center sm:p-6 no-print"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.38)' }} onClick={onClose} aria-hidden />
          <motion.div
            className="relative w-full sm:max-w-[560px]"
            initial={reduce ? { opacity: 0 } : { y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 32, opacity: 0, transition: { duration: 0.18 } }}
            transition={spring}
          >
            <SheetBody trip={trip} onClose={onClose} onSubmit={onSubmit} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SheetBody({ trip, onClose, onSubmit }) {
  const id = useId();
  const panelRef = useRef(null);
  const original = trip.request;
  const [draft, setDraft] = useState(() => pick(original));
  const mode = modeFor(original.plan_mode);

  // Focus management: focus first control, trap Tab, Escape closes, restore focus.
  useEffect(() => {
    const previous = document.activeElement;
    const panel = panelRef.current;
    const focusables = () => Array.from(panel?.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) || []).filter((el) => el.offsetParent !== null);
    panel?.querySelector('[role="radio"][aria-checked="true"]')?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [onClose]);

  const next = useMemo(() => normalizeRequest({ ...original, ...draft, companions: companionsFor(original.companions, draft.travelers) }), [original, draft]);
  const before = useMemo(() => computeBudget(original).total, [original]);
  const after = useMemo(() => computeBudget(next).total, [next]);
  const changed = FIELDS.some((f) => JSON.stringify(original[f]) !== JSON.stringify(next[f]));
  const set = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));
  const toggleInterest = (iid) => setDraft((d) => ({
    ...d,
    interests: d.interests.includes(iid) ? d.interests.filter((x) => x !== iid) : [...d.interests, iid].slice(0, MAX_INTERESTS),
  }));

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-desc`}
      className="flex flex-col max-h-[92dvh] sm:max-h-[min(88dvh,820px)] rounded-t-[var(--radius-lg)] sm:rounded-[var(--radius-lg)] overflow-hidden"
      style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-lg)' }}
    >
      {/* Grabber + header */}
      <div className="shrink-0 px-5 sm:px-7 pt-2.5 sm:pt-6 pb-4 hairline-b">
        <div className="sm:hidden mx-auto mb-3 h-[5px] w-9 rounded-full" style={{ background: 'var(--fill-3)' }} aria-hidden />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id={`${id}-title`} className="t-title-3">Adjust your trip</h2>
            <p id={`${id}-desc`} className="t-footnote t-secondary mt-1">
              Change a few details and we’ll plan {original.destination || 'it'} again. Your current plan stays saved.
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-icon w-11 min-h-11 -mr-1.5 -mt-1 shrink-0" aria-label="Close">
            <X size={18} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7 py-5 space-y-6">
        <Group label="Budget" id={`${id}-budget`} hint={BUDGETS.find((b) => b.id === draft.budget)?.description}>
          <SegmentedControl
            label="Budget"
            size="sm"
            options={BUDGETS.map((b) => ({ id: b.id, label: b.label }))}
            value={draft.budget}
            onChange={set('budget')}
          />
        </Group>

        <Group label="Vibe" id={`${id}-mood`}>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`${id}-mood`}>
            {MOODS.map((m) => (
              <Chip key={m.id} icon={MOOD_ICONS[m.icon]} selected={draft.mood === m.id} onClick={() => set('mood')(m.id)} className="min-h-[40px]">
                {m.label}
              </Chip>
            ))}
          </div>
        </Group>

        <Group label="Pace" id={`${id}-pace`} hint={PACES.find((p) => p.id === draft.pace)?.description}>
          <SegmentedControl label="Pace" size="sm" options={PACES.map((p) => ({ id: p.id, label: p.label }))} value={draft.pace} onChange={set('pace')} />
        </Group>

        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-4">
          <Group label="Duration" id={`${id}-duration`}>
            <Stepper
              label="Duration"
              value={draft.duration}
              min={mode.min}
              max={mode.max}
              onChange={set('duration')}
              format={(v) => pluralize(v, mode.unit)}
            />
          </Group>
          <Group label="Travelers" id={`${id}-travelers`}>
            <Stepper label="Travelers" value={draft.travelers} min={1} max={12} onChange={set('travelers')} format={(v) => pluralize(v, 'traveler')} />
          </Group>
        </div>

        <Group
          label="Interests"
          id={`${id}-interests`}
          hint={`${draft.interests.length} of ${MAX_INTERESTS} selected`}
        >
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`${id}-interests`}>
            {INTERESTS.map((it) => {
              const selected = draft.interests.includes(it.id);
              return (
                <Chip
                  key={it.id}
                  selected={selected}
                  disabled={!selected && draft.interests.length >= MAX_INTERESTS}
                  onClick={() => toggleInterest(it.id)}
                  className="min-h-[40px]"
                >
                  {it.label}
                </Chip>
              );
            })}
          </div>
        </Group>

        <Link to={`/plan?edit=${encodeURIComponent(trip.id)}`} className="link t-subhead font-medium inline-flex min-h-[44px] items-center">
          Edit all details (dates, cities, transport)…
        </Link>
      </div>

      {/* Footer: live budget + actions */}
      <div className="shrink-0 hairline-t px-5 sm:px-7 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-5" style={{ background: 'var(--surface)' }}>
        <div className="flex items-baseline justify-between gap-3 mb-3.5" aria-live="polite">
          <span className="t-footnote t-secondary">New budget</span>
          <span className="tabular">
            {after !== before && <span className="t-footnote t-tertiary line-through mr-2">{formatINR(before)}</span>}
            <span className="t-headline">{formatINR(after)}</span>
            <span className={cx('t-footnote ml-1.5', after > before ? '' : 't-tertiary')} style={after > before ? { color: 'var(--orange-text)' } : undefined}>
              {after === before ? 'unchanged' : `${after > before ? '+' : '−'}${formatINR(Math.abs(after - before))}`}
            </span>
          </span>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={!changed} onClick={() => onSubmit(next)}>
            Update plan
          </Button>
        </div>
      </div>
    </div>
  );
}

function Group({ label, id, hint, children }) {
  return (
    <div>
      <p id={id} className="field-label">{label}</p>
      {children}
      {hint && <p className="t-footnote t-tertiary mt-2">{hint}</p>}
    </div>
  );
}

function pick(req) {
  return {
    budget: req.budget,
    mood: req.mood,
    pace: req.pace,
    duration: req.duration,
    travelers: req.travelers,
    interests: Array.isArray(req.interests) ? req.interests : [],
  };
}

/** Keep the companions field consistent with the traveler count. */
function companionsFor(current, travelers) {
  if (travelers === 1) return 'solo';
  if (current === 'solo') return travelers === 2 ? 'couple' : 'friends';
  if (current === 'couple' && travelers > 2) return 'friends';
  return current;
}
