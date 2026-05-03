import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEOHead from '../components/shared/SEOHead/SEOHead';

export default function NotFound() {
  return (
    <>
      <SEOHead title="Page Not Found" noIndex />
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          <div className="text-8xl font-display font-bold text-gradient-gold mb-4">404</div>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-4">Page Not Found</h1>
          <p className="text-text-secondary mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/" className="btn-primary">Go Home</Link>
            <Link to="/shop" className="btn-secondary">Browse Products</Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
