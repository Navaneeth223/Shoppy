import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  Heart, ShoppingCart, Share2, Star, Truck, Shield, RotateCcw,
  ChevronRight, Minus, Plus, Check, AlertCircle,
} from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import Rating from '../components/ui/Rating/Rating';
import Badge from '../components/ui/Badge/Badge';
import Button from '../components/ui/Button/Button';
import ProductGrid from '../components/product/ProductGrid/ProductGrid';
import { ProductDetailSkeleton } from '../components/ui/Skeleton/Skeleton';
import { productAPI } from '../services/api/productAPI';
import { addToCart, openCartDrawer } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, selectIsInWishlist } from '../store/slices/wishlistSlice';
import { addToRecentlyViewed } from '../store/slices/uiSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const isInWishlist = useSelector(selectIsInWishlist(product?._id));

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const [productRes, relatedRes] = await Promise.all([
          productAPI.getProduct(slug),
          productAPI.getRelated(slug).catch(() => ({ data: { data: [] } })),
        ]);

        const productData = productRes.data.data;
        setProduct(productData);
        setRelatedProducts(relatedRes.data.data || []);

        // Track view
        productAPI.incrementView(productData._id).catch(() => {});

        // Add to recently viewed
        dispatch(addToRecentlyViewed(productData));
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, dispatch]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);

    const variantKey = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}:${v}`)
      .join(',') || 'default';

    const variantLabel = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    await dispatch(addToCart({
      productId: product._id,
      variantKey,
      variantLabel,
      quantity,
    }));

    dispatch(openCartDrawer());
    setIsAddingToCart(false);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    // Navigate to checkout
    window.location.href = '/checkout';
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertCircle size={48} className="text-error mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Product Not Found</h1>
        <p className="text-text-muted mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/shop" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  const effectivePrice = product.effectivePrice || product.salePrice || product.basePrice;
  const hasDiscount = effectivePrice < product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.basePrice - effectivePrice) / product.basePrice) * 100)
    : 0;

  const TABS = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'shipping', label: 'Shipping & Returns' },
  ];

  return (
    <>
      <SEOHead
        title={product.title}
        description={product.shortDescription || product.description?.replace(/<[^>]*>/g, '').slice(0, 160)}
        image={product.images?.[0]?.url}
        type="product"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          image: product.images?.map((img) => img.url),
          description: product.shortDescription,
          sku: product.sku,
          brand: { '@type': 'Brand', name: product.brand?.name },
          offers: {
            '@type': 'Offer',
            price: effectivePrice,
            priceCurrency: 'USD',
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
          aggregateRating: product.ratings?.count > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: product.ratings.average,
            reviewCount: product.ratings.count,
          } : undefined,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-text-primary transition-colors">Shop</Link>
          {product.category && (
            <>
              <ChevronRight size={14} />
              <Link to={`/shop/${product.category.slug}`} className="hover:text-text-primary transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={14} />
          <span className="text-text-primary line-clamp-1">{product.title}</span>
        </nav>

        {/* Main product section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image gallery */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-2 border border-border">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images?.[selectedImage]?.url || 'https://picsum.photos/seed/product/600/600'}
                alt={product.images?.[selectedImage]?.alt || product.title}
                className="w-full h-full object-cover"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNewArrival && <Badge variant="new">New</Badge>}
                {hasDiscount && <Badge variant="sale">-{discountPercent}%</Badge>}
                {product.isFlashDeal && <Badge variant="warning">⚡ Flash Deal</Badge>}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={clsx(
                      'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                      i === selectedImage ? 'border-accent-gold' : 'border-border hover:border-text-muted'
                    )}
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={i === selectedImage}
                  >
                    <img src={img.url} alt={img.alt || product.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-6">
            {/* Brand */}
            {product.brand && (
              <Link to={`/brand/${product.brand.slug}`} className="text-sm font-semibold text-accent-gold hover:text-yellow-400 transition-colors uppercase tracking-wider">
                {product.brand.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-3xl font-display font-bold text-text-primary leading-tight">
              {product.title}
            </h1>

            {/* Rating */}
            {product.ratings?.count > 0 && (
              <div className="flex items-center gap-3">
                <Rating value={product.ratings.average} count={product.ratings.count} size="md" />
                <a href="#reviews" className="text-sm text-accent-cyan hover:underline">
                  {product.ratings.count} reviews
                </a>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-text-primary">
                ${effectivePrice?.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-text-muted line-through mb-1">
                    ${product.basePrice?.toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-success mb-1">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-text-secondary leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Variants */}
            {product.variants?.map((variant) => (
              <div key={variant.name}>
                <p className="text-sm font-semibold text-text-primary mb-3">
                  {variant.name}:
                  {selectedVariants[variant.name] && (
                    <span className="font-normal text-text-secondary ml-2">{selectedVariants[variant.name]}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((option) => {
                    const isSelected = selectedVariants[variant.name] === option.value;
                    const isColor = variant.name.toLowerCase() === 'color' && option.colorHex;

                    return isColor ? (
                      <button
                        key={option.value}
                        onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: option.value }))}
                        className={clsx(
                          'w-8 h-8 rounded-full border-2 transition-all',
                          isSelected ? 'border-accent-gold scale-110' : 'border-border hover:border-text-muted'
                        )}
                        style={{ backgroundColor: option.colorHex }}
                        title={option.label}
                        aria-label={`${variant.name}: ${option.label}`}
                        aria-pressed={isSelected}
                      />
                    ) : (
                      <button
                        key={option.value}
                        onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: option.value }))}
                        className={clsx(
                          'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                          isSelected
                            ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                            : 'border-border text-text-secondary hover:border-text-muted hover:text-text-primary'
                        )}
                        aria-pressed={isSelected}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-text-primary mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-surface-2 rounded-xl border border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-semibold text-text-primary">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Stock status */}
                {product.stock > 0 ? (
                  <span className="flex items-center gap-1.5 text-sm text-success">
                    <Check size={14} />
                    {product.stock <= 10 ? `Only ${product.stock} left` : 'In Stock'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm text-error">
                    <AlertCircle size={14} />
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                isLoading={isAddingToCart}
                disabled={product.stock === 0}
                leftIcon={<ShoppingCart size={18} />}
                className="flex-1"
                size="lg"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Please sign in to save to wishlist');
                    return;
                  }
                  if (isInWishlist) dispatch(removeFromWishlist(product._id));
                  else dispatch(addToWishlist(product._id));
                }}
                className="w-12 h-12 p-0 flex items-center justify-center"
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
              </Button>
            </div>

            {product.stock > 0 && (
              <Button variant="outline" onClick={handleBuyNow} fullWidth size="lg">
                Buy Now
              </Button>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
              {[
                { icon: Truck, text: 'Free Shipping', sub: 'Orders over $75' },
                { icon: Shield, text: 'Secure Payment', sub: '256-bit SSL' },
                { icon: RotateCcw, text: 'Easy Returns', sub: '30-day policy' },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} className="flex flex-col items-center gap-1 text-center">
                  <Icon size={20} className="text-accent-gold" />
                  <p className="text-xs font-semibold text-text-primary">{text}</p>
                  <p className="text-[10px] text-text-muted">{sub}</p>
                </div>
              ))}
            </div>

            {/* Seller info */}
            {product.seller && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-2 border border-border">
                <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold font-semibold">
                  {product.seller.firstName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {product.seller.firstName} {product.seller.lastName}
                  </p>
                  <p className="text-xs text-text-muted">Verified Seller</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-16">
          <div className="flex gap-1 border-b border-border mb-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-6 py-3 text-sm font-medium transition-all border-b-2 -mb-px',
                  activeTab === tab.id
                    ? 'border-accent-gold text-accent-gold'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                )}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div role="tabpanel">
            {activeTab === 'description' && (
              <div
                className="prose prose-invert max-w-none text-text-secondary"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            {activeTab === 'specifications' && (
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <tbody>
                    {product.specifications?.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-2'}>
                        <td className="px-6 py-3 font-medium text-text-secondary w-1/3">{spec.key}</td>
                        <td className="px-6 py-3 text-text-primary">{spec.value}{spec.unit ? ` ${spec.unit}` : ''}</td>
                      </tr>
                    ))}
                    {(!product.specifications || product.specifications.length === 0) && (
                      <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-text-muted">
                          No specifications available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4 text-text-secondary">
                <div className="p-4 rounded-xl bg-surface-2 border border-border">
                  <h3 className="font-semibold text-text-primary mb-2">Shipping Information</h3>
                  <p>{product.shippingInfo || 'Standard shipping: 3-5 business days. Express shipping: 1-2 business days. Free shipping on orders over $75.'}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-2 border border-border">
                  <h3 className="font-semibold text-text-primary mb-2">Return Policy</h3>
                  <p>{product.returnPolicy || 'We accept returns within 30 days of delivery. Items must be in original condition with all tags attached.'}</p>
                </div>
                {product.warrantyInfo && (
                  <div className="p-4 rounded-xl bg-surface-2 border border-border">
                    <h3 className="font-semibold text-text-primary mb-2">Warranty</h3>
                    <p>{product.warrantyInfo}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section aria-labelledby="related-heading">
            <h2 id="related-heading" className="section-title mb-8">You May Also Like</h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </>
  );
}
