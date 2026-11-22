import React from 'react';

const BADGE_STYLES = {
  neutral: 'bg-surface-muted text-navy-700 border-slate-border',
  primary: 'bg-navy-50 text-navy-800 border-navy-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-rose-50 text-rose-800 border-rose-200',
  accent: 'bg-slate-100 text-accent border-slate-200',
};

export default function Badge({
  children,
  variant = 'neutral',
  className = '',
  dot = false,
}) {
  const style = BADGE_STYLES[variant] || BADGE_STYLES.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success'
              ? 'bg-emerald-600'
              : variant === 'warning'
              ? 'bg-amber-600'
              : variant === 'danger'
              ? 'bg-rose-600'
              : 'bg-navy-700'
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
