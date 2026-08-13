import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Mountain, Music, Landmark, Map, Calendar, Home, Bus, AlertCircle, Clock, IndianRupee, TrendingUp, Sparkles } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const TripPlan = ({ plan }) => {
  if (!plan || !plan.matrix) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-gray-500 text-lg">No trip plan data available. Please try again.</p>
    </div>
  );

  const { matrix } = plan;
  const { stays, places_to_visit, transport, the_scene, itinerary } = matrix || {};
  const itinerarySegments = itinerary?.segments || (itinerary?.daily_plan || []).map((day) => ({
    segment_label: `Day ${day.day}`,
    focus: day.density || 'Planned activities',
    activities: day.activities,
  }));

  const allocated = places_to_visit?.budget_allocated || 0;
  const remaining = places_to_visit?.remaining_budget || 0;
  const spentRatio = allocated > 0 ? Math.max(0, Math.min(100, ((allocated - remaining) / allocated) * 100)) : 0;

  const sceneIcons = {
    Sun: <Sun className="w-6 h-6 text-amber-400" />,
    Mountain: <Mountain className="w-6 h-6 text-emerald-400" />,
    Music: <Music className="w-6 h-6 text-violet-400" />,
    Landmark: <Landmark className="w-6 h-6 text-blue-400" />,
    Map: <Map className="w-6 h-6 text-gray-400" />,
  };

  const moodColors = {
    Relaxing: 'from-amber-500/20 to-orange-500/20 border-amber-500/20',
    Adventure: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20',
    Party: 'from-violet-500/20 to-purple-500/20 border-violet-500/20',
    Cultural: 'from-blue-500/20 to-indigo-500/20 border-blue-500/20',
    Romantic: 'from-pink-500/20 to-rose-500/20 border-pink-500/20',
  };
  const sceneGradient = moodColors[the_scene?.mood] || moodColors.Relaxing;

  return (
    <div id="trip-plan" className="py-12 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider mb-4 uppercase">
            <Sparkles size={14} />
            AI-Generated Plan
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Your Trip <span className="text-gradient">Matrix</span>
          </h2>
        </motion.div>

        {/* The Scene */}
        <motion.div {...fadeIn} className="mb-10 flex justify-center">
          <div className={`bg-gradient-to-r ${sceneGradient} border px-8 py-5 rounded-2xl flex items-center gap-5 backdrop-blur-sm`}>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              {sceneIcons[the_scene?.visual_cue] || sceneIcons.Map}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">The Scene</h3>
              <p className="text-gray-400 text-sm">{the_scene?.mood} • {the_scene?.category}</p>
            </div>
          </div>
        </motion.div>

        {/* Grid: Stays, Transport, Activities */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Stays */}
          <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10"><Home className="w-5 h-5 text-blue-400" /></div>
                Stays
              </h3>
              <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">₹{stays.budget_allocated.toLocaleString()}</span>
            </div>
            {stays.options.map((stay, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className={`glass-card p-5 transition-all duration-300 hover:bg-white/[0.06] ${
                  stay.is_over_budget ? 'ring-1 ring-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white text-sm">{stay.name}</h4>
                  {stay.is_over_budget && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                </div>
                <p className="text-xs text-gray-500 mb-3">{stay.type} • {stay.amenity}</p>
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-sm flex items-center gap-1">
                    <IndianRupee size={13} />{stay.total_cost.toLocaleString()}
                  </span>
                  {stay.is_over_budget && <span className="text-[10px] text-red-400 font-medium bg-red-500/10 px-2 py-0.5 rounded-full">Over Budget</span>}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Transport */}
          <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="p-2 rounded-lg bg-violet-500/10"><Bus className="w-5 h-5 text-violet-400" /></div>
                Transport
              </h3>
              <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">₹{transport.budget_allocated.toLocaleString()}</span>
            </div>
            {transport.options.map((option, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.08 }}
                className={`glass-card p-5 transition-all duration-300 hover:bg-white/[0.06] ${
                  option.is_over_budget ? 'ring-1 ring-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-white text-sm">{option.mode}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm flex items-center gap-1">
                      <IndianRupee size={13} />{option.estimated_total.toLocaleString()}
                    </span>
                    {option.is_over_budget && <AlertCircle className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
                {option.is_over_budget && <span className="text-[10px] text-red-400 font-medium mt-1 inline-block">Over Budget</span>}
              </motion.div>
            ))}
          </motion.div>

          {/* Activities Budget */}
          <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
                Activities
              </h3>
              <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">₹{places_to_visit.budget_allocated.toLocaleString()}</span>
            </div>
            <div className="glass-card p-6">
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Based on your <span className="text-white font-medium">{places_to_visit.mood}</span> mood, we optimized activities for {places_to_visit.companions?.toLowerCase() || 'your style'} at a <span className="text-white font-medium">{places_to_visit.pace?.toLowerCase() || 'moderate'}</span> pace.
              </p>
              <div className="mb-3">
                <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${spentRatio}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full"
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Spent: {Math.round(spentRatio)}%</span>
                <span className="text-emerald-400 font-medium">Remaining: ₹{remaining.toLocaleString()}</span>
              </div>
            </div>

            {/* Quick summary card */}
            <div className="glass-card p-5 space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">Trip Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Planning Mode</span>
                  <span className="text-white font-medium">{itinerary?.planning_mode || 'Day-wise'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Duration</span>
                  <span className="text-white font-medium">{itinerary?.duration_label}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Density</span>
                  <span className="text-white font-medium">{itinerary?.density}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Itinerary Timeline */}
        <div className="mt-16 max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Calendar className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Itinerary
              </h3>
              <p className="text-xs text-gray-500">{itinerary?.planning_mode || 'Day-wise'} • {itinerary?.density} • {itinerary?.duration_label || `${itinerary?.duration || 0} days`}</p>
            </div>
          </motion.div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {itinerarySegments.map((segment, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                {/* Timeline node */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/10 bg-slate-900 group-[.is-active]:bg-gradient-to-br group-[.is-active]:from-orange-500 group-[.is-active]:to-amber-500 text-gray-600 group-[.is-active]:text-white shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="font-bold text-sm">{idx + 1}</span>
                </div>

                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-6 hover:bg-white/[0.05] transition-all duration-300">
                  <h4 className="font-bold text-white mb-1">{segment.segment_label}</h4>
                  <p className="text-xs text-gray-500 mb-4">{segment.focus}</p>
                  <ul className="space-y-3">
                    {segment.activities.map((act, i) => (
                      <li key={i} className="flex gap-3 text-sm group/item">
                        <div className="flex flex-col items-center">
                          <span className="text-gray-600 font-mono text-[10px] bg-white/5 px-2 py-1 rounded-md min-w-[72px] text-center">
                            {act.time}
                          </span>
                          {act.duration_minutes && (
                            <span className="text-[9px] text-gray-600 mt-1 flex items-center gap-0.5">
                              <Clock size={8} />{act.duration_minutes}m
                            </span>
                          )}
                        </div>
                        <div className="flex-1 pb-3 border-b border-white/5 last:border-b-0">
                          <p className="text-gray-200 font-medium text-sm group-hover/item:text-white transition-colors">{act.activity}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {act.details || 'Planned local experience'}
                            {act.location_zone && <span className="text-gray-600"> • {act.location_zone}</span>}
                            {act.cost > 0 && <span className="text-emerald-400/70 ml-1">• ₹{(act.cost || 0).toLocaleString()}</span>}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlan;
