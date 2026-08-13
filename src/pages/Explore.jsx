import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, MapPin, ArrowUpRight } from 'lucide-react';
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
    <div className="pt-24 pb-16 min-h-screen mesh-bg">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Explore <span className="text-gradient">Destinations</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover the most popular and hidden gems for your next adventure.
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
              className="w-full px-5 py-3.5 pl-12 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-sm"
            />
            <Search className="absolute left-4 top-4 text-gray-500 w-4 h-4" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dest, index) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="glass-card overflow-hidden group hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Star size={12} className="fill-amber-400" /> {dest.rating}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-white">{dest.name}</h3>
                  <span className="text-sm font-bold text-emerald-400">{dest.price}</span>
                </div>
                <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">{dest.description}</p>
                <Link
                  to={`/explore/${dest.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-medium hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300"
                >
                  View Details <ArrowUpRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No destinations found for "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
