import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { destinations } from '../data/mockData';

const Destinations = () => {
    return (
        <section id="destinations" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <span className="inline-block py-1 px-3 rounded-full bg-red-100 text-orange-600 text-xs font-semibold tracking-wider mb-4 uppercase">
                            Trending Now
                        </span>
                        <h2 className="text-4xl font-bold text-gray-900">Popular Destinations</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {destinations.map((dest, index) => (
                        <motion.div
                            key={dest.id}
                            initial={{ scale: 0.95, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.03 }}
                            className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 group cursor-pointer"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-800 shadow-sm flex items-center gap-1">
                                    ★ {dest.rating}
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {dest.name}
                                    </h3>
                                    <span className="text-lg font-bold text-green-600">
                                        {dest.price}
                                    </span>
                                </div>
                                <p className="text-gray-500 mb-4 text-sm line-clamp-2">
                                    Experience the magic of {dest.name} with our curated packages including flights, stays, and activities.
                                </p>
                                <Link 
                                    to={`/explore/${dest.id}`}
                                    className="block w-full text-center py-3 rounded-xl bg-gray-50 text-gray-700 font-semibold group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
                                >
                                    View Details
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Destinations;
