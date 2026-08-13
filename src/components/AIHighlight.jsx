import React from 'react';
import { motion } from 'framer-motion';
import { Map, Hotel, Compass, Zap, Shield, Globe } from 'lucide-react';
import { features } from '../data/mockData';

const iconMap = {
  Map: <Map className="w-7 h-7" />,
  Hotel: <Hotel className="w-7 h-7" />,
  Compass: <Compass className="w-7 h-7" />,
};

const gradients = [
  { bg: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/10', icon: 'text-blue-400', hover: 'hover:border-blue-500/20' },
  { bg: 'from-violet-500/10 to-purple-500/10', border: 'border-violet-500/10', icon: 'text-violet-400', hover: 'hover:border-violet-500/20' },
  { bg: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-500/10', icon: 'text-emerald-400', hover: 'hover:border-emerald-500/20' },
];

const AIHighlight = () => {
  return (
    <section id="ai-planner" className="py-24 relative overflow-hidden">
      {/* Mesh bg */}
      <div className="absolute inset-0 mesh-bg opacity-40" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider mb-6 uppercase">
            <Zap size={14} />
            AI-Powered Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Plan Smarter with <span className="text-gradient">AI</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Our Gemini-powered algorithms analyze your preferences to create the perfect trip tailored just for you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.01 }}
              className={`glass-card p-8 ${gradients[index].hover} transition-all duration-300 group shimmer`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradients[index].bg} border ${gradients[index].border} flex items-center justify-center mb-6 ${gradients[index].icon} group-hover:scale-110 transition-transform`}>
                {iconMap[feature.icon]}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gradient transition-all">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIHighlight;
