import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import Spinner from '../Spinner/Spinner';

/**
 * Primary button component with multiple variants and states.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'|'outline'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.fullWidth=false]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className,
    children,
    onClick,
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading;

  const baseClasses = clsx(
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'select-none',
    fullWidth && 'w-full'
  );

  const variantClasses = {
    primary: clsx(
      'rounded-full text-bg',
      'bg-gradient-to-r from-accent-gold to-yellow-400',
      'shadow-gold-glow hover:shadow-[0_0_30px_rgba(201,168,76,0.5)]',
      'hover:-translate-y-0.5 active:translate-y-0'
    ),
    secondary: clsx(
      'rounded-full text-accent-cyan',
      'border border-accent-cyan',
      'hover:bg-accent-cyan/10'
    ),
    ghost: clsx(
      'rounded-md text-text-secondary',
      'hover:bg-surface-2 hover:text-text-primary'
    ),
    danger: clsx(
      'rounded-full text-white',
      'bg-error hover:bg-red-600',
      'shadow-[0_0_20px_rgba(255,77,109,0.2)] hover:shadow-[0_0_30px_rgba(255,77,109,0.4)]'
    ),
    outline: clsx(
      'rounded-full text-text-primary',
      'border border-border',
      'hover:border-text-secondary hover:bg-surface-2'
    ),
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-5 text-lg',
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      whileTap={!isDisabled ? { scale: 0.97 } : undefined}
      className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
});

export default Button;
