import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { describe, expect, it } from 'vitest';

import { dateRangesOverlap } from '@utils/helpers/dateRangesOverlap';

dayjs.extend(isBetween);

describe('dateRangesOverlap', () => {
  it('should return false when range1 is completely before range2', () => {
    const range1Start = dayjs('2023-01-01');
    const range1End = dayjs('2023-01-03');
    const range2Start = dayjs('2023-01-04');
    const range2End = dayjs('2023-01-06');

    const result = dateRangesOverlap(range1Start, range1End, range2Start, range2End);
    expect(result).toBe(false);
  });

  it('should return false when range1 is completely after range2', () => {
    const range1Start = dayjs('2023-01-04');
    const range1End = dayjs('2023-01-06');
    const range2Start = dayjs('2023-01-01');
    const range2End = dayjs('2023-01-03');

    const result = dateRangesOverlap(range1Start, range1End, range2Start, range2End);
    expect(result).toBe(false);
  });

  it('should return true when range1 partially overlaps range2 from the left', () => {
    const range1Start = dayjs('2023-01-01');
    const range1End = dayjs('2023-01-05');
    const range2Start = dayjs('2023-01-03');
    const range2End = dayjs('2023-01-07');

    const result = dateRangesOverlap(range1Start, range1End, range2Start, range2End);
    expect(result).toBe(true);
  });

  it('should return true when range1 partially overlaps range2 from the right', () => {
    const range1Start = dayjs('2023-01-03');
    const range1End = dayjs('2023-01-07');
    const range2Start = dayjs('2023-01-01');
    const range2End = dayjs('2023-01-05');

    const result = dateRangesOverlap(range1Start, range1End, range2Start, range2End);
    expect(result).toBe(true);
  });

  it('should return true when range1 starts inside range2', () => {
    const range1Start = dayjs('2023-01-02');
    const range1End = dayjs('2023-01-04');
    const range2Start = dayjs('2023-01-01');
    const range2End = dayjs('2023-01-05');

    const result = dateRangesOverlap(range1Start, range1End, range2Start, range2End);
    expect(result).toBe(true);
  });

  it('should return true when range2 starts inside range1', () => {
    const range1Start = dayjs('2023-01-01');
    const range1End = dayjs('2023-01-05');
    const range2Start = dayjs('2023-01-02');
    const range2End = dayjs('2023-01-04');

    const result = dateRangesOverlap(range1Start, range1End, range2Start, range2End);
    expect(result).toBe(true);
  });

  it('should return true when ranges touch at the end of range1 and start of range2', () => {
    const range1Start = dayjs('2023-01-01');
    const range1End = dayjs('2023-01-03');
    const range2Start = dayjs('2023-01-03');
    const range2End = dayjs('2023-01-05');

    const result = dateRangesOverlap(range1Start, range1End, range2Start, range2End);
    expect(result).toBe(true);
  });

  it('should return true when ranges touch at the end of range2 and start of range1', () => {
    const range1Start = dayjs('2023-01-03');
    const range1End = dayjs('2023-01-05');
    const range2Start = dayjs('2023-01-01');
    const range2End = dayjs('2023-01-03');

    const result = dateRangesOverlap(range1Start, range1End, range2Start, range2End);
    expect(result).toBe(true);
  });

  it('should return true when ranges are identical', () => {
    const range1Start = dayjs('2023-01-01');
    const range1End = dayjs('2023-01-03');
    const range2Start = dayjs('2023-01-01');
    const range2End = dayjs('2023-01-03');

    const result = dateRangesOverlap(range1Start, range1End, range2Start, range2End);
    expect(result).toBe(true);
  });

  it('should return true for single-point overlapping ranges', () => {
    const range1Start = dayjs('2023-01-01');
    const range1End = dayjs('2023-01-01');
    const range2Start = dayjs('2023-01-01');
    const range2End = dayjs('2023-01-01');

    const result = dateRangesOverlap(range1Start, range1End, range2Start, range2End);
    expect(result).toBe(true);
  });
});
