import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Trash2, Plus, Minus, Tag, X, ArrowRight, Truck } from 'lucide-react';
import {
  selectCartItems, selectCartItemCount, selectCartSubtotal,
  selectCartTotal, selectCartDiscount, selectCartCoupon,
  selectIsCartOpen, closeCartDrawer,
  removeCartItem, updateCartItem, applyCoupon, removeCoupon, fetchCart,
} from '../../../store/slices/cartSlice';
import { selectIsAuthenticated } from '../../../store/slices/authSlice';
import { createPortal } from 'react-dom';
import { useState } from 'react';
import clsx from 'clsx';

const FREE_SHIPPING_THRESHOLD = 75;

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector(selectIsCartOpen);
  const items = useSelector(selectCartItems);
  const itemCount = useSelector(selectCartItemCount);
  const subtotal = useSelector(selectCartSubtotal);
  const total = useSelector(selectCartTotal);
  const discount = useSelector(selectCartDiscount);
  const coupon = useSelector(selectCartCoupon);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isOpen, isAuthenticated, dispatch]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await dispatch(applyCoupon(couponInput.trim()));
    setCouponLoading(false);
    setCouponInput('');
  };

  const handleCheckout = () => {
    dispatch(closeCartDrawer());
    navigate('/checkout');
  };

  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const drawer = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-overlay" role="dialog" aria-modal="true" aria-label="Shopping cart">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => dispatch(closeCartDrawer())}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-surface border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-accent-gold" />
                <h2 className="text-base font-display font-semibold text-text-primary">
                  Your Cart
                  {itemCount > 0 && (
                    <span className="ml-2 text-sm font-normal text-text-muted">({itemCount} items)</span>
                  )}
                </h2>
              </div>
              <button
                onClick={() => dispatch(closeCartDrawer())}
                className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Free shipping progress */}
            {subtotal > 0 && (
              <div className="px-6 py-3 bg-surface-2 border-b border-border shrink-0">
                {amountToFreeShipping > 0 ? (
                  <p className="text-xs text-text-secondary mb-2">
                    Add <span className="text-accent-gold font-semibold">${amountToFreeShipping.toFixed(2)}</span> more for free shipping
                  </p>
                ) : (
                  <p className="text-xs text-success mb-2 flex items-center gap-1">
                    <Truck size={12} /> You've unlocked free shipping! 🎉
                  </p>
                )}
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent-gold to-yellow-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center">
                    <ShoppingBag size={32} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-text-primary mb-1">Your cart is empty</p>
                    <p className="text-sm text-text-muted">Add some products to get started</p>
                  </div>
                  <button
                    onClick={() => { dispatch(closeCartDrawer()); navigate('/shop'); }}
                    className="btn-primary text-sm"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  <AnimatePresence>
                    {items.map((item) => (
                      <CartItem key={item._id} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-4 shrink-0">
                {/* Coupon */}
                {!coupon ? (
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Coupon code"
                        className="input-field pl-9 py-2 text-sm"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput}
                      className="btn-secondary text-sm px-4 py-2 disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-success/10 border border-success/20 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-success" />
                      <span className="text-sm font-semibold text-success">{coupon.code}</span>
                      <span className="text-xs text-text-muted">-${coupon.discountAmount?.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => dispatch(removeCoupon())}
                      className="text-text-muted hover:text-error transition-colors"
                      aria-label="Remove coupon"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Price breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-muted text-xs">
                    <span>Shipping</span>
                    <span>{subtotal >= FREE_SHIPPING_THRESHOLD ? 'Free' : 'Calculated at checkout'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-text-primary pt-2 border-t border-border">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary text-base py-4 shadow-gold-glow"
                >
                  Checkout <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => dispatch(closeCartDrawer())}
                  className="w-full text-sm text-text-muted hover:text-text-primary transition-colors py-1"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(drawer, document.body);
}

function CartItem({ item }) {
  const dispatch = useDispatch();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    await dispatch(removeCartItem(item._id));
  };

  const handleQuantityChange = (newQty) => {
    if (newQty < 1) return;
    dispatch(updateCartItem({ itemId: item._id, quantity: newQty }));
  };

  return (
    <motion.div
      layout
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex gap-4 p-4"
    >
      {/* Image */}
      <Link to={`/product/${item.product?.slug || '#'}`} className="shrink-0">
        <img
          src={item.image || 'https://picsum.photos/seed/cart/80/80'}
          alt={item.title}
          className="w-16 h-16 rounded-lg object-cover border border-border"
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/product/${item.product?.slug || '#'}`}>
          <p className="text-sm font-medium text-text-primary line-clamp-2 hover:text-accent-gold transition-colors">
            {item.title}
          </p>
        </Link>
        {item.variantLabel && (
          <p className="text-xs text-text-muted mt-0.5">{item.variantLabel}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          {/* Quantity stepper */}
          <div className="flex items-center gap-1 bg-surface-2 rounded-lg border border-border">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <span className="w-8 text-center text-sm font-medium text-text-primary">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Price */}
          <span className="text-sm font-bold text-text-primary">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className="shrink-0 p-1.5 text-text-muted hover:text-error transition-colors self-start"
        aria-label="Remove item"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}
