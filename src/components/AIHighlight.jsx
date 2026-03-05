import React from 'react';
import { motion } from 'framer-motion';
import { Map, Hotel, Compass, BrainCircuit } from 'lucide-react';
import { features } from '../data/mockData';

const AIHighlight = () => {
    const icons = {
        Map: <Map className="w-8 h-8 text-blue-500 mb-4" />,
        Hotel: <Hotel className="w-8 h-8 text-purple-500 mb-4" />,
        Compass: <Compass className="w-8 h-8 text-teal-500 mb-4" />
    };

  return (
    <section id="ai-planner" className="py-20 bg-gray-50/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold tracking-wider mb-4 uppercase">
            AI-Powered Features
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Plan Smarter with AI
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Our advanced AI algorithms analyze your preferences to create the perfect trip tailored just for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group"
            >
              <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 group-hover:bg-blue-50 transition-colors">
                {icons[feature.icon]}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">
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
