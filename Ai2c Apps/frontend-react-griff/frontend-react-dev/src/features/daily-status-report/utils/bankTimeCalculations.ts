import { IBankTimeForecast } from '@store/griffin_api/auto_dsr/models';

/**
 * Constants for reporting periods
 */
export const REPORTING_PERIODS = {
  CURRENT: 0,
  NEXT: 1,
} as const;

/**
 * Calculates the average value for a specific reporting period across all models
 * @param data - Array of bank time forecast data
 * @param periodIndex - Index of the reporting period (0 for current, 1 for next)
 * @returns Rounded average value for the specified period
 */
export const calculatePeriodAverage = (data: IBankTimeForecast[], periodIndex: number): number => {
  if (!data || data.length === 0) {
    return 0;
  }

  const sum = data.reduce((acc, modelData) => {
    const projectionValue = modelData.projections[periodIndex]?.value ?? 0;
    return acc + projectionValue;
  }, 0);

  return Math.round(sum / data.length);
};

/**
 * Calculates the projected difference between current and next reporting periods
 * @param data - Array of bank time forecast data
 * @returns Difference between current and next period averages
 */
export const calculateProjectedDifference = (data: IBankTimeForecast[]): number => {
  const currentAverage = calculatePeriodAverage(data, REPORTING_PERIODS.CURRENT);
  const nextAverage = calculatePeriodAverage(data, REPORTING_PERIODS.NEXT);

  return currentAverage - nextAverage;
};

/**
 * Calculates the percentage value for display in the gauge
 * @param data - Array of bank time forecast data
 * @returns Percentage value (average / 100) for gauge display
 */
export const calculateBankTimePercentage = (data: IBankTimeForecast[]): number => {
  const currentAverage = calculatePeriodAverage(data, REPORTING_PERIODS.CURRENT);
  return currentAverage / 100;
};

/**
 * Calculates all bank time metrics in a single function
 * @param data - Array of bank time forecast data
 * @returns Object containing percentage and projected difference
 */
export const calculateBankTimeMetrics = (data: IBankTimeForecast[] | undefined) => {
  if (!data || data.length === 0) {
    return {
      percentage: 0,
      projectedDifference: 0,
    };
  }

  return {
    percentage: calculateBankTimePercentage(data),
    projectedDifference: calculateProjectedDifference(data),
  };
};
