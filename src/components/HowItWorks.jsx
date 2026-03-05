import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Sparkles, Map } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus className="w-10 h-10 text-blue-600" />,
    title: "1. Enter Preferences",
    description: "Tell us where you want to go, your budget, and travel style."
  },
  {
    icon: <Sparkles className="w-10 h-10 text-purple-600" />,
    title: "2. AI Generates Plan",
    description: "Our AI creates a personalized itinerary including stays and activities."
  },
  {
    icon: <Map className="w-10 h-10 text-green-600" />,
    title: "3. Explore & Travel",
    description: "Review your plan, book everything in one click, and enjoy your trip."
  }
];

const HowItWorks = () => {
    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-purple-100 text-purple-600 text-xs font-semibold tracking-wider mb-4 uppercase">
                        Easy Process
                    </span>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Planning your dream vacation has never been easier. Just follow these 3 simple steps.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-blue-100 via-purple-100 to-green-100 -z-10 transform -translate-y-1/2" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center"
                        >
                            <div className="bg-white p-4 rounded-full shadow-md mb-6 relative z-10 border-4 border-gray-50">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                            <p className="text-gray-500">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
