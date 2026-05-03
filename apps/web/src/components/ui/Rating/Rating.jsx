import React from 'react';
import { Star } from 'lucide-react';
import clsx from 'clsx';

/**
 * Star rating display component.
 */
export default function Rating({ value = 0, count, size = 'sm', showCount = true, className }) {
  const stars = [1, 2, 3, 4, 5];

  const sizeMap = {
    xs: 10,
    sm: 12,
    md: 16,
    lg: 20,
  };

  const starSize = sizeMap[size];

  return (
    <div className={clsx('flex items-center gap-1', className)} aria-label={`Rating: ${value} out of 5${count ? `, ${count} reviews` : ''}`}>
      <div className="flex items-center gap-0.5">
        {stars.map((star) => {
          const filled = value >= star;
          const partial = !filled && value > star - 1;
          const fillPercent = partial ? (value - (star - 1)) * 100 : 0;

          return (
            <span key={star} className="relative" style={{ width: starSize, height: starSize }}>
              {/* Background star */}
              <Star
                size={starSize}
                className="text-text-muted absolute inset-0"
                fill="currentColor"
                aria-hidden="true"
              />
              {/* Filled star */}
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? '100%' : `${fillPercent}%` }}
                >
                  <Star
                    size={starSize}
                    className="text-accent-gold"
                    fill="currentColor"
                    aria-hidden="true"
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>

      {showCount && count !== undefined && (
        <span className="text-text-muted text-xs">({count.toLocaleString()})</span>
      )}
    </div>
  );
}
