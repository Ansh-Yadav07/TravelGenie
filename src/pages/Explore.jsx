import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, SearchX, Sparkles } from 'lucide-react';

import { Button, EmptyState, Reveal, SegmentedControl } from '../components/ui';
import DestinationCard from '../components/explore/DestinationCard';
import { ChipFilter, SearchField } from '../components/explore/FilterBar';
import { interestsIn, matchesQuery, parseList, planLink } from '../components/explore/helpers';
import { destinations } from '../data/destinations';
import { pluralize } from '../lib/format';
import { easeOut } from '../lib/ui';

const INTEREST_OPTIONS = interestsIn(destinations);
const INTEREST_IDS = INTEREST_OPTIONS.map((i) => i.id);
const SORTS = [
  { id: 'popular', label: 'Popular' },
  { id: 'price', label: 'Price' },
];

export default function Explore() {
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const interests = useMemo(() => parseList(params.get('interests'), INTEREST_IDS), [params]);
  const sort = params.get('sort') === 'price' ? 'price' : 'popular';

  useEffect(() => { document.title = 'Explore India · TravelGenie'; }, []);

  /** Patch URL params; empty values are removed. Replace history so typing doesn't spam Back. */
  const update = (patch) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => {
        if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) next.delete(k);
        else next.set(k, Array.isArray(v) ? v.join(',') : v);
      });
      return next;
    }, { replace: true });
  };

  const toggleInterest = (id) =>
    update({ interests: interests.includes(id) ? interests.filter((i) => i !== id) : [...interests, id] });
  const clearAll = () => update({ q: '', interests: [] });

  const results = useMemo(() => {
    const list = destinations.filter(
      (d) => matchesQuery(d, query) && (interests.length === 0 || d.tags.some((t) => interests.includes(t))),
    );
    return sort === 'price' ? [...list].sort((a, b) => a.startingPrice - b.startingPrice) : list;
  }, [query, interests, sort]);

  const trimmed = query.trim();
  const filtered = Boolean(trimmed) || interests.length > 0;

  return (
    <div className="page-top pb-24">
      <header className="container-x pt-4 md:pt-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="max-w-[760px]"
        >
          <p className="t-eyebrow mb-3">Explore</p>
          <h1 className="t-display">Explore India.</h1>
          <p className="mt-4 text-[19px] md:text-[21px] leading-[1.4] tracking-[-0.015em] t-secondary">
            Hand-picked places we love, from Himalayan passes to coral islands. Open one for highlights and the best
            time to go — or plan a trip anywhere in a tap.
          </p>
        </motion.div>
      </header>

      {/* Filters */}
      <section aria-label="Filter destinations" className="container-x mt-10 md:mt-14">
        <div className="flex flex-col gap-4">
          <SearchField
            value={query}
            onChange={(v) => update({ q: v })}
            label="Search destinations"
            placeholder="Search by place, state or vibe"
            className="md:max-w-[460px]"
          />
          <ChipFilter
            label="Filter by interest"
            options={INTEREST_OPTIONS}
            selected={interests}
            onToggle={toggleInterest}
            onClear={() => update({ interests: [] })}
            allLabel="All interests"
          />
        </div>

        <div className="mt-6 pt-5 hairline-t flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <p className="t-subhead t-secondary tabular" role="status">{pluralize(results.length, 'destination')}</p>
            {filtered && results.length > 0 && (
              <button type="button" onClick={clearAll} className="link t-subhead min-h-[44px] -my-3 px-1">Clear</button>
            )}
          </div>
          <SegmentedControl
            label="Sort destinations"
            options={SORTS}
            value={sort}
            onChange={(v) => update({ sort: v === 'popular' ? '' : v })}
            size="sm"
            fullWidth={false}
          />
        </div>
      </section>

      {/* Results */}
      <section aria-label="Destinations" className="container-x mt-8">
        {results.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((d, i) => (
              <Reveal as="li" key={d.slug} delay={(i % 3) * 0.05}>
                <DestinationCard destination={d} eager={i < 3} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={SearchX}
            title={trimmed ? `No curated guide for “${trimmed}” yet` : 'No destinations match'}
            message={
              trimmed
                ? 'That’s fine — TravelGenie can plan a trip to any city, town or region in India, not just these.'
                : 'Try fewer interests, or clear the filters to see everything.'
            }
            action={
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {trimmed && (
                  <Button to={planLink(trimmed)} icon={Sparkles} className="!whitespace-normal max-w-full text-center py-2.5">Plan a trip to “{trimmed}”</Button>
                )}
                <Button variant="secondary" onClick={clearAll}>Clear filters</Button>
              </div>
            }
          />
        )}
      </section>

      {/* Anywhere banner */}
      {results.length > 0 && (
        <section className="container-x mt-16 md:mt-24">
          <Reveal>
            <div className="card-inset rounded-[24px] px-6 py-8 md:px-12 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-[560px]">
                <h2 className="t-title-2">Somewhere else in mind?</h2>
                <p className="t-body t-secondary mt-2">
                  These are just starting points. Type any destination into the planner and Gemini will build the trip
                  around it.
                </p>
              </div>
              <Button
                to={trimmed ? planLink(trimmed) : '/plan'}
                size="lg"
                iconRight={ArrowRight}
                className="self-start md:self-auto max-w-full"
              >
                <span className="truncate">{trimmed ? `Plan a trip to “${trimmed}”` : 'Plan any trip'}</span>
              </Button>
            </div>
          </Reveal>
        </section>
      )}
    </div>
  );
}
