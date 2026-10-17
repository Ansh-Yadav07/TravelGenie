import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import DestinationDetails from './pages/DestinationDetails';
import TripResult from './pages/TripResult';
import Stays from './pages/Stays';
import About from './pages/About';
import Footer from './components/Footer';

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/:id" element={<DestinationDetails />} />
          <Route path="/stays" element={<Stays />} />
          <Route path="/about" element={<About />} />
          <Route path="/trip-result" element={<TripResult />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.5 origin-left z-[100]"
      style={{ scaleX, background: 'linear-gradient(90deg, var(--accent), #7C5CFF)' }}
    />
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col antialiased">
        <ScrollProgress />
        <Navbar />
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
