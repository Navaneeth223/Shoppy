import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SlidersHorizontal, Grid3X3, List, ChevronDown } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import ProductGrid from '../components/product/ProductGrid/ProductGrid';
import Pagination from '../components/ui/Pagination/Pagination';
import { productAPI } from '../services/api/productAPI';
import { selectFilters, setSortBy, setPage, setView } from '../store/slices/filterSlice';
import clsx from 'clsx';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'bestseller', label: 'Best Sellers' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function Shop() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useSelector(selectFilters);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        sort: filters.sortBy,
        ...(filters.category && { category: filters.category }),
        ...(filters.brands.length && { brand: filters.brands.join(',') }),
        ...(filters.rating && { rating: filters.rating }),
        ...(filters.inStock && { inStock: true }),
        ...(filters.priceRange[0] > 0 && { minPrice: filters.priceRange[0] }),
        ...(filters.priceRange[1] < 10000 && { maxPrice: filters.priceRange[1] }),
        ...(searchParams.get('q') && { q: searchParams.get('q') }),
        ...(searchParams.get('isFeatured') && { isFeatured: true }),
        ...(searchParams.get('isTrending') && { isTrending: true }),
      };

      const response = await productAPI.getProducts(params);
      setProducts(response.data.data || []);
      setTotal(response.data.meta?.total || 0);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.ceil(total / filters.limit);

  return (
    <>
      <SEOHead
        title="Shop All Products"
        description="Browse thousands of premium products across all categories. Filter by brand, price, rating, and more."
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">All Products</h1>
            <p className="text-sm text-text-muted mt-1">
              {isLoading ? 'Loading...' : `${total.toLocaleString()} products found`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => dispatch(setSortBy(e.target.value))}
                className="appearance-none input-field py-2 pr-8 text-sm cursor-pointer"
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-1 border border-border">
              <button
                onClick={() => dispatch(setView('grid'))}
                className={clsx(
                  'p-1.5 rounded-md transition-colors',
                  filters.view === 'grid' ? 'bg-accent-gold text-bg' : 'text-text-muted hover:text-text-primary'
                )}
                aria-label="Grid view"
                aria-pressed={filters.view === 'grid'}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => dispatch(setView('list'))}
                className={clsx(
                  'p-1.5 rounded-md transition-colors',
                  filters.view === 'list' ? 'bg-accent-gold text-bg' : 'text-text-muted hover:text-text-primary'
                )}
                aria-label="List view"
                aria-pressed={filters.view === 'list'}
              >
                <List size={16} />
              </button>
            </div>

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setFilterPanelOpen(true)}
              className="lg:hidden flex items-center gap-2 btn-secondary text-sm px-4 py-2"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Products */}
        <ProductGrid
          products={products}
          isLoading={isLoading}
          view={filters.view}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              page={filters.page}
              totalPages={totalPages}
              onPageChange={(p) => {
                dispatch(setPage(p));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
