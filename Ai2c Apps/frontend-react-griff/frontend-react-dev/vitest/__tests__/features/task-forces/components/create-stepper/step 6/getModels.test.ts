/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import { SubordinateSchemaType } from '@features/task-forces/components/create-stepper/step 2/schema';
import { getModels } from '@features/task-forces/components/create-stepper/step 6/utils/getModels';

describe('getModels', () => {
  it('returns an empty array when row is undefined', () => {
    expect(getModels(undefined)).toEqual([]);
  });

  it('returns aircraft models when aircraft exists', () => {
    const row = {
      aircraft: [{ model: 'A320' }, { model: 'B737' }],
    };

    expect(getModels(row as any)).toEqual(['A320', 'B737']);
  });

  it('returns uas models when uas exists (overrides aircraft)', () => {
    const row = {
      aircraft: [{ model: 'A320' }],
      uas: [{ model: 'DJI-M300' }],
    };

    expect(getModels(row as any)).toEqual(['A320', 'DJI-M300']);
  });

  it('returns agse models when agse exists (overrides uas and aircraft)', () => {
    const row = {
      aircraft: [{ model: 'A320' }],
      uas: [{ model: 'DJI-M300' }],
      agse: [{ model: 'Loader-1' }, { model: 'Loader-2' }],
    };

    expect(getModels(row as SubordinateSchemaType)).toEqual(['A320', 'DJI-M300', 'Loader-1', 'Loader-2']);
  });

  it('handles empty arrays gracefully', () => {
    const row = {
      aircraft: [],
      uas: [],
      agse: [],
    };

    expect(getModels(row as any)).toEqual([]);
  });
});
