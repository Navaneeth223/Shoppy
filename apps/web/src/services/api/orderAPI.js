import axiosInstance from './axiosInstance';

export const orderAPI = {
  createOrder: (data) => axiosInstance.post('/orders', data),
  getOrder: (id) => axiosInstance.get(`/orders/${id}`),
  trackOrder: (orderNumber) => axiosInstance.get(`/orders/track/${orderNumber}`),
  getUserOrders: (params) => axiosInstance.get('/users/me/orders', { params }),
  cancelOrder: (id, reason) => axiosInstance.post(`/users/me/orders/${id}/cancel`, { reason }),
  requestReturn: (id, data) => axiosInstance.post(`/users/me/orders/${id}/return`, data),
};
