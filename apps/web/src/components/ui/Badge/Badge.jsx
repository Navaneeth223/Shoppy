import React from 'react';
import clsx from 'clsx';

/**
 * Badge component for labels and status indicators.
 */
export default function Badge({ children, variant = 'default', size = 'sm', className }) {
  const variants = {
    default: 'badge-cyan',
    gold: 'badge-gold',
    success: 'badge-success',
    error: 'badge-error',
    warning: 'badge-warning',
    new: 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20',
    sale: 'bg-error/10 text-error border border-error/20',
    hot: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    trending: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
