/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import {
  IAggregateCondition,
  IAggregateConditionDto,
  IAGSEEditIn,
  IAGSEEditInDto,
  IAGSEEditOut,
  IAGSEEditOutDto,
  mapToAggregateCondition,
  mapToAGSEEditInDto,
  mapToAGSEEditOut,
} from '@store/griffin_api/agse/models';

describe('mapToAggregateCondition', () => {
  it('testing aggregate condition mapping', () => {
    const dto: IAggregateConditionDto = {
      display_name: 'AGPU',
      fmc: 129,
      pmc: 0,
      nmc: 0,
    };
    const expected: IAggregateCondition = {
      displayName: 'AGPU',
      fmc: 129,
      pmc: 0,
      nmc: 0,
      total: 129,
    };
    const result = mapToAggregateCondition(dto);
    expect(result).toEqual(expected);
  });
  it('testing aggregate condition null mapping', () => {
    const dto: IAggregateConditionDto = {
      display_name: null as any,
      fmc: null as any,
      pmc: null as any,
      nmc: null as any,
    };
    const expected: IAggregateCondition = {
      displayName: null as any,
      fmc: null as any,
      pmc: null as any,
      nmc: null as any,
      total: 0,
    };
    const result = mapToAggregateCondition(dto);
    expect(result).toEqual(expected);
  });

  it('testing the IAGSEEditIn', () => {
    const data: IAGSEEditIn = {
      equipmentNumber: 'test',
      condition: 'test',
      fieldSyncStatus: {},
      locationId: 1,
      remarks: 'test',
    };

    const expected: IAGSEEditInDto = {
      equipment_number: 'test',
      condition: 'test',
      field_sync_status: {},
      location_id: 1,
      remarks: 'test',
    };

    const result = mapToAGSEEditInDto(data);
    expect(result).toEqual(expected);
  });

  it('testing the IAGSEEditOut', () => {
    const expected: IAGSEEditOut = {
      detail: 'test',
      editedAGSE: ['1'],
      notEditedAGSE: ['2'],
    };

    const dto: IAGSEEditOutDto = {
      detail: 'test',
      edited_agse: ['1'],
      not_edited_agse: ['2'],
    };

    const result = mapToAGSEEditOut(dto);
    expect(result).toEqual(expected);
  });
});
