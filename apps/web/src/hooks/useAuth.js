import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAccessToken,
  loginUser,
  registerUser,
  logoutUser,
  updateProfile,
} from '../store/slices/authSlice';
import { openAuthModal } from '../store/slices/uiSlice';

/**
 * Convenience hook for auth state and actions.
 * @returns {{ user, isAuthenticated, isLoading, accessToken, login, register, logout, requireAuth }}
 */
export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const accessToken = useSelector(selectAccessToken);

  const login = useCallback(
    (credentials) => dispatch(loginUser(credentials)),
    [dispatch]
  );

  const register = useCallback(
    (userData) => dispatch(registerUser(userData)),
    [dispatch]
  );

  const logout = useCallback(() => dispatch(logoutUser()), [dispatch]);

  const updateUser = useCallback(
    (data) => dispatch(updateProfile(data)),
    [dispatch]
  );

  /**
   * Opens the auth modal if not authenticated.
   * @param {Function} [callback] - Called after successful auth
   * @returns {boolean} true if already authenticated
   */
  const requireAuth = useCallback(
    (mode = 'login') => {
      if (!isAuthenticated) {
        dispatch(openAuthModal(mode));
        return false;
      }
      return true;
    },
    [isAuthenticated, dispatch]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    login,
    register,
    logout,
    updateUser,
    requireAuth,
    isSeller: ['seller', 'admin', 'superadmin'].includes(user?.role),
    isAdmin: ['admin', 'superadmin'].includes(user?.role),
    isSuperAdmin: user?.role === 'superadmin',
  };
}
