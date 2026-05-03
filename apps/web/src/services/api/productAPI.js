import axiosInstance from './axiosInstance';

export const productAPI = {
  getProducts: (params) => axiosInstance.get('/products', { params }),
  getProduct: (slug) => axiosInstance.get(`/products/${slug}`),
  getFeatured: (limit) => axiosInstance.get('/products/featured', { params: { limit } }),
  getTrending: (limit) => axiosInstance.get('/products/trending', { params: { limit } }),
  getNewArrivals: (limit) => axiosInstance.get('/products/new-arrivals', { params: { limit } }),
  getFlashDeals: () => axiosInstance.get('/products/flash-deals'),
  getRelated: (id) => axiosInstance.get(`/products/${id}/related`),
  search: (params) => axiosInstance.get('/search', { params }),
  autocomplete: (q) => axiosInstance.get('/search/autocomplete', { params: { q } }),
  popularSearches: () => axiosInstance.get('/search/popular'),
  incrementView: (id) => axiosInstance.post(`/products/${id}/view`),
  createProduct: (data) => axiosInstance.post('/products', data),
  updateProduct: (id, data) => axiosInstance.put(`/products/${id}`, data),
  deleteProduct: (id) => axiosInstance.delete(`/products/${id}`),
  uploadImages: (id, formData) => axiosInstance.post(`/products/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
