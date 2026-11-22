import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div className={`text-center py-12 px-4 rounded-xl border border-dashed border-slate-border bg-surface/50 ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-surface-muted border border-slate-border flex items-center justify-center mx-auto mb-3.5 text-navy-700">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-navy-950 mb-1">{title}</h4>
      <p className="text-xs text-slate-text max-w-sm mx-auto mb-4 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
