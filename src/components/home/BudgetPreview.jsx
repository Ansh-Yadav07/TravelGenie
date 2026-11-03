import { labelOf, BUDGETS, CUSTOM_BUDGET_ID } from '../../lib/planner';
import { describeBudget } from './budget';
import { formatINR, pluralize } from '../../lib/format';
import { cx } from '../../lib/ui';

/** Thin stacked bar: stay / transport / activities. */
export function BudgetBar({ parts, total, className }) {
  return (
    <div className={cx('flex h-2 w-full gap-[3px] rounded-full overflow-hidden', className)} aria-hidden>
      {parts.map((p) => (
        <span
          key={p.id}
          className="h-full first:rounded-l-full last:rounded-r-full transition-[width] duration-500"
          style={{ width: `${(p.value / total) * 100}%`, background: p.color, transitionTimingFunction: 'var(--ease-out)' }}
        />
      ))}
    </div>
  );
}

/**
 * Live budget estimate for a planner request.
 * variant "inline": one line + bar + legend (inside the form)
 * variant "full": big total, bar and an itemised legend (Plan page summary)
 */
export default function BudgetPreview({ request, variant = 'inline', className }) {
  const b = describeBudget(request);
  const summary = `Budget ${formatINR(b.total)} total, ${formatINR(b.perPerson)} per person`;
  const custom = b.tier === CUSTOM_BUDGET_ID;

  if (variant === 'full') {
    return (
      <div className={className}>
        <p className="t-footnote t-secondary">{custom ? 'Your budget' : `Estimated budget · ${labelOf(BUDGETS, request.budget)}`}</p>
        <p className="mt-1 flex items-baseline gap-2 flex-wrap" aria-live="polite" aria-label={summary}>
          <span className="t-title-1 tabular">{formatINR(b.total)}</span>
          {b.travelers > 1 && <span className="t-subhead t-secondary tabular">{formatINR(b.perPerson)} per person</span>}
        </p>
        <BudgetBar parts={b.parts} total={b.total} className="mt-4" />
        <dl className="mt-4 space-y-2">
          {b.parts.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 t-subhead">
              <dt className="flex items-center gap-2 t-secondary">
                <span className="w-2 h-2 rounded-full" style={{ background: p.color }} aria-hidden />
                {p.label}
              </dt>
              <dd className="tabular font-medium">{formatINR(p.value)}</dd>
            </div>
          ))}
        </dl>
        <p className="t-caption t-tertiary mt-4">
          {request.plan_mode === 'hours'
            ? `For ${pluralize(b.travelers, 'traveler')} over ${pluralize(request.duration, 'hour')}. No stay needed.`
            : `For ${pluralize(b.travelers, 'traveler')}, ${pluralize(b.nights, 'night')} in ${pluralize(b.rooms, 'room')}.`}{' '}
          {custom ? 'Gemini treats this as your limit and flags anything over it.' : 'Gemini plans within this total and flags anything over it.'}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="t-subhead" aria-live="polite">
        <span className="font-semibold tabular">≈ {formatINR(b.total)}</span>
        <span className="t-secondary"> total</span>
        {b.travelers > 1 && <span className="t-secondary tabular"> · {formatINR(b.perPerson)} per person</span>}
      </p>
      <BudgetBar parts={b.parts} total={b.total} className="mt-3" />
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 t-caption t-secondary">
        {b.parts.map((p) => (
          <li key={p.id} className="flex items-center gap-1.5 tabular">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} aria-hidden />
            {p.label} {formatINR(p.value)}
          </li>
        ))}
      </ul>
    </div>
  );
}
