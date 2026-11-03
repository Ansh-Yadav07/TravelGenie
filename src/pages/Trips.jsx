import PageHero from '../components/layout/PageHero';
import { getDestination } from '../data/destinations';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { HardDrive, Luggage, Plus } from 'lucide-react';
import { Button, EmptyState } from '../components/ui';
import { useToast } from '../components/ui/Toast';
import TripCard from '../components/trip/TripCard';
import ConfirmPopover from '../components/trip/ConfirmPopover';
import { normalizeTrip } from '../components/trip/tripModel';
import { clearTrips, deleteTrip, listTrips, subscribeTrips } from '../lib/storage';
import { pluralize } from '../lib/format';
import { easeOut } from '../lib/ui';

const time = (iso) => {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const HERO_IMAGE = getDestination('hampi')?.image || '';

export default function Trips() {
  const toast = useToast();
  const reduce = useReducedMotion();
  const raw = useSyncExternalStore(subscribeTrips, () => JSON.stringify(listTrips()), () => '[]');
  const trips = useMemo(() => {
    let list = [];
    try { list = JSON.parse(raw); } catch { /* corrupt storage — show empty */ }
    return list
      .map((t, i) => ({ trip: normalizeTrip(t), i }))
      .filter((x) => x.trip)
      // Newest first; storage order breaks ties.
      .sort((a, b) => time(b.trip.created_at) - time(a.trip.created_at) || a.i - b.i)
      .map((x) => x.trip);
  }, [raw]);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Your trips · TravelGenie';
    return () => { document.title = prev; };
  }, []);

  const onDelete = (trip) => {
    deleteTrip(trip.id);
    toast('Trip deleted', { tone: 'info' });
  };

  const onClear = () => {
    clearTrips();
    toast('All trips cleared', { tone: 'info' });
  };

  return (
    <div className="pb-24 md:pb-32">
      <PageHero image={HERO_IMAGE} eyebrow="Your journal" title="Your trips" />
      <div className="container-x pt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 md:mb-10">
          <p className="t-callout t-secondary flex items-center gap-1.5">
            <HardDrive size={15} strokeWidth={2} aria-hidden className="shrink-0" />
            Saved in this browser only — they won’t sync to other devices.
          </p>
          {trips.length > 0 && (
            <div className="flex items-center gap-2">
              <ConfirmPopover
                title={trips.length === 1 ? 'Delete your saved trip?' : `Delete all ${pluralize(trips.length, 'trip')}?`}
                message="Every saved itinerary will be removed from this device. This can’t be undone."
                confirmLabel="Delete all"
                onConfirm={onClear}
                align="left"
                className="md:[&>[role=alertdialog]]:left-auto md:[&>[role=alertdialog]]:right-0"
                renderTrigger={(props) => (
                  <button type="button" {...props} className="btn btn-plain btn-sm min-h-11" style={{ color: 'var(--red-text)' }}>
                    Clear all
                  </button>
                )}
              />
              <Button to="/plan" size="sm" icon={Plus} className="min-h-11">Plan a trip</Button>
            </div>
          )}
        </div>

        {trips.length === 0 ? (
          <div className="card-flat">
            <EmptyState
              icon={Luggage}
              title="No trips yet"
              message="Plan your first trip and it will appear here, ready to revisit, share or print."
              action={<Button to="/plan">Plan a trip</Button>}
            />
          </div>
        ) : (
          <ul className="grid gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {trips.map((trip, i) => (
                <motion.li
                  key={trip.id}
                  layout={!reduce}
                  className="relative focus-within:z-20"
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.5, delay: Math.min(i, 6) * 0.04, ease: easeOut }}
                >
                  <TripCard trip={trip} onDelete={() => onDelete(trip)} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
