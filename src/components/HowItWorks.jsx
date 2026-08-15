import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Sparkles, Map } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus className="w-5 h-5" />,
    title: "Enter Preferences",
    description: "Tell us your destination, budget, mood, and travel style.",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Plan Generated",
    description: "A personalized itinerary with real hotels and activities is created instantly.",
  },
  {
    icon: <Map className="w-5 h-5" />,
    title: "Explore & Travel",
    description: "Review your plan, adjust on-the-fly, and enjoy your trip.",
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-14"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--accent)' }}>
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Three simple steps
          </h2>
          <p className="max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-2)' }}>
            Planning your dream vacation has never been easier.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 relative">
          {/* Connecting line (desktop) */}
          <div
            className="hidden md:block absolute top-14 left-[20%] w-[60%] h-px"
            style={{ backgroundColor: 'var(--border)' }}
          />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.4 }}
              className="p-7 rounded-2xl flex flex-col items-center"
              style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 relative z-10"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--btn-text)' }}
              >
                {step.icon}
              </div>
              <p className="text-[10px] font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
                Step {index + 1}
              </p>
              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
