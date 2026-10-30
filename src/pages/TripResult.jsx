import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { MapPinOff } from 'lucide-react';
import { Button, ChevronLink, EmptyState } from '../components/ui';
import { useToast } from '../components/ui/Toast';
import GenerationOverlay from '../components/trip/GenerationOverlay';
import TripHero from '../components/trip/TripHero';
import TripToolbar from '../components/trip/TripToolbar';
import TripGlance from '../components/trip/TripGlance';
import Itinerary from '../components/trip/Itinerary';
import AdjustSheet from '../components/trip/AdjustSheet';
import { GeneratedNote, StaysPanel, TipsPanel, TransportPanel } from '../components/trip/TripSidebar';
import { normalizeTrip, tripToText } from '../components/trip/tripModel';
import useTripGeneration from '../hooks/useTripGeneration';
import { deleteTrip, getTrip, subscribeTrips } from '../lib/storage';

/** A request that can be sent again (drops a start date that is now in the past). */
function regenerable(request) {
  if (!request.start_date) return request;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(`${request.start_date}T00:00:00`);
  return Number.isNaN(start.getTime()) || start < today ? { ...request, start_date: '' } : request;
}

export default function TripResult() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const gen = useTripGeneration();

  // Snapshot as a string so useSyncExternalStore gets a stable value.
  const raw = useSyncExternalStore(subscribeTrips, () => JSON.stringify(getTrip(id)), () => 'null');
  const stored = useMemo(() => {
    try { return normalizeTrip(JSON.parse(raw)); } catch { return null; }
  }, [raw]);
  // Keep rendering the trip while we navigate away after deleting it.
  const [deleted, setDeleted] = useState(null);
  const trip = stored || deleted;

  const [adjustOpen, setAdjustOpen] = useState(false);
  const openAdjust = useCallback(() => setAdjustOpen(true), []);
  const closeAdjust = useCallback(() => setAdjustOpen(false), []);

  // One-time "ready" toast after a fresh generation; clear the flag so reloads don't repeat it.
  const freshShown = useRef(null);
  useEffect(() => {
    if (!location.state?.fresh || !stored || freshShown.current === stored.id) return;
    freshShown.current = stored.id;
    toast('Your trip is ready', { tone: 'success' });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, stored, toast, navigate]);

  useEffect(() => {
    if (!stored) return undefined;
    const prev = document.title;
    document.title = `${stored.overview.title} · TravelGenie`;
    return () => { document.title = prev; };
  }, [stored]);

  if (!trip) {
    return (
      <div className="page-top container-x min-h-[70vh] flex items-center justify-center">
        <EmptyState
          icon={MapPinOff}
          title="This trip isn’t on this device"
          message="Trips are saved in the browser you planned them in. It may have been deleted, or planned on another device."
          action={(
            <div className="flex flex-col items-center gap-4">
              <Button to="/plan">Plan a new trip</Button>
              <ChevronLink to="/trips">See your saved trips</ChevronLink>
            </div>
          )}
        />
      </div>
    );
  }

  const onRegenerate = () => gen.generate(regenerable(trip.request), { replace: false });

  const onAdjustSubmit = (request) => {
    setAdjustOpen(false);
    gen.generate(regenerable(request), { replace: false });
  };

  const onShare = async () => {
    const text = tripToText(trip);
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: trip.overview.title, text });
        return;
      } catch (e) {
        if (e?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast('Itinerary copied to clipboard', { tone: 'success' });
    } catch {
      toast('Couldn’t copy the itinerary', { tone: 'error' });
    }
  };

  const onDelete = () => {
    setDeleted(trip);
    deleteTrip(trip.id);
    navigate('/trips', { replace: true });
    toast('Trip deleted', { tone: 'info' });
  };

  return (
    <article className="pb-20 md:pb-28 print:pb-0" aria-labelledby="trip-title">
      <TripHero trip={trip} />
      <TripToolbar
        onAdjust={openAdjust}
        onRegenerate={onRegenerate}
        onShare={onShare}
        onPrint={() => window.print()}
        onDelete={onDelete}
        busy={gen.status === 'running'}
      />

      <div className="container-x">
        <TripGlance trip={trip} onAdjust={openAdjust} />

        <div className="mt-12 md:mt-16 grid gap-10 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,352px)] items-start print:block">
          <Itinerary trip={trip} />

          <aside
            aria-label="Stays, transport and tips"
            className="flex flex-col gap-4 min-w-0 lg:sticky lg:top-[calc(var(--nav-height)+16px)] lg:max-h-[calc(100dvh-var(--nav-height)-32px)] lg:overflow-y-auto lg:overscroll-contain lg:-mx-3 lg:px-3 lg:pt-1 lg:pb-3 [scrollbar-width:thin] print:static! print:max-h-none! print:overflow-visible! print:mt-10 print:gap-8"
          >
            <StaysPanel trip={trip} />
            <TransportPanel trip={trip} />
            <TipsPanel trip={trip} />
            <GeneratedNote trip={trip} />
          </aside>
        </div>
      </div>

      <AdjustSheet open={adjustOpen} onClose={closeAdjust} trip={trip} onSubmit={onAdjustSubmit} />
      <GenerationOverlay generation={gen} />
    </article>
  );
}
