import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  selectCartItems,
  selectCartItemCount,
  selectCartSubtotal,
  selectCartTotal,
  selectCartDiscount,
  selectCartCoupon,
  selectIsCartOpen,
  selectCartLoading,
  addToCart,
  removeCartItem,
  updateCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  openCartDrawer,
  closeCartDrawer,
  fetchCart,
} from '../store/slices/cartSlice';

/**
 * Convenience hook for cart state and actions.
 */
export function useCart() {
  const dispatch = useDispatch();

  const items = useSelector(selectCartItems);
  const itemCount = useSelector(selectCartItemCount);
  const subtotal = useSelector(selectCartSubtotal);
  const total = useSelector(selectCartTotal);
  const discount = useSelector(selectCartDiscount);
  const coupon = useSelector(selectCartCoupon);
  const isOpen = useSelector(selectIsCartOpen);
  const isLoading = useSelector(selectCartLoading);

  const addItem = useCallback(
    (productId, options = {}) =>
      dispatch(addToCart({ productId, ...options })),
    [dispatch]
  );

  const removeItem = useCallback(
    (itemId) => dispatch(removeCartItem(itemId)),
    [dispatch]
  );

  const updateItem = useCallback(
    (itemId, quantity) => dispatch(updateCartItem({ itemId, quantity })),
    [dispatch]
  );

  const clear = useCallback(() => dispatch(clearCart()), [dispatch]);

  const applyCode = useCallback(
    (code) => dispatch(applyCoupon(code)),
    [dispatch]
  );

  const removeCode = useCallback(() => dispatch(removeCoupon()), [dispatch]);

  const openDrawer = useCallback(() => dispatch(openCartDrawer()), [dispatch]);
  const closeDrawer = useCallback(() => dispatch(closeCartDrawer()), [dispatch]);

  const refresh = useCallback(() => dispatch(fetchCart()), [dispatch]);

  const isInCart = useCallback(
    (productId, variantKey = 'default') =>
      items.some(
        (item) =>
          (item.product?._id || item.product) === productId &&
          item.variantKey === variantKey
      ),
    [items]
  );

  return {
    items,
    itemCount,
    subtotal,
    total,
    discount,
    coupon,
    isOpen,
    isLoading,
    addItem,
    removeItem,
    updateItem,
    clear,
    applyCode,
    removeCode,
    openDrawer,
    closeDrawer,
    refresh,
    isInCart,
    isEmpty: items.length === 0,
  };
}
