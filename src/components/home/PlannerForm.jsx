import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Navigation, Sparkles } from 'lucide-react';

import { Button, Chip, Field, SegmentedControl, Stepper, TextInput } from '../ui';
import GenerationOverlay from '../trip/GenerationOverlay';
import useTripGeneration from '../../hooks/useTripGeneration';
import {
  BUDGETS, COMPANIONS, DEFAULT_REQUEST, INTERESTS, MAX_INTERESTS, MOODS, PACES, PLAN_MODES, TRANSPORTS,
  labelOf, modeFor, normalizeRequest, validateRequest,
} from '../../lib/planner';
import { getLastRequest } from '../../lib/storage';
import { formatDate, formatINR, pluralize } from '../../lib/format';
import { cx } from '../../lib/ui';
import DestinationField from './DestinationField';
import BudgetPreview from './BudgetPreview';
import { describeBudget } from './budget';
import { withIcons } from './icons';
import { useIsNarrow } from './hooks';

/* Option lists for the controls (icon names → components, or no icons where space is tight). */
const plain = (list) => list.map(({ id, label }) => ({ id, label }));
const MODE_OPTIONS = plain(PLAN_MODES);
const COMPANION_OPTIONS = plain(COMPANIONS);
const BUDGET_OPTIONS = plain(BUDGETS);
const PACE_OPTIONS = plain(PACES);
const TRANSPORT_OPTIONS = plain(TRANSPORTS);
const MOOD_OPTIONS = withIcons(MOODS);

const FIELD_ORDER = ['destination', 'origin', 'duration', 'travelers', 'start_date'];

const pad = (n) => String(n).padStart(2, '0');
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Starting values: defaults ← the user's last preferences ← explicit initial
 * request (deep link or trip being edited). The last destination and date are
 * not carried over — a fresh form should not assume the same trip.
 */
function initialState(initialRequest) {
  const last = getLastRequest() || {};
  const prefs = { ...last, destination: '', start_date: '' };
  const req = normalizeRequest({ ...DEFAULT_REQUEST, ...prefs, ...(initialRequest || {}) });
  if (req.start_date && req.start_date < todayISO()) req.start_date = '';
  return req;
}

function customizeSummary(req) {
  const parts = [`${labelOf(BUDGETS, req.budget)} budget`, labelOf(MOODS, req.mood), `${labelOf(PACES, req.pace)} pace`];
  if (req.start_date) parts.push(formatDate(req.start_date));
  if (req.interests.length) parts.push(pluralize(req.interests.length, 'interest'));
  return parts.join(' · ');
}

/**
 * The trip planner form — the heart of TravelGenie.
 * variant "hero": essentials up front, everything else behind "Customize".
 * variant "page": every option in grouped sections, with a sticky summary.
 */
export default function PlannerForm({ initialRequest, variant = 'hero', autoFocus = false, aside }) {
  const gen = useTripGeneration();
  const uid = useId();
  const ids = {
    form: `${uid}form`,
    destination: `${uid}destination`,
    origin: `${uid}origin`,
    date: `${uid}date`,
    more: `${uid}more`,
  };
  const reduce = useReducedMotion();
  const narrow = useIsNarrow();

  const [req, setReq] = useState(() => initialState(initialRequest));
  const [errors, setErrors] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [minDate] = useState(todayISO);

  const destRef = useRef(null);
  const originRef = useRef(null);
  const dateRef = useRef(null);

  const mode = modeFor(req.plan_mode);
  const running = gen.status === 'running';
  const hasOrigin = Boolean(req.origin.trim());
  const isHero = variant === 'hero';

  const update = (patch) => {
    setReq((r) => ({ ...r, ...patch }));
    if (Object.keys(patch).some((k) => errors[k])) {
      setErrors((e) => {
        const next = { ...e };
        Object.keys(patch).forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const setMode = (id) => {
    if (id === req.plan_mode) return;
    // Switching units resets the length, so "3 days" never silently becomes "3 hours".
    update({ plan_mode: id, duration: modeFor(id).default });
  };

  const setCompanions = (id) => {
    const c = COMPANIONS.find((o) => o.id === id);
    update({ companions: id, travelers: c?.travelers ?? req.travelers });
  };

  const toggleInterest = (id) => {
    const has = req.interests.includes(id);
    if (!has && req.interests.length >= MAX_INTERESTS) return;
    update({ interests: has ? req.interests.filter((x) => x !== id) : [...req.interests, id] });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (running) return;
    const errs = validateRequest(req);
    setErrors(errs);
    const first = FIELD_ORDER.find((k) => errs[k]);
    if (first) {
      const refs = { destination: destRef, origin: originRef, start_date: dateRef };
      if (first === 'start_date' && isHero && !expanded) {
        setExpanded(true);
        window.setTimeout(() => dateRef.current?.focus(), 60);
      } else {
        refs[first]?.current?.focus();
      }
      return;
    }
    gen.generate(req);
  };

  /* ── Fields ── */

  const destinationField = (
    <Field label="Where to?" htmlFor={ids.destination} error={errors.destination}>
      <DestinationField
        ref={destRef}
        id={ids.destination}
        value={req.destination}
        onChange={(v) => update({ destination: v })}
        error={errors.destination}
        autoFocus={autoFocus}
        size={isHero ? 'lg' : 'md'}
      />
    </Field>
  );

  const originField = (
    <Field
      label="From"
      optional
      htmlFor={ids.origin}
      error={errors.origin}
      hint="Add your city to get real flights, trains or buses with prices."
    >
      <TextInput
        ref={originRef}
        id={ids.origin}
        icon={Navigation}
        placeholder="Your city"
        autoComplete="address-level2"
        autoCapitalize="words"
        maxLength={80}
        enterKeyHint="go"
        value={req.origin}
        error={errors.origin}
        onChange={(e) => update({ origin: e.target.value })}
        className={isHero ? '!min-h-[56px]' : undefined}
      />
    </Field>
  );

  const durationField = (
    <Field label="How long" error={errors.duration}>
      <div className="space-y-3">
        <SegmentedControl label="Trip type" options={MODE_OPTIONS} value={req.plan_mode} onChange={setMode} />
        <Stepper
          label="Trip length"
          value={req.duration}
          min={mode.min}
          max={mode.max}
          onChange={(v) => update({ duration: v })}
          format={(v) => pluralize(v, mode.unit)}
        />
      </div>
    </Field>
  );

  const whoField = (
    <Field label="Who’s going" error={errors.travelers}>
      <div className="space-y-3">
        <SegmentedControl
          label="Who’s going"
          options={COMPANION_OPTIONS}
          value={req.companions}
          onChange={setCompanions}
          size={narrow ? 'sm' : 'md'}
        />
        <Stepper
          label="Travelers"
          value={req.travelers}
          min={1}
          max={12}
          onChange={(v) => update({ travelers: v })}
          format={(v) => pluralize(v, 'traveler')}
        />
      </div>
    </Field>
  );

  const dateField = (
    <Field
      label={req.plan_mode === 'hours' ? 'Date' : 'Start date'}
      optional
      htmlFor={ids.date}
      error={errors.start_date}
      hint="Helps account for season, weather and weekends."
    >
      <input
        ref={dateRef}
        id={ids.date}
        type="date"
        className="input"
        min={minDate}
        value={req.start_date}
        aria-invalid={errors.start_date ? true : undefined}
        onChange={(e) => update({ start_date: e.target.value })}
      />
    </Field>
  );

  const budgetField = (
    <Field label={isHero ? 'Budget' : undefined}>
      <SegmentedControl
        label="Budget"
        options={BUDGET_OPTIONS}
        value={req.budget}
        onChange={(id) => update({ budget: id })}
        size={narrow ? 'sm' : 'md'}
      />
      <p className="t-footnote t-secondary mt-2.5">{BUDGETS.find((b) => b.id === req.budget)?.description}</p>
      {isHero && <BudgetPreview request={req} className="mt-4 card-inset p-4" />}
    </Field>
  );

  const vibeField = (
    <Field label="Vibe">
      <div role="group" aria-label="Vibe" className="flex flex-wrap gap-2">
        {MOOD_OPTIONS.map((m) => (
          <Chip key={m.id} icon={m.icon} selected={req.mood === m.id} onClick={() => update({ mood: m.id })}>
            {m.label}
          </Chip>
        ))}
      </div>
    </Field>
  );

  const paceField = (
    <Field label="Pace">
      <SegmentedControl label="Pace" options={PACE_OPTIONS} value={req.pace} onChange={(id) => update({ pace: id })} />
      <p className="t-footnote t-secondary mt-2.5">{PACES.find((p) => p.id === req.pace)?.description}</p>
    </Field>
  );

  const transportField = (
    <Field
      label="Travel by"
      hint={hasOrigin
        ? `Your preferred way to get from ${req.origin.trim()} to ${req.destination.trim() || 'your destination'}.`
        : 'Add a starting city to choose how you get there.'}
    >
      <fieldset disabled={!hasOrigin} className={cx('min-w-0 transition-opacity duration-200', !hasOrigin && 'opacity-45')}>
        <legend className="sr-only">Travel by</legend>
        <SegmentedControl
          label="Travel by"
          options={TRANSPORT_OPTIONS}
          value={req.transport}
          onChange={(id) => update({ transport: id })}
        />
      </fieldset>
    </Field>
  );

  const interestCount = req.interests.length;
  const interestsField = (
    <Field
      label={(
        <span className="flex items-center justify-between gap-3">
          <span>{isHero ? 'Interests' : 'What do you love?'}</span>
          <span className="font-normal t-tertiary tabular" aria-live="polite">{interestCount} of {MAX_INTERESTS}</span>
        </span>
      )}
      hint={interestCount >= MAX_INTERESTS ? 'That’s the maximum — deselect one to pick another.' : undefined}
    >
      <div role="group" aria-label="Interests" className="flex flex-wrap gap-2">
        {INTERESTS.map((it) => {
          const selected = req.interests.includes(it.id);
          return (
            <Chip
              key={it.id}
              selected={selected}
              disabled={!selected && interestCount >= MAX_INTERESTS}
              onClick={() => toggleInterest(it.id)}
            >
              {it.label}
            </Chip>
          );
        })}
      </div>
    </Field>
  );

  const submitButton = (
    <Button type="submit" form={ids.form} size="lg" icon={Sparkles} disabled={running} className={isHero ? 'w-full md:w-auto' : 'w-full'}>
      Plan my trip
    </Button>
  );

  /* ── Hero layout ── */

  if (isHero) {
    const b = describeBudget(req);
    return (
      <>
        <form id={ids.form} onSubmit={onSubmit} noValidate aria-label="Plan a trip">
          <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
            {destinationField}
            {originField}
          </div>
          <div className="grid gap-5 md:grid-cols-2 mt-6">
            {durationField}
            {whoField}
          </div>

          <div className="mt-7 hairline-t">
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={ids.more}
              onClick={() => setExpanded((x) => !x)}
              className="w-full flex items-center justify-between gap-4 py-4 min-h-[64px] text-left rounded-[12px]"
            >
              <span className="min-w-0">
                <span className="t-headline block">
                  Customize <span className="font-normal t-secondary hidden sm:inline">— budget, vibe, pace, interests</span>
                </span>
                <span className="t-footnote t-secondary block truncate mt-0.5">{customizeSummary(req)}</span>
              </span>
              <span
                className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-transform duration-300"
                style={{ background: 'var(--fill)', color: 'var(--text-2)', transform: expanded ? 'rotate(180deg)' : undefined, transitionTimingFunction: 'var(--ease-out)' }}
                aria-hidden
              >
                <ChevronDown size={18} strokeWidth={2.25} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="more"
                  id={ids.more}
                  initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden -mx-1.5 px-1.5"
                >
                  <div className="grid gap-x-5 gap-y-7 md:grid-cols-2 pt-2 pb-7">
                    <div className="md:col-span-2">{budgetField}</div>
                    {vibeField}
                    {paceField}
                    {dateField}
                    {transportField}
                    <div className="md:col-span-2">{interestsField}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hairline-t pt-6 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4">
            <p className="t-subhead t-secondary text-center md:text-left" aria-live="polite">
              Estimated <span className="font-semibold tabular" style={{ color: 'var(--text)' }}>{formatINR(b.total)}</span>
              {' '}for {pluralize(b.travelers, 'traveler')}
              <span className="hidden sm:inline"> · {labelOf(BUDGETS, req.budget)}</span>
            </p>
            {submitButton}
          </div>
        </form>
        <GenerationOverlay generation={gen} />
      </>
    );
  }

  /* ── Page layout (grouped sections + sticky summary) ── */

  return (
    <>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 lg:items-start">
        <form id={ids.form} onSubmit={onSubmit} noValidate aria-label="Plan a trip" className="space-y-10">
          <Group title="Destination" description="Type any city, region or neighbourhood in India.">
            {destinationField}
            <div className="grid gap-6 md:grid-cols-2">
              {originField}
              {dateField}
            </div>
          </Group>
          <Group title="Trip">
            <div className="grid gap-6 md:grid-cols-2">
              {durationField}
              {whoField}
            </div>
          </Group>
          <Group title="Budget" description="Sets the total Gemini plans against. Prices are for the whole group.">
            {budgetField}
          </Group>
          <Group title="Style">
            {vibeField}
            {paceField}
            {transportField}
          </Group>
          <Group title="Interests" description="Optional. Pick up to five to shape what you’ll do each day.">
            {interestsField}
          </Group>
        </form>

        <aside aria-label="Trip summary" className="mt-10 lg:mt-0 grid gap-5 items-start md:grid-cols-2 lg:grid-cols-1 lg:[@media(min-height:760px)]:sticky lg:top-[calc(var(--nav-height)+24px)]">
          <div className="card p-6">
            <p className="t-headline truncate">{req.destination.trim() || 'Your trip'}</p>
            <p className="t-footnote t-secondary mt-0.5">
              {pluralize(req.duration, mode.unit)} · {pluralize(req.travelers, 'traveler')}
              {hasOrigin ? ` · from ${req.origin.trim()}` : ''}
            </p>
            <div className="hairline-t my-5" />
            <BudgetPreview request={req} variant="full" />
            <div className="mt-6">{submitButton}</div>
          </div>
          {aside}
        </aside>
      </div>
      <GenerationOverlay generation={gen} />
    </>
  );
}

/** iOS Settings-style grouped section. */
function Group({ title, description, children }) {
  const id = useId();
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="t-title-3">{title}</h2>
      {description && <p className="t-subhead t-secondary mt-1">{description}</p>}
      <div className="card p-5 md:p-7 mt-4 space-y-7">{children}</div>
    </section>
  );
}
