import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Wallet, Smile, Users, Activity, Bus, Sparkles, Plane, ArrowRight } from 'lucide-react';

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
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data && data.matrix) {
        navigate('/trip-result', {
          state: {
            plan: data,
            query: { ...formData },
          },
        });
      } else {
        alert("Failed to generate trip plan. Please try again.");
      }
    } catch (error) {
      console.error("Error generating trip:", error);
      alert("Failed to connect to AI server. Make sure it's running!");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/[0.07] outline-none transition-all duration-300 text-sm";
  const selectClass = "w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300 appearance-none text-sm cursor-pointer";
  const labelClass = "flex items-center text-xs font-medium text-gray-400 gap-1.5 mb-2 uppercase tracking-wider";

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Travel Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]"></div>
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950"></div>
        <div className="absolute inset-0 mesh-bg opacity-60"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-pink-500/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 pt-28 pb-16">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider mb-6 uppercase"
          >
            <Sparkles size={14} className="animate-pulse-slow" />
            Powered by Gemini AI
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Plan Your Dream
            <br />
            <span className="text-gradient">Adventure with AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Get personalized itineraries, smart hotel picks, and budget-optimized plans — all generated by AI in seconds.
          </motion.p>
        </div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glass-strong rounded-3xl p-6 md:p-8 max-w-5xl mx-auto glow-blue"
          id="trip-form"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Destination */}
            <div>
              <label className={labelClass}>
                <MapPin size={14} className="text-blue-400" /> Destination
              </label>
              <input
                id="input-destination"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Where to go?"
                className={inputClass}
              />
            </div>

            {/* Duration */}
            <div>
              <label className={labelClass}>
                <Calendar size={14} className="text-blue-400" /> Duration
              </label>
              <input
                id="input-duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                min="1"
                placeholder={formData.planMode === 'Hour-wise' ? 'Hours' : 'Days'}
                className={inputClass}
              />
            </div>

            {/* Plan Mode */}
            <div>
              <label className={labelClass}>
                <Calendar size={14} className="text-violet-400" /> Plan Type
              </label>
              <select
                id="select-planmode"
                value={formData.planMode}
                onChange={(e) => setFormData({ ...formData, planMode: e.target.value })}
                className={selectClass}
              >
                <option value="Day-wise">Day-wise</option>
                <option value="Hour-wise">Hour-wise</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className={labelClass}>
                <Wallet size={14} className="text-emerald-400" /> Budget Range
              </label>
              <select 
                id="select-budget"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                className={selectClass}
              >
                <option value="Budget Friendly">Budget Friendly</option>
                <option value="Moderate">Moderate</option>
                <option value="Luxury">Luxury</option>
                <option value="Ultra Luxury">Ultra Luxury</option>
              </select>
            </div>

            {/* Mood */}
            <div>
              <label className={labelClass}>
                <Smile size={14} className="text-pink-400" /> Mood
              </label>
              <select 
                id="select-mood"
                value={formData.mood}
                onChange={(e) => setFormData({...formData, mood: e.target.value})}
                className={selectClass}
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
              <label className={labelClass}>
                <Users size={14} className="text-amber-400" /> Companions
              </label>
              <select
                id="select-companions"
                value={formData.companions}
                onChange={(e) => setFormData({...formData, companions: e.target.value})}
                className={selectClass}
              >
                <option value="Solo">Solo</option>
                <option value="Couple">Couple</option>
                <option value="Friends">Friends</option>
                <option value="Family">Family</option>
              </select>
            </div>

            {/* Pace */}
            <div>
              <label className={labelClass}>
                <Activity size={14} className="text-cyan-400" /> Pace
              </label>
              <select
                id="select-pace"
                value={formData.pace}
                onChange={(e) => setFormData({...formData, pace: e.target.value})}
                className={selectClass}
              >
                <option value="Chill">Chill</option>
                <option value="Moderate">Moderate</option>
                <option value="Fast Paced">Fast Paced</option>
              </select>
            </div>

            {/* Transport */}
            <div>
              <label className={labelClass}>
                <Plane size={14} className="text-orange-400" /> Transport
              </label>
              <select
                id="select-transport"
                value={formData.transport}
                onChange={(e) => setFormData({...formData, transport: e.target.value})}
                className={selectClass}
              >
                <option value="Flight">Flight</option>
                <option value="Train">Train</option>
                <option value="Bus">Bus</option>
                <option value="Car Rental">Car Rental</option>
              </select>
            </div>
          </div>

          {/* Interests Chips */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">Interests</p>
            <div className="flex flex-wrap gap-2">
              {["Beaches", "Mountains", "History", "Food", "Nightlife", "Shopping", "Nature"].map((tag) => (
                <label key={tag} className="cursor-pointer">
                  <input type="checkbox" className="peer sr-only" />
                  <span className="px-4 py-1.5 rounded-full text-sm border border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300 peer-checked:bg-blue-500/15 peer-checked:text-blue-400 peer-checked:border-blue-500/30 transition-all select-none">
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
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>AI is planning your trip...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} className="group-hover:animate-pulse" />
                  <span>Generate AI Trip Plan</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-8 md:gap-16 mt-12 text-center"
        >
          {[
            { value: '10K+', label: 'Trips Planned' },
            { value: '150+', label: 'Destinations' },
            { value: '4.9★', label: 'User Rating' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
