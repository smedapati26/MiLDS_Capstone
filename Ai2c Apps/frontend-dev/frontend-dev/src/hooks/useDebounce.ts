import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook that debounces a value by delaying its update
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds before updating the debounced value
 * @returns An array containing the debounced value
 */
export function useDebounce<T>(value: T, delay: number): [T] {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T | undefined>(undefined);

  // Ref to track if this is the first render
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      isFirstRender.current = false;
    }, delay);

    // Cleanup function to clear the timeout if the component unmounts or dependencies change
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Re-run effect when value or delay changes

  // Return the original value on first render, then the debounced value
  return [isFirstRender.current ? value : (debouncedValue as T)];
}
