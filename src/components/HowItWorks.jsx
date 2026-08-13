import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Sparkles, Map, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus className="w-8 h-8" />,
    title: "Enter Preferences",
    description: "Tell us where you want to go, your budget, mood, and travel style.",
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'shadow-blue-500/20',
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "AI Generates Plan",
    description: "Gemini AI creates a personalized itinerary with real hotels and activities.",
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    glow: 'shadow-violet-500/20',
  },
  {
    icon: <Map className="w-8 h-8" />,
    title: "Explore & Travel",
    description: "Review your plan, tweak mood/pace on-the-fly, and enjoy your trip.",
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/20',
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg-warm opacity-30" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold tracking-wider mb-6 uppercase">
            Easy Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            How It <span className="text-gradient-cool">Works</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Planning your dream vacation has never been easier. Just follow 3 simple steps.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[16%] w-[68%] h-px bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-emerald-500/20" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="glass-card p-8 flex flex-col items-center hover:bg-white/[0.05] transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 text-white shadow-lg ${step.glow} group-hover:scale-110 transition-transform relative z-10`}>
                {step.icon}
              </div>
              <div className="text-xs text-gray-600 font-mono mb-3">STEP {index + 1}</div>
              <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
