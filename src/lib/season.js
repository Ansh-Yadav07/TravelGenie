import { findDestinationByName } from '../data/destinations';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Whether month index `m` falls inside a "Nov – Feb" style range (which may wrap the year). */
function inRange(bestTime, m) {
  const [from, to] = bestTime.split('–').map((part) => MONTHS.indexOf(part.trim().slice(0, 3)));
  if (from < 0 || to < 0) return null;
  return from <= to ? m >= from && m <= to : m >= from || m <= to;
}

/**
 * Season advice for a known destination.
 * @returns {{name:string, bestTime:string, inSeason:boolean|null}|null} inSeason is null without a date.
 */
export function seasonNote(destination, startDate) {
  const dest = destination ? findDestinationByName(destination.trim()) : null;
  if (!dest?.bestTime) return null;
  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const inSeason = start && !Number.isNaN(start.getTime()) ? inRange(dest.bestTime, start.getMonth()) : null;
  return { name: dest.name, bestTime: dest.bestTime, inSeason };
}
