import { describe, expect, it } from 'vitest';

import { IModification, IModificationDto, IModificationEditIn, IModificationEditInDto, IModificationEditOut, IModificationEditOutDto, mapToIModification, mapToIModificationEditInDto, mapToIModificationEditOut, TrackingVariableOptions } from '@store/griffin_api/mods/models';

describe('IModification model test', () => {
  it('mapToIModification test', () => {
    const dto: IModificationDto = {
      id: 1,
      serial_number: 'serial1',
      model: 'model1',
      unit: 'unit1',
      tracking_variable: TrackingVariableOptions.STATUS.value,
      value: 'FMC',
      location: undefined,
      remarks: undefined,
      assigned_aircraft: undefined,
    };

    const expected: IModification = {
      id: 1,
      serialNumber: 'serial1',
      model: 'model1',
      unit: 'unit1',
      trackingVariable: TrackingVariableOptions.STATUS.value,
      value: 'FMC',
      location: undefined,
      remarks: undefined,
      assignedAircraft: undefined,
    };

    const result = mapToIModification(dto);
    expect(result).toEqual(expected);
  });

  it('mapToIModificationEditInDto test', () => {
    const obj: IModificationEditIn = {
      id: 1,
      serialNumber: 'serial1',
      model: 'model1',
      unit: 'unit1',
      trackingVariable: TrackingVariableOptions.STATUS.value,
      value: 'FMC',
      locationId: 1,
      remarks: "Comments",
      assignedAircraft: "12345",
    };

    const expected: IModificationEditInDto = {
      id: 1,
      serial_number: 'serial1',
      model: 'model1',
      unit_uic: 'unit1',
      tracking_variable: TrackingVariableOptions.STATUS.value,
      value: 'FMC',
      location_id: 1,
      remarks: "Comments",
      assigned_aircraft: "12345",
    };

    const result = mapToIModificationEditInDto(obj);
    expect(result).toEqual(expected);
  });

  it('mapToIModificationEditOut test', () => {
    const dto: IModificationEditOutDto = {
      edited_mods: [1, 2, 3],
      not_edited_mods: [0],
      detail: "Partial editing complete.",
    };

    const expected: IModificationEditOut = {
      editedMods: [1, 2, 3],
      notEditedMods: [0],
      detail: "Partial editing complete.",
    };

    const result = mapToIModificationEditOut(dto);
    expect(result).toEqual(expected);
  });
});
