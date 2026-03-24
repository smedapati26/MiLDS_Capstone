import { describe, expect, it } from 'vitest';

import {
  IStatusOverTime,
  IStatusOverTimeDto,
  mapToIStatusOverTime,
} from '@store/griffin_api/readiness/models/IStatusOverTime';

describe('IStatusOverTimeDto', () => {
  it('should have the correct interface structure', () => {
    const dto: IStatusOverTimeDto = {
      reporting_month: '2024-01',
      total_fmc_hours: 100,
      total_field_hours: 50,
      total_pmcm_hours: 75,
      total_pmcs_hours: 25,
      total_dade_hours: 30,
      total_sust_hours: 40,
      total_nmcs_hours: 20,
      total_hours_in_status: 340,
    };

    expect(dto).toHaveProperty('reporting_month');
    expect(dto).toHaveProperty('total_fmc_hours');
    expect(dto).toHaveProperty('total_field_hours');
    expect(dto).toHaveProperty('total_pmcm_hours');
    expect(dto).toHaveProperty('total_pmcs_hours');
    expect(dto).toHaveProperty('total_dade_hours');
    expect(dto).toHaveProperty('total_sust_hours');
    expect(dto).toHaveProperty('total_nmcs_hours');
    expect(dto).toHaveProperty('total_hours_in_status');
  });

  it('should accept valid data types', () => {
    const dto: IStatusOverTimeDto = {
      reporting_month: '2024-01',
      total_fmc_hours: 100,
      total_field_hours: 50,
      total_pmcm_hours: 75,
      total_pmcs_hours: 25,
      total_dade_hours: 30,
      total_sust_hours: 40,
      total_nmcs_hours: 20,
      total_hours_in_status: 340,
    };

    expect(typeof dto.reporting_month).toBe('string');
    expect(typeof dto.total_fmc_hours).toBe('number');
    expect(typeof dto.total_field_hours).toBe('number');
    expect(typeof dto.total_pmcm_hours).toBe('number');
    expect(typeof dto.total_pmcs_hours).toBe('number');
    expect(typeof dto.total_dade_hours).toBe('number');
    expect(typeof dto.total_sust_hours).toBe('number');
    expect(typeof dto.total_nmcs_hours).toBe('number');
    expect(typeof dto.total_hours_in_status).toBe('number');
  });
});

describe('IStatusOverTime', () => {
  it('should have the correct interface structure', () => {
    const statusOverTime: IStatusOverTime = {
      reportingMonth: '2024-01',
      totalFieldHours: 50,
      totalFmcHours: 100,
      totalPmcsHours: 25,
      totalPmcmHours: 75,
      totalNmcsHours: 20,
      totalDadeHours: 30,
      totalSustHours: 40,
      totalHoursInStatus: 340,
      nmcmHours: 90,
      fmcHoursPercentage: 0.294,
      pmcsHoursPercentage: 0.221,
      pmcmHoursPercentage: 0.074,
      nmcsHoursPercentage: 0.059,
      dadeHoursPercentage: 0.088,
      nmcmHoursPercentage: 0.265,
    };

    expect(statusOverTime).toHaveProperty('reportingMonth');
    expect(statusOverTime).toHaveProperty('totalFieldHours');
    expect(statusOverTime).toHaveProperty('totalFmcHours');
    expect(statusOverTime).toHaveProperty('totalPmcsHours');
    expect(statusOverTime).toHaveProperty('totalPmcmHours');
    expect(statusOverTime).toHaveProperty('totalNmcsHours');
    expect(statusOverTime).toHaveProperty('totalDadeHours');
    expect(statusOverTime).toHaveProperty('totalSustHours');
    expect(statusOverTime).toHaveProperty('totalHoursInStatus');
    expect(statusOverTime).toHaveProperty('fmcHoursPercentage');
    expect(statusOverTime).toHaveProperty('pmcsHoursPercentage');
    expect(statusOverTime).toHaveProperty('pmcmHoursPercentage');
    expect(statusOverTime).toHaveProperty('nmcsHoursPercentage');
    expect(statusOverTime).toHaveProperty('dadeHoursPercentage');
    expect(statusOverTime).toHaveProperty('nmcmHoursPercentage');
  });

  it('should have nmcmHours as optional property', () => {
    const statusOverTime: IStatusOverTime = {
      reportingMonth: '2024-01',
      totalFieldHours: 50,
      totalFmcHours: 100,
      totalPmcsHours: 25,
      totalPmcmHours: 75,
      totalNmcsHours: 20,
      totalDadeHours: 30,
      totalSustHours: 40,
      totalHoursInStatus: 340,
      fmcHoursPercentage: 0.294,
      pmcsHoursPercentage: 0.221,
      pmcmHoursPercentage: 0.074,
      nmcsHoursPercentage: 0.059,
      dadeHoursPercentage: 0.088,
      nmcmHoursPercentage: 0.265,
    };

    // Should compile without nmcmHours
    expect(statusOverTime.nmcmHours).toBeUndefined();
  });
});

describe('mapToIStatusOverTime', () => {
  const mockDto: IStatusOverTimeDto = {
    reporting_month: '2024-01',
    total_fmc_hours: 100,
    total_field_hours: 50,
    total_pmcm_hours: 75,
    total_pmcs_hours: 25,
    total_dade_hours: 30,
    total_sust_hours: 40,
    total_nmcs_hours: 20,
    total_hours_in_status: 340,
  };

  it('should correctly map DTO properties to camelCase', () => {
    const result = mapToIStatusOverTime(mockDto);

    expect(result.reportingMonth).toBe(mockDto.reporting_month);
    expect(result.totalFmcHours).toBe(mockDto.total_fmc_hours);
    expect(result.totalFieldHours).toBe(mockDto.total_field_hours);
    expect(result.totalPmcmHours).toBe(mockDto.total_pmcm_hours);
    expect(result.totalPmcsHours).toBe(mockDto.total_pmcs_hours);
    expect(result.totalNmcsHours).toBe(mockDto.total_nmcs_hours);
    expect(result.totalDadeHours).toBe(mockDto.total_dade_hours);
    expect(result.totalSustHours).toBe(mockDto.total_sust_hours);
    expect(result.totalHoursInStatus).toBe(mockDto.total_hours_in_status);
  });

  it('should calculate percentages correctly', () => {
    const result = mapToIStatusOverTime(mockDto);

    // Expected calculations based on mockDto values
    expect(result.fmcHoursPercentage).toBeCloseTo(100 / 340, 5); // ~0.294
    expect(result.pmcsHoursPercentage).toBeCloseTo(75 / 340, 5); // ~0.221
    expect(result.pmcmHoursPercentage).toBeCloseTo(25 / 340, 5); // ~0.074
    expect(result.nmcsHoursPercentage).toBeCloseTo(20 / 340, 5); // ~0.059
    expect(result.dadeHoursPercentage).toBeCloseTo(30 / 340, 5); // ~0.088
    expect(result.nmcmHoursPercentage).toBeCloseTo((40 + 50) / 340, 5); // ~0.265
  });

  it('should handle zero total hours gracefully', () => {
    const zeroTotalDto: IStatusOverTimeDto = {
      ...mockDto,
      total_hours_in_status: 0,
    };

    const result = mapToIStatusOverTime(zeroTotalDto);

    expect(result.fmcHoursPercentage).toBe(Infinity);
    expect(result.pmcsHoursPercentage).toBe(Infinity);
    expect(result.pmcmHoursPercentage).toBe(Infinity);
    expect(result.nmcsHoursPercentage).toBe(Infinity);
    expect(result.dadeHoursPercentage).toBe(Infinity);
    expect(result.nmcmHoursPercentage).toBe(Infinity);
  });

  it('should handle zero individual hours correctly', () => {
    const zeroIndividualDto: IStatusOverTimeDto = {
      reporting_month: '2024-01',
      total_fmc_hours: 0,
      total_field_hours: 0,
      total_pmcm_hours: 0,
      total_pmcs_hours: 0,
      total_dade_hours: 0,
      total_sust_hours: 0,
      total_nmcs_hours: 0,
      total_hours_in_status: 100,
    };

    const result = mapToIStatusOverTime(zeroIndividualDto);

    expect(result.fmcHoursPercentage).toBe(0);
    expect(result.pmcsHoursPercentage).toBe(0);
    expect(result.pmcmHoursPercentage).toBe(0);
    expect(result.nmcsHoursPercentage).toBe(0);
    expect(result.dadeHoursPercentage).toBe(0);
    expect(result.nmcmHoursPercentage).toBe(0);
  });

  it('should return all required properties', () => {
    const result = mapToIStatusOverTime(mockDto);

    expect(result).toHaveProperty('reportingMonth');
    expect(result).toHaveProperty('totalFmcHours');
    expect(result).toHaveProperty('totalPmcmHours');
    expect(result).toHaveProperty('totalPmcsHours');
    expect(result).toHaveProperty('totalNmcsHours');
    expect(result).toHaveProperty('totalDadeHours');
    expect(result).toHaveProperty('totalSustHours');
    expect(result).toHaveProperty('totalFieldHours');
    expect(result).toHaveProperty('totalHoursInStatus');
    expect(result).toHaveProperty('fmcHoursPercentage');
    expect(result).toHaveProperty('pmcsHoursPercentage');
    expect(result).toHaveProperty('pmcmHoursPercentage');
    expect(result).toHaveProperty('nmcsHoursPercentage');
    expect(result).toHaveProperty('dadeHoursPercentage');
    expect(result).toHaveProperty('nmcmHoursPercentage');
  });

  it('should calculate nmcmHoursPercentage as sum of sust and field hours', () => {
    const result = mapToIStatusOverTime(mockDto);
    const expectedNmcmPercentage =
      (mockDto.total_sust_hours + mockDto.total_field_hours) / mockDto.total_hours_in_status;

    expect(result.nmcmHoursPercentage).toBeCloseTo(expectedNmcmPercentage, 5);
  });

  it('should handle decimal values correctly', () => {
    const decimalDto: IStatusOverTimeDto = {
      reporting_month: '2024-01',
      total_fmc_hours: 33.33,
      total_field_hours: 16.67,
      total_pmcm_hours: 25.5,
      total_pmcs_hours: 8.25,
      total_dade_hours: 10.1,
      total_sust_hours: 13.45,
      total_nmcs_hours: 6.7,
      total_hours_in_status: 114,
    };

    const result = mapToIStatusOverTime(decimalDto);

    expect(result.fmcHoursPercentage).toBeCloseTo(33.33 / 114, 5);
    expect(result.pmcsHoursPercentage).toBeCloseTo(25.5 / 114, 5);
    expect(result.pmcmHoursPercentage).toBeCloseTo(8.25 / 114, 5);
    expect(result.nmcsHoursPercentage).toBeCloseTo(6.7 / 114, 5);
    expect(result.dadeHoursPercentage).toBeCloseTo(10.1 / 114, 5);
    expect(result.nmcmHoursPercentage).toBeCloseTo((13.45 + 16.67) / 114, 5);
  });
});
