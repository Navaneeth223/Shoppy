import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
      <SEOHead title={brand?.name || 'Brand'} description={brand?.description} image={brand?.logo?.url} />

      {brand && (
        <div className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center gap-6">
              {brand.logo?.url && (
                <img src={brand.logo.url} alt={brand.name} className="w-20 h-20 rounded-xl object-contain bg-surface-2 p-2 border border-border" />
              )}
              <div>
                <h1 className="text-3xl font-display font-bold text-text-primary">{brand.name}</h1>
                {brand.description && <p className="text-text-secondary mt-1 max-w-xl">{brand.description}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </>
  );
}
