import axiosInstance from './axiosInstance';

export const paymentAPI = {
  createPaymentIntent: (orderId) => axiosInstance.post('/payments/create-payment-intent', { orderId }),
  savePaymentMethod: (stripePaymentMethodId) => axiosInstance.post('/payments/save-payment-method', { stripePaymentMethodId }),
  getPaymentMethods: () => axiosInstance.get('/payments/payment-methods'),
  processRefund: (orderId, amount, reason) => axiosInstance.post(`/payments/refund/${orderId}`, { amount, reason }),
};
