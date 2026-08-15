import React from 'react';
import { motion } from 'framer-motion';
import { stays } from '../data/mockData';
import { MapPin, Star } from 'lucide-react';

const Stays = () => {
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--accent)' }}>
            Accommodation
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-3" style={{ color: 'var(--text)' }}>
            Find Your Perfect Stay
          </h1>
          <p className="max-w-lg mx-auto" style={{ color: 'var(--text-2)' }}>
            Handpicked hotels, resorts, and villas for comfort and style.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stays.map((stay, index) => (
            <motion.div
              key={stay.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
              className="rounded-2xl overflow-hidden group transition-colors"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={stay.image}
                  alt={stay.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--surface) 0%, transparent 50%)' }} />
                <div
                  className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1"
                  style={{ backgroundColor: 'rgba(11,13,12,0.7)', backdropFilter: 'blur(4px)', color: '#E5C07B' }}
                >
                  <Star size={11} fill="#E5C07B" /> {stay.rating}
                </div>
                <div
                  className="absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider"
                  style={{ backgroundColor: 'rgba(11,13,12,0.7)', backdropFilter: 'blur(4px)', color: 'var(--text-2)' }}
                >
                  {stay.type}
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>{stay.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
                      <MapPin size={11} /> {stay.location}
                    </div>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{stay.price}</p>
                </div>

                <div className="pt-3 mb-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-3)' }}>Amenities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stay.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md text-[11px]"
                        style={{ color: 'var(--text-3)', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{ color: 'var(--text-2)', border: '1px solid var(--border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--btn-text)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
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
