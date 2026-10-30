import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Compass, Home as HomeIcon, Sparkles } from 'lucide-react';
import { Button } from '../components/ui';

export default function NotFound() {
  const { pathname } = useLocation();
  useEffect(() => { document.title = 'Page not found · TravelGenie'; }, []);

  return (
    <div className="page-top pb-24 container-x min-h-[72vh] flex items-center justify-center">
      <div className="text-center max-w-[560px]">
        <span
          className="mx-auto w-16 h-16 rounded-[20px] flex items-center justify-center"
          style={{ background: 'var(--fill)', color: 'var(--text-2)' }}
        >
          <Compass size={30} strokeWidth={1.75} aria-hidden />
        </span>
        <p className="t-eyebrow mt-8">404</p>
        <h1 className="t-display mt-2">This page took a detour.</h1>
        <p className="t-body t-secondary mt-4">
          We couldn’t find <span className="font-medium break-all" style={{ color: 'var(--text)' }}>{pathname}</span>.
          The link may be old, or the page may have moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button to="/" variant="secondary" icon={HomeIcon}>Home</Button>
          <Button to="/plan" icon={Sparkles}>Plan a trip</Button>
        </div>
      </div>
    </div>
  );
}
