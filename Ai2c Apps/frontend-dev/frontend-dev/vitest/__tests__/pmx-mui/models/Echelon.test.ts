import { titlecase } from '@helpers/titlecase';

import { Echelon, EchelonMap, getEchelonName, getEchelonOptions } from '@ai2c/pmx-mui/models/Echelon';

describe('Echelon Enum', () => {
  it('should have GROUP as a valid key', () => {
    expect(Echelon.GROUP).toBe('GROUP');
  });
});

describe('getEchelonName', () => {
  it('should return the correct name for GROUP', () => {
    const echelonName = getEchelonName(Echelon.GROUP);
    expect(echelonName).toBe(titlecase('GROUP'));
  });
});

describe('getEchelonOptions', () => {
  it('should include GROUP in the options', () => {
    const options = getEchelonOptions();
    const groupOption = options.find((option) => option.value === Echelon.GROUP);
    expect(groupOption).toBeDefined();
    expect(groupOption?.label).toBe(titlecase('GROUP'));
  });
});

describe('EchelonMap', () => {
  it('should have a mapping for GROUP', () => {
    const groupMapping = EchelonMap[Echelon.GROUP];
    expect(groupMapping).toBeDefined();
    expect(groupMapping.value).toBe('GROUP');
    expect(groupMapping.label).toBe('Group');
    expect(groupMapping.level).toBe(5);
  });
});
