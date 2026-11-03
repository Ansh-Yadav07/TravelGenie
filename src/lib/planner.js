/**
 * Planner domain model shared by the whole frontend.
 *
 * Option ids are the exact values the API accepts (see TravelGenieAI/README
 * "API contract"). Labels are UI-only. Budget math mirrors
 * TravelGenieAI/services/budget.py so the form can preview the budget the
 * server will plan against.
 */

export const PLAN_MODES = [
  { id: 'days', label: 'Multi-day', unit: 'day', units: 'days', min: 1, max: 14, default: 3 },
  { id: 'hours', label: 'A few hours', unit: 'hour', units: 'hours', min: 2, max: 12, default: 6 },
];

export const COMPANIONS = [
  { id: 'solo', label: 'Solo', icon: 'User', travelers: 1 },
  { id: 'couple', label: 'Couple', icon: 'Heart', travelers: 2 },
  { id: 'friends', label: 'Friends', icon: 'Users', travelers: 4 },
  { id: 'family', label: 'Family', icon: 'Baby', travelers: 4 },
];

export const BUDGETS = [
  { id: 'budget', label: 'Budget', description: 'Hostels, street food, public transport' },
  { id: 'moderate', label: 'Moderate', description: 'Comfortable 3★ hotels, local favourites' },
  { id: 'luxury', label: 'Luxury', description: '5★ stays, fine dining, private transfers' },
  { id: 'ultra', label: 'Ultra', description: 'Palaces, suites and once-in-a-lifetime' },
];

export const CUSTOM_BUDGET_ID = 'custom';
export const CUSTOM_BUDGET_LIMITS = { min: 500, max: 5000000 };

export const BUDGET_BASES = [
  { id: 'total', label: 'Whole trip' },
  { id: 'per_person', label: 'Per person' },
];

export const BUDGET_PRIORITIES = [
  { id: 'balanced', label: 'Balanced', description: 'An even split across the trip' },
  { id: 'stay', label: 'Stay', description: 'A nicer place to sleep comes first' },
  { id: 'experiences', label: 'Experiences', description: 'More for food and activities, a simpler stay' },
  { id: 'transport', label: 'Travel', description: 'Faster, more comfortable journeys come first' },
];

export const STAY_TYPES = [
  { id: 'any', label: 'No preference' },
  { id: 'hostel', label: 'Hostel' },
  { id: 'homestay', label: 'Homestay' },
  { id: 'hotel', label: 'Hotel' },
  { id: 'boutique', label: 'Boutique' },
  { id: 'resort', label: 'Resort' },
];

export const FOOD_PREFERENCES = [
  { id: 'any', label: 'Anything' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'jain', label: 'Jain' },
  { id: 'non_vegetarian', label: 'Non-veg lover' },
];

export const MAX_NOTES = 300;

export const MOODS = [
  { id: 'relaxing', label: 'Relaxing', icon: 'Sun' },
  { id: 'adventure', label: 'Adventure', icon: 'Mountain' },
  { id: 'romantic', label: 'Romantic', icon: 'Heart' },
  { id: 'cultural', label: 'Cultural', icon: 'Landmark' },
  { id: 'party', label: 'Party', icon: 'Music' },
];

export const PACES = [
  { id: 'relaxed', label: 'Relaxed', description: '3–4 stops a day' },
  { id: 'balanced', label: 'Balanced', description: '4–5 stops a day' },
  { id: 'packed', label: 'Packed', description: '6+ stops a day' },
];

export const TRANSPORTS = [
  { id: 'flight', label: 'Flight', icon: 'Plane' },
  { id: 'train', label: 'Train', icon: 'TrainFront' },
  { id: 'bus', label: 'Bus', icon: 'Bus' },
  { id: 'car', label: 'Car', icon: 'Car' },
];

export const INTERESTS = [
  { id: 'beaches', label: 'Beaches' },
  { id: 'mountains', label: 'Mountains' },
  { id: 'history', label: 'History' },
  { id: 'food', label: 'Food' },
  { id: 'nightlife', label: 'Nightlife' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'nature', label: 'Nature' },
  { id: 'art', label: 'Art & design' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'adventure-sports', label: 'Adventure sports' },
  { id: 'spiritual', label: 'Spiritual' },
  { id: 'wildlife', label: 'Wildlife' },
  { id: 'photography', label: 'Photography' },
  { id: 'offbeat', label: 'Offbeat' },
];

export const MAX_INTERESTS = 5;

/** Activity categories returned by the API, with display metadata. */
export const CATEGORIES = {
  food: { label: 'Food & drink', icon: 'UtensilsCrossed', color: 'var(--orange)' },
  sight: { label: 'Sightseeing', icon: 'Camera', color: 'var(--accent)' },
  nature: { label: 'Nature', icon: 'Trees', color: 'var(--green)' },
  culture: { label: 'Culture', icon: 'Landmark', color: 'var(--gold)' },
  adventure: { label: 'Adventure', icon: 'Mountain', color: 'var(--teal)' },
  shopping: { label: 'Shopping', icon: 'ShoppingBag', color: 'var(--pink)' },
  nightlife: { label: 'Nightlife', icon: 'Music', color: 'var(--pink)' },
  wellness: { label: 'Wellness', icon: 'Flower2', color: 'var(--green)' },
  transit: { label: 'Getting around', icon: 'Navigation', color: 'var(--text-3)' },
  stay: { label: 'Stay', icon: 'BedDouble', color: 'var(--text-3)' },
  other: { label: 'Activity', icon: 'MapPin', color: 'var(--text-3)' },
};

export const DEFAULT_REQUEST = {
  destination: '',
  origin: '',
  start_date: '',
  plan_mode: 'days',
  duration: 3,
  travelers: 2,
  companions: 'couple',
  budget: 'moderate',
  mood: 'relaxing',
  pace: 'balanced',
  transport: 'flight',
  interests: [],
  custom_budget: null,
  custom_budget_basis: 'total',
  budget_priority: 'balanced',
  stay_type: 'any',
  food: 'any',
  notes: '',
};

/* ── Budget model (mirror of services/budget.py) ───────────────────── */

export const BUDGET_TIERS = {
  budget: { room_per_night: 1800, daily_per_person: 1500, intercity_per_person: 3000 },
  moderate: { room_per_night: 5000, daily_per_person: 3000, intercity_per_person: 8000 },
  luxury: { room_per_night: 15000, daily_per_person: 7000, intercity_per_person: 16000 },
  ultra: { room_per_night: 40000, daily_per_person: 15000, intercity_per_person: 40000 },
};

const round100 = (n) => Math.round(n / 100) * 100;

const PRIORITY_WEIGHTS = {
  balanced: {},
  stay: { stay: 1.5 },
  experiences: { activities: 1.5 },
  transport: { transport: 1.5 },
};

const TIGHT_RATIO = 0.7;

function tierBudget(req, tierId) {
  const tier = BUDGET_TIERS[tierId] || BUDGET_TIERS.moderate;
  const travelers = clamp(Number(req.travelers) || 1, 1, 12);
  const duration = Number(req.duration) || 1;
  const hasOrigin = Boolean(req.origin && req.origin.trim());

  if (req.plan_mode === 'hours') {
    const share = Math.min(1, duration / 8);
    const activities = round100(travelers * tier.daily_per_person * share);
    const transport = round100(travelers * tier.daily_per_person * 0.25 * share);
    return { tier: tierId, style: tierId, tight: false, total: activities + transport, nights: 0, rooms: 0, allocation: { stay: 0, transport, activities } };
  }

  const nights = Math.max(1, duration - 1);
  const rooms = Math.ceil(travelers / 2);
  const stay = round100(rooms * nights * tier.room_per_night);
  const activities = round100(travelers * duration * tier.daily_per_person);
  const transport = hasOrigin
    ? round100(travelers * tier.intercity_per_person)
    : round100(travelers * duration * tier.daily_per_person * 0.25);
  return { tier: tierId, style: tierId, tight: false, total: stay + transport + activities, nights, rooms, allocation: { stay, transport, activities } };
}

/** The custom budget for the whole group, or null when a tier is used. */
export function customTotal(req) {
  const amount = Number(req.custom_budget);
  if (req.custom_budget == null || !Number.isFinite(amount) || amount <= 0) return null;
  return req.custom_budget_basis === 'per_person' ? amount * clamp(Number(req.travelers) || 1, 1, 12) : amount;
}

/**
 * Deterministic budget for a request. Returns INR totals for the whole group.
 * @returns {{tier:string, style:string, tight:boolean, total:number, nights:number, rooms:number, allocation:{stay:number, transport:number, activities:number}}}
 */
export function computeBudget(req) {
  const total = customTotal(req);
  if (total == null) return tierBudget(req, req.budget);

  // Split the traveller's own total the way the nearest tier would, then apply their priority.
  const distance = (t) => Math.abs(Math.log(total / tierBudget(req, t).total));
  const style = Object.keys(BUDGET_TIERS).reduce((best, t) => (distance(t) < distance(best) ? t : best));
  const reference = tierBudget(req, style);
  const boost = PRIORITY_WEIGHTS[req.budget_priority] || {};
  const weight = (part) => reference.allocation[part] * (boost[part] ?? 1);
  const scale = total / (weight('stay') + weight('transport') + weight('activities'));
  const stay = round100(weight('stay') * scale);
  const transport = round100(weight('transport') * scale);
  return {
    tier: CUSTOM_BUDGET_ID,
    style,
    tight: total < tierBudget(req, 'budget').total * TIGHT_RATIO,
    total,
    nights: reference.nights,
    rooms: reference.rooms,
    allocation: { stay, transport, activities: Math.max(0, total - stay - transport) },
  };
}

/* ── Validation ────────────────────────────────────────────────────── */

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function modeFor(planMode) {
  return PLAN_MODES.find((m) => m.id === planMode) || PLAN_MODES[0];
}

/**
 * Validate a request before sending. Returns a map of field -> message
 * (empty object when valid).
 */
export function validateRequest(req) {
  const errors = {};
  const dest = (req.destination || '').trim();
  if (!dest) errors.destination = 'Where would you like to go?';
  else if (dest.length > 80) errors.destination = 'Keep the destination under 80 characters.';
  if ((req.origin || '').trim().length > 80) errors.origin = 'Keep the starting city under 80 characters.';
  const mode = modeFor(req.plan_mode);
  const d = Number(req.duration);
  if (!Number.isInteger(d) || d < mode.min || d > mode.max) {
    errors.duration = `Choose ${mode.min}–${mode.max} ${mode.units}.`;
  }
  const t = Number(req.travelers);
  if (!Number.isInteger(t) || t < 1 || t > 12) errors.travelers = 'Choose 1–12 travelers.';
  if (req.start_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(`${req.start_date}T00:00:00`);
    if (Number.isNaN(start.getTime())) errors.start_date = 'Enter a valid date.';
    else if (start < today) errors.start_date = 'Pick a date from today onwards.';
  }
  if (req.custom_budget != null) {
    const { min, max } = CUSTOM_BUDGET_LIMITS;
    const amount = Number(req.custom_budget);
    if (!Number.isInteger(amount) || amount < min) errors.custom_budget = 'Enter at least ₹500.';
    else if (amount > max) errors.custom_budget = 'Enter ₹50,00,000 or less.';
  }
  if ((req.notes || '').length > MAX_NOTES) errors.notes = `Keep this under ${MAX_NOTES} characters.`;
  return errors;
}

/** Normalise a (possibly partial / stale) request into the exact API shape. */
export function normalizeRequest(input = {}) {
  const req = { ...DEFAULT_REQUEST, ...input };
  const mode = modeFor(req.plan_mode);
  const pick = (list, value, fallback) => (list.some((o) => o.id === value) ? value : fallback);
  return {
    destination: String(req.destination || '').trim(),
    origin: String(req.origin || '').trim(),
    start_date: req.start_date || '',
    plan_mode: mode.id,
    duration: clamp(parseInt(req.duration, 10) || mode.default, mode.min, mode.max),
    travelers: clamp(parseInt(req.travelers, 10) || 1, 1, 12),
    companions: pick(COMPANIONS, req.companions, DEFAULT_REQUEST.companions),
    budget: pick(BUDGETS, req.budget, DEFAULT_REQUEST.budget),
    mood: pick(MOODS, req.mood, DEFAULT_REQUEST.mood),
    pace: pick(PACES, req.pace, DEFAULT_REQUEST.pace),
    transport: pick(TRANSPORTS, req.transport, DEFAULT_REQUEST.transport),
    interests: (Array.isArray(req.interests) ? req.interests : [])
      .filter((id) => INTERESTS.some((o) => o.id === id))
      .slice(0, MAX_INTERESTS),
    custom_budget: Number.isFinite(parseInt(req.custom_budget, 10)) ? parseInt(req.custom_budget, 10) : null,
    custom_budget_basis: pick(BUDGET_BASES, req.custom_budget_basis, DEFAULT_REQUEST.custom_budget_basis),
    budget_priority: pick(BUDGET_PRIORITIES, req.budget_priority, DEFAULT_REQUEST.budget_priority),
    stay_type: pick(STAY_TYPES, req.stay_type, DEFAULT_REQUEST.stay_type),
    food: pick(FOOD_PREFERENCES, req.food, DEFAULT_REQUEST.food),
    notes: String(req.notes || '').slice(0, MAX_NOTES),
  };
}

/** Request payload for the API (empty optional strings become null). */
export function toApiPayload(req) {
  const n = normalizeRequest(req);
  return { ...n, origin: n.origin || null, start_date: n.start_date || null, notes: n.notes.trim() || null };
}

export const labelOf = (list, id) => list.find((o) => o.id === id)?.label ?? id;
