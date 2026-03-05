import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { destinations } from '../data/mockData';
import { MapPin, Calendar, CheckCircle, Plane, Hotel, CheckSquare } from 'lucide-react';

const DestinationDetails = () => {
    const { id } = useParams();
    const destination = destinations.find(d => d.id === parseInt(id));

    if (!destination) return <div>Destination not found</div>;

    return (
        <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
             <div className="container mx-auto px-4">
                <Link to="/explore" className="text-blue-600 mb-6 flex items-center gap-1 hover:underline">← Back to Explore</Link>
                
                <div className="grid lg:grid-cols-2 gap-12">
                   {/* Image Section */}
                   <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-3xl overflow-hidden shadow-2xl h-[500px]"
                   >
                       <img src={destination.image} alt={destination.name} className="w-full h-full object-cover" />
                   </motion.div>

                   {/* Details Section */}
                   <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                   >
                        <div>
                             <h1 className="text-5xl font-bold text-gray-900 mb-4">{destination.name}</h1>
                             <div className="flex items-center gap-2 mb-4">
                                  <MapPin className="text-red-500 w-5 h-5"/>
                                  <span className="text-gray-600 text-lg">India</span>
                                  <span className="mx-2">•</span>
                                  <span className="text-yellow-500 font-bold">★ {destination.rating} (200+ Reviews)</span>
                             </div>
                             <p className="text-gray-600 text-lg leading-relaxed mb-6">{destination.description}</p>
                             
                             {destination.activities && (
                                <div className="mt-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Popular Activities</h3>
                                    <ul className="space-y-3">
                                        {destination.activities.map((activity, index) => (
                                            <li key={index} className="flex items-start gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                                <div className="bg-green-100 p-2 rounded-full">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 text-sm">{activity.name}</h4>
                                                    <p className="text-xs text-gray-500">{activity.description}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                             )}
                        </div>

                        {/* Booking Options */}
                         <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex-1">
                             <h3 className="text-2xl font-bold text-gray-900 mb-6">Booking Options</h3>
                             <div className="space-y-4">
                                 <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                                     <div className="flex items-center gap-3">
                                         <div className="bg-white p-2 rounded-full shadow-sm">
                                             <Plane className="w-5 h-5 text-blue-600" />
                                         </div>
                                         <div>
                                             <h4 className="font-bold text-gray-900">Flight</h4>
                                             <p className="text-sm text-gray-500">Fastest Route</p>
                                         </div>
                                     </div>
                                     <span className="font-bold text-gray-900">{destination.booking.flight}</span>
                                 </div>

                                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                                     <div className="flex items-center gap-3">
                                         <div className="bg-white p-2 rounded-full shadow-sm">
                                             <Hotel className="w-5 h-5 text-purple-600" />
                                         </div>
                                         <div>
                                             <h4 className="font-bold text-gray-900">Hotel</h4>
                                             <p className="text-sm text-gray-500">Best Reviewed</p>
                                         </div>
                                     </div>
                                     <span className="font-bold text-gray-900">{destination.booking.hotel}</span>
                                 </div>

                                 <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                                     <div className="flex items-center gap-3">
                                         <div className="bg-white p-2 rounded-full shadow-sm">
                                             <CheckSquare className="w-5 h-5 text-green-600" />
                                         </div>
                                         <div>
                                             <h4 className="font-bold text-gray-900">Full Package</h4>
                                             <p className="text-sm text-gray-500">Includes Flight + Hotel</p>
                                         </div>
                                     </div>
                                     <span className="font-bold text-gray-900">{destination.booking.package}</span>
                                 </div>
                             </div>

                             <button className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                 Book Now
                             </button>
                         </div>
                   </motion.div>
                </div>
             </div>
        </div>
    );
};

export default DestinationDetails;
