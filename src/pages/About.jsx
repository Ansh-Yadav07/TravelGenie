import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, Award, Heart } from 'lucide-react';

const About = () => {
    return (
        <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">About TravelGenie</h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        We are passionate about making travel planning seamless, personalized, and unforgettable. 
                        TravelGenie leverages cutting-edge AI to craft itineraries that match your unique style.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                     <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                         <img 
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80" 
                            alt="Our Team" 
                            className="rounded-3xl shadow-2xl"
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                        <p className="text-gray-600 text-lg">
                            We believe that every journey should be as unique as the traveler. Our mission is to eliminate the stress of planning and replace it with the excitement of discovery. By combining human expertise with AI precision, we curate experiences that go beyond the ordinary.
                        </p>
                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-gray-800">Global Reach</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-xl text-green-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-gray-800">Community Focused</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                                    <Award className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-gray-800">Award Winning</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-100 rounded-xl text-red-600">
                                    <Heart className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-gray-800">Made with Love</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                 <div className="bg-white rounded-3xl p-12 shadow-xl text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Meet the Creators</h2>
                    <div className="flex justify-center flex-wrap gap-8">
                        {/* Placeholder for team members */}
                         <div className="flex flex-col items-center">
                            <img src="https://ui-avatars.com/api/?name=Ansh+Yadav&background=0D8ABC&color=fff&size=128" className="w-24 h-24 rounded-full mb-4 shadow-md" alt="Ansh" />
                            <h4 className="font-bold text-lg text-gray-900">Ansh Yadav</h4>
                            <span className="text-blue-600 text-sm">Developer</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <img src="https://ui-avatars.com/api/?name=Taraksh+Pratap+Singh&background=0D8ABC&color=fff&size=128" className="w-24 h-24 rounded-full mb-4 shadow-md" alt="Taraksh" />
                            <h4 className="font-bold text-lg text-gray-900">Taraksh Pratap Singh</h4>
                            <span className="text-blue-600 text-sm">Developer</span>
                        </div>
                         <div className="flex flex-col items-center">
                            <img src="https://ui-avatars.com/api/?name=Dishan+Kumar&background=6366f1&color=fff&size=128" className="w-24 h-24 rounded-full mb-4 shadow-md" alt="Dishan" />
                            <h4 className="font-bold text-lg text-gray-900">Dishan</h4>
                            <span className="text-purple-600 text-sm">Developer</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
