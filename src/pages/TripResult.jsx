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
            if (!response.ok) throw new Error('Failed to update itinerary');
            const data = await response.json();
            if (data?.matrix) setPlan(data);
        } catch (error) {
            console.error(error);
            alert('Could not re-plan your trip right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        const t = setTimeout(() => refreshPlan(controls.mood, controls.planMode), 350);
        return () => clearTimeout(t);
    }, [controls.mood, controls.planMode]);

    if (!plan) return <Navigate to="/" replace />;

    const selectStyle = {
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        borderRadius: 'var(--radius)',
    };

    return (
        <div className="pt-24 min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="container mx-auto px-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                    <Link
                        to="/"
                        id="btn-back-home"
                        className="flex items-center gap-2 text-sm font-medium transition-colors group"
                        style={{ color: 'var(--text-2)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-2)'}
                    >
                        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                        New Trip
                    </Link>

                    <div className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="block text-[10px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>Mood</label>
                            <select
                                id="control-mood"
                                value={controls.mood}
                                onChange={(e) => setControls((p) => ({ ...p, mood: e.target.value }))}
                                className="px-3.5 py-2.5 text-sm outline-none appearance-none cursor-pointer"
                                style={selectStyle}
                            >
                                <option value="Relaxing">Relaxing</option>
                                <option value="Adventure">Adventure</option>
                                <option value="Romantic">Romantic</option>
                                <option value="Cultural">Cultural</option>
                                <option value="Party">Party</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-3)' }}>Plan Type</label>
                            <select
                                id="control-planmode"
                                value={controls.planMode}
                                onChange={(e) => setControls((p) => ({ ...p, planMode: e.target.value }))}
                                className="px-3.5 py-2.5 text-sm outline-none appearance-none cursor-pointer"
                                style={selectStyle}
                            >
                                <option value="Day-wise">Day-wise</option>
                                <option value="Hour-wise">Hour-wise</option>
                            </select>
                        </div>
                        <button
                            id="btn-update-plan"
                            onClick={() => refreshPlan(controls.mood, controls.planMode)}
                            disabled={loading || !canReplan}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40 transition-all flex items-center gap-2"
                            style={{ backgroundColor: 'var(--accent)', color: 'var(--btn-text)' }}
                        >
                            {loading ? (
                                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
                            ) : (
                                <><RefreshCw size={13} /> Update</>
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
