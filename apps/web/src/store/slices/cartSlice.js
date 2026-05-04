import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../services/api/cartAPI';
import toast from 'react-hot-toast';

const GUEST_CART_KEY = 'nexus_guest_cart';

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await cartAPI.getCart();
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, variantKey, variantLabel, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.addItem({ productId, variantKey, variantLabel, quantity });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.updateItem(itemId, { quantity });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await cartAPI.removeItem(itemId);
      return { itemId, ...response.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code, { rejectWithValue }) => {
    try {
      const response = await cartAPI.applyCoupon({ code });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Invalid coupon code');
    }
  }
);

export const removeCoupon = createAsyncThunk('cart/removeCoupon', async () => {
  await cartAPI.removeCoupon();
});

export const loadGuestCart = createAsyncThunk('cart/loadGuest', async () => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : { items: [], coupon: null };
  } catch {
    return { items: [], coupon: null };
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  items: [],
  coupon: null,
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  total: 0,
  isLoading: false,
  isCartOpen: false,
  error: null,
};

function calculateTotals(state) {
  state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  state.subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  state.discount = state.coupon?.discountAmount || 0;
  state.total = Math.max(0, state.subtotal - state.discount);
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    openCart: (state) => { state.isCartOpen = true; },
    closeCart: (state) => { state.isCartOpen = false; },
    toggleCart: (state) => { state.isCartOpen = !state.isCartOpen; },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      calculateTotals(state);
    },
    syncCart: (state, action) => {
      state.items = action.payload.items || [];
      state.coupon = action.payload.coupon || null;
      calculateTotals(state);
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder
      .addCase(fetchCart.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload?.items || [];
        state.coupon = action.payload?.coupon || null;
        calculateTotals(state);
      })
      .addCase(fetchCart.rejected, (state) => { state.isLoading = false; });

    // Add to cart
    builder
      .addCase(addToCart.pending, (state) => { state.isLoading = true; })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.itemCount = action.payload?.itemCount || state.itemCount;
        state.subtotal = action.payload?.subtotal || state.subtotal;
        state.total = action.payload?.total || state.total;
        toast.success('Added to cart!');
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        toast.error(action.payload || 'Failed to add to cart');
      });

    // Update item
    builder
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.itemCount = action.payload?.itemCount || state.itemCount;
        state.subtotal = action.payload?.subtotal || state.subtotal;
        state.total = action.payload?.total || state.total;
      });

    // Remove item
    builder
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload.itemId);
        state.itemCount = action.payload?.itemCount || state.itemCount;
        state.subtotal = action.payload?.subtotal || state.subtotal;
        state.total = action.payload?.total || state.total;
        calculateTotals(state);
      });

    // Apply coupon
    builder
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.coupon = action.payload?.coupon;
        state.discount = action.payload?.discount || 0;
        state.total = action.payload?.total || state.total;
        toast.success('Coupon applied!');
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        toast.error(action.payload || 'Invalid coupon');
      });

    // Remove coupon
    builder.addCase(removeCoupon.fulfilled, (state) => {
      state.coupon = null;
      state.discount = 0;
      calculateTotals(state);
    });

    // Load guest cart
    builder.addCase(loadGuestCart.fulfilled, (state, action) => {
      if (action.payload?.items?.length > 0) {
        state.items = action.payload.items;
        state.coupon = action.payload.coupon;
        calculateTotals(state);
      }
    });
  },
});

export const { openCart, closeCart, toggleCart, clearCart, syncCart } = cartSlice.actions;

// Aliases for consistent naming across the app
export const openCartDrawer = openCart;
export const closeCartDrawer = closeCart;
export const toggleCartDrawer = toggleCart;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartItemCount = (state) => state.cart.itemCount;
export const selectCartSubtotal = (state) => state.cart.subtotal;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartDiscount = (state) => state.cart.discount;
export const selectCartCoupon = (state) => state.cart.coupon;
export const selectIsCartOpen = (state) => state.cart.isCartOpen;
export const selectCartDrawerOpen = (state) => state.cart.isCartOpen;
export const selectCartLoading = (state) => state.cart.isLoading;

export default cartSlice.reducer;
