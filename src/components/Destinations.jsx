import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowUpRight } from 'lucide-react';
import { destinations } from '../data/mockData';

const Destinations = () => {
  return (
    <section id="destinations" className="py-24">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--accent)' }}>
              Trending
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold" style={{ color: 'var(--text)' }}>
              Popular destinations
            </h2>
          </div>
          <Link
            to="/explore"
            className="hidden md:flex items-center gap-1.5 text-sm font-medium transition-colors group"
            style={{ color: 'var(--text-2)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-2)'}
          >
            View all
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinations.map((dest, index) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="rounded-2xl overflow-hidden group cursor-pointer transition-colors duration-200"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-2)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--surface) 0%, transparent 50%)' }} />
                <div
                  className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1"
                  style={{ backgroundColor: 'rgba(11,13,12,0.7)', backdropFilter: 'blur(4px)', color: '#E5C07B' }}
                >
                  <Star size={11} fill="#E5C07B" /> {dest.rating}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
                    {dest.name}
                  </h3>
                  <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                    {dest.price}
                  </span>
                </div>
                <p className="text-xs leading-relaxed line-clamp-2 mb-4" style={{ color: 'var(--text-2)' }}>
                  {dest.description}
                </p>
                <Link
                  to={`/explore/${dest.id}`}
                  className="block w-full text-center py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{ color: 'var(--text-2)', border: '1px solid var(--border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.color = '#0B0D0C'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/explore" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
            View All Destinations →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Destinations;
