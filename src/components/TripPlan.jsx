import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Mountain, Music, Landmark, Map, Calendar, DollarSign, Home, Bus, AlertCircle } from 'lucide-react';

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
    Sun: <Sun className="w-6 h-6 text-yellow-500" />,
    Mountain: <Mountain className="w-6 h-6 text-green-500" />,
    Music: <Music className="w-6 h-6 text-purple-500" />,
    Landmark: <Landmark className="w-6 h-6 text-blue-500" />,
    Map: <Map className="w-6 h-6 text-gray-500" />
  };

  return (
    <div id="trip-plan" className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold tracking-wider mb-4 uppercase">
            Your Personalized Plan
          </span>
          <h2 className="text-4xl font-bold text-gray-900">Trip Matrix</h2>
        </motion.div>

        {/* The Scene */}
        <div className="mb-12 flex justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-full">
                    {sceneIcons[the_scene?.visual_cue] || sceneIcons.Map}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">The Scene</h3>
                    <p className="text-gray-500">{the_scene?.mood} • {the_scene?.category}</p>
                </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Stays */}
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Home className="w-6 h-6 text-blue-600" /> Stays
                    </h3>
                    <span className="text-sm text-gray-500">Budget: ₹{stays.budget_allocated.toLocaleString()}</span>
                </div>
                {stays.options.map((stay, idx) => (
                    <motion.div 
                        key={idx}
                        className={`bg-white p-5 rounded-2xl border transition-all ${
                            stay.is_over_budget 
                                ? 'shadow-[0_0_15px_rgba(239,68,68,0.4)] border-red-200' 
                                : 'shadow-sm border-gray-100 hover:shadow-md'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900">{stay.name}</h4>
                            {stay.is_over_budget && <AlertCircle className="w-5 h-5 text-red-500" />}
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{stay.type} • {stay.amenity}</p>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-900 font-semibold">₹{stay.total_cost.toLocaleString()}</span>
                            {stay.is_over_budget && <span className="text-xs text-red-500 font-medium">Over Budget</span>}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Transport */}
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Bus className="w-6 h-6 text-purple-600" /> Transport
                    </h3>
                    <span className="text-sm text-gray-500">Budget: ₹{transport.budget_allocated.toLocaleString()}</span>
                </div>
                 {transport.options.map((option, idx) => (
                    <motion.div 
                        key={idx}
                         className={`bg-white p-5 rounded-2xl border transition-all ${
                            option.is_over_budget 
                                ? 'shadow-[0_0_15px_rgba(239,68,68,0.4)] border-red-200' 
                                : 'shadow-sm border-gray-100 hover:shadow-md'
                        }`}
                    >
                         <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900">{option.mode}</h4>
                             {option.is_over_budget && <AlertCircle className="w-5 h-5 text-red-500" />}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                             <span className="text-gray-900 font-semibold">~₹{option.estimated_total.toLocaleString()}</span>
                             {option.is_over_budget && <span className="text-xs text-red-500 font-medium">Over Budget</span>}
                        </div>
                    </motion.div>
                ))}
            </div>

             {/* Places to Visit (Budget Remaining) */}
             <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Map className="w-6 h-6 text-green-600" /> Activities
                    </h3>
                    <span className="text-sm text-gray-500">Budget: ₹{places_to_visit.budget_allocated.toLocaleString()}</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-600 mb-4">Based on your mood <strong>{places_to_visit.mood}</strong>, we optimized activities for {places_to_visit.companions?.toLowerCase() || 'your style'} at a {places_to_visit.pace?.toLowerCase() || 'moderate'} pace.</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{width: `${spentRatio}%`}}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Spent: {Math.round(spentRatio)}%</span>
                        <span>Remaining: ₹{remaining.toLocaleString()}</span>
                    </div>
                </div>
            </div>

        </div>

        {/* Itinerary Timeline */}
        <div className="mt-16 max-w-4xl mx-auto">
             <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-orange-600" /> Itinerary ({itinerary?.planning_mode || 'Day-wise'} • {itinerary?.density})
            </h3>
            <p className="text-sm text-gray-500 mb-6">Duration: {itinerary?.duration_label || `${itinerary?.duration || 0} days`}</p>
            
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {itinerarySegments.map((segment, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-orange-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <span className="font-bold text-sm">{idx + 1}</span>
                        </div>
                        
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-1">{segment.segment_label}</h4>
                            <p className="text-xs text-gray-500 mb-3">{segment.focus}</p>
                            <ul className="space-y-3">
                                {segment.activities.map((act, i) => (
                                    <li key={i} className="flex gap-3 text-sm">
                                        <span className="text-gray-400 font-mono text-xs pt-1 min-w-[88px]">{act.time}</span>
                                        <div>
                                          <p className="text-gray-800 font-medium">{act.activity}</p>
                                          <p className="text-gray-500 text-xs">{act.details || 'Planned local experience'} • {act.location_zone || 'City center'} • ₹{(act.cost || 0).toLocaleString()}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

        </div>

      </div>
    </div>
  );
};

export default TripPlan;
