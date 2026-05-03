import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Package, Heart, MapPin, CreditCard, Bell, Shield,
  Star, Gift, ChevronRight, TrendingUp,
} from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import { selectCurrentUser } from '../store/slices/authSlice';

const MENU_ITEMS = [
  { icon: Package, label: 'My Orders', desc: 'Track and manage your orders', to: '/profile/orders', color: '#C9A84C' },
  { icon: Heart, label: 'Wishlist', desc: 'Items you\'ve saved for later', to: '/profile/wishlist', color: '#FF4D6D' },
  { icon: MapPin, label: 'Addresses', desc: 'Manage delivery addresses', to: '/profile/addresses', color: '#00E5FF' },
  { icon: CreditCard, label: 'Payment Methods', desc: 'Saved cards and payment options', to: '/profile/payment-methods', color: '#00C896' },
  { icon: Bell, label: 'Notifications', desc: 'Manage your notification preferences', to: '/profile/notifications', color: '#FFB800' },
  { icon: Shield, label: 'Security', desc: 'Password, 2FA, and active sessions', to: '/profile/security', color: '#8B5CF6' },
  { icon: Star, label: 'My Reviews', desc: 'Reviews you\'ve written', to: '/profile/reviews', color: '#F97316' },
  { icon: Gift, label: 'Loyalty Points', desc: 'Points balance and tier benefits', to: '/profile/loyalty', color: '#EC4899' },
];

const TIER_COLORS = {
  bronze: { bg: 'bg-orange-900/20', text: 'text-orange-400', border: 'border-orange-800/30' },
  silver: { bg: 'bg-gray-700/20', text: 'text-gray-300', border: 'border-gray-600/30' },
  gold: { bg: 'bg-accent-gold/10', text: 'text-accent-gold', border: 'border-accent-gold/20' },
  platinum: { bg: 'bg-cyan-900/20', text: 'text-accent-cyan', border: 'border-accent-cyan/20' },
};

export default function Profile() {
  const user = useSelector(selectCurrentUser);
  const tier = user?.membershipTier || 'bronze';
  const tierStyle = TIER_COLORS[tier];

  return (
    <>
      <SEOHead title="My Account" noIndex />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-8"
        >
          <div className="flex items-center gap-5">
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={user.firstName}
                className="w-20 h-20 rounded-full object-cover border-2 border-accent-gold/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-accent-gold/20 border-2 border-accent-gold/30 flex items-center justify-center text-3xl font-display font-bold text-accent-gold">
                {user?.firstName?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-text-primary">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-text-muted text-sm mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className={`badge ${tierStyle.bg} ${tierStyle.text} border ${tierStyle.border} capitalize`}>
                  {tier} Member
                </span>
                <span className="text-xs text-text-muted">
                  {user?.loyaltyPoints?.toLocaleString() || 0} points
                </span>
              </div>
            </div>
            <Link to="/profile/settings" className="btn-ghost text-sm hidden md:flex">
              Edit Profile
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            {[
              { label: 'Total Orders', value: user?.totalOrders || 0 },
              { label: 'Total Spent', value: `$${(user?.totalSpent || 0).toFixed(0)}` },
              { label: 'Loyalty Points', value: (user?.loyaltyPoints || 0).toLocaleString() },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Menu grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MENU_ITEMS.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={item.to}
                className="flex items-center gap-4 p-4 card-hover group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon size={20} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary group-hover:text-accent-gold transition-colors">
                    {item.label}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5 truncate">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-text-muted group-hover:text-text-primary transition-colors shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
