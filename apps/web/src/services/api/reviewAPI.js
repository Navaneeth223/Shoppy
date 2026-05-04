import axiosInstance from './axiosInstance';

export const reviewAPI = {
  getProductReviews: (productId, params) =>
    axiosInstance.get(`/products/${productId}/reviews`, { params }),
  createReview: (productId, data) =>
    axiosInstance.post(`/products/${productId}/reviews`, data),
  voteReview: (reviewId, vote) =>
    axiosInstance.post(`/reviews/${reviewId}/vote`, { vote }),
  replyToReview: (reviewId, body) =>
    axiosInstance.post(`/reviews/${reviewId}/reply`, { body }),
};
