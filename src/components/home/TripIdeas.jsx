import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Reveal, SectionHeader, SmartImage } from '../ui';
import { getDestination } from '../../data/destinations';
import { tripIdeas } from '../../data/tripIdeas';
import { pluralize } from '../../lib/format';

function planLink(idea, name) {
  const params = new URLSearchParams({
    destination: name,
    days: idea.days,
    travelers: idea.travelers,
    companions: idea.companions,
    mood: idea.mood,
    budget: idea.budget,
  });
  return `/plan?${params}`;
}

/** Postcards that open the planner with a whole trip already filled in. */
export default function TripIdeas() {
  return (
    <section className="section pb-0 md:pb-0" aria-labelledby="ideas-title">
      <div className="container-x">
        <SectionHeader
          eyebrow="Trip ideas"
          title={<span id="ideas-title">Start with a story.</span>}
          subtitle="Pick one and the planner fills itself in. Change anything you like before you go."
        />
      </div>
      <ul className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory rail-pad scroll-pl-[22px] md:scroll-pl-8 pb-4">
        {tripIdeas.map((idea, i) => {
          const dest = getDestination(idea.destination);
          if (!dest) return null;
          return (
            <Reveal as="li" key={idea.id} delay={i * 0.04} className="snap-start shrink-0 w-[260px] md:w-[300px]">
              <Link to={planLink(idea, dest.name)} className="group block card overflow-hidden card-interactive rounded-[20px] p-2.5 pb-4">
                <SmartImage
                  src={dest.image}
                  alt=""
                  className="rounded-[14px] aspect-[4/3]"
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="px-2 pt-3.5">
                  <p className="t-caption uppercase tracking-[0.08em] t-tertiary flex items-center justify-between gap-2">
                    {dest.name}
                    <ArrowUpRight size={16} strokeWidth={2} aria-hidden style={{ color: 'var(--accent-text)' }} />
                  </p>
                  <h3 className="t-title-2 mt-1.5 min-h-[3.8rem]">{idea.title}</h3>
                  <p className="t-footnote t-secondary mt-2">{pluralize(idea.days, 'day')} · {pluralize(idea.travelers, 'traveler')}</p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
