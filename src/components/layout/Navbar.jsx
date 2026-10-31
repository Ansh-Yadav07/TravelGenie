import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Menu, Monitor, Moon, Sun, X } from 'lucide-react';

import Logo from '../ui/Logo';
import { Button, SegmentedControl } from '../ui';
import { useTheme } from '../../hooks/useTheme';
import { useSavedTrips, useScrolledPast } from '../home/hooks';
import { cx, spring } from '../../lib/ui';

const LINKS = [
  { to: '/plan', label: 'Plan' },
  { to: '/explore', label: 'Explore' },
  { to: '/stays', label: 'Stays' },
  { to: '/trips', label: 'Trips', badge: true },
  { to: '/about', label: 'About' },
];

const THEMES = [
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
];

export default function Navbar() {
  const location = useLocation();
  const scrolled = useScrolledPast(8);
  const tripCount = useSavedTrips().length;
  const headerRef = useRef(null);
  const toggleRef = useRef(null);
  const reduce = useReducedMotion();

  // The sheet is "open for" one location entry, so any navigation closes it
  // without syncing state in an effect.
  const [openFor, setOpenFor] = useState(null);
  const menuOpen = openFor === location.key;
  const closeMenu = () => setOpenFor(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpenFor(null); toggleRef.current?.focus(); }
    };
    const onPointer = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setOpenFor(null);
    };
    const onResize = () => { if (window.innerWidth >= 768) setOpenFor(null); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  const solid = scrolled || menuOpen;

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-[100] no-print">
      <div
        className={cx('relative transition-[background-color,border-color,backdrop-filter] duration-300', solid ? 'material' : 'bg-transparent')}
        style={{ borderBottom: `1px solid ${solid && !menuOpen ? 'var(--separator)' : 'transparent'}` }}
      >
        <nav aria-label="Main" className="container-x flex items-center justify-between gap-4" style={{ height: 'var(--nav-height)' }}>
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2 shrink-0 -ml-1 px-1 rounded-[10px]" aria-label="TravelGenie home">
            <Logo size={28} />
            <span className="text-[17px] font-semibold tracking-[-0.02em]" style={{ color: 'var(--text)' }}>TravelGenie</span>
          </Link>

          <ul className="hidden md:flex items-center gap-0.5">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) => cx(
                    'relative inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[14px] transition-colors duration-200',
                    isActive ? 'font-medium text-text' : 'text-text-2 hover:text-text',
                  )}
                >
                  {l.label}
                  {l.badge && tripCount > 0 && <CountBadge count={tripCount} />}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <div className="hidden md:block"><ThemeMenu /></div>
            <Button to="/plan" size="sm" className="hidden md:inline-flex !min-h-[32px] !px-3.5 !text-[14px]">Plan a trip</Button>
            <button
              ref={toggleRef}
              type="button"
              className="md:hidden btn btn-plain btn-icon !w-11 !min-h-11 -mr-2"
              style={{ color: 'var(--text)' }}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setOpenFor(menuOpen ? null : location.key)}
            >
              {menuOpen ? <X size={22} strokeWidth={1.75} aria-hidden /> : <Menu size={22} strokeWidth={1.75} aria-hidden />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="scrim"
              className="md:hidden fixed inset-0 -z-10"
              style={{ top: 'var(--nav-height)', background: 'rgba(0,0,0,0.28)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
              aria-hidden
            />
            <motion.div
              key="sheet"
              id="mobile-menu"
              className="md:hidden material-thick hairline-b overflow-y-auto"
              style={{ maxHeight: 'calc(100dvh - var(--nav-height))' }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={reduce ? { duration: 0.15 } : spring}
            >
              <nav aria-label="Mobile" className="container-x pt-3 pb-8">
                <ul>
                  {LINKS.map((l) => (
                    <li key={l.to} className="hairline-b">
                      <NavLink
                        to={l.to}
                        onClick={closeMenu}
                        className={({ isActive }) => cx(
                          'flex items-center justify-between min-h-[56px] text-[24px] font-semibold tracking-[-0.02em] rounded-[10px]',
                          isActive ? 'text-text' : 'text-text-2',
                        )}
                      >
                        {l.label}
                        {l.badge && tripCount > 0 && <CountBadge count={tripCount} large />}
                      </NavLink>
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <p className="field-label">Appearance</p>
                  <MobileThemeControl />
                </div>
                <Button to="/plan" size="lg" className="w-full mt-7" onClick={closeMenu}>Plan a trip</Button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function CountBadge({ count, large }) {
  return (
    <span
      className={cx('inline-flex items-center justify-center rounded-full tabular font-semibold', large ? 'min-w-[24px] h-6 px-2 text-[13px]' : 'min-w-[18px] h-[18px] px-1.5 text-[11px]')}
      style={{ background: 'var(--accent-soft)', color: 'var(--accent-text)' }}
      aria-label={`${count} saved`}
    >
      {count}
    </span>
  );
}

function MobileThemeControl() {
  const { preference, setPreference } = useTheme();
  return <SegmentedControl label="Appearance" options={THEMES} value={preference} onChange={setPreference} />;
}

/** Appearance popover: System / Light / Dark, as a menu of radio items. */
function ThemeMenu() {
  const { preference, resolved, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const itemRefs = useRef([]);
  const menuId = useId();
  const reduce = useReducedMotion();

  const CurrentIcon = preference === 'system' ? Monitor : resolved === 'dark' ? Moon : Sun;

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); } };
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    const i = THEMES.findIndex((t) => t.id === preference);
    const raf = requestAnimationFrame(() => itemRefs.current[i]?.focus());
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(raf);
    };
  }, [open, preference]);

  const onMenuKey = (e) => {
    const items = itemRefs.current.filter(Boolean);
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
    if (e.key === 'Home') { e.preventDefault(); items[0]?.focus(); }
    if (e.key === 'End') { e.preventDefault(); items[items.length - 1]?.focus(); }
    if (e.key === 'Tab') setOpen(false);
  };

  const choose = (id) => {
    setPreference(id);
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-plain btn-icon !w-9 !min-h-9"
        style={{ color: 'var(--text-2)' }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Appearance: ${THEMES.find((t) => t.id === preference)?.label}`}
        title="Appearance"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); } }}
      >
        <CurrentIcon size={17} strokeWidth={1.9} aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label="Appearance"
            onKeyDown={onMenuKey}
            className="absolute right-0 top-[calc(100%+8px)] w-48 p-1.5 rounded-[14px] material-thick"
            style={{ boxShadow: 'var(--shadow-lg)', border: '1px solid var(--separator)', transformOrigin: 'top right' }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -2 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {THEMES.map((t, i) => {
              const Icon = t.icon;
              const active = t.id === preference;
              return (
                <button
                  key={t.id}
                  ref={(el) => { itemRefs.current[i] = el; }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  tabIndex={-1}
                  onClick={() => choose(t.id)}
                  className="w-full flex items-center gap-2.5 min-h-[40px] px-2.5 rounded-[9px] text-[15px] text-left transition-colors hover:bg-fill focus-visible:bg-fill"
                  style={{ color: 'var(--text)' }}
                >
                  <Icon size={16} strokeWidth={1.9} aria-hidden style={{ color: 'var(--text-2)' }} />
                  <span className="flex-1">{t.label}</span>
                  {active && <Check size={16} strokeWidth={2.25} aria-hidden style={{ color: 'var(--accent)' }} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
