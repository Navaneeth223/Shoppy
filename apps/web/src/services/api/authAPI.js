import axiosInstance from './axiosInstance';

export const authAPI = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  logout: () => axiosInstance.post('/auth/logout'),
  refreshToken: () => axiosInstance.post('/auth/refresh-token'),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => axiosInstance.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => axiosInstance.post(`/auth/verify-email/${token}`),
  resendVerification: (email) => axiosInstance.post('/auth/resend-verification', { email }),
  setup2FA: () => axiosInstance.post('/auth/2fa/setup'),
  verify2FA: (token) => axiosInstance.post('/auth/2fa/verify', { token }),
  disable2FA: (password) => axiosInstance.post('/auth/2fa/disable', { password }),
  validate2FA: (tempToken, code) => axiosInstance.post('/auth/2fa/validate', { tempToken, code }),
  updateProfile: (data) => axiosInstance.put('/users/me', data),
};
