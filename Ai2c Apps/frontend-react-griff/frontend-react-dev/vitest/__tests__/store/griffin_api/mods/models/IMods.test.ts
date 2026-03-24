import { describe, expect, it } from 'vitest';

import { IMods, IModsDto, mapToMods } from '@store/griffin_api/mods/models';

describe('mods model test', () => {
  it('mapToMods test', () => {
    const dto: IModsDto = {
      serial_number: 'serial3',
      TEST1: 'TEST_ENTRY',
      TEST2: ' ',
      TEST3: ' ',
      TEST4: 'TEST_ENTRY',
      TEST5: 'TEST_ENTRY',
      TEST6: ' ',
      TEST7: ' ',
      TEST8: 'TEST_ENTRY',
      TEST9: 'TEST_ENTRY',
    };

    const expected: IMods = {
      serialNumber: 'serial3',
      TEST1: 'TEST_ENTRY',
      TEST2: ' ',
      TEST3: ' ',
      TEST4: 'TEST_ENTRY',
      TEST5: 'TEST_ENTRY',
      TEST6: ' ',
      TEST7: ' ',
      TEST8: 'TEST_ENTRY',
      TEST9: 'TEST_ENTRY',
    };

    const result = mapToMods(dto);
    expect(result).toEqual(expected);
  });
});
