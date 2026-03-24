import { useMemo } from 'react';

import { ColumnConfig } from '@components/data-tables/PmxTable';
import { roundDecimal } from '@utils/helpers';

export type TableSearchOptions = {
  label: string;
  value: string;
};

export interface UseTableSearchOptionsConfig<T = unknown> {
  /** Include only specific columns by their keys */
  includeColumns?: Array<keyof T>;
  /** Exclude specific columns by their keys */
  excludeColumns?: Array<keyof T>;
  /** Maximum number of options to return (for performance) */
  maxOptions?: number;
  /** Custom formatter for values */
  valueFormatter?: (value: unknown, columnKey: keyof T) => string;
}

/**
 * Custom hook that extracts unique search options from table data based on column configurations.
 *
 * This hook processes table data to create a list of unique values that can be used for search/filter
 * functionality. It handles different data types appropriately and provides performance optimizations.
 *
 * @template T - The type of data objects in the table
 * @param columns - Array of column configurations that define the table structure
 * @param data - Array of data objects to extract search options from
 * @param config - Optional configuration object for customizing behavior
 * @returns Array of search options with label and value properties
 *
 * @example
 * ```typescript
 * const searchOptions = useTableSearchOptions(columns, data, {
 *   excludeColumns: ['id', 'internalField'],
 *   maxOptions: 100
 * });
 * ```
 */
export function useTableSearchOptions<T>(
  columns: Array<ColumnConfig<T>>,
  data: Array<T> | undefined,
  config: UseTableSearchOptionsConfig<T> = {},
): Array<TableSearchOptions> {
  const { includeColumns, excludeColumns = [], maxOptions = 500, valueFormatter } = config;

  const searchOptions = useMemo(() => {
    // Early return if no data
    if (!data || data.length === 0) {
      return [];
    }

    // Filter columns based on include/exclude configuration
    const filteredColumns = columns.filter((column) => {
      if (includeColumns && !includeColumns.includes(column.key)) {
        return false;
      }
      if (excludeColumns.includes(column.key)) {
        return false;
      }
      return true;
    });

    const uniqueValues = new Set<string>();

    // Process each data item
    for (const item of data) {
      // Break early if we've reached the maximum options limit
      if (uniqueValues.size >= maxOptions) {
        break;
      }

      // Process each column for this item
      for (const column of filteredColumns) {
        const rawValue = item[column.key];

        // Skip null, undefined, or empty string values
        if (rawValue === null || rawValue === undefined || rawValue === '') {
          continue;
        }

        let formattedValue: string;

        // Use custom formatter if provided
        if (valueFormatter) {
          try {
            formattedValue = valueFormatter(rawValue, column.key);
          } catch (error) {
            console.warn(`Custom formatter failed for column ${String(column.key)}:`, error);
            formattedValue = String(rawValue);
          }
        } else {
          // Default formatting logic
          formattedValue = formatValue(rawValue);
        }

        // Only add non-empty formatted values
        if (formattedValue.trim()) {
          uniqueValues.add(formattedValue);
        }

        // Break early if we've reached the maximum options limit
        if (uniqueValues.size >= maxOptions) {
          break;
        }
      }
    }

    // Convert Set to sorted array of options
    return Array.from(uniqueValues)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((value) => ({
        value,
        label: value,
      }));
  }, [columns, data, includeColumns, excludeColumns, maxOptions, valueFormatter]);

  return searchOptions;
}

/**
 * Formats a value for display in search options.
 * Handles different data types appropriately.
 *
 * @param value - The raw value to format
 * @returns Formatted string representation of the value
 */
function formatValue(value: unknown): string {
  // Handle numbers
  if (typeof value === 'number') {
    // Use roundDecimal for floating point numbers
    if (value % 1 !== 0) {
      const rounded = roundDecimal(value, 2);
      return rounded ?? value.toString();
    }
    return value.toString();
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Handle dates
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  // Handle objects with toString method
  if (typeof value === 'object' && value !== null) {
    // Check if it's a dayjs object or similar
    if ('format' in value && typeof value.format === 'function') {
      return (value as { format: (format: string) => string }).format('YYYY-MM-DD');
    }

    // For other objects, try to stringify
    try {
      const stringified = JSON.stringify(value);
      return stringified !== '{}' ? stringified : String(value);
    } catch {
      return String(value);
    }
  }

  // Default to string conversion
  return String(value);
}
