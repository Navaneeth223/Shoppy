import { useState, useCallback } from 'react';

/**
 * Hook for managing pagination state.
 * @param {object} options
 * @param {number} [options.initialPage=1]
 * @param {number} [options.initialLimit=24]
 * @param {number} [options.total=0]
 * @returns {{ page, limit, skip, totalPages, setPage, nextPage, prevPage, reset }}
 */
export function usePagination({ initialPage = 1, initialLimit = 24, total = 0 } = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);

  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  const reset = useCallback(() => setPage(1), []);

  const goToPage = useCallback(
    (p) => setPage(Math.max(1, Math.min(p, totalPages))),
    [totalPages]
  );

  return {
    page,
    limit,
    skip,
    totalPages,
    setPage: goToPage,
    nextPage,
    prevPage,
    reset,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
