import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingBag, Package, Star, TrendingUp,
  AlertTriangle, Plus, Eye, ArrowUpRight, ArrowDownRight,
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

const CATEGORY_DATA = [
  { name: 'Electronics', value: 35, color: '#00E5FF' },
  { name: 'Fashion', value: 28, color: '#C9A84C' },
  { name: 'Home', value: 20, color: '#00C896' },
  { name: 'Other', value: 17, color: '#8B5CF6' },
];

function StatCard({ title, value, change, icon: Icon, color, prefix = '', suffix = '' }) {
  const isPositive = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-success' : 'text-error'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(change)}%
        </div>
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
    <div className="bg-surface border border-border rounded-lg p-3 shadow-card text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name === 'revenue' ? `$${p.value.toLocaleString()}` : p.value} {p.name}
        </p>
      ))}
    </div>
  );
};

export default function SellerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [revenueData] = useState(generateRevenueData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/sellers/me/analytics/overview')
      .then((res) => setAnalytics(res.data.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const stats = [
    {
      title: 'Revenue (30 days)',
      value: analytics?.revenue?.current || 0,
      change: analytics?.revenue?.change || 0,
      icon: DollarSign,
      color: '#C9A84C',
      prefix: '$',
    },
    {
      title: 'Orders (30 days)',
      value: analytics?.orders?.current || 0,
      change: analytics?.orders?.change || 0,
      icon: ShoppingBag,
      color: '#00E5FF',
    },
    {
      title: 'Active Products',
      value: analytics?.products?.total || 0,
      change: 0,
      icon: Package,
      color: '#00C896',
    },
    {
      title: 'Store Rating',
      value: analytics?.rating?.average?.toFixed(1) || '—',
      change: 0,
      icon: Star,
      color: '#FFB800',
    },
  ];

  return (
    <>
      <SEOHead title="Seller Dashboard" noIndex />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">Seller Dashboard</h1>
            <p className="text-text-muted text-sm mt-0.5">Welcome back! Here's what's happening with your store.</p>
          </div>
          <Link to="/seller-dashboard/products/add" className="btn-primary text-sm">
            <Plus size={16} /> Add Product
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue chart */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-text-primary">Revenue Overview</h2>
              <div className="flex gap-2">
                {['7D', '30D', '90D'].map((period) => (
                  <button
                    key={period}
                    className="px-3 py-1 rounded-md text-xs font-medium bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
                  >
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

          {/* Category breakdown */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-text-primary mb-6">Sales by Category</h2>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {CATEGORY_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ background: '#111113', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {CATEGORY_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-text-secondary">{item.name}</span>
                  </div>
                  <span className="font-semibold text-text-primary">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'View Products', to: '/seller-dashboard/products', icon: Package, color: '#00E5FF' },
            { label: 'Manage Orders', to: '/seller-dashboard/orders', icon: ShoppingBag, color: '#C9A84C' },
            { label: 'Analytics', to: '/seller-dashboard/analytics', icon: TrendingUp, color: '#00C896' },
            { label: 'Inventory', to: '/seller-dashboard/inventory', icon: AlertTriangle, color: '#FFB800' },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="card-hover p-4 flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${action.color}15` }}>
                <action.icon size={18} style={{ color: action.color }} />
              </div>
              <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                {action.label}
              </span>
              <ArrowUpRight size={14} className="text-text-muted ml-auto group-hover:text-text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
