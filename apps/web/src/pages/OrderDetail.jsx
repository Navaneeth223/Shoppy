import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft, Download } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import { orderAPI } from '../services/api/orderAPI';
import { format } from 'date-fns';
import clsx from 'clsx';

const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  packed: Package,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    orderAPI.getOrder(id)
      .then((res) => setOrder(res.data.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-2 rounded w-1/3" />
          <div className="card p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-surface-2 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-text-muted">Order not found.</p>
        <Link to="/profile/orders" className="btn-primary mt-4 inline-flex">Back to Orders</Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={`Order ${order.orderNumber}`} noIndex />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/profile/orders" className="p-2 rounded-md hover:bg-surface-2 transition-colors text-text-muted hover:text-text-primary">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">Order {order.orderNumber}</h1>
            <p className="text-sm text-text-muted mt-0.5">
              Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order timeline */}
            <div className="card p-6">
              <h2 className="font-display font-semibold text-text-primary mb-6">Order Timeline</h2>
              <div className="space-y-4">
                {order.timeline?.map((event, i) => {
                  const Icon = STATUS_ICONS[event.status] || Clock;
                  const isLatest = i === order.timeline.length - 1;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className={clsx(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          isLatest ? 'bg-accent-gold text-bg' : 'bg-surface-2 text-text-muted'
                        )}>
                          <Icon size={14} />
                        </div>
                        {i < order.timeline.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-2" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className={clsx('text-sm font-medium', isLatest ? 'text-text-primary' : 'text-text-secondary')}>
                          {event.message}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {format(new Date(event.timestamp), 'MMM d, yyyy · h:mm a')}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Items */}
            <div className="card p-6">
              <h2 className="font-display font-semibold text-text-primary mb-4">Items Ordered</h2>
              <div className="space-y-4">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <img
                      src={item.image || `https://picsum.photos/seed/${i}/80/80`}
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-cover border border-border"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{item.title}</p>
                      {item.variantLabel && <p className="text-xs text-text-muted">{item.variantLabel}</p>}
                      <p className="text-sm text-text-muted mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping address */}
            <div className="card p-6">
              <h2 className="font-display font-semibold text-text-primary mb-4">Shipping Address</h2>
              <div className="text-sm text-text-secondary space-y-1">
                <p className="font-medium text-text-primary">
                  {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                </p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                </p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="card p-6">
              <h2 className="font-display font-semibold text-text-primary mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>${order.subtotal?.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-${order.discountAmount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-secondary">
                  <span>Shipping</span>
                  <span>${order.shippingCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Tax</span>
                  <span>${order.taxAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-text-primary pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {['pending', 'confirmed'].includes(order.orderStatus) && (
                <button className="w-full btn-secondary text-sm py-2.5 text-error border-error hover:bg-error/10">
                  Cancel Order
                </button>
              )}
              {order.orderStatus === 'delivered' && (
                <button className="w-full btn-secondary text-sm py-2.5">
                  Request Return
                </button>
              )}
              <button className="w-full btn-ghost text-sm py-2.5 flex items-center justify-center gap-2">
                <Download size={14} /> Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
