import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Button } from '../ui';
import { cx, spring } from '../../lib/ui';

/**
 * Inline confirmation popover anchored to its trigger (replaces confirm()).
 *
 * renderTrigger(props) must spread `props` (ref, onClick, aria-*) onto a
 * focusable element. Escape / outside click cancel and focus returns to the
 * trigger.
 */
export default function ConfirmPopover({
  renderTrigger,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  align = 'right',
  placement = 'bottom',
  className,
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const cancelRef = useRef(null);

  const close = (restore = true) => {
    setOpen(false);
    if (restore) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const triggerProps = {
    ref: triggerRef,
    onClick: (e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); },
    'aria-expanded': open,
    'aria-haspopup': 'dialog',
    'aria-controls': open ? id : undefined,
  };

  return (
    <div ref={rootRef} className={cx('relative inline-flex', className)}>
      {renderTrigger(triggerProps)}
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            role="alertdialog"
            aria-modal="false"
            aria-labelledby={`${id}-t`}
            aria-describedby={message ? `${id}-m` : undefined}
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: placement === 'top' ? 6 : -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
            transition={spring}
            className={cx(
              'absolute z-40 w-[min(280px,calc(100vw-32px))] card p-4 text-left',
              placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
              align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            )}
            style={{ boxShadow: 'var(--shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p id={`${id}-t`} className="t-headline">{title}</p>
            {message && <p id={`${id}-m`} className="t-footnote t-secondary mt-1">{message}</p>}
            <div className="flex gap-2 mt-4">
              <Button ref={cancelRef} variant="secondary" size="sm" className="flex-1 min-h-[44px]" onClick={(e) => { e.preventDefault(); close(); }}>
                Cancel
              </Button>
              <button
                type="button"
                className="btn btn-sm flex-1 min-h-[44px]"
                style={{ background: 'var(--red)', color: 'var(--text-on-accent)' }}
                onClick={(e) => { e.preventDefault(); close(false); onConfirm?.(); }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
