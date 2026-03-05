import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
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

            const response = await fetch(`http://localhost:8000/plan_trip?${params.toString()}`);
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

    return (
        <div className="pt-24 min-h-screen bg-gray-50">
             <div className="container mx-auto px-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <Link to="/" className="text-blue-600 flex items-center gap-1 hover:underline">← Create Another Trip</Link>
                    <div className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="block text-sm font-medium font-bold text-black-500 mb-1">Mood</label>
                            <select
                                value={controls.mood}
                                onChange={(e) => setControls((prev) => ({ ...prev, mood: e.target.value }))}
                                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                            >
                                <option>Relaxing</option>
                                <option>Adventure</option>
                                <option>Romantic</option>
                                <option>Cultural</option>
                                <option>Party</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black-500 mb-1">Plan Type</label>
                            <select
                                value={controls.planMode}
                                onChange={(e) => setControls((prev) => ({ ...prev, planMode: e.target.value }))}
                                className="px-5 py-4 rounded-lg border border-gray-200 bg-white text-sm"
                            >
                                <option>Day-wise</option>
                                <option>Hour-wise</option>
                            </select>
                        </div>
                        <button
                            onClick={() => refreshPlan(controls.mood, controls.planMode)}
                            disabled={loading || !canReplan}
                            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
                        >
                            {loading ? 'Re-planning...' : 'Update Plan'}
                        </button>
                    </div>
                </div>
             </div>
            <TripPlan plan={plan} />
        </div>
    );
};

export default TripResult;
