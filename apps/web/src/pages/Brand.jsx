import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead/SEOHead';
import ProductGrid from '../components/product/ProductGrid/ProductGrid';
import { productAPI } from '../services/api/productAPI';
import axiosInstance from '../services/api/axiosInstance';

export default function Brand() {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axiosInstance.get(`/brands/${slug}`),
      productAPI.getProducts({ brand: slug, limit: 24 }),
    ])
      .then(([brandRes, productsRes]) => {
        setBrand(brandRes.data.data);
        setProducts(productsRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [slug]);

  return (
    <>
      <SEOHead
        title={brand?.name || 'Brand'}
        description={brand?.description || `Shop ${brand?.name} products on Nexus Commerce.`}
        image={brand?.logo?.url}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {brand && (
          <div className="flex items-center gap-6 mb-10 p-6 card">
            {brand.logo?.url && (
              <img src={brand.logo.url} alt={brand.name} className="w-20 h-20 object-contain rounded-xl bg-surface-2 p-2" />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-display font-bold text-text-primary">{brand.name}</h1>
              {brand.description && <p className="text-text-secondary mt-1">{brand.description}</p>}
              {brand.website && (
                <a href={brand.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-accent-cyan hover:underline mt-2">
                  Visit Website <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        )}
        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </>
  );
}
