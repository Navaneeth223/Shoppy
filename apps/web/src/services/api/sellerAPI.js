import axiosInstance from './axiosInstance';

export const sellerAPI = {
  apply: (data) => axiosInstance.post('/sellers/apply', data),
  getProfile: () => axiosInstance.get('/sellers/me'),
  updateProfile: (data) => axiosInstance.put('/sellers/me', data),
  getProducts: (params) => axiosInstance.get('/sellers/me/products', { params }),
  getOrders: (params) => axiosInstance.get('/sellers/me/orders', { params }),
  updateOrderItemStatus: (orderId, itemId, data) =>
    axiosInstance.put(`/sellers/me/orders/${orderId}/items/${itemId}/status`, data),
  getAnalyticsOverview: () => axiosInstance.get('/sellers/me/analytics/overview'),
  getRevenueAnalytics: (params) =>
    axiosInstance.get('/sellers/me/analytics/revenue', { params }),
  getTopProducts: () => axiosInstance.get('/sellers/me/analytics/products'),
  getInventory: (params) => axiosInstance.get('/sellers/me/inventory', { params }),
  updateInventory: (variantId, data) =>
    axiosInstance.put(`/sellers/me/inventory/${variantId}`, data),
  getCoupons: () => axiosInstance.get('/coupons'),
  createCoupon: (data) => axiosInstance.post('/coupons', data),
  updateCoupon: (id, data) => axiosInstance.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => axiosInstance.delete(`/coupons/${id}`),
  getPayouts: () => axiosInstance.get('/sellers/me/payouts'),
  getPublicStore: (slug) => axiosInstance.get(`/sellers/${slug}`),
  getStoreProducts: (slug, params) =>
    axiosInstance.get(`/sellers/${slug}/products`, { params }),
};
