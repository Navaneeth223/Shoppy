import { useEffect, useCallback } from 'react';

/**
 * Listens for a specific keyboard shortcut.
 * @param {string|string[]} keys - Key(s) to listen for (e.g. 'Escape', ['Meta', 'k'])
 * @param {Function} callback - Handler function
 * @param {object} [options]
 * @param {boolean} [options.preventDefault=false]
 * @param {boolean} [options.enabled=true]
 */
export function useKeyboard(keys, callback, { preventDefault = false, enabled = true } = {}) {
  const keyArray = Array.isArray(keys) ? keys : [keys];

  const handleKeyDown = useCallback(
    (event) => {
      if (!enabled) return;

      const pressedKeys = [];
      if (event.metaKey) pressedKeys.push('Meta');
      if (event.ctrlKey) pressedKeys.push('Control');
      if (event.altKey) pressedKeys.push('Alt');
      if (event.shiftKey) pressedKeys.push('Shift');
      pressedKeys.push(event.key);

      const matches = keyArray.every((k) => pressedKeys.includes(k));

      if (matches) {
        if (preventDefault) event.preventDefault();
        callback(event);
      }
    },
    [keyArray, callback, preventDefault, enabled]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Calls handler when Escape key is pressed.
 * @param {Function} handler
 * @param {boolean} [enabled=true]
 */
export function useEscapeKey(handler, enabled = true) {
  useKeyboard('Escape', handler, { enabled });
}
