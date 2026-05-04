import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import ProductGrid from '../components/product/ProductGrid/ProductGrid';
import { productAPI } from '../services/api/productAPI';
import { formatDistanceToNow } from 'date-fns';

function CountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const end = new Date(endTime);
      const now = new Date();
      const diff = end - now;
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <span className="font-mono text-accent-gold font-bold">{timeLeft}</span>
  );
}

export default function Deals() {
  const [flashDeals, setFlashDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productAPI.getFlashDeals()
      .then((res) => setFlashDeals(res.data.data || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <SEOHead
        title="Flash Deals — Up to 70% Off"
        description="Limited time flash deals on premium products. Shop now before they're gone!"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-error/20 via-surface to-surface border border-error/20 p-8 mb-12 text-center"
        >
          <div className="absolute inset-0 bg-gradient-radial from-error/5 via-transparent to-transparent" />
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap size={28} className="text-error" />
              <h1 className="text-4xl font-display font-bold text-text-primary">Flash Deals</h1>
              <Zap size={28} className="text-error" />
            </div>
            <p className="text-text-secondary mb-4">Limited time offers — grab them before they're gone!</p>
            {flashDeals[0]?.flashDealExpiry && (
              <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
                <Clock size={14} />
                <span>Ends in: </span>
                <CountdownTimer endTime={flashDeals[0].flashDealExpiry} />
              </div>
            )}
          </div>
        </motion.div>

        <ProductGrid products={flashDeals} isLoading={isLoading} skeletonCount={8} />

        {!isLoading && flashDeals.length === 0 && (
          <div className="text-center py-20">
            <Zap size={48} className="text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-display font-semibold text-text-primary mb-2">No Active Deals</h2>
            <p className="text-text-muted">Check back soon for new flash deals!</p>
          </div>
        )}
      </div>
    </>
  );
}
