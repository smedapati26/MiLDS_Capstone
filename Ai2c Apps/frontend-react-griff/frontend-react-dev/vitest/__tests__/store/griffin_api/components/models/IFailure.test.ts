import { describe, expect, it } from 'vitest';

import { IFailureCountDto, mapToIFailureCount } from '@store/griffin_api/components/models';

describe('mapToIFailureCount', () => {
  it('should map all fields correctly from IFailureCountDto to IFailureCount', () => {
    const dto: IFailureCountDto = {
      part_number: 'PN123',
      nomenclature: 'Engine Part',
      model: 'ModelX',
      serial: 'SN456',
      failure_chance: 0.75,
      work_unit_code: 'WUC789',
    };

    const result = mapToIFailureCount(dto);

    expect(result.partNumber).toBe(dto.part_number);
    expect(result.nomenclature).toBe(dto.nomenclature);
    expect(result.model).toBe(dto.model);
    expect(result.serial).toBe(dto.serial);
    expect(result.failureChance).toBe(dto.failure_chance);
    expect(result.wuc).toBe(dto.work_unit_code);
  });

  it('should return a new object and not mutate the input', () => {
    const dto: IFailureCountDto = {
      part_number: 'PN001',
      nomenclature: 'Wing Part',
      model: 'ModelY',
      serial: 'SN002',
      failure_chance: 0.1,
      work_unit_code: 'WUC003',
    };

    const dtoCopy = { ...dto };
    const result = mapToIFailureCount(dto);

    expect(result).not.toBe(dto);
    expect(dto).toEqual(dtoCopy); // input unchanged
  });
});
