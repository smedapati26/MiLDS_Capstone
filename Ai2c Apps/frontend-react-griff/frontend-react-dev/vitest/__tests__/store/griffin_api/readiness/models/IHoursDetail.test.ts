import { describe, expect, it } from 'vitest';

import {
  IHoursDetail,
  IHoursFlown,
  IHoursFlownModel,
  IHoursFlownSubordinate,
  IHoursFlownUnits,
} from '@store/griffin_api/readiness/models';

describe('IHoursDetail', () => {
  const dto: IHoursDetail = {
    hours_flown: 100,
    reporting_month: '2024-01',
  };

  it('should have the correct interface structure', () => {
    expect(dto).toHaveProperty('hours_flown');
    expect(dto).toHaveProperty('reporting_month');
  });

  it('should accept valid data types', () => {
    expectTypeOf(dto.hours_flown).toBeNumber();
    expectTypeOf(dto.reporting_month).toBeString();
  });
});

describe('IHoursFlown', () => {
  const dto: IHoursFlown = {
    hours_detail: [{ hours_flown: 100, reporting_month: '2024-01' }],
  };

  it('should have the correct interface structure', () => {
    expect(dto).toHaveProperty('hours_detail');
    expectTypeOf(dto.hours_detail).toBeArray();
    expect(dto.hours_detail.length).toBe(1);
  });
});

describe('IHoursFlownUnits', () => {
  const dto: IHoursFlownUnits = {
    uic: 'TEST_UIC',
    hours_detail: [{ hours_flown: 100, reporting_month: '2024-01' }],
  };

  it('should have the correct interface structure', () => {
    expect(dto).toHaveProperty('uic');
    expect(dto).toHaveProperty('hours_detail');
    expectTypeOf(dto.uic).toBeString();
    expectTypeOf(dto.hours_detail).toBeArray();
    expect(dto.hours_detail.length).toBe(1);
  });
});

describe('IHoursFlownSubordinate', () => {
  const dto: IHoursFlownSubordinate = {
    uic: 'TEST_UIC',
    parent_uic: 'TEST_PARENT_UIC',
    hours_detail: [{ hours_flown: 100, reporting_month: '2024-01' }],
  };

  it('should have the correct interface structure', () => {
    expect(dto).toHaveProperty('uic');
    expect(dto).toHaveProperty('parent_uic');
    expect(dto).toHaveProperty('hours_detail');
    expectTypeOf(dto.uic).toBeString();
    expectTypeOf(dto.parent_uic).toBeString();
    expectTypeOf(dto.hours_detail).toBeArray();
    expect(dto.hours_detail.length).toBe(1);
  });
});

describe('IHoursFlownModel', () => {
  const dto: IHoursFlownModel = {
    model: 'CH-47',
    hours_detail: [{ hours_flown: 100, reporting_month: '2024-01' }],
  };

  it('should have the correct interface structure', () => {
    expect(dto).toHaveProperty('model');
    expectTypeOf(dto.model).toBeString();
    expectTypeOf(dto.hours_detail).toBeArray();
    expect(dto.hours_detail.length).toBe(1);
  });
});
