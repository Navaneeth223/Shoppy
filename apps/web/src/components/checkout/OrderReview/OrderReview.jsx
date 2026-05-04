import React from 'react';
import { MapPin, CreditCard, Truck, Package } from 'lucide-react';
import clsx from 'clsx';

/**
 * Order review summary shown on the final checkout step.
 */
export default function OrderReview({ items = [], shippingAddress, shippingMethod, paymentMethod, subtotal, shippingCost, taxAmount, discount, total }) {
  return (
    <div className="space-y-6">
      {/* Items */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
          <Package size={16} className="text-accent-gold" />
          Order Items ({items.length})
        </h3>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex gap-3">
              <img
                src={item.image || `https://picsum.photos/seed/${i}/60/60`}
                alt={item.title}
                className="w-14 h-14 rounded-lg object-cover border border-border shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary line-clamp-1">{item.title}</p>
                {item.variantLabel && (
                  <p className="text-xs text-text-muted mt-0.5">{item.variantLabel}</p>
                )}
                <p className="text-xs text-text-muted mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-text-primary shrink-0">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* Shipping address */}
      {shippingAddress && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
            <MapPin size={16} className="text-accent-cyan" />
            Shipping To
          </h3>
          <address className="text-sm text-text-secondary not-italic leading-relaxed">
            {shippingAddress.firstName} {shippingAddress.lastName}<br />
            {shippingAddress.addressLine1}
            {shippingAddress.addressLine2 && <>, {shippingAddress.addressLine2}</>}<br />
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
            {shippingAddress.country}
          </address>
        </section>
      )}

      {/* Shipping method */}
      {shippingMethod && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
            <Truck size={16} className="text-accent-gold" />
            Shipping Method
          </h3>
          <p className="text-sm text-text-secondary">
            {shippingMethod.name} — {shippingMethod.estimatedDays || '5-7 business days'}
            {shippingMethod.cost === 0 ? (
              <span className="ml-2 text-success font-medium">Free</span>
            ) : (
              <span className="ml-2">${shippingMethod.cost?.toFixed(2)}</span>
            )}
          </p>
        </section>
      )}

      {/* Payment */}
      {paymentMethod && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
            <CreditCard size={16} className="text-accent-cyan" />
            Payment
          </h3>
          <p className="text-sm text-text-secondary capitalize">
            {paymentMethod.brand} ending in {paymentMethod.last4}
          </p>
        </section>
      )}

      <div className="divider" />

      {/* Price breakdown */}
      <section className="space-y-2 text-sm">
        <div className="flex justify-between text-text-secondary">
          <span>Subtotal</span>
          <span>${subtotal?.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success">
            <span>Discount</span>
            <span>-${discount?.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-text-secondary">
          <span>Shipping</span>
          <span>{shippingCost === 0 ? 'Free' : `$${shippingCost?.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Tax</span>
          <span>${taxAmount?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-base text-text-primary pt-2 border-t border-border">
          <span>Total</span>
          <span className="text-accent-gold">${total?.toFixed(2)}</span>
        </div>
      </section>
    </div>
  );
}
