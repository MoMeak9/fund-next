"use client";

import { useEffect, useMemo, useState } from "react";

interface UsePaginationOptions {
  pageSize?: number;
}

export function usePagination<T>(items: T[], options: UsePaginationOptions = {}) {
  const { pageSize = 20 } = options;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(items.length / pageSize);
  const paginatedItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  useEffect(() => { setPage(1); }, [items.length]);

  return {
    items: paginatedItems,
    page,
    totalPages,
    totalItems: items.length,
    setPage,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  };
}
