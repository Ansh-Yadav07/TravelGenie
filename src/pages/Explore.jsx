import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, ArrowUpRight } from 'lucide-react';
import { destinations } from '../data/mockData';
import { Link } from 'react-router-dom';

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return destinations;
    return destinations.filter((d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-semibold mb-3" style={{ color: 'var(--text)' }}>
            Explore Destinations
          </h1>
          <p className="max-w-md mx-auto" style={{ color: 'var(--text-2)' }}>
            Discover popular and hidden gems for your next adventure.
          </p>
        </motion.div>

        {/* Search */}
        <div className="flex justify-center mb-12">
          <div className="relative w-full max-w-md">
            <input
              id="search-destinations"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search destination..."
              className="w-full px-4 py-3 pl-10 rounded-xl text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4" style={{ color: 'var(--text-3)' }} />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((dest, index) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              className="rounded-2xl overflow-hidden group transition-colors"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
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
                  <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>{dest.name}</h3>
                  <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{dest.price}</span>
                </div>
                <p className="text-xs leading-relaxed line-clamp-2 mb-4" style={{ color: 'var(--text-2)' }}>{dest.description}</p>
                <Link
                  to={`/explore/${dest.id}`}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{ color: 'var(--text-2)', border: '1px solid var(--border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.color = '#0B0D0C'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  View Details <ArrowUpRight size={13} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p style={{ color: 'var(--text-2)' }}>No destinations found for "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
