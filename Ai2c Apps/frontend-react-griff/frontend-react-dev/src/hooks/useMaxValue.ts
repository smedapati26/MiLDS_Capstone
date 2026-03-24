import { useMemo } from 'react';

/**
 * Custom React hook that calculates the maximum value from an array of objects
 * for a specified field. It rounds each value to the nearest integer, finds the max,
 * and then rounds up to the nearest multiple of 5 to ensure nice step divisions
 * (e.g., for chart axes or sliders).
 *
 * @template T - The type of the objects in the data array.
 * @template K - The key type for the field to extract values from, constrained to keys of T.
 * @param {T[] | undefined} data - The array of objects to process. If undefined or empty, returns 0.
 * @param {K} field - The key of the numeric field to extract and compare values from.
 * @returns {number} The maximum value rounded up to the nearest multiple of 5, or 0 if no valid data.
 */
export const useMaxValue = <T, K extends keyof T>(
  data: T[] | undefined, // Allow undefined data (returns 0 in such cases)
  field: K,
): number => {
  return useMemo(() => {
    // Handle cases where data is undefined or empty
    if (!data || data.length === 0) {
      return 0;
    }

    // Initialize array to hold rounded numeric values
    const values: number[] = [];

    // Iterate through each object in the data array
    for (const row of data) {
      // Convert the field value to a number and round to nearest integer
      const value = Number(row[field]);
      values.push(Math.round(value));
    }

    // Find the maximum value from the rounded values
    const maxValue = Math.max(...values);

    // Round up to the nearest multiple of 5 for better step divisions
    if (maxValue < 5) return 5;
    return Math.ceil(maxValue / 5) * 5;
  }, [data, field]); // Memoize based on data and field changes
};
