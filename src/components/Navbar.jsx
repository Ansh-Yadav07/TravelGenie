import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md py-4' : 'bg-white/10 backdrop-blur-sm py-6 border-b border-white/10'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <img src={logo} alt="TravelGenie Logo" className="w-10 h-10 object-contain rounded-full" />
          <span className="text-gray-800">TravelGenie</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`font-bold transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-black-700 hover:text-blue-600'}`}>Home</Link>
          <Link to="/explore" className={`font-bold transition-colors ${location.pathname === '/explore' ? 'text-blue-600' : 'text-black-700 hover:text-blue-600'}`}>Explore</Link>
          <a href="/#ai-planner" className="font-bold text-black-700 hover:text-blue-600 transition-colors">AI Planner</a>
          <Link to="/stays" className={`font-bold transition-colors ${location.pathname === '/stays' ? 'text-blue-600' : 'text-black-700 hover:text-blue-600'}`}>Stays</Link>
          <Link to="/about" className={`font-bold transition-colors ${location.pathname === '/about' ? 'text-blue-600' : 'text-black-700 hover:text-blue-600'}`}>About Us</Link>
          <button className="bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
            Sign In
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-700" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md absolute top-full left-0 w-full shadow-lg py-4 px-6 flex flex-col space-y-4 animate-fade-in-down">
          <Link to="/" className="font-medium text-gray-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/explore" className="font-medium text-gray-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>Explore</Link>
          <a href="/#ai-planner" className="font-medium text-gray-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>AI Planner</a>
          <Link to="/stays" className="font-medium text-gray-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>Stays</Link>
          <Link to="/about" className="font-medium text-gray-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>About Us</Link>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium w-full">
            Sign In
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
