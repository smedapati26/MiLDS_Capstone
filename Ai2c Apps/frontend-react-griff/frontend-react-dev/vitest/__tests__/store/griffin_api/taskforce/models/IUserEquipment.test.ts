import { describe, expect, it } from 'vitest';

import {
  IAgseDto,
  IAircraftDto,
  IUasDto,
  mapToIUserEquipment,
  mapToUserEquipments,
} from '@store/griffin_api/taskforce/models/IUserEquipment';

describe('mapToIUserEquipment', () => {
  it('maps IAircraftDto correctly', () => {
    const dto: IAircraftDto = {
      serial: 'A123',
      status: 'OPERATIONAL',
      model: 'AH-64',
      current_unit__short_name: '1-101',
    };

    const result = mapToIUserEquipment(dto);

    expect(result).toEqual({
      serial: 'A123',
      model: 'AH-64',
      unit: '1-101',
      status: 'OPERATIONAL',
    });
  });

  it('maps IUasDto correctly', () => {
    const dto: IUasDto = {
      serial_number: 'U55',
      status: 'DOWN',
      model: 'RQ-7',
      current_unit__short_name: '2-82',
    };

    const result = mapToIUserEquipment(dto);

    expect(result).toEqual({
      serial: 'U55',
      model: 'RQ-7',
      unit: '2-82',
      status: 'DOWN',
    });
  });

  it('maps IAgseDto correctly', () => {
    const dto: IAgseDto = {
      equipment_number: 'G900',
      condition: 'MAINTENANCE',
      model: 'GEN-4',
      current_unit__short_name: '3-25',
    };

    const result = mapToIUserEquipment(dto);

    expect(result).toEqual({
      serial: 'G900',
      model: 'GEN-4',
      unit: '3-25',
      status: 'MAINTENANCE',
    });
  });

  it('throws on unknown DTO type', () => {
    // @ts-expect-error testing invalid input
    expect(() => mapToIUserEquipment({ model: 'X', current_unit__short_name: 'Y' })).toThrow('Unknown DTO type');
  });
});

describe('mapToUserEquipments', () => {
  it('maps all equipment arrays correctly', () => {
    const dto = {
      aircraft: [{ serial: 'A1', status: 'OK', model: 'AH-64', current_unit__short_name: '1-101' }],
      uas: [{ serial_number: 'U1', status: 'OK', model: 'RQ-7', current_unit__short_name: '2-82' }],
      agse: [{ equipment_number: 'G1', condition: 'OK', model: 'GEN-4', current_unit__short_name: '3-25' }],
    };

    const result = mapToUserEquipments(dto);

    expect(result).toEqual({
      aircraft: [{ serial: 'A1', model: 'AH-64', unit: '1-101', status: 'OK' }],
      uas: [{ serial: 'U1', model: 'RQ-7', unit: '2-82', status: 'OK' }],
      agse: [{ serial: 'G1', model: 'GEN-4', unit: '3-25', status: 'OK' }],
    });
  });
});
