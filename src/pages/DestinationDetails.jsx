import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { destinations } from '../data/mockData';
import { MapPin, CheckCircle, Plane, Hotel, CheckSquare, ArrowLeft, Star } from 'lucide-react';

const DestinationDetails = () => {
  const { id } = useParams();
  const destination = destinations.find(d => d.id === parseInt(id));

  if (!destination) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="mb-4" style={{ color: 'var(--text-2)' }}>Destination not found</p>
        <Link to="/explore" style={{ color: 'var(--accent)' }}>← Back to Explore</Link>
      </div>
    </div>
  );

  const cardStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
  };

  const bookingOptions = [
    { icon: <Plane size={15} />, label: 'Flight', sublabel: 'Fastest Route', value: destination.booking.flight },
    { icon: <Hotel size={15} />, label: 'Hotel', sublabel: 'Best Reviewed', value: destination.booking.hotel },
    { icon: <CheckSquare size={15} />, label: 'Full Package', sublabel: 'Flight + Hotel', value: destination.booking.package },
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <Link
          to="/explore"
          className="flex items-center gap-2 text-sm font-medium mb-8 transition-colors group inline-flex"
          style={{ color: 'var(--text-2)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-2)'}
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Explore
        </Link>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl overflow-hidden h-[480px]"
            style={{ border: '1px solid var(--border)' }}
          >
            <img src={destination.image} alt={destination.name} className="w-full h-full object-cover" />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold mb-3" style={{ color: 'var(--text)' }}>
                {destination.name}
              </h1>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-2)' }}>
                  <MapPin size={13} style={{ color: 'var(--accent)' }} /> India
                </span>
                <span style={{ color: 'var(--text-3)' }}>·</span>
                <span className="flex items-center gap-1 text-sm font-medium" style={{ color: '#E5C07B' }}>
                  <Star size={13} fill="#E5C07B" /> {destination.rating}
                  <span className="font-normal ml-1" style={{ color: 'var(--text-3)' }}>(200+ Reviews)</span>
                </span>
              </div>
              <p className="leading-relaxed" style={{ color: 'var(--text-2)' }}>{destination.description}</p>
            </div>

            {/* Activities */}
            {destination.activities && (
              <div>
                <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>Popular Activities</h3>
                <ul className="space-y-2">
                  {destination.activities.map((activity, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.08 }}
                      className="flex items-start gap-3 p-4 rounded-2xl"
                      style={cardStyle}
                    >
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
                      <div>
                        <h4 className="text-sm font-medium" style={{ color: 'var(--text)' }}>{activity.name}</h4>
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>{activity.description}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Booking */}
            <div className="p-6 rounded-2xl" style={cardStyle}>
              <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text)' }}>Booking Options</h3>
              <div className="space-y-2.5">
                {bookingOptions.map((opt) => (
                  <div
                    key={opt.label}
                    className="flex items-center justify-between p-4 rounded-xl transition-colors"
                    style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--surface)', color: 'var(--accent)' }}>
                        {opt.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium" style={{ color: 'var(--text)' }}>{opt.label}</h4>
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>{opt.sublabel}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{opt.value}</span>
                  </div>
                ))}
              </div>

              <button
                className="w-full mt-5 py-3.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ backgroundColor: 'var(--accent)', color: '#0B0D0C' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-h)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
              >
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
