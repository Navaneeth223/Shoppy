import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  Home, ShoppingBag, Tag, Sparkles, User, Package,
  Heart, MapPin, Bell, Shield, LogOut, Store, ChevronRight,
} from 'lucide-react';
import { selectCurrentUser, selectIsAuthenticated, logoutUser } from '../../../store/slices/authSlice';
import { openAuthModal } from '../../../store/slices/uiSlice';
import { createPortal } from 'react-dom';

const NAV_ITEMS = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Shop', to: '/shop', icon: ShoppingBag },
  { label: 'Deals', to: '/deals', icon: Tag },
  { label: 'New Arrivals', to: '/new-arrivals', icon: Sparkles },
];

const USER_ITEMS = [
  { label: 'My Account', to: '/profile', icon: User },
  { label: 'My Orders', to: '/profile/orders', icon: Package },
  { label: 'Wishlist', to: '/profile/wishlist', icon: Heart },
  { label: 'Addresses', to: '/profile/addresses', icon: MapPin },
  { label: 'Notifications', to: '/profile/notifications', icon: Bell },
  { label: 'Security', to: '/profile/security', icon: Shield },
];

export default function MobileNav({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    onClose();
    navigate('/');
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-overlay"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-80 bg-surface border-r border-border z-modal overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="text-2xl font-display font-bold text-gradient-gold">NEXUS<span className="text-accent-cyan">.</span></div>
              {isAuthenticated && user && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-gold/20 border border-accent-gold/30 flex items-center justify-center text-accent-gold font-semibold">
                    {user.firstName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-text-muted capitalize">{user.membershipTier} Member</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="p-4">
              <div className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
                  >
                    <item.icon size={18} />
                    {item.label}
                    <ChevronRight size={14} className="ml-auto text-text-muted" />
                  </Link>
                ))}
              </div>

              {isAuthenticated ? (
                <>
                  <div className="divider my-4" />
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 mb-2">Account</p>
                  <div className="space-y-1">
                    {USER_ITEMS.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
                      >
                        <item.icon size={18} />
                        {item.label}
                      </Link>
                    ))}
                    {['seller', 'admin', 'superadmin'].includes(user?.role) && (
                      <Link
                        to="/seller-dashboard"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-accent-gold hover:bg-accent-gold/10 transition-colors"
                      >
                        <Store size={18} />
                        Seller Dashboard
                      </Link>
                    )}
                  </div>
                  <div className="divider my-4" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="divider my-4" />
                  <div className="space-y-2 px-3">
                    <button
                      onClick={() => { dispatch(openAuthModal('login')); onClose(); }}
                      className="w-full btn-secondary text-sm py-3"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { dispatch(openAuthModal('register')); onClose(); }}
                      className="w-full btn-primary text-sm py-3"
                    >
                      Create Account
                    </button>
                  </div>
                </>
              )}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
