import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCart, Heart, User, Search, Menu, X, ChevronDown,
  Package, LogOut, Settings, LayoutDashboard, Store,
} from 'lucide-react';
import { selectCartItemCount, toggleCartDrawer } from '../../../store/slices/cartSlice';
import { selectWishlistCount } from '../../../store/slices/wishlistSlice';
import { selectCurrentUser, selectIsAuthenticated, logoutUser } from '../../../store/slices/authSlice';
import { openAuthModal, openSearch, closeMobileNav, openMobileNav, selectMobileNavOpen } from '../../../store/slices/uiSlice';
import { selectUnreadCount } from '../../../store/slices/notificationSlice';
import SearchBar from './SearchBar';
import MegaMenu from './MegaMenu';
import MobileNav from '../MobileNav/MobileNav';
import clsx from 'clsx';

const NAV_CATEGORIES = [
  { label: 'Electronics', slug: 'electronics', featured: true },
  { label: 'Fashion', slug: 'fashion', featured: true },
  { label: 'Home & Living', slug: 'home-living' },
  { label: 'Beauty', slug: 'beauty-health' },
  { label: 'Sports', slug: 'sports-outdoors' },
  { label: 'Books', slug: 'books-media' },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = useSelector(selectCartItemCount);
  const wishlistCount = useSelector(selectWishlistCount);
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const mobileNavOpen = useSelector(selectMobileNavOpen);
  const unreadCount = useSelector(selectUnreadCount);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const userMenuRef = useRef(null);

  // Smart scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      setIsHidden(currentScrollY > lastScrollY.current && currentScrollY > 100);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-surface border-b border-border text-xs text-text-muted hidden md:block">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between">
          <span>Free shipping on orders over $75 🚀</span>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-text-primary transition-colors">About</Link>
            <Link to="/contact" className="hover:text-text-primary transition-colors">Contact</Link>
            <Link to="/faq" className="hover:text-text-primary transition-colors">FAQ</Link>
            {!isAuthenticated && (
              <Link to="/become-a-seller" className="text-accent-gold hover:text-yellow-400 transition-colors font-medium">
                Sell on Nexus
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <motion.header
        animate={{ y: isHidden ? '-100%' : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={clsx(
          'sticky top-0 z-sticky transition-all duration-300',
          isScrolled ? 'glass shadow-card' : 'bg-bg border-b border-border'
        )}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-1 shrink-0"
              aria-label="Nexus Commerce Home"
            >
              <span className="text-2xl font-display font-bold text-gradient-gold">NEXUS</span>
              <span className="text-accent-cyan text-2xl font-bold">.</span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-1 ml-4" aria-label="Main navigation">
              {NAV_CATEGORIES.map((cat) => (
                <div
                  key={cat.slug}
                  className="relative"
                  onMouseEnter={() => setActiveMegaMenu(cat.slug)}
                  onMouseLeave={() => setActiveMegaMenu(null)}
                >
                  <Link
                    to={`/shop/${cat.slug}`}
                    className={clsx(
                      'flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      location.pathname.includes(cat.slug)
                        ? 'text-accent-gold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                    )}
                  >
                    {cat.label}
                    <ChevronDown size={14} className={clsx(
                      'transition-transform duration-200',
                      activeMegaMenu === cat.slug && 'rotate-180'
                    )} />
                  </Link>

                  <AnimatePresence>
                    {activeMegaMenu === cat.slug && (
                      <MegaMenu category={cat} onClose={() => setActiveMegaMenu(null)} />
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <Link
                to="/deals"
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-error hover:bg-error/10 transition-colors"
              >
                🔥 Deals
              </Link>

              <Link
                to="/new-arrivals"
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-accent-cyan hover:bg-accent-cyan/10 transition-colors"
              >
                ✨ New
              </Link>
            </nav>

            {/* Search bar (desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <SearchBar />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Mobile search */}
              <button
                onClick={() => dispatch(openSearch())}
                className="md:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors touch-target"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <Link
                to="/profile/wishlist"
                className="relative p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors touch-target hidden sm:flex items-center"
                aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ''}`}
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => dispatch(toggleCartDrawer())}
                className="relative p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors touch-target"
                aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent-gold text-bg text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </button>

              {/* User menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-md hover:bg-surface-2 transition-colors"
                    aria-label="User menu"
                    aria-expanded={userMenuOpen}
                  >
                    {user?.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent-gold/20 border border-accent-gold/30 flex items-center justify-center text-accent-gold text-sm font-semibold">
                        {user?.firstName?.[0]?.toUpperCase()}
                      </div>
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-surface border border-border shadow-modal overflow-hidden z-dropdown"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-semibold text-text-primary">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-text-muted truncate">{user?.email}</p>
                          <span className="badge-gold text-[10px] mt-1 inline-block capitalize">{user?.membershipTier}</span>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                          <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors">
                            <User size={16} /> My Account
                          </Link>
                          <Link to="/profile/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors">
                            <Package size={16} /> My Orders
                          </Link>
                          {['seller', 'admin', 'superadmin'].includes(user?.role) && (
                            <Link to="/seller-dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent-gold hover:bg-accent-gold/10 transition-colors">
                              <Store size={16} /> Seller Dashboard
                            </Link>
                          )}
                          {['admin', 'superadmin'].includes(user?.role) && (
                            <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent-cyan hover:bg-accent-cyan/10 transition-colors">
                              <LayoutDashboard size={16} /> Admin Panel
                            </Link>
                          )}
                          <Link to="/profile/security" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors">
                            <Settings size={16} /> Settings
                          </Link>
                        </div>

                        <div className="border-t border-border py-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => dispatch(openAuthModal('login'))}
                    className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => dispatch(openAuthModal('register'))}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Join Free
                  </button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => dispatch(mobileNavOpen ? closeMobileNav() : openMobileNav())}
                className="lg:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors touch-target"
                aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileNavOpen}
              >
                {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile navigation */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => dispatch(closeMobileNav())} />
    </>
  );
}
