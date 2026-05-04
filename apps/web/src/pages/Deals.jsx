import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import ProductGrid from '../components/product/ProductGrid/ProductGrid';
import { productAPI } from '../services/api/productAPI';

function CountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(endTime) - new Date());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="flex items-center gap-1 font-mono text-sm">
      {[timeLeft.h, timeLeft.m, timeLeft.s].map((val, i) => (
        <React.Fragment key={i}>
          <span className="bg-surface-2 border border-border rounded px-2 py-1 font-bold text-text-primary min-w-[2.5rem] text-center">
            {String(val).padStart(2, '0')}
          </span>
          {i < 2 && <span className="text-text-muted">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Deals() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productAPI.getFlashDeals()
      .then((res) => setProducts(res.data.data || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <SEOHead
        title="Flash Deals — Up to 70% Off"
        description="Limited time flash deals on premium products. Shop now before they're gone!"
      />

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-error/20 via-surface to-surface border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-2 text-error">
              <Zap size={28} fill="currentColor" />
              <span className="text-sm font-semibold uppercase tracking-widest">Flash Sale</span>
              <Zap size={28} fill="currentColor" />
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-text-primary">
              Up to <span className="text-error">70% Off</span>
            </h1>
            <p className="text-text-secondary text-lg">Limited time offers — grab them before they're gone!</p>
            <div className="flex items-center gap-3 mt-2">
              <Clock size={16} className="text-text-muted" />
              <span className="text-sm text-text-muted">Deals refresh in:</span>
              <CountdownTimer endTime={new Date(Date.now() + 6 * 60 * 60 * 1000)} />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <ProductGrid products={products} isLoading={isLoading} skeletonCount={8} />
      </div>
    </>
  );
}
