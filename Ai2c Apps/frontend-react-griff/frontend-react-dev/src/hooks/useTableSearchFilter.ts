import { useMemo, useState } from 'react';

import { ColumnConfig } from '@components/data-tables';

export function useTableSearchFilter<T>(columns: ColumnConfig<T>[], data: T[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(
    () =>
      data.filter((row) => {
        // If no search query, include all rows
        if (!searchQuery) return true;

        // Check if search query matches any column value (case-insensitive)
        return columns.some((column) => {
          const cellValue = row[column.key as keyof T];
          return cellValue?.toString().toLowerCase().includes(searchQuery.toLowerCase());
        });
      }),
    [columns, data, searchQuery],
  );

  return { searchQuery, setSearchQuery, filteredData };
}
