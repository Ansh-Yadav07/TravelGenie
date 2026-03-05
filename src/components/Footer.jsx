import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import logo from '../assets/logo.png';

const Footer = () => {
    return (
        <footer className="bg-gray-900 border-t border-gray-800 text-gray-300 py-16">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
                    {/* Brand */}
                    <div className="max-w-md">
                        <a href="#" className="flex items-center gap-2 text-2xl font-bold mb-4 text-white">
                            <img src={logo} alt="TravelGenie Logo" className="w-10 h-10 object-contain rounded-full" />
                            TravelGenie
                        </a>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            Your AI-powered travel companion. Discover new places, plan smarter, and make memories that last a lifetime.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex gap-16 flex-wrap">
                        <div>
                            <h4 className="text-white font-semibold mb-4 tracking-wider uppercase text-sm">Company</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4 tracking-wider uppercase text-sm">Support</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-sm text-gray-500">
                        &copy; 2026 TravelGenie Inc. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Facebook size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors"><Instagram size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Linkedin size={20} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
