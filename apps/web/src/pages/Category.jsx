import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import ProductGrid from '../components/product/ProductGrid/ProductGrid';
import Pagination from '../components/ui/Pagination/Pagination';
import { productAPI } from '../services/api/productAPI';

export default function Category() {
  const { categorySlug, subcategorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const slug = subcategorySlug || categorySlug;
  const title = slug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Category';

  useEffect(() => {
    setIsLoading(true);
    productAPI.getProducts({ page, limit: 24, category: slug })
      .then((res) => {
        setProducts(res.data.data || []);
        setTotal(res.data.meta?.total || 0);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [slug, page]);

  return (
    <>
      <SEOHead title={title} description={`Shop ${title} products on Nexus Commerce`} />
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
                {categorySlug?.replace(/-/g, ' ')}
              </Link>
            </>
          )}
          <ChevronRight size={14} />
          <span className="text-text-primary capitalize">{slug?.replace(/-/g, ' ')}</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary capitalize">{title}</h1>
            <p className="text-text-muted text-sm mt-1">{total.toLocaleString()} products</p>
          </div>
        </div>

        <ProductGrid products={products} isLoading={isLoading} />

        {Math.ceil(total / 24) > 1 && (
          <div className="mt-12">
            <Pagination
              page={page}
              totalPages={Math.ceil(total / 24)}
              onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          </div>
        )}
      </div>
    </>
  );
}
