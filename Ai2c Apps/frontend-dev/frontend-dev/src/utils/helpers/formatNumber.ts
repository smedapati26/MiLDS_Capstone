import { Theme } from '@mui/material/styles';

/**
 * Returns the appropriate theme if the value is below the given threshold
 *
 * @param value the value to calculate the theme color for
 * @param threshold the threshold to check if the number is less than
 * @param theme the theme to apply to the number
 * @returns the theme (if the value is below the threshold)
 */
export const getNumberColor = (
  value: string | number | null | undefined,
  threshold: number,
  theme: Theme,
): string | undefined => {
  if (value === null || value === undefined) return undefined;

  const num = Number(value);
  if (isNaN(num)) return undefined;

  return num < threshold ? theme.palette.error.light : undefined;
};
