import axiosInstance from './axiosInstance';

export const cartAPI = {
  getCart: () => axiosInstance.get('/cart'),
  addItem: (data) => axiosInstance.post('/cart/items', data),
  updateItem: (itemId, data) => axiosInstance.put(`/cart/items/${itemId}`, data),
  removeItem: (itemId) => axiosInstance.delete(`/cart/items/${itemId}`),
  clearCart: () => axiosInstance.delete('/cart'),
  mergeCart: (sessionId) => axiosInstance.post('/cart/merge', { sessionId }),
  applyCoupon: (data) => axiosInstance.post('/cart/apply-coupon', data),
  removeCoupon: () => axiosInstance.delete('/cart/coupon'),
};
