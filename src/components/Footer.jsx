import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Github, Heart, ArrowUpRight } from 'lucide-react';
import logo from '../assets/logo.png';

const footerLinks = {
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  Support: [
    { label: 'Contact', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
  Product: [
    { label: 'Explore', to: '/explore' },
    { label: 'AI Planner', href: '/#ai-planner' },
    { label: 'Stays', to: '/stays' },
  ],
};

const socialLinks = [
  { icon: <Facebook size={18} />, href: '#', label: 'Facebook' },
  { icon: <Twitter size={18} />, href: '#', label: 'Twitter' },
  { icon: <Instagram size={18} />, href: '#', label: 'Instagram' },
  { icon: <Linkedin size={18} />, href: '#', label: 'LinkedIn' },
  { icon: <Github size={18} />, href: '#', label: 'GitHub' },
];

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-slate-950 relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute inset-0 mesh-bg opacity-20" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Main footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5 group">
              <img src={logo} alt="TravelGenie Logo" className="w-10 h-10 object-contain rounded-full ring-2 ring-blue-500/20" />
              <span className="text-xl font-bold text-gradient" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>TravelGenie</span>
            </Link>
            <p className="text-gray-500 leading-relaxed text-sm mb-6 max-w-sm">
              Your AI-powered travel companion. Discover new places, plan smarter, and make memories that last a lifetime.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-widest">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => {
                  const Component = link.to ? Link : 'a';
                  const props = link.to ? { to: link.to } : { href: link.href };
                  return (
                    <li key={link.label}>
                      <Component {...props} className="text-gray-500 hover:text-white text-sm transition-colors flex items-center gap-1 group">
                        {link.label}
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Component>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            © 2026 TravelGenie Inc. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 flex items-center gap-1">
            Made with <Heart size={12} className="text-red-400 fill-red-400" /> and Gemini AI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
