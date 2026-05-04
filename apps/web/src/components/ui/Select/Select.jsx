import React, { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

/**
 * Styled select dropdown component.
 */
const Select = forwardRef(function Select(
  { label, options = [], error, hint, required, disabled, placeholder, className, containerClassName, id, ...props },
  ref
) {
  const selectId = id || `select-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-text-secondary">
          {label}
          {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={clsx(
            'w-full appearance-none px-4 py-3 pr-10 rounded-md text-sm transition-all duration-200',
            'bg-surface-2 border text-text-primary cursor-pointer',
            error
              ? 'border-error focus:ring-error/30 focus:border-error'
              : 'border-border focus:ring-accent-cyan/30 focus:border-accent-cyan',
            'focus:outline-none focus:ring-2',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {error && (
        <p id={`${selectId}-error`} role="alert" className="text-xs text-error flex items-center gap-1">
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}
    </div>
  );
});

export default Select;
