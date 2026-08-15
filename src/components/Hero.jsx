import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Wallet, Smile, Users, Activity, Plane, ArrowRight } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: '',
    duration: '',
    planMode: 'Day-wise',
    budget: 'Budget Friendly',
    mood: 'Relaxing',
    companions: 'Solo',
    pace: 'Moderate',
    transport: 'Flight'
  });
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!formData.location || !formData.duration) {
      alert("Please enter a destination and duration.");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        location: formData.location,
        duration: String(formData.duration),
        budget: formData.budget,
        mood: formData.mood,
        plan_mode: formData.planMode,
        companions: formData.companions,
        pace: formData.pace,
        transport: formData.transport,
      });
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/plan_trip?${params.toString()}`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      if (data && data.matrix) {
        navigate('/trip-result', { state: { plan: data, query: { ...formData } } });
      } else {
        alert("Failed to generate trip plan. Please try again.");
      }
    } catch (error) {
      console.error("Error generating trip:", error);
      alert("Failed to connect to server. Make sure it's running!");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: 'var(--radius)',
  };

  const labelClass = "flex items-center gap-1.5 text-xs font-medium mb-2 uppercase tracking-wider";

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Travel Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, var(--overlay) 0%, var(--overlay-heavy) 60%, var(--bg) 100%)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-28 pb-20">
        <div className="text-center mb-10">
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xs font-medium uppercase tracking-[0.2em] mb-5"
            style={{ color: 'var(--accent)' }}
          >
            Plan smarter. Travel better.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl md:text-6xl lg:text-7xl font-semibold mb-5 leading-[1.08] tracking-tight"
            style={{ color: 'var(--text)' }}
          >
            Your next trip,
            <br />
            thoughtfully planned.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base md:text-lg max-w-xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-2)' }}
          >
            Personalized itineraries, smart hotel picks, and budget-optimized plans — generated in seconds.
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-5xl mx-auto p-6 md:p-8 rounded-2xl"
          id="trip-form"
          style={{
            backgroundColor: 'var(--overlay)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Destination */}
            <div>
              <label className={labelClass} style={{ color: 'var(--text-2)' }}>
                <MapPin size={13} style={{ color: 'var(--accent)' }} /> Destination
              </label>
              <input
                id="input-destination"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Where to?"
                className="w-full px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
                style={{ ...inputStyle, '::placeholder': { color: 'var(--text-3)' } }}
              />
            </div>

            {/* Duration */}
            <div>
              <label className={labelClass} style={{ color: 'var(--text-2)' }}>
                <Calendar size={13} style={{ color: 'var(--accent)' }} /> Duration
              </label>
              <input
                id="input-duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                min="1"
                placeholder={formData.planMode === 'Hour-wise' ? 'Hours' : 'Days'}
                className="w-full px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
                style={inputStyle}
              />
            </div>

            {/* Plan Mode */}
            <div>
              <label className={labelClass} style={{ color: 'var(--text-2)' }}>
                <Calendar size={13} style={{ color: 'var(--text-3)' }} /> Plan Type
              </label>
              <select
                id="select-planmode"
                value={formData.planMode}
                onChange={(e) => setFormData({ ...formData, planMode: e.target.value })}
                className="w-full px-4 py-3 text-sm outline-none appearance-none cursor-pointer"
                style={inputStyle}
              >
                <option value="Day-wise">Day-wise</option>
                <option value="Hour-wise">Hour-wise</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className={labelClass} style={{ color: 'var(--text-2)' }}>
                <Wallet size={13} style={{ color: 'var(--text-3)' }} /> Budget
              </label>
              <select
                id="select-budget"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                className="w-full px-4 py-3 text-sm outline-none appearance-none cursor-pointer"
                style={inputStyle}
              >
                <option value="Budget Friendly">Budget Friendly</option>
                <option value="Moderate">Moderate</option>
                <option value="Luxury">Luxury</option>
                <option value="Ultra Luxury">Ultra Luxury</option>
              </select>
            </div>

            {/* Mood */}
            <div>
              <label className={labelClass} style={{ color: 'var(--text-2)' }}>
                <Smile size={13} style={{ color: 'var(--text-3)' }} /> Mood
              </label>
              <select
                id="select-mood"
                value={formData.mood}
                onChange={(e) => setFormData({...formData, mood: e.target.value})}
                className="w-full px-4 py-3 text-sm outline-none appearance-none cursor-pointer"
                style={inputStyle}
              >
                <option value="Relaxing">Relaxing</option>
                <option value="Adventure">Adventure</option>
                <option value="Romantic">Romantic</option>
                <option value="Cultural">Cultural</option>
                <option value="Party">Party</option>
              </select>
            </div>

            {/* Companions */}
            <div>
              <label className={labelClass} style={{ color: 'var(--text-2)' }}>
                <Users size={13} style={{ color: 'var(--text-3)' }} /> Companions
              </label>
              <select
                id="select-companions"
                value={formData.companions}
                onChange={(e) => setFormData({...formData, companions: e.target.value})}
                className="w-full px-4 py-3 text-sm outline-none appearance-none cursor-pointer"
                style={inputStyle}
              >
                <option value="Solo">Solo</option>
                <option value="Couple">Couple</option>
                <option value="Friends">Friends</option>
                <option value="Family">Family</option>
              </select>
            </div>

            {/* Pace */}
            <div>
              <label className={labelClass} style={{ color: 'var(--text-2)' }}>
                <Activity size={13} style={{ color: 'var(--text-3)' }} /> Pace
              </label>
              <select
                id="select-pace"
                value={formData.pace}
                onChange={(e) => setFormData({...formData, pace: e.target.value})}
                className="w-full px-4 py-3 text-sm outline-none appearance-none cursor-pointer"
                style={inputStyle}
              >
                <option value="Chill">Chill</option>
                <option value="Moderate">Moderate</option>
                <option value="Fast Paced">Fast Paced</option>
              </select>
            </div>

            {/* Transport */}
            <div>
              <label className={labelClass} style={{ color: 'var(--text-2)' }}>
                <Plane size={13} style={{ color: 'var(--text-3)' }} /> Transport
              </label>
              <select
                id="select-transport"
                value={formData.transport}
                onChange={(e) => setFormData({...formData, transport: e.target.value})}
                className="w-full px-4 py-3 text-sm outline-none appearance-none cursor-pointer"
                style={inputStyle}
              >
                <option value="Flight">Flight</option>
                <option value="Train">Train</option>
                <option value="Bus">Bus</option>
                <option value="Car Rental">Car Rental</option>
              </select>
            </div>
          </div>

          {/* Interests */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Interests</p>
            <div className="flex flex-wrap gap-2">
              {["Beaches", "Mountains", "History", "Food", "Nightlife", "Shopping", "Nature"].map((tag) => (
                <label key={tag} className="cursor-pointer">
                  <input type="checkbox" className="peer sr-only" />
                  <span
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all select-none inline-block peer-checked:!bg-[var(--accent)] peer-checked:!text-white peer-checked:!border-[var(--accent)]"
                    style={{ color: 'var(--text-3)', border: '1px solid var(--border)', backgroundColor: 'transparent' }}
                  >
                    {tag}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-6">
            <button
              id="btn-generate-trip"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full md:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--btn-text)' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent-h)'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent)'; }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Planning your trip...
                </>
              ) : (
                <>
                  Generate Trip Plan
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-12 md:gap-20 mt-14 text-center"
        >
          {[
            { value: '10K+', label: 'Trips Planned' },
            { value: '150+', label: 'Destinations' },
            { value: '4.9★', label: 'User Rating' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-xl md:text-2xl font-semibold" style={{ color: 'var(--text)' }}>{stat.value}</p>
              <p className="text-[11px] mt-1 uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
