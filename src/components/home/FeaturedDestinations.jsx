import { Link } from 'react-router-dom';
import { ChevronLink, Reveal, SectionHeader, SmartImage } from '../ui';
import { destinations } from '../../data/destinations';
import { formatINR } from '../../lib/format';

const FEATURED = destinations.slice(0, 6);

export default function FeaturedDestinations() {
  return (
    <section className="section" aria-labelledby="featured-title">
      <div className="container-x">
        <SectionHeader
          eyebrow="Destinations"
          title={<span id="featured-title">Where will you go next?</span>}
          subtitle="Hand-picked places to start from. Open one for highlights and the best time to go — or plan it in a tap."
          action={<ChevronLink to="/explore" className="t-callout shrink-0">Explore all destinations</ChevronLink>}
        />
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((d, i) => (
            <Reveal as="li" key={d.slug} delay={(i % 3) * 0.06}>
              <Link
                to={`/explore/${d.slug}`}
                className="group card-interactive relative block overflow-hidden rounded-[24px] aspect-[4/5] sm:aspect-[3/4] isolate"
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <SmartImage
                  src={d.image}
                  alt=""
                  className="absolute inset-0 -z-10"
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div
                  className="absolute inset-0 -z-10"
                  style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.78) 100%)' }}
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-6" style={{ color: '#fff' }}>
                  <p className="t-caption uppercase tracking-[0.06em]" style={{ color: 'rgba(255,255,255,0.78)' }}>{d.region}</p>
                  <h3 className="t-title-2 mt-1" style={{ color: '#fff' }}>{d.name}</h3>
                  <p className="t-subhead mt-1" style={{ color: 'rgba(255,255,255,0.86)' }}>{d.tagline}</p>
                  <div className="mt-4 pt-3 flex items-center justify-between gap-3 t-footnote" style={{ borderTop: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.86)' }}>
                    <span>Best {d.bestTime}</span>
                    <span className="tabular">From {formatINR(d.startingPrice)}/person</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
