import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Animated progress bar component.
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  color = 'gold',
  size = 'md',
  className,
  animated = true,
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorClasses = {
    gold: 'bg-gradient-to-r from-accent-gold to-yellow-400',
    cyan: 'bg-accent-cyan',
    success: 'bg-success',
    error: 'bg-error',
    warning: 'bg-warning',
  };

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-text-secondary">{label}</span>}
          {showValue && (
            <span className="text-xs font-medium text-text-primary">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={clsx('w-full bg-surface-2 rounded-full overflow-hidden', sizeClasses[size])}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <motion.div
          className={clsx('h-full rounded-full', colorClasses[color])}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
