import { describe, expect, it } from 'vitest';

import { generateSliderMarks } from '@utils/helpers/generateSliderMarks';

describe('generateSliderMarks', () => {
  describe('Basic Functionality', () => {
    it('should generate marks with default parameters', () => {
      const marks = generateSliderMarks();

      expect(marks).toEqual([
        { value: 0, label: 0 },
        { value: 5 },
        { value: 10 },
        { value: 15 },
        { value: 20 },
        { value: 25, label: 25 },
        { value: 30 },
        { value: 35 },
        { value: 40 },
        { value: 45 },
        { value: 50, label: 50 },
        { value: 55 },
        { value: 60 },
        { value: 65 },
        { value: 70 },
        { value: 75, label: 75 },
        { value: 80 },
        { value: 85 },
        { value: 90 },
        { value: 95 },
        { value: 100, label: 100 },
      ]);
    });

    it('should round max up to the nearest multiple of 5', () => {
      const marks = generateSliderMarks(0, 102, 5, 25);

      expect(marks[marks.length - 1].value).toBe(105); // 102 rounded up to 105
    });

    it('should generate marks with custom parameters', () => {
      const marks = generateSliderMarks(10, 50, 10, 20);

      expect(marks).toEqual([
        { value: 10, label: 10 },
        { value: 20, label: 20 },
        { value: 30 },
        { value: 40, label: 40 },
        { value: 50, label: 50 },
      ]);
    });

    it('should handle step that does not align with max', () => {
      const marks = generateSliderMarks(0, 100, 7, 25);

      // Should include max even if step doesn't land on it
      expect(marks[marks.length - 1]).toEqual({ value: 100, label: 100 });
    });
  });

  describe('Labeling', () => {
    it('should add labels at multiples of labelStep', () => {
      const marks = generateSliderMarks(0, 50, 5, 10);

      expect(marks).toEqual([
        { value: 0, label: 0 },
        { value: 5 },
        { value: 10, label: 10 },
        { value: 15 },
        { value: 20, label: 20 },
        { value: 25 },
        { value: 30, label: 30 },
        { value: 35 },
        { value: 40, label: 40 },
        { value: 45 },
        { value: 50, label: 50 },
      ]);
    });

    it('should always label min and max', () => {
      const marks = generateSliderMarks(5, 45, 5, 100); // labelStep larger than range

      expect(marks[0]).toEqual({ value: 5, label: 5 });
      expect(marks[marks.length - 1]).toEqual({ value: 45, label: 45 });
    });

    it('should not add labels for values not at labelStep multiples or boundaries', () => {
      const marks = generateSliderMarks(0, 20, 5, 10);

      expect(marks[1]).toEqual({ value: 5 }); // No label
      expect(marks[3]).toEqual({ value: 15 }); // No label
    });
  });

  describe('Edge Cases', () => {
    it('should handle min equal to max', () => {
      const marks = generateSliderMarks(10, 10, 5, 25);

      expect(marks).toEqual([{ value: 10, label: 10 }]);
    });

    it('should handle small ranges', () => {
      const marks = generateSliderMarks(0, 5, 1, 5);

      expect(marks).toEqual([
        { value: 0, label: 0 },
        { value: 1 },
        { value: 2 },
        { value: 3 },
        { value: 4 },
        { value: 5, label: 5 },
      ]);
    });

    it('should handle floating point values by rounding', () => {
      const marks = generateSliderMarks(0.5, 10.7, 2, 5);

      expect(marks[0]).toEqual({ value: 1 }); // 0.5 rounded to 1, no label since not multiple of 5, not min/max
      expect(marks[marks.length - 1]).toEqual({ value: 15, label: 15 }); // max rounded up to 15, and 15%5==0
    });

    it('should return correct structure', () => {
      const marks = generateSliderMarks(0, 10, 5, 5);

      marks.forEach((mark) => {
        expect(mark).toHaveProperty('value');
        expect(typeof mark.value).toBe('number');
        if (mark.label !== undefined) {
          expect(typeof mark.label).toBe('number');
          expect(mark.label).toBe(mark.value);
        }
      });
    });
  });
});
