import { useState, useEffect, useCallback } from 'react';
import { productAPI } from '../services/api/productAPI';

/**
 * Hook for fetching a paginated list of products with filters.
 * @param {object} initialParams - Initial query parameters
 * @returns {{ products, total, page, isLoading, error, setPage, setParams, refresh }}
 */
export function useProducts(initialParams = {}) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialParams.page || 1);
  const [params, setParams] = useState(initialParams);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productAPI.getProducts({ ...params, page });
      setProducts(response.data.data || []);
      setTotal(response.data.meta?.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [params, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParams = useCallback((newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
    setPage(1);
  }, []);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / (params.limit || 24)),
    isLoading,
    error,
    setPage,
    setParams: updateParams,
    refresh: fetchProducts,
    isEmpty: !isLoading && products.length === 0,
  };
}

/**
 * Hook for fetching a single product by slug.
 * @param {string} slug
 * @returns {{ product, isLoading, error }}
 */
export function useProduct(slug) {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    productAPI.getProduct(slug)
      .then((res) => setProduct(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Product not found'))
      .finally(() => setIsLoading(false));
  }, [slug]);

  return { product, isLoading, error };
}
