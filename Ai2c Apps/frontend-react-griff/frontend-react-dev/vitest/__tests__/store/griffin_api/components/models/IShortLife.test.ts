import { describe, expect, it } from 'vitest';

import { IShortLifeComponentDto, mapToIShortLife } from '@store/griffin_api/components/models';

describe('mapToIShortLife', () => {
  it('should correctly map all fields from IShortLifeComponentDto to IShortLife', () => {
    const dto: IShortLifeComponentDto = {
      id: 1,
      aircraft: 'AC123',
      aircraft_model: 'ModelX',
      work_unit_code: 'WUC456',
      nomenclature: 'Nomenclature1',
      part_number: 'PN789',
      comp_serial_number: 'SN101112',
      tracker_display_name: 'Tracker1',
      component_type: 'TypeA',
      current_value: 100,
      replacement_due: 200,
      flying_hours_remaining: 50,
    };

    const result = mapToIShortLife(dto);

    expect(result.id).toBe(dto.id);
    expect(result.aircraftModel).toBe(dto.aircraft_model);
    expect(result.aircraftSerialNumber).toBe(dto.aircraft);
    expect(result.workUnitCode).toBe(dto.work_unit_code);
    expect(result.nomenclature).toBe(dto.nomenclature);
    expect(result.partNumber).toBe(dto.part_number);
    expect(result.serialNumber).toBe(dto.comp_serial_number);
    expect(result.trackerName).toBe(dto.tracker_display_name);
    expect(result.componentType).toBe(dto.component_type);
    expect(result.currentValue).toBe(dto.current_value);
    expect(result.replacementDue).toBe(dto.replacement_due);
    expect(result.hoursRemaining).toBe(dto.flying_hours_remaining);
  });

  it('should handle null values correctly', () => {
    const dto: IShortLifeComponentDto = {
      id: 2,
      aircraft: 'AC999',
      aircraft_model: 'ModelY',
      work_unit_code: 'WUC888',
      nomenclature: 'Nomenclature2',
      part_number: 'PN777',
      comp_serial_number: 'SN666',
      tracker_display_name: null,
      component_type: null,
      current_value: 150,
      replacement_due: null,
      flying_hours_remaining: null,
    };

    const result = mapToIShortLife(dto);

    expect(result.trackerName).toBeNull();
    expect(result.componentType).toBeNull();
    expect(result.replacementDue).toBeNull();
    expect(result.hoursRemaining).toBeNull();
  });

  it('should return a new object and not mutate the input', () => {
    const dto: IShortLifeComponentDto = {
      id: 3,
      aircraft: 'AC555',
      aircraft_model: 'ModelZ',
      work_unit_code: 'WUC444',
      nomenclature: 'Nomenclature3',
      part_number: 'PN333',
      comp_serial_number: 'SN222',
      tracker_display_name: 'Tracker3',
      component_type: 'TypeC',
      current_value: 300,
      replacement_due: 400,
      flying_hours_remaining: 100,
    };

    const dtoCopy = { ...dto };
    const result = mapToIShortLife(dto);

    expect(result).not.toBe(dto);
    expect(dto).toEqual(dtoCopy); // input unchanged
  });
});
