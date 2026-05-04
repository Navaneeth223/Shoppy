import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import { orderAPI } from '../../../services/api/orderAPI';
import Pagination from '../../ui/Pagination/Pagination';
import EmptyState from '../../shared/EmptyState/EmptyState';
import { ORDER_STATUS_CONFIG } from '../../../utils/constants';
import { formatDate } from '../../../utils/formatters';
import clsx from 'clsx';

const FILTER_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

/**
 * Order history list component.
 */
export default function OrderHistory() {
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
    <div>
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
            <div key={i} className="card p-4 h-24 shimmer" aria-hidden="true" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description={statusFilter ? `No ${statusFilter} orders.` : "You haven't placed any orders yet."}
          action={{ label: 'Start Shopping', href: '/shop' }}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => {
            const statusConfig = ORDER_STATUS_CONFIG[order.orderStatus] || { label: order.orderStatus, badgeClass: 'badge-cyan' };

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/profile/orders/${order._id}`}
                  className="card-hover block p-5 group"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-text-primary group-hover:text-accent-gold transition-colors">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`badge ${statusConfig.badgeClass} capitalize`}>
                        {statusConfig.label}
                      </span>
                      <span className="font-bold text-text-primary">
                        ${order.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <img
                          key={idx}
                          src={item.image || `https://picsum.photos/seed/${idx}/40/40`}
                          alt={item.title}
                          className="w-9 h-9 rounded-lg object-cover border-2 border-surface"
                        />
                      ))}
                      {order.items?.length > 3 && (
                        <div className="w-9 h-9 rounded-lg bg-surface-2 border-2 border-surface flex items-center justify-center text-xs text-text-muted font-medium">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-text-muted ml-1">
                      {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                    </p>
                    <ChevronRight size={14} className="text-text-muted ml-auto group-hover:text-text-primary transition-colors" />
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
  );
}
