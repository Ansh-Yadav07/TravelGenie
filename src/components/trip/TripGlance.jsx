import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, CircleCheck, CircleAlert, MapPin, Users, Wallet } from 'lucide-react';
import { formatDuration, formatINR, pluralize } from '../../lib/format';
import { cx, easeOut } from '../../lib/ui';

const PARTS = [
  { id: 'stay', label: 'Stay', color: 'var(--accent)' },
  { id: 'transport', label: 'Transport', color: 'var(--orange)' },
  { id: 'activities', label: 'Activities & food', color: 'var(--teal)' },
];

function Tile({ icon: Icon, label, value, sub }) {
  return (
    <div className="card-flat p-4 md:p-5 min-w-0">
      <p className="flex items-center gap-1.5 t-footnote t-secondary">
        <Icon size={14} strokeWidth={2} aria-hidden />
        {label}
      </p>
      <p className="t-title-2 tabular mt-1.5 truncate">{value}</p>
      {sub && <p className="t-footnote t-tertiary mt-0.5 truncate">{sub}</p>}
    </div>
  );
}

/** Stat tiles + budget breakdown. */
export default function TripGlance({ trip, onAdjust }) {
  const { budget, request } = trip;
  const est = budget.estimate;
  const perPerson = Math.round(est.total / Math.max(1, budget.travelers));
  const durationSub = trip.isHours ? 'Single outing' : budget.nights ? pluralize(budget.nights, 'night') : '';
  const over = budget.status === 'over';

  return (
    <section aria-labelledby="glance-title" className="pt-10 md:pt-14">
      <h2 id="glance-title" className="t-title-2 mb-5">At a glance</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Tile icon={Wallet} label="Estimated total" value={formatINR(est.total)} sub={`Budget ${formatINR(budget.total)}`} />
        <Tile icon={Users} label="Per person" value={formatINR(perPerson)} sub={pluralize(budget.travelers, 'traveler')} />
        <Tile icon={CalendarDays} label="Duration" value={formatDuration(request.duration, request.plan_mode)} sub={durationSub} />
        <Tile
          icon={MapPin}
          label="Stops"
          value={trip.stopCount}
          sub={trip.isHours ? 'In one outing' : `Across ${pluralize(trip.days.length, 'day')}`}
        />
      </div>

      <BudgetCard budget={budget} over={over} onAdjust={onAdjust} />
    </section>
  );
}

function BudgetCard({ budget, over, onAdjust }) {
  const reduce = useReducedMotion();
  const est = budget.estimate;
  const scale = Math.max(budget.total, est.total, 1);
  const budgetPos = Math.min(100, (budget.total / scale) * 100);
  const delta = Math.abs(budget.delta);
  const parts = PARTS.filter((p) => est[p.id] > 0 || budget.allocation[p.id] > 0);

  return (
    <div className="card p-5 md:p-6 mt-3 md:mt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="t-headline">Budget</h3>
        <p className="t-footnote t-secondary tabular">
          Estimate {formatINR(est.total)} of {formatINR(budget.total)}
        </p>
      </div>

      {/* Segmented bar */}
      <div className="relative mt-5 mb-2">
        <div
          className="flex h-3 w-full overflow-hidden rounded-full gap-[2px]"
          style={{ background: 'var(--fill)' }}
          role="img"
          aria-label={`Estimated ${formatINR(est.total)}: ${parts.map((p) => `${p.label} ${formatINR(est[p.id])}`).join(', ')}. Budget ${formatINR(budget.total)}.`}
        >
          {parts.map((p, i) => {
            const w = (Math.max(0, est[p.id]) / scale) * 100;
            if (w <= 0) return null;
            return (
              <motion.span
                key={p.id}
                className="h-full first:rounded-l-full last:rounded-r-full print:transform-none!"
                style={{ background: p.color, width: `${w}%`, transformOrigin: 'left' }}
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: easeOut }}
              />
            );
          })}
        </div>
        {/* Budget marker */}
        <div className="absolute -top-1.5 -bottom-1.5 w-[2px] rounded-full" style={{ left: `calc(${budgetPos}% - 1px)`, background: 'var(--text)' }} aria-hidden />
      </div>
      <div className="relative h-4 mb-4" aria-hidden>
        <span
          className="absolute t-caption t-secondary whitespace-nowrap"
          style={budgetPos > 80 ? { right: `${100 - budgetPos}%` } : { left: `${budgetPos}%`, transform: 'translateX(-50%)' }}
        >
          Budget
        </span>
      </div>

      {/* Legend */}
      <ul className={cx('grid grid-cols-1 gap-x-6 gap-y-3', parts.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
        {parts.map((p) => (
          <li key={p.id} className="flex items-start gap-2.5 min-w-0">
            <span className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} aria-hidden />
            <div className="min-w-0 flex-1 flex sm:block items-baseline justify-between gap-3">
              <p className="t-subhead t-secondary">{p.label}</p>
              <p className="t-headline tabular">
                {formatINR(est[p.id])}
                <span className="t-footnote t-tertiary font-normal"> / {formatINR(budget.allocation[p.id])}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div
        className={cx('mt-5 rounded-[12px] px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2')}
        style={{ background: over ? 'var(--orange-soft)' : 'var(--green-soft)' }}
      >
        {over ? (
          <CircleAlert size={18} strokeWidth={2} style={{ color: 'var(--orange-text)' }} aria-hidden />
        ) : (
          <CircleCheck size={18} strokeWidth={2} style={{ color: 'var(--green-text)' }} aria-hidden />
        )}
        <p className="t-subhead flex-1 min-w-[12rem]">
          <strong className="font-semibold tabular" style={{ color: over ? 'var(--orange-text)' : 'var(--green-text)' }}>
            {delta === 0 ? 'Right on budget' : `${formatINR(delta)} ${over ? 'over' : 'under'} budget`}
          </strong>
          <span className="t-secondary">
            {over ? ' — try a lower tier or fewer days.' : ' — room for a splurge or two.'}
          </span>
        </p>
        {over && onAdjust && (
          <button type="button" onClick={onAdjust} className="btn btn-plain btn-sm min-h-11 -my-2 -mr-2 no-print">
            Adjust plan
          </button>
        )}
      </div>
    </div>
  );
}
