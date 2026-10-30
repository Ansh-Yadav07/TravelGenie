/**
 * Local persistence for generated trips and the last planner request.
 * Everything is wrapped in try/catch: storage can be full, disabled or
 * blocked (private mode) and the app must keep working without it.
 */

const TRIPS_KEY = 'tg:trips:v1';
const LAST_REQUEST_KEY = 'tg:last-request:v1';
const MAX_TRIPS = 20;
const EVENT = 'tg:trips-changed';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const isTrip = (t) => t && typeof t.id === 'string' && Array.isArray(t.days);

/** All saved trips, newest first. */
export function listTrips() {
  const trips = read(TRIPS_KEY, []);
  return Array.isArray(trips) ? trips.filter(isTrip) : [];
}

export function getTrip(id) {
  return listTrips().find((t) => t.id === id) || null;
}

/** Insert or replace a trip and keep the newest MAX_TRIPS. */
export function saveTrip(trip) {
  if (!isTrip(trip)) return false;
  let trips = [trip, ...listTrips().filter((t) => t.id !== trip.id)].slice(0, MAX_TRIPS);
  // If storage is full, drop the oldest trips until it fits.
  while (trips.length && !write(TRIPS_KEY, trips)) trips = trips.slice(0, -1);
  window.dispatchEvent(new Event(EVENT));
  return trips.some((t) => t.id === trip.id);
}

export function deleteTrip(id) {
  write(TRIPS_KEY, listTrips().filter((t) => t.id !== id));
  window.dispatchEvent(new Event(EVENT));
}

export function clearTrips() {
  write(TRIPS_KEY, []);
  window.dispatchEvent(new Event(EVENT));
}

/** Subscribe to trip list changes (this tab and other tabs). Returns unsubscribe. */
export function subscribeTrips(callback) {
  const onStorage = (e) => { if (!e.key || e.key === TRIPS_KEY) callback(); };
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

export function getLastRequest() {
  return read(LAST_REQUEST_KEY, null);
}

export function setLastRequest(req) {
  write(LAST_REQUEST_KEY, req);
}
