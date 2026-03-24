import { useGetBankTimeQuery } from '@store/griffin_api/auto_dsr/slices';

import { useBankTimeCalculations } from './useBankTimeCalculations';

/**
 * Custom hook for managing bank time forecast data and calculations
 *
 * This hook orchestrates the fetching of bank time forecast data for the current unit
 * and provides calculated metrics such as percentage and projected difference.
 * It integrates with the Redux store to get the current UIC and uses RTK Query
 * for efficient data fetching with caching and loading states.
 *
 * @returns {Object} An object containing:
 *   - percentage: Calculated percentage from bank time data
 *   - projectedDifference: Calculated projected difference from bank time data
 *   - data: Raw bank time forecast data from the API
 *   - isError: Boolean indicating if the query resulted in an error
 *   - isFetching: Boolean indicating if the query is currently fetching
 *   - isUninitialized: Boolean indicating if the query has not been initialized
 *   - refetch: Function to manually refetch the data
 */
export function useBankTimeForecast(uic: string) {
  // Fetch bank time forecast data using RTK Query
  // Skip the query if no UIC is selected to avoid unnecessary API calls
  const { data, isError, isFetching, isUninitialized, refetch } = useGetBankTimeQuery(
    { uic: uic },
    { skip: uic === '' },
  );

  // Calculate derived metrics from the raw bank time data
  const { percentage, projectedDifference } = useBankTimeCalculations(data);

  // Return all relevant data and query states for consuming components
  return {
    percentage,
    projectedDifference,
    data,
    isError,
    isFetching,
    isUninitialized,
    refetch,
  };
}
