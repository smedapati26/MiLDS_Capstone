import { useMemo } from 'react';

import { IOptions } from '@models/IOptions';

/**
 * Custom React hook that extracts unique filter options from an array of data objects.
 * It processes a specified field from each object, collects unique string values,
 * sorts them alphabetically, and returns them as an array of IOptions.
 *
 * @template T - The type of the data objects in the array.
 * @template K - The key type of the field to extract from each object, must be a key of T.
 * @param data - An array of data objects or undefined. If undefined or empty, returns an empty array.
 * @param field - The key of the field to extract unique values from each data object.
 * @returns An array of IOptions, where each option has the same key and label (the unique field value).
 */
export const useFilterOptions = <T, K extends keyof T>(
  data: T[] | undefined, // Allow undefined data (returns empty array)
  field: K,
): IOptions[] => {
  return useMemo(() => {
    // If data is undefined or empty, return an empty array of options
    if (!data || data.length === 0) {
      return [];
    }

    // Use a Set to collect unique string values from the specified field
    const uniqueValues = new Set<string>();

    // Iterate through each data object
    for (const row of data) {
      // Extract the value from the specified field
      const value = row[field];
      // If the value exists (truthy), add its string representation to the set
      if (value) {
        uniqueValues.add(String(value));
      }
    }

    // Convert the set to an array, sort alphabetically, and map to IOptions format
    return Array.from(uniqueValues)
      .sort()
      .map((value) => ({ label: value, value: value }));
  }, [data, field]); // Dependencies for memoization: recompute when data or field changes
};
