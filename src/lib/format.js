const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inrCompact = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 });

/** ₹12,500 */
export function formatINR(value) {
  const n = Number(value);
  return Number.isFinite(n) ? inr.format(n) : '—';
}

/** ₹1.2L / ₹12K — for tight spaces */
export function formatINRCompact(value) {
  const n = Number(value);
  return Number.isFinite(n) ? inrCompact.format(n) : '—';
}

/** "09:30" → "9:30 AM" (locale aware). Returns input unchanged if unparseable. */
export function formatTime(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || '').trim());
  if (!m) return hhmm || '';
  const d = new Date(2000, 0, 1, Number(m[1]), Number(m[2]));
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
}

/** 95 → "1h 35m", 45 → "45 min" */
export function formatMinutes(mins) {
  const n = Math.round(Number(mins));
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n < 60) return `${n} min`;
  const h = Math.floor(n / 60);
  const m = n % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** "3 days" / "1 hour" */
export function formatDuration(duration, planMode) {
  const n = Number(duration) || 0;
  const unit = planMode === 'hours' ? 'hour' : 'day';
  return `${n} ${unit}${n === 1 ? '' : 's'}`;
}

/** "Sat, 20 Dec" — accepts YYYY-MM-DD */
export function formatDate(iso, opts = { weekday: 'short', day: 'numeric', month: 'short' }) {
  if (!iso) return '';
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', opts);
}

/** Date of trip day N (1-based) given a start date, or '' */
export function dayDate(startIso, dayNumber) {
  if (!startIso) return '';
  const d = new Date(`${startIso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + (dayNumber - 1));
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** "2 hours ago", "Yesterday", "12 Oct" */
export function formatRelative(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 172800) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
}

/** Google Maps search URL for a place */
export function mapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Google Maps directions URL from origin to destination */
export function directionsUrl(origin, destination, travelmode) {
  const params = new URLSearchParams({ api: '1', destination });
  if (origin) params.set('origin', origin);
  if (travelmode) params.set('travelmode', travelmode);
  return `https://www.google.com/maps/dir/?${params}`;
}

export function pluralize(n, word, plural = `${word}s`) {
  return `${n} ${n === 1 ? word : plural}`;
}

export function slugify(s) {
  return String(s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-');
}

/** Google Maps directions through a day's stops, in order. Null when there is no route to follow. */
export function dayRouteUrl(stops) {
  const list = stops.filter(Boolean).slice(0, 10); // Maps accepts about 8 waypoints between the ends
  if (list.length < 2) return null;
  const params = new URLSearchParams({ api: '1', origin: list[0], destination: list[list.length - 1] });
  if (list.length > 2) params.set('waypoints', list.slice(1, -1).join('|'));
  return `https://www.google.com/maps/dir/?${params}`;
}
