import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  selectWishlistItems,
  selectWishlistCount,
  selectIsInWishlist,
  addToWishlist,
  removeFromWishlist,
  fetchWishlist,
} from '../store/slices/wishlistSlice';
import { useAuth } from './useAuth';

/**
 * Convenience hook for wishlist state and actions.
 */
export function useWishlist() {
  const dispatch = useDispatch();
  const { requireAuth } = useAuth();

  const items = useSelector(selectWishlistItems);
  const count = useSelector(selectWishlistCount);

  const add = useCallback(
    (productId) => {
      if (!requireAuth()) return;
      dispatch(addToWishlist(productId));
    },
    [dispatch, requireAuth]
  );

  const remove = useCallback(
    (productId) => dispatch(removeFromWishlist(productId)),
    [dispatch]
  );

  const toggle = useCallback(
    (productId, isInList) => {
      if (isInList) {
        dispatch(removeFromWishlist(productId));
      } else {
        if (!requireAuth()) return;
        dispatch(addToWishlist(productId));
      }
    },
    [dispatch, requireAuth]
  );

  const refresh = useCallback(() => dispatch(fetchWishlist()), [dispatch]);

  const checkIsInWishlist = useCallback(
    (productId) =>
      items.some(
        (item) => (item.product?._id || item.product) === productId
      ),
    [items]
  );

  return {
    items,
    count,
    add,
    remove,
    toggle,
    refresh,
    checkIsInWishlist,
    isEmpty: items.length === 0,
  };
}
