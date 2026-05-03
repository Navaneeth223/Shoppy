import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../../services/api/userAPI';
import toast from 'react-hot-toast';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  const response = await userAPI.getWishlist();
  return response.data.data;
});

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (productId, { rejectWithValue }) => {
    try {
      await userAPI.addToWishlist(productId);
      return productId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (productId, { rejectWithValue }) => {
    try {
      await userAPI.removeFromWishlist(productId);
      return productId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    itemCount: 0,
    isLoading: false,
  },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.itemCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        state.itemCount = action.payload?.itemCount || 0;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        if (!state.items.find((item) => item.product?._id === action.payload || item.product === action.payload)) {
          state.items.push({ product: action.payload });
          state.itemCount++;
        }
        toast.success('Added to wishlist!');
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        toast.error(action.payload || 'Failed to add to wishlist');
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => (item.product?._id || item.product) !== action.payload
        );
        state.itemCount = Math.max(0, state.itemCount - 1);
        toast.success('Removed from wishlist');
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.itemCount;
export const selectIsInWishlist = (productId) => (state) =>
  state.wishlist.items.some(
    (item) => (item.product?._id || item.product) === productId
  );

export default wishlistSlice.reducer;
