import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import CartDrawer from '../../cart/CartDrawer/CartDrawer';
import AuthModal from '../../auth/AuthModal/AuthModal';
import ScrollToTop from '../../shared/ScrollToTop/ScrollToTop';
import { useSelector } from 'react-redux';
import { selectCartDrawerOpen } from '../../../store/slices/cartSlice';
import { selectAuthModalOpen } from '../../../store/slices/uiSlice';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function PageWrapper() {
  const location = useLocation();
  const cartDrawerOpen = useSelector(selectCartDrawerOpen);
  const authModalOpen = useSelector(selectAuthModalOpen);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Skip navigation link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-accent-cyan focus:text-bg focus:rounded-md focus:font-semibold"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      {/* Global overlays */}
      <CartDrawer />
      {authModalOpen && <AuthModal />}
      <ScrollToTop />
    </div>
  );
}
