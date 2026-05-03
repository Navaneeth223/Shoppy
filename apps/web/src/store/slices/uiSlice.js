import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    cartDrawerOpen: false,
    mobileNavOpen: false,
    searchOpen: false,
    authModalOpen: false,
    authModalMode: 'login', // 'login' | 'register' | 'forgot'
    compareProducts: [], // max 4
    recentlyViewed: [],
    currency: 'USD',
    theme: 'dark',
    scrollProgress: 0,
  },
  reducers: {
    openCartDrawer: (state) => { state.cartDrawerOpen = true; },
    closeCartDrawer: (state) => { state.cartDrawerOpen = false; },
    toggleCartDrawer: (state) => { state.cartDrawerOpen = !state.cartDrawerOpen; },

    openMobileNav: (state) => { state.mobileNavOpen = true; },
    closeMobileNav: (state) => { state.mobileNavOpen = false; },

    openSearch: (state) => { state.searchOpen = true; },
    closeSearch: (state) => { state.searchOpen = false; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },

    openAuthModal: (state, action) => {
      state.authModalOpen = true;
      state.authModalMode = action.payload || 'login';
    },
    closeAuthModal: (state) => { state.authModalOpen = false; },
    setAuthModalMode: (state, action) => { state.authModalMode = action.payload; },

    addToCompare: (state, action) => {
      if (state.compareProducts.length < 4 && !state.compareProducts.find((p) => p._id === action.payload._id)) {
        state.compareProducts.push(action.payload);
      }
    },
    removeFromCompare: (state, action) => {
      state.compareProducts = state.compareProducts.filter((p) => p._id !== action.payload);
    },
    clearCompare: (state) => { state.compareProducts = []; },

    addToRecentlyViewed: (state, action) => {
      const existing = state.recentlyViewed.findIndex((p) => p._id === action.payload._id);
      if (existing > -1) state.recentlyViewed.splice(existing, 1);
      state.recentlyViewed.unshift(action.payload);
      if (state.recentlyViewed.length > 10) state.recentlyViewed.pop();
    },

    setCurrency: (state, action) => { state.currency = action.payload; },
    setScrollProgress: (state, action) => { state.scrollProgress = action.payload; },
  },
});

export const {
  openCartDrawer, closeCartDrawer, toggleCartDrawer,
  openMobileNav, closeMobileNav,
  openSearch, closeSearch, toggleSearch,
  openAuthModal, closeAuthModal, setAuthModalMode,
  addToCompare, removeFromCompare, clearCompare,
  addToRecentlyViewed,
  setCurrency, setScrollProgress,
} = uiSlice.actions;

export const selectCartDrawerOpen = (state) => state.ui.cartDrawerOpen;
export const selectMobileNavOpen = (state) => state.ui.mobileNavOpen;
export const selectSearchOpen = (state) => state.ui.searchOpen;
export const selectAuthModalOpen = (state) => state.ui.authModalOpen;
export const selectAuthModalMode = (state) => state.ui.authModalMode;
export const selectCompareProducts = (state) => state.ui.compareProducts;
export const selectRecentlyViewed = (state) => state.ui.recentlyViewed;
export const selectCurrency = (state) => state.ui.currency;

export default uiSlice.reducer;
