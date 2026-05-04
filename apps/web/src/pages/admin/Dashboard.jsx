import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, ShoppingBag, DollarSign, Package, Star,
  AlertTriangle, TrendingUp, ArrowUpRight,
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
  }));

function KPICard({ title, value, change, icon: Icon, color, prefix = '' }) {
  const isPositive = change >= 0;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold ${isPositive ? 'text-success' : 'text-error'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-text-primary">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-xs text-text-muted mt-1">{title}</p>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [chartData] = useState(generateData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/admin/dashboard')
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const kpis = [
    { title: 'Total Revenue', value: data?.revenue?.total || 0, change: 12, icon: DollarSign, color: '#C9A84C', prefix: '$' },
    { title: 'Total Users', value: data?.users?.total || 0, change: 8, icon: Users, color: '#00E5FF' },
    { title: 'Total Orders', value: data?.orders?.total || 0, change: 15, icon: ShoppingBag, color: '#00C896' },
    { title: 'Active Products', value: data?.products?.total || 0, change: 5, icon: Package, color: '#8B5CF6' },
    { title: 'Pending Reviews', value: data?.pendingReviews || 0, icon: Star, color: '#FFB800' },
    { title: 'Pending Sellers', value: data?.pendingSellers || 0, icon: AlertTriangle, color: '#FF4D6D' },
  ];

  const QUICK_LINKS = [
    { label: 'Manage Users', to: '/admin/users', icon: Users },
    { label: 'Seller Approvals', to: '/admin/sellers?status=pending', icon: AlertTriangle },
    { label: 'Review Moderation', to: '/admin/reviews?status=pending', icon: Star },
    { label: 'Revenue Analytics', to: '/admin/analytics', icon: TrendingUp },
  ];

  return (
    <>
      <SEOHead title="Admin Dashboard" noIndex />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-text-primary">Admin Dashboard</h1>
          <p className="text-text-muted text-sm mt-0.5">Platform overview and management</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {kpis.map((kpi) => <KPICard key={kpi.title} {...kpi} />)}
        </div>

        {/* Revenue chart */}
        <div className="card p-6 mb-8">
          <h2 className="font-display font-semibold text-text-primary mb-6">Platform Revenue (30 Days)</h2>
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
              <Tooltip contentStyle={{ background: '#111113', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#adminRevGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="card-hover p-4 flex items-center gap-3 group">
              <link.icon size={18} className="text-accent-gold" />
              <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">{link.label}</span>
              <ArrowUpRight size={14} className="text-text-muted ml-auto" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
