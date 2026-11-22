import React from 'react';

export default function PageHeader({
  title,
  subtitle,
  badge,
  breadcrumbs = [],
  action,
  className = '',
}) {
  return (
    <div className={`mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-border ${className}`}>
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-text mb-1.5">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-border">/</span>}
                <span className={idx === breadcrumbs.length - 1 ? 'font-medium text-navy-950' : ''}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-sm text-slate-text mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2.5">{action}</div>}
    </div>
  );
}
