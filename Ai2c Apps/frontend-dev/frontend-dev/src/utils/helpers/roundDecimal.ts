/**
 * Implements floating point rounding using a combination of the Math.round and toFixed builtins
 *
 * @param value the number to round
 * @param precision the number of decimals to include on the number
 * @returns the properly formatted/rounded number
 */
export const roundDecimal = (value: string | number | null | undefined, precision: number = 2): string | undefined => {
  // Handle null/undefined early
  if (value === null || value === undefined) {
    return undefined;
  }

  const num = Number(value);

  // Return original value if not a valid number
  if (isNaN(num)) return value.toString();

  const scalingFactor: number = precision === 0 ? 0 : 10 ** precision;

  if (scalingFactor === 0) {
    return Math.round(num).toString();
  } else {
    // Check if the number has decimals
    if (num % 1 !== 0) {
      // Scale up by scaling factor, round, then scale back down
      const scaled = Math.round(Math.abs(num) * scalingFactor);
      const rounded = (scaled / scalingFactor) * Math.sign(num);
      return rounded.toFixed(precision);
    }
  }

  // Return as-is if it's a whole number
  return num.toString();
};
