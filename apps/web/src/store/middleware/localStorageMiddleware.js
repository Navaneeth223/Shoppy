const STORAGE_KEY = 'nexus_auth';

/**
 * Persists auth state to localStorage whenever it changes.
 */
export const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  // Persist auth state
  if (action.type?.startsWith('auth/')) {
    const { user, accessToken, isAuthenticated } = state.auth;
    if (isAuthenticated && user && accessToken) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken }));
      } catch {
        // Storage quota exceeded — ignore
      }
    } else if (!isAuthenticated) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return result;
};
