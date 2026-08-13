import React from 'react';
import { motion } from 'framer-motion';
import { Map, Hotel, Compass } from 'lucide-react';
import { features } from '../data/mockData';

const iconMap = {
  Map: <Map className="w-5 h-5" />,
  Hotel: <Hotel className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
};

const AIHighlight = () => {
  return (
    <section id="ai-planner" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--accent)' }}>
            Features
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Plan smarter, not harder
          </h2>
          <p className="max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-2)' }}>
            Our algorithms analyze your preferences to create trips tailored just for you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="p-7 rounded-2xl transition-colors duration-200 group"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-2)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: 'var(--surface-2)', color: 'var(--accent)' }}
              >
                {iconMap[feature.icon]}
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
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
