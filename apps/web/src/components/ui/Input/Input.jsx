import React, { forwardRef, useState } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Input field component with label, error, and icon support.
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    success,
    leftIcon,
    rightIcon,
    type = 'text',
    className,
    containerClassName,
    required,
    disabled,
    id,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`;
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
          {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={inputType}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={clsx(
            'w-full px-4 py-3 rounded-md text-sm transition-all duration-200',
            'bg-surface-2 border text-text-primary',
            'placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            leftIcon && 'pl-10',
            (rightIcon || isPassword || error || success) && 'pr-10',
            error
              ? 'border-error focus:ring-error/30 focus:border-error'
              : success
              ? 'border-success focus:ring-success/30 focus:border-success'
              : 'border-border focus:ring-accent-cyan/30 focus:border-accent-cyan',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          {...props}
        />

        {/* Right side icons */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {error && !isPassword && (
            <AlertCircle size={16} className="text-error" aria-hidden="true" />
          )}
          {success && !error && !isPassword && (
            <CheckCircle size={16} className="text-success" aria-hidden="true" />
          )}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-text-muted hover:text-text-secondary transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          {rightIcon && !isPassword && (
            <span className="text-text-muted">{rightIcon}</span>
          )}
        </span>
      </div>

      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-error flex items-center gap-1">
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
