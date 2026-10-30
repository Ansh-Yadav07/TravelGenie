import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { spring } from '../../lib/ui';

const ToastContext = createContext(null);
const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
const COLORS = { success: 'var(--green)', error: 'var(--red)', info: 'var(--accent)' };

/** Lightweight HUD-style toasts. Usage: const toast = useToast(); toast('Copied', { tone: 'success' }) */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const show = useCallback((message, { tone = 'info', duration = 2600 } = {}) => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    window.setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const value = useMemo(() => show, [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed inset-x-0 bottom-6 z-[200] flex flex-col items-center gap-2 pointer-events-none px-4 no-print" aria-live="polite" role="status">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = ICONS[t.tone] || Info;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={spring}
                className="material-thick pointer-events-auto flex items-center gap-2.5 rounded-full pl-3.5 pr-5 py-2.5 t-subhead font-medium"
                style={{ boxShadow: 'var(--shadow-lg)', color: 'var(--text)' }}
              >
                <Icon size={18} strokeWidth={2.25} style={{ color: COLORS[t.tone] }} aria-hidden />
                {t.message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
