import { Link } from 'react-router-dom';
import { ChevronLink, Reveal, SectionHeader, SmartImage } from '../ui';
import { destinations } from '../../data/destinations';
import { formatINR } from '../../lib/format';
import { cx } from '../../lib/ui';

const FEATURED = destinations.slice(0, 5);

export default function FeaturedDestinations() {
  return (
    <section className="section" aria-labelledby="featured-title">
      <div className="container-x">
        <SectionHeader
          eyebrow="Destinations"
          title={<span id="featured-title">Where will you go next?</span>}
          subtitle="Places worth the trip. Open one for highlights and the best time to go, or plan it in a tap."
          action={<ChevronLink to="/explore" className="t-callout shrink-0">Explore all destinations</ChevronLink>}
        />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[290px]">
          {FEATURED.map((d, i) => {
            const big = i === 0;
            return (
              <Reveal as="li" key={d.slug} delay={(i % 3) * 0.06} className={cx(big && 'sm:col-span-2 lg:row-span-2')}>
                <Link
                  to={`/explore/${d.slug}`}
                  className={cx('group card-interactive relative block overflow-hidden rounded-[22px] isolate h-full', big ? 'aspect-[4/3] sm:aspect-[2/1] lg:aspect-auto' : 'aspect-[4/3] lg:aspect-auto')}
                  style={{ boxShadow: 'var(--shadow-md)' }}
                >
                  <SmartImage
                    src={d.image}
                    alt=""
                    className="!absolute inset-0 -z-10"
                    imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                  <div
                    className="absolute inset-0 -z-10"
                    style={{ background: 'linear-gradient(180deg, rgba(20,12,5,0) 35%, rgba(20,12,5,0.82) 100%)' }}
                    aria-hidden
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 on-photo">
                    <p className="t-caption uppercase tracking-[0.08em] t-secondary">{d.region}</p>
                    <h3 className={cx('mt-1', big ? 't-display' : 't-title-2')}>{d.name}</h3>
                    {big && <p className="t-callout t-secondary mt-1.5 max-w-[420px]">{d.tagline}</p>}
                    <p className="t-footnote t-secondary tabular mt-1.5">{big && `Best ${d.bestTime} · `}From {formatINR(d.startingPrice)}/person</p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
