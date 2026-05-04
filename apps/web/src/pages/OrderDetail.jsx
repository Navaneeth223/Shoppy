import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Download, RotateCcw, X } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import { orderAPI } from '../services/api/orderAPI';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUS_STYLES = {
  pending: 'badge-warning',
  confirmed: 'badge-cyan',
  processing: 'badge-cyan',
  shipped: 'badge-gold',
  delivered: 'badge-success',
  cancelled: 'badge-error',
  refunded: 'badge-success',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    orderAPI.getOrder(id)
      .then((res) => setOrder(res.data.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setIsCancelling(true);
    try {
      await orderAPI.cancelOrder(id, 'Cancelled by customer');
      toast.success('Order cancelled successfully.');
      setOrder((prev) => ({ ...prev, orderStatus: 'cancelled' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    }
    setIsCancelling(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4 h-24 shimmer" />
        ))}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Package size={48} className="text-text-muted mx-auto mb-4" />
        <h1 className="text-xl font-display font-bold text-text-primary mb-2">Order Not Found</h1>
        <Link to="/profile/orders" className="btn-primary text-sm">Back to Orders</Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead title={`Order ${order.orderNumber}`} noIndex />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link to="/profile/orders" className="hover:text-text-primary transition-colors">My Orders</Link>
          <ChevronRight size={14} />
          <span className="text-text-primary">{order.orderNumber}</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">{order.orderNumber}</h1>
            <p className="text-text-muted text-sm mt-1">
              Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
          <span className={`badge ${STATUS_STYLES[order.orderStatus] || 'badge-cyan'} capitalize`}>
            {order.orderStatus?.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Timeline */}
        {order.timeline?.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="font-semibold text-text-primary mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.timeline.map((event, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={clsx(
                      'w-3 h-3 rounded-full mt-1',
                      i === 0 ? 'bg-accent-gold' : 'bg-text-muted'
                    )} />
                    {i < order.timeline.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-text-primary capitalize">
                      {event.status?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{event.message}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-text-primary mb-4">Order Items</h2>
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

        {/* Price breakdown */}
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-text-primary mb-4">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span><span>${order.subtotal?.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span><span>-${order.discountAmount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-text-secondary">
              <span>Shipping</span><span>${order.shippingCost?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Tax</span><span>${order.taxAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-text-primary pt-2 border-t border-border">
              <span>Total</span><span>${order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        {order.shippingAddress && (
          <div className="card p-6 mb-6">
            <h2 className="font-semibold text-text-primary mb-3">Shipping Address</h2>
            <address className="text-sm text-text-secondary not-italic">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
              {order.shippingAddress.addressLine1}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}
            </address>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {['pending', 'confirmed'].includes(order.orderStatus) && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex items-center gap-2 btn-ghost text-error hover:bg-error/10 border border-error/20"
            >
              <X size={16} />
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
          {order.orderStatus === 'delivered' && (
            <Link to={`/profile/orders/${id}/return`} className="flex items-center gap-2 btn-ghost border border-border">
              <RotateCcw size={16} />
              Request Return
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
