import { useEffect } from 'react';

/**
 * Locks body scroll when active is true.
 * @param {boolean} active
 */
export function useScrollLock(active) {
  useEffect(() => {
    if (active) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [active]);
}
