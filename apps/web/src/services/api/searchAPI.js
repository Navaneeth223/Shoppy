import axiosInstance from './axiosInstance';

export const searchAPI = {
  search: (params) => axiosInstance.get('/search', { params }),
  autocomplete: (q) => axiosInstance.get('/search/autocomplete', { params: { q } }),
  popular: () => axiosInstance.get('/search/popular'),
  track: (data) => axiosInstance.post('/analytics/track', { type: 'search', ...data }),
};
