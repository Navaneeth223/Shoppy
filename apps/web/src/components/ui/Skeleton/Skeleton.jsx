import React from 'react';
import clsx from 'clsx';

/**
 * Skeleton loading placeholder component.
 */
export default function Skeleton({ className, width, height, rounded = 'md' }) {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={clsx(
        'shimmer',
        roundedClasses[rounded],
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton for a product card.
 */
export function ProductCardSkeleton() {
  return (
    <div className="card p-0 overflow-hidden" aria-hidden="true">
      <Skeleton className="w-full aspect-square" rounded="none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-8" rounded="full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for a product detail page.
 */
export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" aria-hidden="true">
      <div className="space-y-4">
        <Skeleton className="w-full aspect-square" rounded="lg" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-square" rounded="md" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-40" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <Skeleton className="h-14 w-full" rounded="full" />
      </div>
    </div>
  );
}
