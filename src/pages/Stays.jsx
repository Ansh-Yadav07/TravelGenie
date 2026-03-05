import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { stays } from '../data/mockData';
import { MapPin, Star, Wifi, Coffee, Utensils, Waves } from 'lucide-react';

const Stays = () => {
    return (
        <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                     <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold tracking-wider mb-4 uppercase">
                        Luxury Accommodation
                    </span>
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">Find Your Perfect Stay</h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Discover handpicked hotels, resorts, and villas that offer the best in comfort and style.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {stays.map((stay, index) => (
                        <motion.div
                            key={stay.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <img 
                                    src={stay.image} 
                                    alt={stay.name} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-800 shadow-sm flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {stay.rating}
                                </div>
                                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide">
                                    {stay.type}
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{stay.name}</h3>
                                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                                            <MapPin className="w-4 h-4" /> {stay.location}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-blue-600">{stay.price}</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Amenities</p>
                                    <div className="flex flex-wrap gap-2">
                                        {stay.amenities.map((amenity, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-100">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button className="w-full mt-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors">
                                    Check Availability
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Stays;
