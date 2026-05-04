import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import ProductGrid from '../components/product/ProductGrid/ProductGrid';
import { productAPI } from '../services/api/productAPI';

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productAPI.getNewArrivals(24)
      .then((res) => setProducts(res.data.data || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <SEOHead
        title="New Arrivals"
        description="Discover the latest products just added to Nexus Commerce. Fresh drops from top brands."
      />

      <div className="bg-gradient-to-r from-accent-cyan/10 via-surface to-surface border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
            <Sparkles size={32} className="text-accent-cyan" />
            <h1 className="text-5xl font-display font-bold text-text-primary">New Arrivals</h1>
            <p className="text-text-secondary text-lg">Fresh drops from the world's best brands</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <ProductGrid products={products} isLoading={isLoading} skeletonCount={12} />
      </div>
    </>
  );
}
