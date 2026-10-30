import { useSyncExternalStore } from 'react';
import { listTrips, subscribeTrips } from '../../lib/storage';

/* ── Saved trips (localStorage) ────────────────────────────────────── */

// listTrips() returns a fresh array on every call, so cache the snapshot and
// only hand React a new reference when the list actually changed.
let cache = { key: null, trips: [] };
function tripsSnapshot() {
  const trips = listTrips();
  const key = trips.map((t) => `${t.id}:${t.created_at}`).join('|');
  if (key !== cache.key) cache = { key, trips };
  return cache.trips;
}
const EMPTY = [];

/** Saved trips, newest first. Re-renders when trips change in this or another tab. */
export function useSavedTrips() {
  return useSyncExternalStore(subscribeTrips, tripsSnapshot, () => EMPTY);
}

/* ── Media query ───────────────────────────────────────────────────── */

const subscribers = new Map();
function subscribeTo(query) {
  if (!subscribers.has(query)) {
    subscribers.set(query, (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    });
  }
  return subscribers.get(query);
}

/** true while the media query matches. */
export function useMediaQuery(query) {
  return useSyncExternalStore(subscribeTo(query), () => window.matchMedia(query).matches, () => false);
}

/** Phones narrower than ~420px, where 4-option segmented controls switch to the small size. */
export const useIsNarrow = () => useMediaQuery('(max-width: 419px)');

/* ── Scroll position ───────────────────────────────────────────────── */

function subscribeScroll(cb) {
  window.addEventListener('scroll', cb, { passive: true });
  return () => window.removeEventListener('scroll', cb);
}

/** true once the page has scrolled past `threshold` px. */
export function useScrolledPast(threshold = 8) {
  return useSyncExternalStore(subscribeScroll, () => window.scrollY > threshold, () => false);
}
