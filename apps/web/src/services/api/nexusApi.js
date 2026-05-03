import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

/**
 * RTK Query base API service.
 * All API endpoints are injected from their respective slice files.
 */
export const nexusApi = createApi({
  reducerPath: 'nexusApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      try {
        const stored = localStorage.getItem('nexus_auth');
        if (stored) {
          const { accessToken } = JSON.parse(stored);
          if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`);
          }
        }
      } catch {
        // Ignore
      }
      return headers;
    },
  }),
  tagTypes: [
    'Products', 'Product', 'Cart', 'Orders', 'Order',
    'User', 'Seller', 'Reviews', 'Categories', 'Brands',
    'Notifications', 'Analytics', 'Wishlist', 'Addresses',
    'FlashDeals', 'Banners',
  ],
  endpoints: () => ({}),
});
