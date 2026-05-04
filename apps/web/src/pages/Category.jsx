import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, SlidersHorizontal, Grid3X3, List, ChevronDown } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import ProductGrid from '../components/product/ProductGrid/ProductGrid';
import Pagination from '../components/ui/Pagination/Pagination';
import { productAPI } from '../services/api/productAPI';
import axiosInstance from '../services/api/axiosInstance';
import clsx from 'clsx';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'bestseller', label: 'Best Sellers' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function Category() {
  const { categorySlug, subcategorySlug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('bestseller');
  const [view, setView] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch category info
    axiosInstance.get(`/categories/${subcategorySlug || categorySlug}`)
      .then((res) => setCategory(res.data.data))
      .catch(() => {});
  }, [categorySlug, subcategorySlug]);

  useEffect(() => {
    setIsLoading(true);
    const params = { page, limit: 24, sort };
    if (subcategorySlug) {
      params.subcategory = subcategorySlug;
    } else {
      params.category = categorySlug;
    }

    productAPI.getProducts(params)
      .then((res) => {
        setProducts(res.data.data || []);
        setTotal(res.data.meta?.total || 0);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [categorySlug, subcategorySlug, page, sort]);

  const totalPages = Math.ceil(total / 24);
  const displayName = category?.name || categorySlug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <SEOHead
        title={displayName}
        description={category?.description || `Shop ${displayName} — browse our curated selection of premium products.`}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-text-primary transition-colors">Shop</Link>
          {subcategorySlug && (
            <>
              <ChevronRight size={14} />
              <Link to={`/shop/${categorySlug}`} className="hover:text-text-primary transition-colors capitalize">
                {categorySlug.replace(/-/g, ' ')}
              </Link>
            </>
          )}
          <ChevronRight size={14} />
          <span className="text-text-primary capitalize">{displayName}</span>
        </nav>

        {/* Category header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-display font-bold text-text-primary mb-2"
          >
            {displayName}
          </motion.h1>
          {category?.description && (
            <p className="text-text-secondary">{category.description}</p>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-text-muted">
            {isLoading ? 'Loading...' : `${total.toLocaleString()} products`}
          </p>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="appearance-none input-field py-2 pr-8 text-sm cursor-pointer"
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
            <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-1 border border-border">
              <button
                onClick={() => setView('grid')}
                className={clsx('p-1.5 rounded-md transition-colors', view === 'grid' ? 'bg-accent-gold text-bg' : 'text-text-muted hover:text-text-primary')}
                aria-label="Grid view" aria-pressed={view === 'grid'}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setView('list')}
                className={clsx('p-1.5 rounded-md transition-colors', view === 'list' ? 'bg-accent-gold text-bg' : 'text-text-muted hover:text-text-primary')}
                aria-label="List view" aria-pressed={view === 'list'}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <ProductGrid products={products} isLoading={isLoading} view={view} />

        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          </div>
        )}
      </div>
    </>
  );
}
