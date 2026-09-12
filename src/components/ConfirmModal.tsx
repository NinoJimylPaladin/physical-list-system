import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="confirm-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLoading) {
            onClose();
          }
        }}
      >
        <motion.div
          id="confirm-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200/80 text-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          {/* Close X Button */}
          <button
            id="confirm-modal-close-button"
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Destructive / Warning Icon */}
          <div
            className={`mx-auto mb-4 w-12 h-12 rounded-2xl flex items-center justify-center border ${
              isDestructive
                ? 'bg-rose-50 border-rose-100 text-rose-600'
                : 'bg-amber-50 border-amber-100 text-amber-600'
            }`}
          >
            {isDestructive ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>

          {/* Title & Description */}
          <h2
            id="confirm-modal-title"
            className="text-lg font-black text-slate-900 tracking-tight"
          >
            {title}
          </h2>
          <p
            id="confirm-modal-description"
            className="mt-1.5 text-xs text-slate-500 leading-relaxed"
          >
            {description}
          </p>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center gap-3">
            <button
              id="confirm-modal-cancel-button"
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              id="confirm-modal-confirm-button"
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                  : 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  {isDestructive && <Trash2 className="w-3.5 h-3.5" />}
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
