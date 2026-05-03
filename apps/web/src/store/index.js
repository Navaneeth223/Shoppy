import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import uiReducer from './slices/uiSlice';
import filterReducer from './slices/filterSlice';
import notificationReducer from './slices/notificationSlice';
import { localStorageMiddleware } from './middleware/localStorageMiddleware';
import { nexusApi } from '../services/api/nexusApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
    filter: filterReducer,
    notifications: notificationReducer,
    [nexusApi.reducerPath]: nexusApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(nexusApi.middleware)
      .concat(localStorageMiddleware),
  devTools: import.meta.env.DEV,
});

export default store;
