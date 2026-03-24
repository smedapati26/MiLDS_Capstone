/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import { filterDataByModel } from '@features/task-forces/components/create-stepper/step 6/utils/filterDataByModel';

describe('filterDataByModel', () => {
  const mockEquipment = (model: string) => ({ model }) as any;

  it('filters aircraft by model', () => {
    const row: any = {
      aircraft: [mockEquipment('A320'), mockEquipment('B737')],
    };

    const result = filterDataByModel(row, 'A320');
    expect(result).toEqual({ data: [mockEquipment('A320')], type: 'Aircraft' });
  });

  it('filters uas by model', () => {
    const row: any = {
      uas: [mockEquipment('DJI'), mockEquipment('Parrot')],
    };

    const result = filterDataByModel(row, 'DJI');
    expect(result).toEqual({ data: [mockEquipment('DJI')], type: 'UAS' });
  });

  it('filters agse by model', () => {
    const row: any = {
      agse: [mockEquipment('Loader'), mockEquipment('Towbar')],
    };

    const result = filterDataByModel(row, 'Towbar');
    expect(result).toEqual({ data: [mockEquipment('Towbar')], type: 'AGSE' });
  });

  it('returns empty array when no matching model exists', () => {
    const row: any = {
      aircraft: [mockEquipment('A320')],
    };

    const result = filterDataByModel(row, 'B777');
    expect(result).toEqual({ data: [], type: 'Aircraft' });
  });

  it('prioritizes last matching category (aircraft → uas → agse)', () => {
    const row: any = {
      aircraft: [mockEquipment('A320')],
      uas: [mockEquipment('DJI')],
      agse: [mockEquipment('Towbar')],
    };

    // Because the function overwrites `data` each time,
    // the last matching category (agse) wins.
    const result = filterDataByModel(row, 'Towbar');
    expect(result).toEqual({ data: [mockEquipment('Towbar')], type: 'AGSE' });
  });
});
