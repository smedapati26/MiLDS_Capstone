/**
 * Generates an array of marks for a slider component, including values and optional labels.
 *
 * This utility creates evenly spaced marks between a minimum and maximum value,
 * with labels appearing at specified intervals or at the boundaries. The max value
 * is rounded up to the nearest multiple of 5 to ensure clean divisions for chart axes
 * or sliders. Marks are generated in steps, and labels are conditionally added based
 * on the labelStep parameter.
 *
 * @param {number} [min=0] - The minimum value for the slider marks.
 * @param {number} [max=100] - The maximum value for the slider marks. Will be rounded up to the nearest multiple of 5.
 * @param {number} [step=5] - The increment between each mark value.
 * @param {number} [labelStep=25] - The interval at which labels should be added to marks (e.g., every 25 units).
 * @returns {Array<{value: number, label?: number}>} An array of mark objects, each containing a 'value' and optionally a 'label'.
 *
 * @example
 * // Generate marks from 0 to 100 with labels every 25 units
 * const marks = generateSliderMarks(0, 100, 5, 25);
 * // Result: [{value: 0, label: 0}, {value: 5}, {value: 10}, ..., {value: 25, label: 25}, ...]
 */
export const generateSliderMarks = (min = 0, max = 100, step = 5, labelStep = 25) => {
  // Round max up to the nearest multiple of 5 to ensure steps divide nicely for axes/sliders
  max = Math.ceil(max / 5) * 5;

  const marks = [];

  // Generate marks from min to max in increments of step
  for (let value = min; value <= max; value += step) {
    // Round to nearest integer to handle potential floating-point precision issues
    const roundedValue = Math.round(value);

    // Determine if this mark should have a label: either a multiple of labelStep or at boundaries (min/max)
    const shouldLabel = roundedValue % labelStep === 0 || roundedValue === min || roundedValue === max;

    // Create mark object with value and conditional label
    const mark = {
      value: roundedValue,
      ...(shouldLabel && { label: roundedValue }),
    };

    marks.push(mark);
  }

  // Ensure the max value is always included, even if the step doesn't align perfectly (safety check)
  if (marks[marks.length - 1].value !== max) {
    marks.push({
      value: max,
      // Label max if it's a multiple of labelStep or equal to min (edge case)
      label: max % labelStep === 0 || max === min ? max : undefined,
    });
  }

  return marks;
};
