import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Wallet, Smile, Users, Activity, Bus } from 'lucide-react';

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

      const response = await fetch(`http://localhost:8000/plan_trip?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data && data.matrix) {
        navigate('/trip-result', {
          state: {
            plan: data,
            query: {
              ...formData,
            },
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

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Travel Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 mt-16">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg"
          >
            Discover Your Next Adventure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
              Powered by AI
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-200 max-w-2xl mx-auto drop-shadow-md"
          >
            Plan your perfect trip in seconds. Customizable itineraries, smart recommendations, and seamless booking.
          </motion.p>
        </div>

        {/* Search Card */}
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.4 }}
           className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto border border-white/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Destination */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
                <MapPin size={16} className="text-blue-600" /> Destination
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Where to go?"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
                <Calendar size={16} className="text-blue-600" /> Duration
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                min="1"
                placeholder={formData.planMode === 'Hour-wise' ? 'Hours' : 'Days'}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Plan Mode */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
                <Calendar size={16} className="text-blue-600" /> Plan Type
              </label>
              <select
                value={formData.planMode}
                onChange={(e) => setFormData({ ...formData, planMode: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
              >
                <option>Day-wise</option>
                <option>Hour-wise</option>
              </select>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
                <Wallet size={16} className="text-blue-600" /> Budget Range
              </label>
              <select 
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
              >
                <option>Budget Friendly</option>
                <option>Moderate</option>
                <option>Luxury</option>
                <option>Ultra Luxury</option>
              </select>
            </div>

            {/* Mood */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
                <Smile size={16} className="text-blue-600" /> Mood
              </label>
              <select 
                value={formData.mood}
                onChange={(e) => setFormData({...formData, mood: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
              >
                <option>Relaxing</option>
                <option>Adventure</option>
                <option>Romantic</option>
                <option>Cultural</option>
                <option>Party</option>
              </select>
            </div>

            {/* Row 2 */}
            
            {/* Travel Companions */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
                <Users size={16} className="text-blue-600" /> Companions
              </label>
              <select
                value={formData.companions}
                onChange={(e) => setFormData({...formData, companions: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
              >
                <option>Solo</option>
                <option>Couple</option>
                <option>Friends</option>
                <option>Family</option>
              </select>
            </div>

            {/* Activity Level */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
                <Activity size={16} className="text-blue-600" /> Pace
              </label>
               <select
                value={formData.pace}
                onChange={(e) => setFormData({...formData, pace: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
               >
                <option>Chill</option>
                <option>Moderate</option>
                <option>Fast Paced</option>
              </select>
            </div>

            {/* Transport Mode */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
                <Bus size={16} className="text-blue-600" /> Transport
              </label>
               <select
                value={formData.transport}
                onChange={(e) => setFormData({...formData, transport: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 shadow-sm border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
               >
                <option>Flight</option>
                <option>Train</option>
                <option>Bus</option>
                <option>Car Rental</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Activity className="animate-spin" size={20} /> : <Search size={20} />}
                {loading ? "Planning..." : "Generate Trip"}
              </button>
            </div>

          </div>

          {/* Interests Chips */}
          <div className="mt-6 pt-6 border-t border-gray-100">
             <p className="text-sm font-medium text-gray-500 mb-3">Interests</p>
             <div className="flex flex-wrap gap-2">
                {["Beaches", "Mountains", "History", "Food", "Nightlife", "Shopping", "Nature"].map((tag) => (
                  <label key={tag} className="cursor-pointer">
                    <input type="checkbox" className="peer sr-only" />
                    <span className="px-4 py-1.5 rounded-full text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 peer-checked:bg-blue-50 peer-checked:text-blue-600 peer-checked:border-blue-200 transition-all select-none">
                      {tag}
                    </span>
                  </label>
                ))}
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
