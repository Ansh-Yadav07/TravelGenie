import React from 'react';
import { motion } from 'framer-motion';
import { stays } from '../data/mockData';
import { MapPin, Star, Sparkles } from 'lucide-react';

const Stays = () => {
  return (
    <div className="pt-24 pb-16 min-h-screen mesh-bg">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold tracking-wider mb-6 uppercase">
            <Sparkles size={14} />
            Luxury Accommodation
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Find Your <span className="text-gradient">Perfect Stay</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover handpicked hotels, resorts, and villas that offer the best in comfort and style.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stays.map((stay, index) => (
            <motion.div
              key={stay.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -5 }}
              className="glass-card overflow-hidden group"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={stay.image}
                  alt={stay.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Star size={12} className="fill-amber-400" /> {stay.rating}
                </div>
                <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                  {stay.type}
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{stay.name}</h3>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                      <MapPin size={12} /> {stay.location}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-blue-400">{stay.price}</p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stay.amenities.map((amenity, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white/5 text-gray-400 text-[11px] rounded-lg border border-white/5">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full mt-5 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium text-sm hover:bg-gradient-to-r hover:from-blue-500 hover:to-violet-500 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                  Check Availability
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stays;
