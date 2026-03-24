import { titlecase } from '@ai2c/pmx-mui/helpers/titlecase';
import { Echelon, getEchelonName, getEchelonOptions } from '@ai2c/pmx-mui/models/Echelon';

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
  it('should include Company in the options', () => {
    const options = getEchelonOptions();
    const groupOption = options.find((option) => option.value === Echelon.COMPANY);
    expect(groupOption).toBeDefined();
    expect(groupOption?.label).toBe(titlecase('COMPANY'));
  });
});
