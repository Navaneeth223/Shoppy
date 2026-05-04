import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import ProductGrid from '../components/product/ProductGrid/ProductGrid';
import Pagination from '../components/ui/Pagination/Pagination';
import { productAPI } from '../services/api/productAPI';

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    productAPI.getNewArrivals(24)
      .then((res) => {
        setProducts(res.data.data || []);
        setTotal(res.data.data?.length || 0);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [page]);

  return (
    <>
      <SEOHead
        title="New Arrivals"
        description="Discover the latest products just added to Nexus Commerce. Fresh drops from top brands every day."
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles size={28} className="text-accent-cyan" />
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary">New Arrivals</h1>
            <p className="text-text-muted text-sm mt-1">Fresh drops added in the last 30 days</p>
          </div>
        </div>
        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </>
  );
}
