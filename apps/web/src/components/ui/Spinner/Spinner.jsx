import React from 'react';
import clsx from 'clsx';

/**
 * Loading spinner component.
 * @param {'sm'|'md'|'lg'} [size='md']
 * @param {string} [className]
 */
export default function Spinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <span
      role="status"
      aria-label="Loading"
      className={clsx(
        'inline-block rounded-full border-current border-t-transparent animate-spin',
        sizeClasses[size],
        className
      )}
    />
  );
}
