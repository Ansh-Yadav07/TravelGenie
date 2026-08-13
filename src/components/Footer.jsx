import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const footerLinks = {
  Product: [
    { label: 'Explore', to: '/explore' },
    { label: 'Stays', to: '/stays' },
    { label: 'Trip Planner', href: '/#trip-form' },
  ],
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  Support: [
    { label: 'Contact', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
};

const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border)' }}>
      <div className="container mx-auto px-6">
        {/* Main */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src={logo} alt="TravelGenie" className="w-8 h-8 object-contain rounded-lg" />
              <span className="text-base font-semibold" style={{ color: 'var(--text)' }}>TravelGenie</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-2)' }}>
              Your travel companion. Discover new places, plan smarter, and make memories that last.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => {
                  const Component = link.to ? Link : 'a';
                  const props = link.to ? { to: link.to } : { href: link.href };
                  return (
                    <li key={link.label}>
                      <Component
                        {...props}
                        className="text-sm transition-colors"
                        style={{ color: 'var(--text-2)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-2)'}
                      >
                        {link.label}
                      </Component>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="py-5 flex flex-col md:flex-row justify-between items-center gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>
            © 2026 TravelGenie. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
