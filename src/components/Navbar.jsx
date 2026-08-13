import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import logo from '../assets/logo.png';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
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

  useEffect(() => setIsOpen(false), [location.pathname]);

  return (
    <nav
      id="main-nav"
      className="fixed w-full z-50 transition-all duration-300"
      style={{
        backgroundColor: isScrolled ? 'rgba(11, 13, 12, 0.85)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        borderBottom: isScrolled ? '1px solid var(--border)' : '1px solid transparent',
        padding: isScrolled ? '14px 0' : '20px 0',
      }}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5" id="nav-logo">
          <img
            src={logo}
            alt="TravelGenie"
            className="w-8 h-8 object-contain rounded-lg"
          />
          <span className="text-base font-semibold" style={{ color: 'var(--text)' }}>
            TravelGenie
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.label}
                to={link.to}
                id={`nav-${link.label.toLowerCase()}`}
                className="px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                style={{
                  color: isActive ? 'var(--text)' : 'var(--text-2)',
                  backgroundColor: isActive ? 'var(--surface)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text-2)';
                }}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="w-px h-5 mx-3" style={{ backgroundColor: 'var(--border)' }} />

          <button
            id="nav-signin"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#0B0D0C',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-h)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
          >
            Sign In
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          id="nav-mobile-toggle"
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-2)' }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{
              backgroundColor: 'var(--surface)',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium"
                    style={{
                      color: isActive ? 'var(--text)' : 'var(--text-2)',
                      backgroundColor: isActive ? 'var(--surface-2)' : 'transparent',
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <button
                className="mt-2 px-4 py-2.5 rounded-lg text-sm font-medium w-full"
                style={{ backgroundColor: 'var(--accent)', color: '#0B0D0C' }}
              >
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
