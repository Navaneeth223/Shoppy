import axiosInstance from './axiosInstance';

export const userAPI = {
  getMe: () => axiosInstance.get('/users/me'),
  updateMe: (data) => axiosInstance.put('/users/me', data),
  changePassword: (data) => axiosInstance.put('/users/me/password', data),
  uploadAvatar: (formData) => axiosInstance.put('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deactivateAccount: () => axiosInstance.delete('/users/me'),

  // Addresses
  getAddresses: () => axiosInstance.get('/users/me/addresses'),
  addAddress: (data) => axiosInstance.post('/users/me/addresses', data),
  updateAddress: (id, data) => axiosInstance.put(`/users/me/addresses/${id}`, data),
  deleteAddress: (id) => axiosInstance.delete(`/users/me/addresses/${id}`),
  setDefaultAddress: (id) => axiosInstance.put(`/users/me/addresses/${id}/default`),

  // Wishlist
  getWishlist: (params) => axiosInstance.get('/users/me/wishlist', { params }),
  addToWishlist: (productId) => axiosInstance.post(`/users/me/wishlist/${productId}`),
  removeFromWishlist: (productId) => axiosInstance.delete(`/users/me/wishlist/${productId}`),

  // Notifications
  getNotifications: (params) => axiosInstance.get('/users/me/notifications', { params }),
  markNotificationRead: (id) => axiosInstance.put(`/users/me/notifications/${id}/read`),
  markAllNotificationsRead: () => axiosInstance.put('/users/me/notifications/read-all'),

  // Reviews
  getMyReviews: (params) => axiosInstance.get('/users/me/reviews', { params }),

  // Loyalty
  getLoyaltyInfo: () => axiosInstance.get('/users/me/loyalty'),
};
