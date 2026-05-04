import axiosInstance from './axiosInstance';

export const categoryAPI = {
  getCategories: (params) => axiosInstance.get('/categories', { params }),
  getCategory: (slug) => axiosInstance.get(`/categories/${slug}`),
  getCategoryTree: () => axiosInstance.get('/categories', { params: { tree: true } }),
};
