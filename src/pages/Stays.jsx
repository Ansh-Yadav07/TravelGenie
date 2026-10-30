import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { BedDouble } from 'lucide-react';

import { Button, EmptyState, Reveal } from '../components/ui';
import StayCard from '../components/explore/StayCard';
import { ChipFilter } from '../components/explore/FilterBar';
import { STAY_SETTINGS, parseList, settingOf } from '../components/explore/helpers';
import { stays } from '../data/stays';
import { getDestination } from '../data/destinations';
import { pluralize } from '../lib/format';
import { easeOut } from '../lib/ui';

const SETTING_OPTIONS = STAY_SETTINGS.filter((s) => stays.some((st) => settingOf(st) === s.id));
const SETTING_IDS = SETTING_OPTIONS.map((s) => s.id);

export default function Stays() {
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const selected = useMemo(() => parseList(params.get('type'), SETTING_IDS), [params]);

  useEffect(() => { document.title = 'Stays · TravelGenie'; }, []);

  const setSelected = (ids) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    if (ids.length) next.set('type', ids.join(',')); else next.delete('type');
    return next;
  }, { replace: true });

  const toggle = (id) => setSelected(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  const results = useMemo(
    () => (selected.length ? stays.filter((s) => selected.includes(settingOf(s))) : stays),
    [selected],
  );

  return (
    <div className="page-top pb-24">
      <header className="container-x pt-4 md:pt-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="max-w-[760px]"
        >
          <p className="t-eyebrow mb-3">Stays</p>
          <h1 className="t-display">Places worth the night.</h1>
          <p className="mt-4 text-[19px] md:text-[21px] leading-[1.4] tracking-[-0.015em] t-secondary">
            A short list of India’s most memorable hotels — lake palaces, backwater resorts and Himalayan retreats.
            Every trip TravelGenie plans also suggests stays to match your budget.
          </p>
        </motion.div>
      </header>

      <section aria-label="Filter stays" className="container-x mt-10 md:mt-14">
        <ChipFilter
          label="Filter by setting"
          options={SETTING_OPTIONS}
          selected={selected}
          onToggle={toggle}
          onClear={() => setSelected([])}
          allLabel="All stays"
        />
        <p className="mt-6 pt-5 hairline-t t-subhead t-secondary tabular" role="status">{pluralize(results.length, 'stay')}</p>
      </section>

      <section aria-label="Stays" className="container-x mt-6">
        {results.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((s, i) => (
              <Reveal as="li" key={s.id} delay={(i % 3) * 0.05}>
                <StayCard stay={s} destinationName={getDestination(s.destinationSlug)?.name} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={BedDouble}
            title="No stays match"
            message="Try another setting, or see them all."
            action={<Button variant="secondary" onClick={() => setSelected([])}>Show all stays</Button>}
          />
        )}

        <p className="t-footnote t-tertiary mt-10 max-w-[720px]">
          Prices are indicative starting rates per room per night, in INR, and change with dates and availability.
          Ratings are typical guest scores. TravelGenie doesn’t take bookings — check rates with the hotel or your
          preferred booking site. Where we don’t have a photo of the property itself, the image shows its setting.
        </p>
      </section>
    </div>
  );
}
