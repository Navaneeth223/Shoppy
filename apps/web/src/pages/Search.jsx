import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import ProductGrid from '../components/product/ProductGrid/ProductGrid';
import Pagination from '../components/ui/Pagination/Pagination';
import { productAPI } from '../services/api/productAPI';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    setIsLoading(true);
    productAPI.search({ q: query, page, limit: 24 })
      .then((res) => {
        setResults(res.data.data?.products || []);
        setTotal(res.data.data?.total || 0);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [query, page]);

  const totalPages = Math.ceil(total / 24);

  return (
    <>
      <SEOHead
        title={query ? `Search: "${query}"` : 'Search'}
        description={`Search results for "${query}" on Nexus Commerce`}
        noIndex
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SearchIcon size={24} className="text-accent-gold" />
            <h1 className="text-2xl font-display font-bold text-text-primary">
              {query ? `Results for "${query}"` : 'Search Products'}
            </h1>
          </div>
          {!isLoading && query && (
            <p className="text-text-muted text-sm">
              {total.toLocaleString()} {total === 1 ? 'result' : 'results'} found
            </p>
          )}
        </div>

        <ProductGrid products={results} isLoading={isLoading} />

        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => {
                setSearchParams({ q: query, page: p.toString() });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
