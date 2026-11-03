import { useId } from 'react';
import { CircleAlert } from 'lucide-react';
import { Chip, SegmentedControl } from '../ui';
import {
  BUDGETS, BUDGET_BASES, BUDGET_PRIORITIES, BUDGET_TIERS, CUSTOM_BUDGET_LIMITS,
  computeBudget, labelOf,
} from '../../lib/planner';
import { formatINR, formatINRCompact, pluralize } from '../../lib/format';
import { cx } from '../../lib/ui';

const BASIS_OPTIONS = BUDGET_BASES.map(({ id, label }) => ({ id, label }));
const SLIDER_STEPS = 200;

const roundTo = (n, step) => Math.round(n / step) * step;
const niceAmount = (n) => Math.max(CUSTOM_BUDGET_LIMITS.min, roundTo(n, n >= 100000 ? 5000 : n >= 10000 ? 500 : 100));

/**
 * Budget picker: a card per tier with its price for this trip, plus "My budget"
 * for a figure of the traveller's own. The custom amount lives on the request
 * as entered, so a per-person figure keeps up with the traveler count.
 */
export default function BudgetField({ request, onChange, error, compact = false }) {
  const uid = useId();
  const isCustom = request.custom_budget != null;
  const travelers = Math.max(1, Number(request.travelers) || 1);
  const tierTotal = (id) => computeBudget({ ...request, budget: id, custom_budget: null }).total;

  const selectTier = (id) => onChange({ budget: id, custom_budget: null });
  const selectCustom = () => {
    if (isCustom) return;
    onChange({ custom_budget: niceAmount(tierTotal(request.budget)), custom_budget_basis: 'total' });
  };

  return (
    <div>
      <div role="radiogroup" aria-label="Budget" className={cx('grid gap-2 grid-cols-2', compact ? 'min-[480px]:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-5')}>
        {Object.keys(BUDGET_TIERS).map((id) => (
          <OptionCard
            key={id}
            selected={!isCustom && request.budget === id}
            onSelect={() => selectTier(id)}
            title={labelOf(BUDGETS, id)}
            detail={`≈ ${formatINRCompact(tierTotal(id))}`}
          />
        ))}
        <OptionCard selected={isCustom} onSelect={selectCustom} title="My budget" detail="Set your own" accent className={cx('col-span-2', compact ? 'min-[480px]:col-span-2' : 'sm:col-span-1')} />
      </div>

      {isCustom ? (
        <CustomPanel uid={uid} request={request} onChange={onChange} error={error} travelers={travelers} tierTotal={tierTotal} />
      ) : (
        <p className="t-footnote t-secondary mt-2.5">{BUDGETS.find((b) => b.id === request.budget)?.description}</p>
      )}
    </div>
  );
}

function OptionCard({ selected, onSelect, title, detail, accent, className }) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className={cx('option-card', className)}>
      <span className="t-subhead font-semibold block">{title}</span>
      <span className={cx('t-footnote block tabular mt-0.5', !selected && !accent && 't-secondary')} style={!selected && accent ? { color: 'var(--accent-text)' } : undefined}>{detail}</span>
    </button>
  );
}

function CustomPanel({ uid, request, onChange, error, travelers, tierTotal }) {
  const perPerson = request.custom_budget_basis === 'per_person';
  const divisor = perPerson ? travelers : 1;
  const amount = request.custom_budget || 0;
  const hours = request.plan_mode === 'hours';

  // A log scale gives equal room to ₹10,000 trips and ₹10,00,000 trips.
  const low = Math.max(CUSTOM_BUDGET_LIMITS.min, niceAmount((tierTotal('budget') * 0.4) / divisor));
  const high = Math.max(low * 2, niceAmount((tierTotal('ultra') * 1.2) / divisor));
  const toPosition = (v) => Math.round((Math.log(Math.min(high, Math.max(low, v)) / low) / Math.log(high / low)) * SLIDER_STEPS);
  const fromPosition = (p) => niceAmount(low * (high / low) ** (p / SLIDER_STEPS));

  const setBasis = (id) => {
    if (id === request.custom_budget_basis) return;
    const next = id === 'per_person' ? amount / travelers : amount * travelers;
    onChange({ custom_budget_basis: id, custom_budget: niceAmount(next) });
  };

  const b = computeBudget(request);
  const valid = !error && amount > 0;
  const roomNights = b.rooms * b.nights;
  const priorities = hours ? BUDGET_PRIORITIES.filter((p) => p.id !== 'stay') : BUDGET_PRIORITIES;
  const priority = priorities.some((p) => p.id === request.budget_priority) ? request.budget_priority : 'balanced';

  return (
    <div className="card-inset mt-3 p-4 md:p-5 space-y-5">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <div className="flex-1 min-w-[170px]">
          <label htmlFor={`${uid}amount`} className="field-label">Your budget</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 t-title-3 t-secondary pointer-events-none" aria-hidden>₹</span>
            <input
              id={`${uid}amount`}
              className="input !pl-9 t-title-3 tabular"
              style={{ background: 'var(--surface)' }}
              inputMode="numeric"
              autoComplete="off"
              aria-invalid={error ? true : undefined}
              value={amount ? amount.toLocaleString('en-IN') : ''}
              placeholder="25,000"
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                onChange({ custom_budget: digits ? parseInt(digits, 10) : 0 });
              }}
            />
          </div>
        </div>
        <div className="w-full sm:w-auto sm:min-w-[210px]">
          <SegmentedControl label="Budget is for" size="sm" options={BASIS_OPTIONS} value={request.custom_budget_basis} onChange={setBasis} />
        </div>
      </div>

      <input
        type="range"
        className="range-input"
        aria-label="Adjust your budget"
        aria-valuetext={formatINR(amount)}
        min={0}
        max={SLIDER_STEPS}
        value={toPosition(amount)}
        onChange={(e) => onChange({ custom_budget: fromPosition(Number(e.target.value)) })}
      />

      {error ? (
        <p role="alert" className="t-footnote" style={{ color: 'var(--red-text)' }}>{error}</p>
      ) : valid && (
        <div aria-live="polite">
          <p className="t-subhead">
            {perPerson && travelers > 1 && <><span className="font-semibold tabular">{formatINR(b.total)}</span> for the group. </>}
            Buys about a <span className="font-semibold">{labelOf(BUDGETS, b.style).toLowerCase()}</span> trip.
          </p>
          <ul className="mt-2 t-footnote t-secondary space-y-0.5 tabular">
            {roomNights > 0 && <li>{formatINR(b.allocation.stay / roomNights)} a night for {pluralize(b.rooms, 'room')}</li>}
            <li>{formatINR(b.allocation.activities / (hours ? travelers : travelers * request.duration))} {hours ? 'each' : 'a day each'} for food and activities</li>
            <li>{formatINR(b.allocation.transport)} for {request.origin?.trim() && !hours ? 'getting there and back' : 'getting around'}</li>
          </ul>
          {b.tight && (
            <p className="mt-3 flex items-start gap-2 t-footnote" style={{ color: 'var(--orange-text)' }}>
              <CircleAlert size={15} strokeWidth={2} className="mt-px shrink-0" aria-hidden />
              This is tight for this trip. We’ll favour free sights, street food and simple stays, and tell you what it leaves out.
            </p>
          )}
        </div>
      )}

      <div>
        <p className="field-label" id={`${uid}priority`}>What matters most?</p>
        <div role="group" aria-labelledby={`${uid}priority`} className="flex flex-wrap gap-2">
          {priorities.map((p) => (
            <Chip key={p.id} selected={priority === p.id} onClick={() => onChange({ budget_priority: p.id })}>{p.label}</Chip>
          ))}
        </div>
        <p className="t-footnote t-secondary mt-2">{priorities.find((p) => p.id === priority)?.description}</p>
      </div>
    </div>
  );
}

