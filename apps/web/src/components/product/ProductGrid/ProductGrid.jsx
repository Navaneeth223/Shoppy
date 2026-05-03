import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import ProductCard from '../ProductCard/ProductCard';
import { ProductCardSkeleton } from '../../ui/Skeleton/Skeleton';
import EmptyState from '../../shared/EmptyState/EmptyState';
import { ShoppingBag } from 'lucide-react';
import clsx from 'clsx';

/**
 * Responsive product grid with virtualization for large lists.
 */
export default function ProductGrid({
  products = [],
  isLoading = false,
  skeletonCount = 12,
  view = 'grid',
  className,
}) {
  if (isLoading) {
    return (
      <div className={clsx(
        view === 'grid'
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
          : 'flex flex-col gap-4',
        className
      )}>
        {[...Array(skeletonCount)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No products found"
        description="Try adjusting your filters or search query to find what you're looking for."
        action={{ label: 'Clear Filters', href: '/shop' }}
      />
    );
  }

  return (
    <div
      className={clsx(
        view === 'grid'
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
          : 'flex flex-col gap-4',
        className
      )}
      role="list"
      aria-label="Products"
    >
      {products.map((product) => (
        <div key={product._id} role="listitem">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
