import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Mountain, Music, Landmark, Map, Calendar, Home, Bus, AlertCircle, Clock, IndianRupee } from 'lucide-react';

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay },
});

const TripPlan = ({ plan }) => {
  if (!plan || !plan.matrix) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-base" style={{ color: 'var(--text-2)' }}>No trip plan data available.</p>
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
    Sun: <Sun className="w-5 h-5" style={{ color: '#E5C07B' }} />,
    Mountain: <Mountain className="w-5 h-5" style={{ color: 'var(--accent)' }} />,
    Music: <Music className="w-5 h-5" style={{ color: '#C678DD' }} />,
    Landmark: <Landmark className="w-5 h-5" style={{ color: '#61AFEF' }} />,
    Map: <Map className="w-5 h-5" style={{ color: 'var(--text-2)' }} />,
  };

  const cardStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
  };

  return (
    <div id="trip-plan" className="py-12 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div {...fadeIn()} className="text-center mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--accent)' }}>
            Your Results
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold" style={{ color: 'var(--text)' }}>
            Trip Overview
          </h2>
        </motion.div>

        {/* Scene */}
        <motion.div {...fadeIn(0.05)} className="mb-10 flex justify-center">
          <div className="flex items-center gap-4 px-6 py-4 rounded-2xl" style={cardStyle}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--surface-2)' }}>
              {sceneIcons[the_scene?.visual_cue] || sceneIcons.Map}
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>The Scene</h3>
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>{the_scene?.mood} · {the_scene?.category}</p>
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Stays */}
          <motion.div {...fadeIn(0.1)} className="space-y-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <Home className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Stays
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-md" style={{ color: 'var(--text-3)', backgroundColor: 'var(--surface-2)' }}>
                ₹{stays.budget_allocated.toLocaleString()}
              </span>
            </div>
            {stays.options.map((stay, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl transition-colors"
                style={{
                  ...cardStyle,
                  ...(stay.is_over_budget ? { borderColor: 'rgba(217,83,79,0.3)' } : {}),
                }}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className="text-sm font-medium" style={{ color: 'var(--text)' }}>{stay.name}</h4>
                  {stay.is_over_budget && <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--danger)' }} />}
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>{stay.type} · {stay.amenity}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold flex items-center gap-0.5" style={{ color: 'var(--text)' }}>
                    <IndianRupee size={12} />{stay.total_cost.toLocaleString()}
                  </span>
                  {stay.is_over_budget && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ color: 'var(--danger)', backgroundColor: 'rgba(217,83,79,0.1)' }}>
                      Over Budget
                    </span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Transport */}
          <motion.div {...fadeIn(0.15)} className="space-y-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <Bus className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Transport
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-md" style={{ color: 'var(--text-3)', backgroundColor: 'var(--surface-2)' }}>
                ₹{transport.budget_allocated.toLocaleString()}
              </span>
            </div>
            {transport.options.map((option, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl"
                style={{
                  ...cardStyle,
                  ...(option.is_over_budget ? { borderColor: 'rgba(217,83,79,0.3)' } : {}),
                }}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium" style={{ color: 'var(--text)' }}>{option.mode}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold flex items-center gap-0.5" style={{ color: 'var(--text)' }}>
                      <IndianRupee size={12} />{option.estimated_total.toLocaleString()}
                    </span>
                    {option.is_over_budget && <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--danger)' }} />}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Activities */}
          <motion.div {...fadeIn(0.2)} className="space-y-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <Map className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Activities
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-md" style={{ color: 'var(--text-3)', backgroundColor: 'var(--surface-2)' }}>
                ₹{places_to_visit.budget_allocated.toLocaleString()}
              </span>
            </div>

            <div className="p-5 rounded-2xl" style={cardStyle}>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-2)' }}>
                Optimized for <span style={{ color: 'var(--text)' }}>{places_to_visit.mood}</span> mood, {places_to_visit.companions?.toLowerCase() || 'your style'} at <span style={{ color: 'var(--text)' }}>{places_to_visit.pace?.toLowerCase() || 'moderate'}</span> pace.
              </p>
              <div className="mb-2">
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-2)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${spentRatio}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs" style={{ color: 'var(--text-3)' }}>
                <span>Spent: {Math.round(spentRatio)}%</span>
                <span style={{ color: 'var(--accent)' }}>Remaining: ₹{remaining.toLocaleString()}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="p-5 rounded-2xl" style={cardStyle}>
              <h4 className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Summary</h4>
              <div className="space-y-2">
                {[
                  ['Mode', itinerary?.planning_mode || 'Day-wise'],
                  ['Duration', itinerary?.duration_label],
                  ['Density', itinerary?.density],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-3)' }}>{label}</span>
                    <span style={{ color: 'var(--text)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Itinerary */}
        <div className="mt-16 max-w-4xl mx-auto">
          <motion.div {...fadeIn(0.25)} className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <Calendar className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Itinerary</h3>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>{itinerary?.planning_mode} · {itinerary?.density} · {itinerary?.duration_label}</p>
            </div>
          </motion.div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px" style={{ '--tw-before-bg': 'var(--border)' }}>
            {itinerarySegments.map((segment, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx, duration: 0.3 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-sm font-semibold"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--btn-text)' }}
                >
                  {idx + 1}
                </div>

                <div
                  className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2rem)] p-5 rounded-2xl transition-colors"
                  style={cardStyle}
                >
                  <h4 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text)' }}>{segment.segment_label}</h4>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>{segment.focus}</p>
                  <ul className="space-y-2.5">
                    {segment.activities.map((act, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center shrink-0">
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded min-w-[64px] text-center"
                            style={{ color: 'var(--text-3)', backgroundColor: 'var(--surface-2)' }}
                          >
                            {act.time}
                          </span>
                          {act.duration_minutes && (
                            <span className="text-[9px] mt-0.5 flex items-center gap-0.5" style={{ color: 'var(--text-3)' }}>
                              <Clock size={8} />{act.duration_minutes}m
                            </span>
                          )}
                        </div>
                        <div className="flex-1 pb-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{act.activity}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                            {act.details || 'Planned experience'}
                            {act.location_zone && ` · ${act.location_zone}`}
                            {act.cost > 0 && <span style={{ color: 'var(--accent)' }}> · ₹{act.cost.toLocaleString()}</span>}
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
