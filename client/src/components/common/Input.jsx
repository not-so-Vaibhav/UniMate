import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-navy-950 mb-1.5">
          {label} {required && <span className="text-state-danger">*</span>}
        </label>
      )}
      <div className="relative rounded-lg">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-text">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`block w-full text-sm rounded-lg border bg-surface transition-colors duration-150 py-2.5 ${
            Icon ? 'pl-9 pr-3' : 'px-3'
          } ${
            error
              ? 'border-state-danger text-state-danger focus:border-state-danger focus:ring-1 focus:ring-state-danger'
              : 'border-slate-border text-navy-950 focus:border-navy-800 focus:ring-1 focus:ring-navy-800'
          } disabled:bg-surface-muted disabled:text-slate-text disabled:cursor-not-allowed placeholder:text-slate-text/60`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-state-danger font-normal">{error}</p>}
      {!error && helperText && <p className="mt-1.5 text-xs text-slate-text">{helperText}</p>}
    </div>
  );
}
