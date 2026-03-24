import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

/**
 * Checks if two date ranges overlap.
 *
 * @param range1Start - The start date of the first range.
 * @param range1End - The end date of the first range.
 * @param range2Start - The start date of the second range.
 * @param range2End - The end date of the second range.
 * @returns `true` if the date ranges overlap, `false` otherwise.
 */
export const dateRangesOverlap = (
  range1Start: dayjs.Dayjs,
  range1End: dayjs.Dayjs,
  range2Start: dayjs.Dayjs,
  range2End: dayjs.Dayjs,
) => {
  return (
    dayjs(range1Start).isBetween(range2Start, range2End, null, '[]') ||
    dayjs(range1End).isBetween(range2Start, range2End, null, '[]') ||
    dayjs(range2Start).isBetween(range1Start, range1End, null, '[]') ||
    dayjs(range2End).isBetween(range1Start, range1End, null, '[]')
  );
};
