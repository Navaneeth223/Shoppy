import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import ProductGrid from '../components/product/ProductGrid/ProductGrid';
import EmptyState from '../components/shared/EmptyState/EmptyState';
import { fetchWishlist, selectWishlistItems } from '../store/slices/wishlistSlice';

export default function Wishlist() {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const products = items
    .map((item) => item.product)
    .filter(Boolean)
    .filter((p) => typeof p === 'object');

  return (
    <>
      <SEOHead title="My Wishlist" noIndex />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart size={24} className="text-error" />
          <h1 className="text-2xl font-display font-bold text-text-primary">
            My Wishlist
            {items.length > 0 && (
              <span className="ml-2 text-base font-normal text-text-muted">({items.length} items)</span>
            )}
          </h1>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save items you love by clicking the heart icon on any product."
            action={{ label: 'Discover Products', href: '/shop' }}
          />
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </>
  );
}
