import React from 'react';

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  footer,
  padding = 'p-6',
  ...props
}) {
  return (
    <div
      className={`bg-surface border border-slate-border rounded-xl shadow-[0_1px_3px_rgba(16,24,40,0.05)] ${className}`}
      {...props}
    >
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-slate-border flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-semibold text-navy-950">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-text mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={padding}>{children}</div>
      {footer && (
        <div className="px-6 py-3 border-t border-slate-border bg-surface-muted/40 rounded-b-xl text-xs text-slate-text">
          {footer}
        </div>
      )}
    </div>
  );
}
