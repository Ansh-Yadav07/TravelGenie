import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { href: '/#ai-planner', label: 'AI Planner' },
  { to: '/stays', label: 'Stays' },
  { to: '/about', label: 'About' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav
      id="main-nav"
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-slate-950/80 backdrop-blur-2xl shadow-lg shadow-black/20 py-3 border-b border-white/5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group" id="nav-logo">
          <div className="relative">
            <img src={logo} alt="TravelGenie Logo" className="w-10 h-10 object-contain rounded-full ring-2 ring-blue-500/30 group-hover:ring-blue-400/60 transition-all" />
            <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xl font-bold text-gradient" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            TravelGenie
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = link.to && location.pathname === link.to;
            const Component = link.to ? Link : 'a';
            const props = link.to ? { to: link.to } : { href: link.href };

            return (
              <Component
                key={link.label}
                {...props}
                id={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"
                  />
                )}
              </Component>
            );
          })}

          <button
            id="nav-signin"
            className="ml-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2"
          >
            <Sparkles size={14} />
            Sign In
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          id="nav-mobile-toggle"
          className="md:hidden text-gray-300 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-2xl border-t border-white/5 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = link.to && location.pathname === link.to;
                const Component = link.to ? Link : 'a';
                const props = link.to ? { to: link.to } : { href: link.href };

                return (
                  <Component
                    key={link.label}
                    {...props}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'text-blue-400 bg-blue-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Component>
                );
              })}
              <button className="mt-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-semibold w-full flex items-center justify-center gap-2">
                <Sparkles size={14} />
                Sign In
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
