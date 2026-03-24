import dayjs from 'dayjs';

import { dateRangesOverlap } from '@utils/helpers';

describe('dateRangesOverlap', () => {
  it('should return true when ranges overlap', () => {
    const range1Start = dayjs('2023-01-01');
    const range1End = dayjs('2023-01-10');
    const range2Start = dayjs('2023-01-05');
    const range2End = dayjs('2023-01-15');

    expect(dateRangesOverlap(range1Start, range1End, range2Start, range2End)).toBe(true);
  });

  it('should return false when ranges do not overlap', () => {
    const range1Start = dayjs('2023-01-01');
    const range1End = dayjs('2023-01-10');
    const range2Start = dayjs('2023-01-11');
    const range2End = dayjs('2023-01-20');

    expect(dateRangesOverlap(range1Start, range1End, range2Start, range2End)).toBe(false);
  });

  it('should return true when one range is completely within the other', () => {
    const range1Start = dayjs('2023-01-01');
    const range1End = dayjs('2023-01-31');
    const range2Start = dayjs('2023-01-10');
    const range2End = dayjs('2023-01-20');

    expect(dateRangesOverlap(range1Start, range1End, range2Start, range2End)).toBe(true);
  });

  it('should return true when ranges touch at the edges', () => {
    const range1Start = dayjs('2023-01-01');
    const range1End = dayjs('2023-01-10');
    const range2Start = dayjs('2023-01-10');
    const range2End = dayjs('2023-01-20');

    expect(dateRangesOverlap(range1Start, range1End, range2Start, range2End)).toBe(true);
  });

  it('should return false when ranges are far apart', () => {
    const range1Start = dayjs('2023-01-01');
    const range1End = dayjs('2023-01-10');
    const range2Start = dayjs('2023-02-01');
    const range2End = dayjs('2023-02-10');

    expect(dateRangesOverlap(range1Start, range1End, range2Start, range2End)).toBe(false);
  });
});
