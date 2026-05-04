import React from 'react';
import clsx from 'clsx';

/**
 * Avatar component — shows user image or initials fallback.
 */
export default function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className,
  online,
}) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-28 h-28 text-2xl',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div className={clsx('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className={clsx(
            'rounded-full object-cover border border-border',
            sizeClasses[size]
          )}
          loading="lazy"
        />
      ) : (
        <div
          className={clsx(
            'rounded-full bg-accent-gold/20 border border-accent-gold/30',
            'flex items-center justify-center font-semibold text-accent-gold',
            sizeClasses[size]
          )}
          aria-label={name || 'User avatar'}
        >
          {initials}
        </div>
      )}

      {/* Online indicator */}
      {online !== undefined && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-2 border-surface',
            online ? 'bg-success' : 'bg-text-muted',
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'
          )}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}
