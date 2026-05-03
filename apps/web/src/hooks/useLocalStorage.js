import { useState, useCallback } from 'react';

/**
 * useState with localStorage persistence.
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value
 * @returns {[*, Function, Function]} [value, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {
      // Ignore storage errors
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch {
      // Ignore
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
