import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowUpRight } from 'lucide-react';
import { destinations } from '../data/mockData';

const Destinations = () => {
  return (
    <section id="destinations" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg-warm opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold tracking-wider mb-4 uppercase">
              Trending Now
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Popular <span className="text-gradient-warm">Destinations</span>
            </h2>
          </div>
          <Link
            to="/explore"
            className="hidden md:flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
          >
            View All
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, index) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -5 }}
              className="glass-card overflow-hidden group cursor-pointer"
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
                  <h3 className="text-lg font-bold text-white group-hover:text-gradient transition-all">
                    {dest.name}
                  </h3>
                  <span className="text-sm font-bold text-emerald-400">
                    {dest.price}
                  </span>
                </div>
                <p className="text-gray-500 mb-4 text-xs line-clamp-2 leading-relaxed">
                  {dest.description}
                </p>
                <Link 
                  to={`/explore/${dest.id}`}
                  className="block w-full text-center py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-medium group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-violet-500 group-hover:text-white group-hover:border-transparent transition-all duration-300"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center md:hidden">
          <Link to="/explore" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View All Destinations →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Destinations;
