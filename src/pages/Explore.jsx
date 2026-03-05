import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search } from 'lucide-react';
import { destinations } from '../data/mockData';
import { Link } from 'react-router-dom';

const Explore = () => {
    return (
        <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
             <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                     <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Destinations</h1>
                     <p className="text-gray-600 max-w-2xl mx-auto">Discover the most popular and hidden gems for your next adventure.</p>
                </div>

                <div className="flex justify-center mb-12">
                    <div className="relative w-full max-w-md">
                        <input type="text" placeholder="Search destination..." className="w-full px-4 py-3 pl-10 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500" />
                         <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5"/>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {destinations.map((dest, index) => (
                        <motion.div
                            key={dest.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-gray-800 shadow-sm flex items-center gap-1">
                                    ★ {dest.rating}
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{dest.name}</h3>
                                    <span className="text-lg font-bold text-green-600">{dest.price}</span>
                                </div>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{dest.description}</p>
                                <Link 
                                    to={`/explore/${dest.id}`}
                                    className="block w-full text-center py-2.5 rounded-xl bg-blue-50 text-blue-600 font-semibold hover:bg-blue-600 hover:text-white transition-all"
                                >
                                    View Details
                                </Link>
                            </div>
                        </motion.div>
                     ))}
                </div>
            </div>
        </div>
    );
};

export default Explore;
