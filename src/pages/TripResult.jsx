import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import TripPlan from '../components/TripPlan';

const TripResult = () => {
    const location = useLocation();
    const { plan: initialPlan, query } = location.state || {};
    const [plan, setPlan] = useState(initialPlan || null);
    const [loading, setLoading] = useState(false);
    const [controls, setControls] = useState({
        mood: query?.mood || 'Relaxing',
        planMode: query?.planMode || 'Day-wise',
    });
    const isFirstRender = useRef(true);

    const canReplan = useMemo(() => Boolean(query?.location && query?.duration), [query]);

    const refreshPlan = async (nextMood, nextPlanMode) => {
        if (!canReplan) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                location: query.location,
                duration: String(query.duration),
                budget: query.budget || 'Moderate',
                mood: nextMood,
                plan_mode: nextPlanMode,
                companions: query.companions || 'Solo',
                pace: query.pace || 'Moderate',
                transport: query.transport || 'Flight',
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/plan_trip?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to update itinerary');
            }

            const data = await response.json();
            if (data?.matrix) {
                setPlan(data);
            }
        } catch (error) {
            console.error(error);
            alert('Could not re-plan your trip right now. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timeoutId = setTimeout(() => {
            refreshPlan(controls.mood, controls.planMode);
        }, 350);
        return () => clearTimeout(timeoutId);
    }, [controls.mood, controls.planMode]);

    if (!plan) {
        return <Navigate to="/" replace />;
    }

    const selectClass = "px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer transition-all";

    return (
        <div className="pt-24 min-h-screen bg-slate-950 mesh-bg">
            <div className="container mx-auto px-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                    <Link
                        to="/"
                        id="btn-back-home"
                        className="text-gray-400 hover:text-blue-400 flex items-center gap-2 text-sm font-medium transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Create Another Trip
                    </Link>

                    <div className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Mood</label>
                            <select
                                id="control-mood"
                                value={controls.mood}
                                onChange={(e) => setControls((prev) => ({ ...prev, mood: e.target.value }))}
                                className={selectClass}
                            >
                                <option value="Relaxing">Relaxing</option>
                                <option value="Adventure">Adventure</option>
                                <option value="Romantic">Romantic</option>
                                <option value="Cultural">Cultural</option>
                                <option value="Party">Party</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Plan Type</label>
                            <select
                                id="control-planmode"
                                value={controls.planMode}
                                onChange={(e) => setControls((prev) => ({ ...prev, planMode: e.target.value }))}
                                className={selectClass}
                            >
                                <option value="Day-wise">Day-wise</option>
                                <option value="Hour-wise">Hour-wise</option>
                            </select>
                        </div>
                        <button
                            id="btn-update-plan"
                            onClick={() => refreshPlan(controls.mood, controls.planMode)}
                            disabled={loading || !canReplan}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-semibold disabled:opacity-40 hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Re-planning...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={14} />
                                    Update Plan
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
            <TripPlan plan={plan} />
        </div>
    );
};

export default TripResult;
