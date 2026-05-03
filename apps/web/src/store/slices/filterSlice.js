import { createSlice } from '@reduxjs/toolkit';

const filterSlice = createSlice({
  name: 'filter',
  initialState: {
    category: null,
    subcategory: null,
    brands: [],
    priceRange: [0, 10000],
    rating: null,
    colors: [],
    sizes: [],
    inStock: false,
    sortBy: 'relevance',
    page: 1,
    limit: 24,
    view: 'grid', // 'grid' | 'list'
    q: '',
  },
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload;
      state.subcategory = null;
      state.page = 1;
    },
    setSubcategory: (state, action) => {
      state.subcategory = action.payload;
      state.page = 1;
    },
    toggleBrand: (state, action) => {
      const idx = state.brands.indexOf(action.payload);
      if (idx > -1) state.brands.splice(idx, 1);
      else state.brands.push(action.payload);
      state.page = 1;
    },
    setPriceRange: (state, action) => {
      state.priceRange = action.payload;
      state.page = 1;
    },
    setRating: (state, action) => {
      state.rating = action.payload;
      state.page = 1;
    },
    toggleColor: (state, action) => {
      const idx = state.colors.indexOf(action.payload);
      if (idx > -1) state.colors.splice(idx, 1);
      else state.colors.push(action.payload);
      state.page = 1;
    },
    toggleSize: (state, action) => {
      const idx = state.sizes.indexOf(action.payload);
      if (idx > -1) state.sizes.splice(idx, 1);
      else state.sizes.push(action.payload);
      state.page = 1;
    },
    setInStock: (state, action) => {
      state.inStock = action.payload;
      state.page = 1;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      state.page = 1;
    },
    setPage: (state, action) => { state.page = action.payload; },
    setView: (state, action) => { state.view = action.payload; },
    setSearchQuery: (state, action) => {
      state.q = action.payload;
      state.page = 1;
    },
    clearFilters: (state) => {
      state.brands = [];
      state.priceRange = [0, 10000];
      state.rating = null;
      state.colors = [];
      state.sizes = [];
      state.inStock = false;
      state.page = 1;
    },
    resetAll: () => ({
      category: null,
      subcategory: null,
      brands: [],
      priceRange: [0, 10000],
      rating: null,
      colors: [],
      sizes: [],
      inStock: false,
      sortBy: 'relevance',
      page: 1,
      limit: 24,
      view: 'grid',
      q: '',
    }),
  },
});

export const {
  setCategory, setSubcategory, toggleBrand, setPriceRange,
  setRating, toggleColor, toggleSize, setInStock, setSortBy,
  setPage, setView, setSearchQuery, clearFilters, resetAll,
} = filterSlice.actions;

export const selectFilters = (state) => state.filter;
export const selectActiveFilterCount = (state) => {
  const f = state.filter;
  let count = 0;
  if (f.brands.length) count += f.brands.length;
  if (f.rating) count++;
  if (f.colors.length) count += f.colors.length;
  if (f.sizes.length) count += f.sizes.length;
  if (f.inStock) count++;
  if (f.priceRange[0] > 0 || f.priceRange[1] < 10000) count++;
  return count;
};

export default filterSlice.reducer;
