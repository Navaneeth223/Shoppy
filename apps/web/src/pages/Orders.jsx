import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Search, Filter } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import Pagination from '../components/ui/Pagination/Pagination';
import EmptyState from '../components/shared/EmptyState/EmptyState';
import { orderAPI } from '../services/api/orderAPI';
import { format } from 'date-fns';
import clsx from 'clsx';

const STATUS_STYLES = {
  pending: { label: 'Pending', class: 'badge-warning' },
  confirmed: { label: 'Confirmed', class: 'badge-cyan' },
  processing: { label: 'Processing', class: 'badge-cyan' },
  packed: { label: 'Packed', class: 'badge-cyan' },
  shipped: { label: 'Shipped', class: 'badge-gold' },
  out_for_delivery: { label: 'Out for Delivery', class: 'badge-gold' },
  delivered: { label: 'Delivered', class: 'badge-success' },
  cancelled: { label: 'Cancelled', class: 'badge-error' },
  return_requested: { label: 'Return Requested', class: 'badge-warning' },
  returned: { label: 'Returned', class: 'badge-error' },
  refunded: { label: 'Refunded', class: 'badge-success' },
};

const FILTER_TABS = [
  { value: '', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const params = { page, limit: 10 };
    if (statusFilter) params.status = statusFilter;

    orderAPI.getUserOrders(params)
      .then((res) => {
        setOrders(res.data.data || []);
        setTotal(res.data.meta?.total || 0);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / 10);

  return (
    <>
      <SEOHead title="My Orders" noIndex />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-text-primary">My Orders</h1>
          <span className="text-sm text-text-muted">{total} orders</span>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar mb-6 pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                statusFilter === tab.value
                  ? 'bg-accent-gold text-bg'
                  : 'bg-surface-2 text-text-secondary hover:text-text-primary border border-border'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-surface-2 rounded w-1/4 mb-3" />
                <div className="h-3 bg-surface-2 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="When you place an order, it will appear here."
            action={{ label: 'Start Shopping', href: '/shop' }}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const statusStyle = STATUS_STYLES[order.orderStatus] || { label: order.orderStatus, class: 'badge-cyan' };
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/profile/orders/${order._id}`} className="card-hover block p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-semibold text-text-primary">{order.orderNumber}</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {format(new Date(order.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${statusStyle.class}`}>{statusStyle.label}</span>
                        <span className="font-bold text-text-primary">${order.totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <img
                            key={idx}
                            src={item.image || `https://picsum.photos/seed/${idx}/40/40`}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover border-2 border-surface"
                          />
                        ))}
                        {order.items?.length > 3 && (
                          <div className="w-10 h-10 rounded-lg bg-surface-2 border-2 border-surface flex items-center justify-center text-xs text-text-muted font-medium">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-text-muted ml-2">
                        {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                      </p>
                      <ChevronRight size={16} className="text-text-muted ml-auto" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </>
  );
}
