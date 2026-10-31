/**
 * TravelGenie UI primitives (Apple HIG inspired). Import from 'components/ui'.
 * Styling lives in index.css component classes; these components add
 * behaviour and accessibility.
 */
import { forwardRef, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Minus, Plus, ChevronRight } from 'lucide-react';

import { cx, spring } from '../../lib/ui';

/* ── Button ────────────────────────────────────────────────────────── */
/**
 * variant: primary | secondary | tinted | plain | destructive
 * size: sm | md | lg
 * Renders <Link> when `to` is set, <a> when `href` is set.
 */
export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', to, href, loading = false, icon: Icon, iconRight: IconRight, className, children, disabled, ...rest },
  ref,
) {
  const classes = cx('btn', `btn-${variant}`, size !== 'md' && `btn-${size}`, className);
  const content = (
    <>
      {loading ? <Spinner size={16} /> : Icon ? <Icon size={size === 'sm' ? 15 : 17} strokeWidth={2} aria-hidden /> : null}
      {children}
      {IconRight && !loading ? <IconRight size={size === 'sm' ? 15 : 17} strokeWidth={2} aria-hidden /> : null}
    </>
  );
  if (to) return <Link ref={ref} to={to} className={classes} {...rest}>{content}</Link>;
  if (href) return <a ref={ref} href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>{content}</a>;
  return (
    <button ref={ref} type="button" className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
});

export function IconButton({ icon: Icon, label, className, size = 18, ...rest }) {
  return (
    <button type="button" aria-label={label} title={label} className={cx('btn btn-secondary btn-icon', className)} {...rest}>
      <Icon size={size} strokeWidth={2} aria-hidden />
    </button>
  );
}

/** Text link with trailing chevron, like apple.com "Learn more >" */
export function ChevronLink({ to, href, children, className }) {
  const inner = <>{children}<ChevronRight size={16} strokeWidth={2.25} aria-hidden className="translate-y-px" /></>;
  if (href) return <a href={href} className={cx('link', className)} target="_blank" rel="noopener noreferrer">{inner}</a>;
  return <Link to={to} className={cx('link', className)}>{inner}</Link>;
}

/* ── Spinner ───────────────────────────────────────────────────────── */
export function Spinner({ size = 20, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={cx('animate-spin-smooth', className)} aria-hidden>
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── SegmentedControl ──────────────────────────────────────────────── */
/**
 * iOS segmented control with a sliding thumb.
 * options: [{ id, label, icon? }]
 */
export function SegmentedControl({ options, value, onChange, label, size = 'md', className, fullWidth = true }) {
  const groupId = useId();
  const reduce = useReducedMotion();
  const onKeyDown = (e) => {
    const i = options.findIndex((o) => o.id === value);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); onChange(options[(i + 1) % options.length].id); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); onChange(options[(i - 1 + options.length) % options.length].id); }
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cx('relative inline-flex p-[3px] rounded-[11px]', fullWidth && 'w-full', className)}
      style={{ background: 'var(--fill)' }}
    >
      {options.map((o) => {
        const active = o.id === value;
        const Icon = o.icon;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.id)}
            className={cx(
              'relative flex-1 flex items-center justify-center gap-1.5 rounded-[9px] font-medium transition-colors duration-200 whitespace-nowrap',
              size === 'sm' ? 'min-h-[30px] px-3 text-[13px]' : 'min-h-[36px] px-3.5 text-[15px]',
            )}
            style={{ color: active ? 'var(--text)' : 'var(--text-2)' }}
          >
            {active && (
              <motion.span
                layoutId={`seg-${groupId}`}
                transition={reduce ? { duration: 0 } : spring}
                className="absolute inset-0 rounded-[9px]"
                style={{ background: 'var(--surface)', boxShadow: '0 3px 8px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.04)' }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {Icon && <Icon size={15} strokeWidth={2} aria-hidden />}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Stepper ───────────────────────────────────────────────────────── */
export function Stepper({ value, onChange, min = 1, max = 99, label, format = (v) => v, className }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className={cx('flex items-center justify-between gap-3 rounded-[12px] min-h-[48px] px-1.5', className)} style={{ background: 'var(--fill)' }}>
      <button type="button" onClick={dec} disabled={value <= min} aria-label={`Decrease ${label}`} className="btn btn-icon disabled:opacity-30" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}>
        <Minus size={16} strokeWidth={2.5} aria-hidden />
      </button>
      <output aria-live="polite" aria-label={label} className="t-headline tabular text-center flex-1 select-none">{format(value)}</output>
      <button type="button" onClick={inc} disabled={value >= max} aria-label={`Increase ${label}`} className="btn btn-icon disabled:opacity-30" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}>
        <Plus size={16} strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}

/* ── Chip (toggle) ─────────────────────────────────────────────────── */
export function Chip({ selected, onClick, icon: Icon, children, className, disabled, ...rest }) {
  return (
    <button type="button" className={cx('chip disabled:opacity-40', className)} aria-pressed={!!selected} onClick={onClick} disabled={disabled} {...rest}>
      {Icon && <Icon size={15} strokeWidth={2} aria-hidden />}
      {children}
    </button>
  );
}

/* ── Field + TextInput ─────────────────────────────────────────────── */
export function Field({ label, hint, error, htmlFor, children, className, optional }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="field-label">
          {label}
          {optional && <span className="font-normal t-tertiary"> · Optional</span>}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="t-footnote mt-1.5" style={{ color: 'var(--red-text)' }}>{error}</p>
      ) : hint ? (
        <p className="t-footnote mt-1.5 t-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}

export const TextInput = forwardRef(function TextInput({ icon: Icon, error, className, ...rest }, ref) {
  return (
    <div className="relative">
      {Icon && <Icon size={18} strokeWidth={2} aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-3)' }} />}
      <input ref={ref} className={cx('input', Icon && 'pl-11', className)} aria-invalid={error ? true : undefined} {...rest} />
    </div>
  );
});

/* ── Card ──────────────────────────────────────────────────────────── */
export function Card({ as: As = 'div', interactive, flat, className, children, ...rest }) {
  return <As className={cx(flat ? 'card-flat' : 'card', interactive && 'card-interactive', className)} {...rest}>{children}</As>;
}

export function Badge({ tone, icon: Icon, children, className }) {
  return (
    <span className={cx('badge', tone && `badge-${tone}`, className)}>
      {Icon && <Icon size={12} strokeWidth={2.5} aria-hidden />}
      {children}
    </span>
  );
}

/* ── Section header ────────────────────────────────────────────────── */
export function SectionHeader({ eyebrow, title, subtitle, align = 'left', action, className }) {
  return (
    <div className={cx('flex flex-col gap-3 mb-10 md:mb-14', align === 'center' && 'items-center text-center', action && 'md:flex-row md:items-end md:justify-between', className)}>
      <div className={cx(align === 'center' && 'max-w-2xl')}>
        {eyebrow && <p className="t-eyebrow mb-2">{eyebrow}</p>}
        <h2 className="t-display">{title}</h2>
        {subtitle && <p className="t-body t-secondary mt-4 max-w-2xl" style={align === 'center' ? { marginInline: 'auto' } : undefined}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Reveal (scroll-in animation) ──────────────────────────────────── */
export function Reveal({ children, delay = 0, y = 24, className, as = 'div', once = true }) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/* ── EmptyState ────────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, message, action, className }) {
  return (
    <div className={cx('flex flex-col items-center text-center py-20 px-6', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-5" style={{ background: 'var(--fill)', color: 'var(--text-2)' }}>
          <Icon size={28} strokeWidth={1.75} aria-hidden />
        </div>
      )}
      <h3 className="t-title-3 mb-2">{title}</h3>
      {message && <p className="t-callout t-secondary max-w-sm">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ── SmartImage: fades in, falls back to a neutral panel on error ──────── */
export function SmartImage({ src, alt, className, imgClassName, fallbackLabel, loading = 'lazy', ...rest }) {
  const [state, setState] = useState('loading');
  return (
    <div className={cx('img-frame', className)} {...rest}>
      {state !== 'error' && src ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={cx('transition-opacity duration-500', state === 'loaded' ? 'opacity-100' : 'opacity-0', imgClassName)}
        />
      ) : (
        <div className="absolute inset-0 flex items-end p-4" style={{ background: 'linear-gradient(160deg, #48484a 0%, #1c1c1e 100%)' }}>
          {fallbackLabel && <span className="t-title-3" style={{ color: '#fff' }}>{fallbackLabel}</span>}
        </div>
      )}
    </div>
  );
}
