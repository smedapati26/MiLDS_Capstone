import { describe, expect, it } from 'vitest';

import { IFaultOverTime } from '@store/griffin_api/faults/models/IFaultOverTime';

describe('IFaultOverTime', () => {
  describe('Interface Structure Validation', () => {
    it('should have all required properties', () => {
      const faultOverTime: IFaultOverTime = {
        reporting_period: new Date('2024-01-01'),
        no_status: 5,
        cleared: 10,
        ti_cleared: 3,
        diagonal: 2,
        dash: 1,
        admin_deadline: 4,
        deadline: 6,
        circle_x: 0,
        nuclear: 2,
        chemical: 1,
        biological: 0,
      };

      expect(faultOverTime).toHaveProperty('reporting_period');
      expect(faultOverTime).toHaveProperty('no_status');
      expect(faultOverTime).toHaveProperty('cleared');
      expect(faultOverTime).toHaveProperty('ti_cleared');
      expect(faultOverTime).toHaveProperty('diagonal');
      expect(faultOverTime).toHaveProperty('dash');
      expect(faultOverTime).toHaveProperty('admin_deadline');
      expect(faultOverTime).toHaveProperty('deadline');
      expect(faultOverTime).toHaveProperty('circle_x');
      expect(faultOverTime).toHaveProperty('nuclear');
      expect(faultOverTime).toHaveProperty('chemical');
      expect(faultOverTime).toHaveProperty('biological');
    });

    it('should have correct property types for numeric fields', () => {
      const faultOverTime: IFaultOverTime = {
        reporting_period: '2024-01-01',
        no_status: 5,
        cleared: 10,
        ti_cleared: 3,
        diagonal: 2,
        dash: 1,
        admin_deadline: 4,
        deadline: 6,
        circle_x: 0,
        nuclear: 2,
        chemical: 1,
        biological: 0,
      };

      expect(typeof faultOverTime.no_status).toBe('number');
      expect(typeof faultOverTime.cleared).toBe('number');
      expect(typeof faultOverTime.ti_cleared).toBe('number');
      expect(typeof faultOverTime.diagonal).toBe('number');
      expect(typeof faultOverTime.dash).toBe('number');
      expect(typeof faultOverTime.admin_deadline).toBe('number');
      expect(typeof faultOverTime.deadline).toBe('number');
      expect(typeof faultOverTime.circle_x).toBe('number');
      expect(typeof faultOverTime.nuclear).toBe('number');
      expect(typeof faultOverTime.chemical).toBe('number');
      expect(typeof faultOverTime.biological).toBe('number');
    });
  });

  describe('Union Type Handling for reporting_period', () => {
    it('should accept Date object for reporting_period', () => {
      const testDate = new Date('2024-01-15T10:30:00Z');
      const faultOverTime: IFaultOverTime = {
        reporting_period: testDate,
        no_status: 1,
        cleared: 2,
        ti_cleared: 3,
        diagonal: 4,
        dash: 5,
        admin_deadline: 6,
        deadline: 7,
        circle_x: 8,
        nuclear: 9,
        chemical: 10,
        biological: 11,
      };

      expect(faultOverTime.reporting_period).toBeInstanceOf(Date);
      expect(faultOverTime.reporting_period).toEqual(testDate);
    });

    it('should accept string for reporting_period', () => {
      const testDateString = '2024-01-15T10:30:00Z';
      const faultOverTime: IFaultOverTime = {
        reporting_period: testDateString,
        no_status: 1,
        cleared: 2,
        ti_cleared: 3,
        diagonal: 4,
        dash: 5,
        admin_deadline: 6,
        deadline: 7,
        circle_x: 8,
        nuclear: 9,
        chemical: 10,
        biological: 11,
      };

      expect(typeof faultOverTime.reporting_period).toBe('string');
      expect(faultOverTime.reporting_period).toBe(testDateString);
    });

    it('should handle different string date formats', () => {
      const formats = ['2024-01-15', '2024-01-15T10:30:00Z', '2024-01-15T10:30:00.000Z', '01/15/2024'];

      formats.forEach((dateFormat) => {
        const faultOverTime: IFaultOverTime = {
          reporting_period: dateFormat,
          no_status: 0,
          cleared: 0,
          ti_cleared: 0,
          diagonal: 0,
          dash: 0,
          admin_deadline: 0,
          deadline: 0,
          circle_x: 0,
          nuclear: 0,
          chemical: 0,
          biological: 0,
        };

        expect(typeof faultOverTime.reporting_period).toBe('string');
        expect(faultOverTime.reporting_period).toBe(dateFormat);
      });
    });
  });

  describe('Edge Cases and Data Validation', () => {
    it('should handle zero values for all numeric properties', () => {
      const faultOverTime: IFaultOverTime = {
        reporting_period: new Date(),
        no_status: 0,
        cleared: 0,
        ti_cleared: 0,
        diagonal: 0,
        dash: 0,
        admin_deadline: 0,
        deadline: 0,
        circle_x: 0,
        nuclear: 0,
        chemical: 0,
        biological: 0,
      };

      expect(faultOverTime.no_status).toBe(0);
      expect(faultOverTime.cleared).toBe(0);
      expect(faultOverTime.ti_cleared).toBe(0);
      expect(faultOverTime.diagonal).toBe(0);
      expect(faultOverTime.dash).toBe(0);
      expect(faultOverTime.admin_deadline).toBe(0);
      expect(faultOverTime.deadline).toBe(0);
      expect(faultOverTime.circle_x).toBe(0);
      expect(faultOverTime.nuclear).toBe(0);
      expect(faultOverTime.chemical).toBe(0);
      expect(faultOverTime.biological).toBe(0);
    });

    it('should handle large numeric values', () => {
      const faultOverTime: IFaultOverTime = {
        reporting_period: '2024-12-31',
        no_status: 999999,
        cleared: 888888,
        ti_cleared: 777777,
        diagonal: 666666,
        dash: 555555,
        admin_deadline: 444444,
        deadline: 333333,
        circle_x: 222222,
        nuclear: 111111,
        chemical: 100000,
        biological: 99999,
      };

      expect(faultOverTime.no_status).toBe(999999);
      expect(faultOverTime.cleared).toBe(888888);
      expect(faultOverTime.ti_cleared).toBe(777777);
      expect(faultOverTime.diagonal).toBe(666666);
      expect(faultOverTime.dash).toBe(555555);
      expect(faultOverTime.admin_deadline).toBe(444444);
      expect(faultOverTime.deadline).toBe(333333);
      expect(faultOverTime.circle_x).toBe(222222);
      expect(faultOverTime.nuclear).toBe(111111);
      expect(faultOverTime.chemical).toBe(100000);
      expect(faultOverTime.biological).toBe(99999);
    });

    it('should handle decimal values for numeric properties', () => {
      const faultOverTime: IFaultOverTime = {
        reporting_period: new Date('2024-06-15'),
        no_status: 1.5,
        cleared: 2.7,
        ti_cleared: 3.14,
        diagonal: 4.99,
        dash: 5.01,
        admin_deadline: 6.25,
        deadline: 7.75,
        circle_x: 8.33,
        nuclear: 9.67,
        chemical: 10.1,
        biological: 11.9,
      };

      expect(faultOverTime.no_status).toBe(1.5);
      expect(faultOverTime.cleared).toBe(2.7);
      expect(faultOverTime.ti_cleared).toBe(3.14);
      expect(faultOverTime.diagonal).toBe(4.99);
      expect(faultOverTime.dash).toBe(5.01);
      expect(faultOverTime.admin_deadline).toBe(6.25);
      expect(faultOverTime.deadline).toBe(7.75);
      expect(faultOverTime.circle_x).toBe(8.33);
      expect(faultOverTime.nuclear).toBe(9.67);
      expect(faultOverTime.chemical).toBe(10.1);
      expect(faultOverTime.biological).toBe(11.9);
    });
  });

  describe('Interface Compliance', () => {
    it('should create a valid IFaultOverTime object with realistic data', () => {
      const faultOverTime: IFaultOverTime = {
        reporting_period: new Date('2024-03-15T08:00:00Z'),
        no_status: 12,
        cleared: 45,
        ti_cleared: 8,
        diagonal: 3,
        dash: 2,
        admin_deadline: 15,
        deadline: 22,
        circle_x: 1,
        nuclear: 0,
        chemical: 1,
        biological: 0,
      };

      // Verify the object structure matches the interface
      expect(faultOverTime).toBeDefined();
      expect(Object.keys(faultOverTime)).toHaveLength(12);

      // Verify specific values
      expect(faultOverTime.reporting_period).toBeInstanceOf(Date);
      expect(faultOverTime.no_status).toBe(12);
      expect(faultOverTime.cleared).toBe(45);
      expect(faultOverTime.ti_cleared).toBe(8);
      expect(faultOverTime.diagonal).toBe(3);
      expect(faultOverTime.dash).toBe(2);
      expect(faultOverTime.admin_deadline).toBe(15);
      expect(faultOverTime.deadline).toBe(22);
      expect(faultOverTime.circle_x).toBe(1);
      expect(faultOverTime.nuclear).toBe(0);
      expect(faultOverTime.chemical).toBe(1);
      expect(faultOverTime.biological).toBe(0);
    });

    it('should work with array of IFaultOverTime objects', () => {
      const faultOverTimeArray: IFaultOverTime[] = [
        {
          reporting_period: '2024-01-01',
          no_status: 5,
          cleared: 10,
          ti_cleared: 2,
          diagonal: 1,
          dash: 0,
          admin_deadline: 3,
          deadline: 8,
          circle_x: 0,
          nuclear: 0,
          chemical: 0,
          biological: 0,
        },
        {
          reporting_period: new Date('2024-02-01'),
          no_status: 7,
          cleared: 15,
          ti_cleared: 4,
          diagonal: 2,
          dash: 1,
          admin_deadline: 5,
          deadline: 12,
          circle_x: 1,
          nuclear: 0,
          chemical: 1,
          biological: 0,
        },
      ];

      expect(faultOverTimeArray).toHaveLength(2);
      expect(typeof faultOverTimeArray[0].reporting_period).toBe('string');
      expect(faultOverTimeArray[1].reporting_period).toBeInstanceOf(Date);
      expect(faultOverTimeArray[0].cleared).toBe(10);
      expect(faultOverTimeArray[1].cleared).toBe(15);
    });
  });
});
