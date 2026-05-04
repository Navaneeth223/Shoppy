import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
import clsx from 'clsx';

/**
 * Styled checkbox component.
 */
const Checkbox = forwardRef(function Checkbox(
  { label, description, error, disabled, className, id, ...props },
  ref
) {
  const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={clsx('flex items-start gap-3', className)}>
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          disabled={disabled}
          className="sr-only peer"
          aria-describedby={description ? `${checkboxId}-desc` : undefined}
          {...props}
        />
        <label
          htmlFor={checkboxId}
          className={clsx(
            'w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all duration-150',
            'peer-checked:bg-accent-gold peer-checked:border-accent-gold',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-accent-cyan peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg',
            error ? 'border-error' : 'border-border hover:border-text-muted',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Check
            size={12}
            className="text-bg opacity-0 peer-checked:opacity-100 transition-opacity"
            strokeWidth={3}
            aria-hidden="true"
          />
        </label>
      </div>

      {(label || description) && (
        <div>
          {label && (
            <label
              htmlFor={checkboxId}
              className={clsx(
                'text-sm font-medium cursor-pointer',
                disabled ? 'text-text-muted cursor-not-allowed' : 'text-text-primary'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p id={`${checkboxId}-desc`} className="text-xs text-text-muted mt-0.5">
              {description}
            </p>
          )}
          {error && (
            <p role="alert" className="text-xs text-error mt-0.5">{error}</p>
          )}
        </div>
      )}
    </div>
  );
});

export default Checkbox;
