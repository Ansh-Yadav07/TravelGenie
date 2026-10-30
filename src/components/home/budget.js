import { computeBudget } from '../../lib/planner';

export const BUDGET_PARTS = [
  { id: 'stay', label: 'Stay', color: 'var(--accent)' },
  { id: 'transport', label: 'Transport', color: 'var(--indigo)' },
  { id: 'activities', label: 'Food & activities', color: 'var(--teal)' },
];

/** Budget numbers for a request, plus the labels and colours the UI needs. */
export function describeBudget(req) {
  const b = computeBudget(req);
  const travelers = Math.max(1, Number(req.travelers) || 1);
  const hasOrigin = Boolean(req.origin && req.origin.trim());
  const parts = BUDGET_PARTS
    .map((p) => ({
      ...p,
      label: p.id === 'transport' ? (hasOrigin ? 'Getting there' : 'Getting around') : p.label,
      value: b.allocation[p.id],
    }))
    .filter((p) => p.value > 0);
  return { ...b, travelers, perPerson: Math.round(b.total / travelers), parts };
}
