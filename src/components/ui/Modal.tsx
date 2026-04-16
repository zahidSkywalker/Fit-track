import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showClose?: boolean;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-[calc(100%-32px)]',
};

const heightClasses = {
  sm: 'max-h-[60vh]',
  md: 'max-h-[70vh]',
  lg: 'max-h-[80vh]',
  full: 'max-h-[85vh]',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  className = '',
}) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [onClose, closeOnEscape]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/25 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnOverlay ? onClose : undefined}
          />

          {/* Content */}
          <motion.div
            className={[
              'relative w-full mx-4 mb-4 sm:mb-0 neu-raised-lg overflow-hidden flex flex-col',
              sizeClasses[size],
              heightClasses[size],
              className,
            ].join(' ')}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 30,
            }}
          >
            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-neu-bg-dark/15 flex-shrink-0">
                {title && (
                  <h2 className="text-base font-bold text-neu-text">
                    {title}
                  </h2>
                )}
                {showClose && (
                  <motion.button
                    onClick={onClose}
                    className="neu-raised-circle w-8 h-8 flex items-center justify-center neu-pressable ml-auto"
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close"
                  >
                    <X size={16} className="text-neu-text-secondary" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 hide-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ===== Bottom Sheet Variant ===== */
interface BottomSheetProps extends Omit<ModalProps, 'size'> {
  dragHandle?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showClose = false,
  closeOnOverlay = true,
  closeOnEscape = true,
  dragHandle = true,
  className = '',
}) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) onClose();
    },
    [onClose, closeOnEscape]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-black/25 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnOverlay ? onClose : undefined}
          />

          <motion.div
            className={[
              'relative w-full bg-neu-bg rounded-t-3xl overflow-hidden flex flex-col',
              'max-h-[85vh]',
              className,
            ].join(' ')}
            style={{
              boxShadow: '0 -8px 24px rgba(200, 191, 181, 0.2)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            {/* Drag handle */}
            {dragHandle && (
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-neu-bg-dark/40" />
              </div>
            )}

            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-neu-bg-dark/10 flex-shrink-0">
                {title && (
                  <h2 className="text-base font-bold text-neu-text">
                    {title}
                  </h2>
                )}
                {showClose && (
                  <motion.button
                    onClick={onClose}
                    className="neu-raised-circle w-8 h-8 flex items-center justify-center neu-pressable ml-auto"
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close"
                  >
                    <X size={16} className="text-neu-text-secondary" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Body */}
            <div
              className="overflow-y-auto flex-1 p-5 hide-scrollbar"
              style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
