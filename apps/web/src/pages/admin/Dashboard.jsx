import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, ShoppingBag, DollarSign, Package, Star,
  AlertTriangle, TrendingUp, ArrowRight, CheckCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import SEOHead from '../../components/shared/SEOHead/SEOHead';
import axiosInstance from '../../services/api/axiosInstance';
import { format, subDays } from 'date-fns';

const generateData = () =>
  Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'MMM d'),
    revenue: Math.floor(Math.random() * 50000) + 10000,
    users: Math.floor(Math.random() * 200) + 50,
    orders: Math.floor(Math.random() * 300) + 100,
  }));

function StatCard({ title, value, change, icon: Icon, color, prefix = '' }) {
  const isPositive = change >= 0;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-text-primary">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
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
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [chartData] = useState(generateData());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/admin/dashboard')
      .then((res) => setDashboard(res.data.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const d = dashboard || {
    users: { total: 0, new: 0 },
    orders: { total: 0, recent: 0 },
    revenue: { total: 0, recent: 0 },
    products: { total: 0 },
    pendingReviews: 0,
    pendingSellers: 0,
  };

  return (
    <>
      <SEOHead title="Admin Dashboard" noIndex />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary">Admin Dashboard</h1>
            <p className="text-text-muted text-sm mt-1">Platform overview and management</p>
          </div>
        </div>

        {/* Alerts */}
        {(d.pendingSellers > 0 || d.pendingReviews > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {d.pendingSellers > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
                <AlertTriangle size={18} className="text-warning shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-warning">{d.pendingSellers} seller applications pending</p>
                </div>
                <Link to="/admin/sellers?status=pending" className="text-xs text-warning underline">Review</Link>
              </div>
            )}
            {d.pendingReviews > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20">
                <Star size={18} className="text-accent-cyan shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-accent-cyan">{d.pendingReviews} reviews awaiting moderation</p>
                </div>
                <Link to="/admin/reviews?status=pending" className="text-xs text-accent-cyan underline">Moderate</Link>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Users" value={d.users.total} change={d.users.new > 0 ? 5.2 : 0} icon={Users} color="#00E5FF" />
          <StatCard title="Total Orders" value={d.orders.total} change={d.orders.recent > 0 ? 8.1 : 0} icon={ShoppingBag} color="#C9A84C" />
          <StatCard title="Total Revenue" value={d.revenue.total} icon={DollarSign} color="#00C896" prefix="$" />
          <StatCard title="Active Products" value={d.products.total} icon={Package} color="#FFB800" />
        </div>

        {/* Revenue chart */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-text-primary">Platform Revenue</h2>
            <Link to="/admin/analytics/revenue" className="text-xs text-accent-cyan hover:text-cyan-300 flex items-center gap-1">
              Full Report <ArrowRight size={12} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#4A4A52', fontSize: 11 }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fill: '#4A4A52', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#adminRevGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Manage Users', to: '/admin/users', icon: Users, color: '#00E5FF' },
            { label: 'Seller Approvals', to: '/admin/sellers', icon: CheckCircle, color: '#00C896' },
            { label: 'All Orders', to: '/admin/orders', icon: ShoppingBag, color: '#C9A84C' },
            { label: 'Analytics', to: '/admin/analytics', icon: TrendingUp, color: '#FFB800' },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-3 p-4 card-hover group"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                <item.icon size={18} style={{ color: item.color }} />
              </div>
              <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
