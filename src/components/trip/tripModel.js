/**
 * Defensive view-model for a saved Trip. Saved trips can be partial, stale
 * (older app versions) or hand-edited, so everything the UI reads goes
 * through normalizeTrip() and gets sane defaults.
 */
import {
  Motorbike, BedDouble, Bus, Camera, Car, CarTaxiFront, Flower2, Footprints, Landmark, MapPin, Mountain, Music,
  Navigation, Plane, Ship, ShoppingBag, TrainFront, TramFront, Trees, UtensilsCrossed, Route,
} from 'lucide-react';
import { CATEGORIES, computeBudget, labelOf, BUDGETS, normalizeRequest } from '../../lib/planner';
import { dayDate, formatDate, formatDuration, formatINR, formatMinutes, formatTime, pluralize } from '../../lib/format';

/* ── Icons ─────────────────────────────────────────────────────────── */
const CATEGORY_ICONS = { UtensilsCrossed, Camera, Trees, Landmark, Mountain, ShoppingBag, Music, Flower2, Navigation, BedDouble, MapPin };

export function categoryMeta(category) {
  const meta = CATEGORIES[category] || CATEGORIES.other;
  return { ...meta, Icon: CATEGORY_ICONS[meta.icon] || MapPin };
}

const MODES = {
  flight: { label: 'Flight', Icon: Plane, travelmode: null },
  train: { label: 'Train', Icon: TrainFront, travelmode: 'transit' },
  bus: { label: 'Bus', Icon: Bus, travelmode: 'transit' },
  car: { label: 'Car', Icon: Car, travelmode: 'driving' },
  cab: { label: 'Cab', Icon: CarTaxiFront, travelmode: null },
  metro: { label: 'Metro', Icon: TramFront, travelmode: null },
  scooter: { label: 'Scooter', Icon: Motorbike, travelmode: null },
  auto: { label: 'Auto', Icon: CarTaxiFront, travelmode: null },
  ferry: { label: 'Ferry', Icon: Ship, travelmode: null },
  walk: { label: 'Walk', Icon: Footprints, travelmode: null },
  other: { label: 'Other', Icon: Route, travelmode: null },
};

export const modeMeta = (mode) => MODES[mode] || MODES.other;

/* ── Normalisation ─────────────────────────────────────────────────── */
const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const str = (v, fallback = '') => (typeof v === 'string' ? v.trim() : v == null ? fallback : String(v));
const arr = (v) => (Array.isArray(v) ? v : []);
const sum = (list, pick) => list.reduce((n, x) => n + num(pick(x)), 0);

function normActivity(a) {
  const x = a && typeof a === 'object' ? a : {};
  return {
    time: str(x.time),
    title: str(x.title, 'Activity') || 'Activity',
    description: str(x.description),
    area: str(x.area),
    category: CATEGORIES[x.category] ? x.category : 'other',
    cost: Math.max(0, num(x.cost)),
    duration_minutes: Math.max(0, num(x.duration_minutes)),
    maps_query: str(x.maps_query),
  };
}

export function normalizeTrip(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const request = normalizeRequest(raw.request || {});
  const isHours = request.plan_mode === 'hours';

  const days = arr(raw.days).filter((d) => d && typeof d === 'object').map((d, i) => {
    const activities = arr(d.activities).filter((a) => a && typeof a === 'object' && a.title).map(normActivity);
    return {
      day: i + 1, // index-based: keeps keys and anchors unique even if the model repeats numbers
      title: str(d?.title),
      activities,
      total_cost: d?.total_cost != null && Number.isFinite(Number(d.total_cost)) ? num(d.total_cost) : sum(activities, (a) => a.cost),
    };
  });

  const stays = arr(raw.stays).filter((s) => s && typeof s === 'object').map((s) => ({
    name: str(s?.name, 'Stay') || 'Stay',
    type: str(s?.type),
    area: str(s?.area),
    highlight: str(s?.highlight),
    price_per_night: Math.max(0, num(s?.price_per_night)),
    total_cost: Math.max(0, num(s?.total_cost)),
    rating: s?.rating != null && Number.isFinite(Number(s.rating)) ? Math.min(5, Math.max(0, Number(s.rating))) : null,
    recommended: !!s?.recommended,
    over_budget: !!s?.over_budget,
  }));

  // Recommended first, preserving order otherwise.
  const transport = arr(raw.transport)
    .filter((t) => t && typeof t === 'object')
    .map((t) => ({
      mode: MODES[t?.mode] ? t.mode : 'other',
      title: str(t?.title, 'Option') || 'Option',
      details: str(t?.details),
      duration: str(t?.duration),
      total_cost: Math.max(0, num(t?.total_cost)),
      recommended: !!t?.recommended,
      over_budget: !!t?.over_budget,
    }))
    .sort((a, b) => Number(b.recommended) - Number(a.recommended));

  const b = raw.budget && typeof raw.budget === 'object' ? raw.budget : {};
  const computed = computeBudget(request);
  const allocation = {
    stay: num(b.allocation?.stay, computed.allocation.stay),
    transport: num(b.allocation?.transport, computed.allocation.transport),
    activities: num(b.allocation?.activities, computed.allocation.activities),
  };
  const total = num(b.total, allocation.stay + allocation.transport + allocation.activities);
  const est = {
    stay: num(b.estimate?.stay, stays.find((s) => s.recommended)?.total_cost ?? 0),
    transport: num(b.estimate?.transport, transport.find((t) => t.recommended)?.total_cost ?? 0),
    activities: num(b.estimate?.activities, sum(days.flatMap((d) => d.activities), (a) => a.cost)),
  };
  est.total = num(b.estimate?.total, est.stay + est.transport + est.activities);
  const delta = num(b.delta, total - est.total);

  const overview = raw.overview && typeof raw.overview === 'object' ? raw.overview : {};
  const scope = raw.transport_scope === 'intercity' || raw.transport_scope === 'local'
    ? raw.transport_scope
    : request.origin ? 'intercity' : 'local';

  return {
    id: str(raw.id),
    created_at: str(raw.created_at),
    request,
    isHours,
    meta: {
      model: str(raw.meta?.model),
      demo: !!raw.meta?.demo,
    },
    overview: {
      title: str(overview.title) || `${formatDuration(request.duration, request.plan_mode)} in ${request.destination || 'your destination'}`,
      summary: str(overview.summary),
      highlights: arr(overview.highlights).map((h) => str(h)).filter(Boolean).slice(0, 6),
    },
    budget: {
      tier: str(b.tier, request.budget) || request.budget,
      travelers: Math.max(1, num(b.travelers, request.travelers)),
      nights: Math.max(0, num(b.nights, computed.nights)),
      total,
      allocation,
      estimate: est,
      status: b.status === 'over' || b.status === 'within' ? b.status : est.total > total ? 'over' : 'within',
      delta,
    },
    stays,
    transport_scope: scope,
    transport,
    days,
    tips: arr(raw.tips).map((t) => str(t)).filter(Boolean),
    stopCount: days.reduce((n, d) => n + d.activities.filter((a) => a.category !== 'transit' && a.category !== 'stay').length, 0),
  };
}

/* ── Derived labels ────────────────────────────────────────────────── */
export const tierLabel = (id) => labelOf(BUDGETS, id);

/** "9:00 AM – 3:00 PM" for an hours-mode day, from its first and last activity. */
export function hourRange(activities) {
  const timed = activities.filter((a) => /^\d{1,2}:\d{2}$/.test(a.time));
  if (!timed.length) return '';
  const first = timed[0];
  const last = timed[timed.length - 1];
  const [h, m] = last.time.split(':').map(Number);
  const endMins = h * 60 + m + (last.duration_minutes || 0);
  const end = `${String(Math.floor(endMins / 60) % 24).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`;
  return `${formatTime(first.time)} – ${formatTime(end)}`;
}

export function dayLabel(trip, day) {
  const date = dayDate(trip.request.start_date, day.day);
  return { short: `Day ${day.day}`, date };
}

export function activityMapsQuery(activity, destination) {
  return activity.maps_query || [activity.title, activity.area, destination].filter(Boolean).join(', ');
}

/** Plain-text itinerary for sharing / copying. */
export function tripToText(trip) {
  const { request, overview, budget } = trip;
  const lines = [];
  lines.push(overview.title);
  const facts = [
    formatDuration(request.duration, request.plan_mode),
    request.start_date ? formatDate(request.start_date, { day: 'numeric', month: 'short', year: 'numeric' }) : '',
    pluralize(request.travelers, 'traveler'),
    `${tierLabel(budget.tier)} budget`,
  ].filter(Boolean);
  lines.push(facts.join(' · '));
  if (overview.summary) lines.push('', overview.summary);
  lines.push('', `Estimated total: ${formatINR(budget.estimate.total)} (budget ${formatINR(budget.total)})`);

  for (const day of trip.days) {
    const { short, date } = dayLabel(trip, day);
    lines.push('', trip.isHours ? `${hourRange(day.activities) || 'Itinerary'}${day.title ? ` — ${day.title}` : ''}` : `${short}${date ? ` (${date})` : ''}${day.title ? ` — ${day.title}` : ''}`);
    for (const a of day.activities) {
      const meta = [a.area, formatMinutes(a.duration_minutes), a.cost ? formatINR(a.cost) : 'Free'].filter(Boolean).join(', ');
      lines.push(`• ${a.time ? `${formatTime(a.time)} ` : ''}${a.title}${meta ? ` (${meta})` : ''}`);
    }
  }

  const stay = trip.stays.find((s) => s.recommended) || trip.stays[0];
  if (stay) lines.push('', `Stay: ${stay.name}${stay.area ? `, ${stay.area}` : ''} — ${formatINR(stay.price_per_night)}/night`);
  const t = trip.transport[0];
  if (t) lines.push(`${trip.transport_scope === 'intercity' ? 'Getting there' : 'Getting around'}: ${t.title}${t.duration ? ` (${t.duration})` : ''}`);

  if (trip.tips.length) {
    lines.push('', 'Tips');
    trip.tips.forEach((tip, i) => lines.push(`${i + 1}. ${tip}`));
  }
  lines.push('', 'Planned with TravelGenie. Prices and opening hours are estimates — please verify before booking.');
  return lines.join('\n');
}
