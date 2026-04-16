import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ===== Toast Types ===== */
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider />');
  return ctx;
};

/* ===== Toast Config ===== */
const TOAST_CONFIG: Record<ToastType, { icon: React.ReactNode; color: string; bg: string }> = {
  success: {
    icon: <CheckCircle size={18} />,
    color: '#6BB88A',
    bg: 'rgba(142, 205, 168, 0.15)',
  },
  error: {
    icon: <XCircle size={18} />,
    color: '#C05A50',
    bg: 'rgba(212, 117, 107, 0.15)',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    color: '#D4906A',
    bg: 'rgba(232, 168, 124, 0.15)',
  },
  info: {
    icon: <Info size={18} />,
    color: '#5A8DB8',
    bg: 'rgba(123, 167, 204, 0.15)',
  },
};

const DEFAULT_DURATION = 3500;

/* ===== Toast Provider ===== */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, duration: number = DEFAULT_DURATION) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const toast: Toast = { id, type, message, duration };
      setToasts((prev) => [...prev.slice(-4), toast]); // max 5 toasts visible

      const timer = setTimeout(() => removeToast(id), duration);
      timersRef.current.set(id, timer);
    },
    [removeToast]
  );

  const success = useCallback((msg: string, dur?: number) => showToast('success', msg, dur), [showToast]);
  const error = useCallback((msg: string, dur?: number) => showToast('error', msg, dur), [showToast]);
  const warning = useCallback((msg: string, dur?: number) => showToast('warning', msg, dur), [showToast]);
  const info = useCallback((msg: string, dur?: number) => showToast('info', msg, dur), [showToast]);

  const contextValue: ToastContextValue = {
    showToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast container */}
      <div
        className="fixed top-4 left-4 right-4 z-[100] flex flex-col items-center gap-2 pointer-events-none"
        style={{ paddingTop: 'env(safe-area-inset-top, 16px)' }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const config = TOAST_CONFIG[toast.type];
            return (
              <motion.div
                key={toast.id}
                className="pointer-events-auto w-full max-w-sm"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                layout
              >
                <div
                  className="neu-raised flex items-center gap-3 px-4 py-3"
                  style={{ backgroundColor: config.bg }}
                >
                  <span style={{ color: config.color }} className="flex-shrink-0">
                    {config.icon}
                  </span>
                  <p className="flex-1 text-sm font-medium text-neu-text leading-snug">
                    {toast.message}
                  </p>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="flex-shrink-0 text-neu-text-tertiary hover:text-neu-text transition-colors p-0.5"
                    aria-label="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
