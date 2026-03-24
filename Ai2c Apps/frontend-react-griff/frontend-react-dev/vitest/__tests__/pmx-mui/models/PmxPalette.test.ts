import { PmxPalette } from '@ai2c/pmx-mui/models/PmxPalette';
import { baseDarkPalette } from '@ai2c/pmx-mui/theme/darkPalette';
import { baseLightPalette } from '@ai2c/pmx-mui/theme/lightPalette';

describe('PmxPalette', () => {
  const pmxPalette: PmxPalette = {
    dark: baseDarkPalette,
    light: baseLightPalette,
  };

  it('should have a dark palette with correct primary and secondary colors', () => {
    expect(pmxPalette.dark.primary?.main).toBe('#4DA6FF');
    expect(pmxPalette.dark.secondary?.main).toBe('#FFCC01');
  });

  it('should have a light palette with correct primary and secondary colors', () => {
    expect(pmxPalette.light.primary?.main).toBe('#4DA6FF');
    expect(pmxPalette.light.secondary?.main).toBe('#FFCC01');
  });
});
