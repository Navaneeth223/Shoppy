import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingBag, Package, Star, TrendingUp,
  AlertTriangle, Plus, Eye, ArrowRight, BarChart2,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import SEOHead from '../../components/shared/SEOHead/SEOHead';
import axiosInstance from '../../services/api/axiosInstance';
import { format, subDays } from 'date-fns';

// Generate mock chart data
const generateRevenueData = () =>
  Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'MMM d'),
    revenue: Math.floor(Math.random() * 3000) + 500,
    orders: Math.floor(Math.random() * 20) + 2,
  }));

const CHART_COLORS = ['#C9A84C', '#00E5FF', '#00C896', '#FF4D6D', '#FFB800'];

function StatCard({ title, value, change, icon: Icon, color, prefix = '', suffix = '' }) {
  const isPositive = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-text-primary">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
      <p className="text-sm text-text-muted mt-1">{title}</p>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-xl p-3 shadow-modal text-sm">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="font-semibold">
          {entry.name === 'revenue' ? '$' : ''}{entry.value.toLocaleString()}
          {entry.name === 'orders' ? ' orders' : ''}
        </p>
      ))}
    </div>
  );
};

export default function SellerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData] = useState(generateRevenueData());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/sellers/me/analytics/overview'),
      axiosInstance.get('/sellers/me/orders?limit=5'),
    ])
      .then(([analyticsRes, ordersRes]) => {
        setAnalytics(analyticsRes.data.data);
        setRecentOrders(ordersRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const stats = analytics || {
    revenue: { current: 0, change: 0 },
    orders: { current: 0, change: 0 },
    products: { total: 0, outOfStock: 0 },
    rating: { average: 0, count: 0 },
  };

  return (
    <>
      <SEOHead title="Seller Dashboard" noIndex />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary">Seller Dashboard</h1>
            <p className="text-text-muted text-sm mt-1">Welcome back! Here's what's happening with your store.</p>
          </div>
          <Link to="/seller-dashboard/products/add" className="btn-primary text-sm">
            <Plus size={16} /> Add Product
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Revenue (30 days)"
            value={stats.revenue.current}
            change={stats.revenue.change}
            icon={DollarSign}
            color="#C9A84C"
            prefix="$"
          />
          <StatCard
            title="Orders (30 days)"
            value={stats.orders.current}
            change={stats.orders.change}
            icon={ShoppingBag}
            color="#00E5FF"
          />
          <StatCard
            title="Active Products"
            value={stats.products.total}
            icon={Package}
            color="#00C896"
          />
          <StatCard
            title="Store Rating"
            value={stats.rating.average?.toFixed(1) || '—'}
            icon={Star}
            color="#FFB800"
            suffix={stats.rating.count > 0 ? ` (${stats.rating.count})` : ''}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue chart */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-text-primary">Revenue Overview</h2>
              <div className="flex gap-2">
                {['7D', '30D', '90D'].map((period) => (
                  <button key={period} className="px-3 py-1 text-xs rounded-full bg-surface-2 text-text-muted hover:text-text-primary transition-colors">
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#4A4A52', fontSize: 11 }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fill: '#4A4A52', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Orders chart */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-text-primary mb-6">Daily Orders</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#4A4A52', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fill: '#4A4A52', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" fill="#00E5FF" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent orders + alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent orders */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-text-primary">Recent Orders</h2>
              <Link to="/seller-dashboard/orders" className="text-xs text-accent-cyan hover:text-cyan-300 transition-colors flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-text-muted text-sm">No orders yet</div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{order.orderNumber}</p>
                      <p className="text-xs text-text-muted">{order.items?.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-text-primary">${order.totalAmount?.toFixed(2)}</p>
                      <span className="text-xs text-text-muted capitalize">{order.orderStatus?.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Product', icon: Plus, to: '/seller-dashboard/products/add', color: '#C9A84C' },
                { label: 'View Orders', icon: ShoppingBag, to: '/seller-dashboard/orders', color: '#00E5FF' },
                { label: 'Analytics', icon: BarChart2, to: '/seller-dashboard/analytics', color: '#00C896' },
                { label: 'Inventory', icon: Package, to: '/seller-dashboard/inventory', color: '#FFB800' },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex items-center gap-3 p-4 rounded-xl bg-surface-2 border border-border hover:border-text-muted transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${action.color}15` }}>
                    <action.icon size={18} style={{ color: action.color }} />
                  </div>
                  <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>

            {stats.products.outOfStock > 0 && (
              <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
                <AlertTriangle size={16} className="text-warning shrink-0" />
                <p className="text-xs text-warning">
                  {stats.products.outOfStock} product{stats.products.outOfStock > 1 ? 's are' : ' is'} out of stock.{' '}
                  <Link to="/seller-dashboard/inventory" className="underline">Update inventory</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
