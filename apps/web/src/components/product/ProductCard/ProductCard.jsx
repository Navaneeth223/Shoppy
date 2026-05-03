import React, { useState, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, GitCompare, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, openCartDrawer } from '../../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, selectIsInWishlist } from '../../../store/slices/wishlistSlice';
import { addToCompare, selectCompareProducts } from '../../../store/slices/uiSlice';
import { selectIsAuthenticated } from '../../../store/slices/authSlice';
import Badge from '../../ui/Badge/Badge';
import Rating from '../../ui/Rating/Rating';
import clsx from 'clsx';

/**
 * Product card component with hover effects, quick actions, and variant swatches.
 */
const ProductCard = memo(function ProductCard({ product, className }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInWishlist = useSelector(selectIsInWishlist(product._id));
  const compareProducts = useSelector(selectCompareProducts);
  const isInCompare = compareProducts.some((p) => p._id === product._id);

  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [wishlistAnimating, setWishlistAnimating] = useState(false);

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const secondaryImage = product.images?.[1];
  const effectivePrice = product.effectivePrice || product.salePrice || product.basePrice;
  const hasDiscount = effectivePrice < product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.basePrice - effectivePrice) / product.basePrice) * 100)
    : 0;

  const colorVariants = product.variants
    ?.find((v) => v.name.toLowerCase() === 'color')
    ?.options?.slice(0, 5) || [];

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAddingToCart) return;

    setIsAddingToCart(true);
    await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    dispatch(openCartDrawer());
    setTimeout(() => setIsAddingToCart(false), 1000);
  }, [dispatch, product._id, isAddingToCart]);

  const handleWishlist = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;

    setWishlistAnimating(true);
    setTimeout(() => setWishlistAnimating(false), 600);

    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  }, [dispatch, product._id, isInWishlist, isAuthenticated]);

  const handleCompare = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCompare(product));
  }, [dispatch, product]);

  return (
    <motion.article
      className={clsx('group relative card-hover overflow-hidden', className)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Link to={`/product/${product.slug}`} aria-label={product.title}>
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden bg-surface-2">
          {/* Primary image */}
          <img
            src={primaryImage?.url || 'https://picsum.photos/seed/product/400/400'}
            alt={primaryImage?.alt || product.title}
            className={clsx(
              'w-full h-full object-cover transition-all duration-500',
              isHovered && secondaryImage ? 'opacity-0' : 'opacity-100'
            )}
            loading="lazy"
          />

          {/* Secondary image (crossfade on hover) */}
          {secondaryImage && (
            <img
              src={secondaryImage.url}
              alt={`${product.title} - alternate view`}
              className={clsx(
                'absolute inset-0 w-full h-full object-cover transition-all duration-500',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
              loading="lazy"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNewArrival && <Badge variant="new">New</Badge>}
            {hasDiscount && <Badge variant="sale">-{discountPercent}%</Badge>}
            {product.isTrending && <Badge variant="hot">🔥 Hot</Badge>}
            {product.isFlashDeal && <Badge variant="warning">⚡ Deal</Badge>}
            {product.stock === 0 && <Badge variant="error">Sold Out</Badge>}
          </div>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {/* Wishlist */}
            <motion.button
              onClick={handleWishlist}
              animate={wishlistAnimating ? { scale: [1, 1.4, 1] } : {}}
              className={clsx(
                'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
                'shadow-card backdrop-blur-sm',
                isInWishlist
                  ? 'bg-error text-white'
                  : 'bg-surface/80 text-text-secondary hover:bg-surface hover:text-error',
                'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'
              )}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              style={{ transitionDelay: '0ms' }}
            >
              <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
            </motion.button>

            {/* Compare */}
            <button
              onClick={handleCompare}
              className={clsx(
                'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
                'shadow-card backdrop-blur-sm',
                isInCompare
                  ? 'bg-accent-cyan text-bg'
                  : 'bg-surface/80 text-text-secondary hover:bg-surface hover:text-accent-cyan',
                'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'
              )}
              aria-label="Compare product"
              style={{ transitionDelay: '50ms' }}
            >
              <GitCompare size={16} />
            </button>
          </div>

          {/* Quick add to cart */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: isHovered ? 0 : '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 right-0 p-3"
          >
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
              className={clsx(
                'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
                product.stock === 0
                  ? 'bg-surface-2 text-text-muted cursor-not-allowed'
                  : 'bg-accent-gold text-bg hover:bg-yellow-400 shadow-gold-glow'
              )}
              aria-label={product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            >
              {isAddingToCart ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin"
                />
              ) : (
                <ShoppingCart size={16} />
              )}
              {product.stock === 0 ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </motion.div>
        </div>

        {/* Product info */}
        <div className="p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-text-muted mb-1 font-medium uppercase tracking-wider">
              {product.brand.name || product.brand}
            </p>
          )}

          {/* Title */}
          <h3 className="text-sm font-medium text-text-primary line-clamp-2 mb-2 group-hover:text-accent-gold transition-colors">
            {product.title}
          </h3>

          {/* Rating */}
          {product.ratings?.count > 0 && (
            <div className="mb-2">
              <Rating
                value={product.ratings.average}
                count={product.ratings.count}
                size="xs"
              />
            </div>
          )}

          {/* Color swatches */}
          {colorVariants.length > 0 && (
            <div className="flex items-center gap-1 mb-3">
              {colorVariants.map((option, i) => (
                <span
                  key={i}
                  className="w-4 h-4 rounded-full border border-border cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: option.colorHex || '#888' }}
                  title={option.label}
                  aria-label={option.label}
                />
              ))}
              {product.variants?.[0]?.options?.length > 5 && (
                <span className="text-xs text-text-muted">+{product.variants[0].options.length - 5}</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-text-primary">
              ${effectivePrice?.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-text-muted line-through">
                ${product.basePrice?.toFixed(2)}
              </span>
            )}
            {hasDiscount && (
              <span className="text-xs font-semibold text-success">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Stock warning */}
          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-xs text-warning mt-1">
              Only {product.stock} left in stock
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  );
});

export default ProductCard;
