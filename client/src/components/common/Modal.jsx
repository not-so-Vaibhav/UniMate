import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
}) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full ${maxWidth} rounded-xl bg-surface border border-slate-border p-6 shadow-xl transition-all z-10`}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-start justify-between pb-3 border-b border-slate-border mb-4">
            <div>
              <h3 className="text-base font-semibold text-navy-950">{title}</h3>
              {subtitle && <p className="text-xs text-slate-text mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-slate-text hover:text-navy-950 p-1 rounded-lg hover:bg-surface-muted transition-colors focus:outline-none"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
