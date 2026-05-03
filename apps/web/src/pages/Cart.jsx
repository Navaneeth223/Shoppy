import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import { selectCartItems, selectCartSubtotal, selectCartTotal } from '../store/slices/cartSlice';
import EmptyState from '../components/shared/EmptyState/EmptyState';

export default function Cart() {
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const total = useSelector(selectCartTotal);

  return (
    <>
      <SEOHead title="Your Cart" noIndex />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Add some products to get started on your shopping journey."
            action={{ label: 'Start Shopping', href: '/shop' }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item._id} className="card p-4 flex gap-4">
                  <img
                    src={item.image || 'https://picsum.photos/seed/cart/80/80'}
                    alt={item.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{item.title}</p>
                    {item.variantLabel && <p className="text-sm text-text-muted">{item.variantLabel}</p>}
                    <p className="text-accent-gold font-bold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-6 h-fit space-y-4">
              <h2 className="font-display font-semibold text-text-primary">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-text-primary pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary py-4"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
