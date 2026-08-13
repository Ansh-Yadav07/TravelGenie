import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { destinations } from '../data/mockData';
import { MapPin, CheckCircle, Plane, Hotel, CheckSquare, ArrowLeft, Star, IndianRupee } from 'lucide-react';

const DestinationDetails = () => {
  const { id } = useParams();
  const destination = destinations.find(d => d.id === parseInt(id));

  if (!destination) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 text-lg mb-4">Destination not found</p>
        <Link to="/explore" className="text-blue-400 hover:text-blue-300">← Back to Explore</Link>
      </div>
    </div>
  );

  return (
    <div className="pt-24 pb-16 min-h-screen mesh-bg">
      <div className="container mx-auto px-4">
        <Link to="/explore" className="text-gray-400 hover:text-blue-400 mb-8 flex items-center gap-2 text-sm font-medium transition-colors group inline-flex">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Explore
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 mt-6">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl overflow-hidden h-[500px] ring-1 ring-white/10"
          >
            <img src={destination.image} alt={destination.name} className="w-full h-full object-cover" />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {destination.name}
              </h1>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <MapPin size={14} className="text-red-400" /> India
                </span>
                <span className="text-gray-700">•</span>
                <span className="flex items-center gap-1 text-amber-400 text-sm font-semibold">
                  <Star size={14} className="fill-amber-400" /> {destination.rating}
                  <span className="text-gray-500 font-normal ml-1">(200+ Reviews)</span>
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">{destination.description}</p>
            </div>

            {/* Activities */}
            {destination.activities && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Popular Activities</h3>
                <ul className="space-y-3">
                  {destination.activities.map((activity, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-3 glass-card p-4"
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{activity.name}</h4>
                        <p className="text-xs text-gray-500">{activity.description}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Booking */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-5">Booking Options</h3>
              <div className="space-y-3">
                {[
                  { icon: <Plane size={16} />, label: 'Flight', sublabel: 'Fastest Route', value: destination.booking.flight, color: 'blue' },
                  { icon: <Hotel size={16} />, label: 'Hotel', sublabel: 'Best Reviewed', value: destination.booking.hotel, color: 'violet' },
                  { icon: <CheckSquare size={16} />, label: 'Full Package', sublabel: 'Includes Flight + Hotel', value: destination.booking.package, color: 'emerald' },
                ].map((option) => (
                  <div key={option.label} className={`flex items-center justify-between p-4 rounded-xl bg-${option.color}-500/5 border border-${option.color}-500/10 hover:bg-${option.color}-500/10 transition-colors`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${option.color}-500/10 text-${option.color}-400`}>
                        {option.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{option.label}</h4>
                        <p className="text-xs text-gray-500">{option.sublabel}</p>
                      </div>
                    </div>
                    <span className="font-bold text-white text-sm">{option.value}</span>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-4 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300">
                Book Now
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetails;
