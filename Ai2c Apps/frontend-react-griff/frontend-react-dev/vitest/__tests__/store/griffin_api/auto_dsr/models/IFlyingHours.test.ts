import { describe, expect, it } from 'vitest';

import { IFlyingHoursDto, mapToIFlyingHours } from '@store/griffin_api/auto_dsr/models';

describe('mapToIFlyingHours', () => {
  it('should map IFlyingHoursDto to IFlyingHours correctly', () => {
    const dto: IFlyingHoursDto = {
      monthly_hours_flown: 100,
      monthly_hours_total: 200,
      yearly_hours_flown: 1200,
      yearly_hours_total: 2400,
    };

    const result = mapToIFlyingHours(dto);

    expect(result.monthlyHoursFlown).toBe(100);
    expect(result.monthlyHoursTotal).toBe(200);
    expect(result.yearlyHoursFlown).toBe(1200);
    expect(result.yearlyHoursTotal).toBe(2400);
  });

  it('should handle different values', () => {
    const dto: IFlyingHoursDto = {
      monthly_hours_flown: 150,
      monthly_hours_total: 250,
      yearly_hours_flown: 1800,
      yearly_hours_total: 3000,
    };

    const result = mapToIFlyingHours(dto);

    expect(result.monthlyHoursFlown).toBe(150);
    expect(result.monthlyHoursTotal).toBe(250);
    expect(result.yearlyHoursFlown).toBe(1800);
    expect(result.yearlyHoursTotal).toBe(3000);
  });
});
