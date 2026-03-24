/**
 * @fileoverview Custom React hook for bank time calculations in DSR (Daily Status Report)
 *
 * Bank time refers to the projected operational availability of aircraft models
 * based on maintenance schedules, part availability, and operational requirements.
 * This hook provides memoized calculations for displaying bank time metrics
 * in gauges and other UI components.
 */

import { useMemo } from 'react';

import { calculateBankTimeMetrics } from '@features/daily-status-report/utils/bankTimeCalculations';

import { IBankTimeForecast } from '@store/griffin_api/auto_dsr/models';

/**
 * Custom hook for bank time calculations with memoization optimization
 *
 * This hook processes bank time forecast data to calculate key metrics including:
 * - Current period percentage (for gauge display)
 * - Projected difference between current and next reporting periods
 *
 * The calculations are memoized to prevent unnecessary recalculations when the
 * component re-renders but the input data hasn't changed, improving performance
 * especially when used in frequently updating dashboard components.
 *
 * @param data - Array of bank time forecast data containing model projections.
 *               Each item includes aircraft model name and time-series projections
 *               with date/value pairs. Can be undefined during initial loading.
 *
 * @returns Object containing calculated metrics:
 *          - percentage: Current period average divided by 100 (for gauge display 0-1 range)
 *          - projectedDifference: Difference between current and next period averages
 */
export const useBankTimeCalculations = (data: IBankTimeForecast[] | undefined) => {
  // Memoize the calculations to avoid expensive recalculations on every render
  // Only recalculates when the data reference changes (shallow comparison)
  const calculations = useMemo(() => {
    // Delegate to utility function which handles undefined/empty data gracefully
    // Returns default values { percentage: 0, projectedDifference: 0 } for invalid input
    return calculateBankTimeMetrics(data);
  }, [data]); // Dependency array: recalculate only when data reference changes

  // Return the memoized calculations object
  // Structure: { percentage: number, projectedDifference: number }
  return calculations;
};
