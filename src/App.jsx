import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './components/ui/Toast';
import { Spinner } from './components/ui';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import { getHealth } from './lib/api';

const Plan = lazy(() => import('./pages/Plan'));
const TripResult = lazy(() => import('./pages/TripResult'));
const Trips = lazy(() => import('./pages/Trips'));
const Explore = lazy(() => import('./pages/Explore'));
const DestinationDetails = lazy(() => import('./pages/DestinationDetails'));
const Stays = lazy(() => import('./pages/Stays'));
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));

/** Reset scroll on navigation (keeps #hash anchors working). */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

function PageFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center" style={{ color: 'var(--text-3)' }}>
      <Spinner size={24} />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const reduce = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduce ? undefined : { opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <Suspense fallback={<PageFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/trip/:id" element={<TripResult />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/:slug" element={<DestinationDetails />} />
            <Route path="/stays" element={<Stays />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  // Wake a sleeping backend early, so the first plan doesn't wait for a cold start.
  useEffect(() => { getHealth().catch(() => {}); }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[300] btn btn-primary btn-sm">Skip to content</a>
          <div className="backdrop" aria-hidden="true" />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main id="main" className="flex-1">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
