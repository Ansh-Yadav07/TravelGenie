/** Pure helpers for the Explore / Stays pages (kept out of .jsx for Fast Refresh). */
import { INTERESTS } from '../../lib/planner';

/** Region line — falls back to "India" when it just repeats the name (Goa, Goa). */
export const regionLabel = (d) => (d.region && d.region !== d.name ? d.region : 'India');

/** Interests that at least one destination is tagged with, in planner order. */
export function interestsIn(destinations) {
  const used = new Set(destinations.flatMap((d) => d.tags));
  return INTERESTS.filter((i) => used.has(i.id));
}

const norm = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();

/** Case/diacritic-insensitive match on name, region and tagline. */
export function matchesQuery(d, query) {
  const q = norm(query);
  if (!q) return true;
  return [d.name, d.region, d.tagline].some((field) => norm(field).includes(q));
}

/** Parse a comma-separated URL param into a list of known ids. */
export function parseList(value, allowed) {
  const ids = String(value || '').split(',').map((s) => s.trim()).filter(Boolean);
  return [...new Set(ids)].filter((id) => allowed.includes(id));
}

/** Destinations sharing the most tags with `d` (excluding itself). */
export function relatedDestinations(d, all, limit = 3) {
  return all
    .filter((o) => o.slug !== d.slug)
    .map((o, index) => ({ o, index, score: o.tags.filter((t) => d.tags.includes(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((x) => x.o);
}

/** Plan deep link in the shared `/plan?destination=…` format. */
export function planLink(destination, extra = {}) {
  const params = new URLSearchParams({ destination });
  Object.entries(extra).forEach(([k, v]) => { if (v != null && v !== '') params.set(k, String(v)); });
  return `/plan?${params}`;
}

/** Broad setting a stay belongs to, derived from its `type`. */
export const STAY_SETTINGS = [
  { id: 'heritage', label: 'Palaces & heritage', match: /palace|heritage|haveli/i },
  { id: 'water', label: 'Beach & backwaters', match: /beach|backwater|lake|island/i },
  { id: 'mountains', label: 'Mountains', match: /mountain|hill|himalaya/i },
  { id: 'wellness', label: 'Wellness', match: /wellness|spa|retreat|ayurveda/i },
  { id: 'city', label: 'City hotels', match: /hotel/i },
];

export const settingOf = (stay) => STAY_SETTINGS.find((s) => s.match.test(stay.type))?.id ?? 'other';
