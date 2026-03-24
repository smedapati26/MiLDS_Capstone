import { PaletteColorOptions, PaletteMode } from '@mui/material';

import { createPmxPalette } from '@ai2c/pmx-mui/theme/createPmxPalette';
import { baseDarkPalette, baseLightPalette } from '@ai2c/pmx-mui/theme/index';

describe('createPmxPalette', () => {
  const primaryPalette: PaletteColorOptions = {
    main: '#1976d2',
  };

  it('should create a dark mode palette', () => {
    const mode: PaletteMode = 'dark';
    const palette = createPmxPalette(mode, primaryPalette);

    expect(palette.mode).toBe(mode);
    expect(palette.common).toEqual(baseDarkPalette.common);
    expect(palette.primary).toEqual(primaryPalette);
    expect(palette.secondary).toEqual(baseDarkPalette.secondary);
    expect(palette.error).toEqual(baseDarkPalette.error);
    expect(palette.warning).toEqual(baseDarkPalette.warning);
    expect(palette.info).toEqual(baseDarkPalette.info);
    expect(palette.success).toEqual(baseDarkPalette.success);
    expect(palette.grey).toEqual(baseDarkPalette.grey);
    expect(palette.text).toEqual(baseDarkPalette.text);
    expect(palette.divider).toBe(baseDarkPalette.divider);
    expect(palette.background).toEqual(baseDarkPalette.background);
    expect(palette.boxShadow).toBe(baseDarkPalette.boxShadow);
    expect(palette.layout).toEqual(baseDarkPalette.layout);
    expect(palette.badge).toBe(baseDarkPalette.badge);
    expect(palette.avatar).toBe(baseDarkPalette.avatar);
    expect(palette.graph).toEqual(baseDarkPalette.graph);
    expect(palette.stacked_bars).toEqual(baseDarkPalette.stacked_bars);
    expect(palette.classification).toEqual(baseDarkPalette.classification);
    expect(palette.operational_readiness_status).toEqual(baseDarkPalette.operational_readiness_status);
  });

  it('should create a light mode palette', () => {
    const mode: PaletteMode = 'light';
    const palette = createPmxPalette(mode, primaryPalette);

    expect(palette.mode).toBe(mode);
    expect(palette.common).toEqual(baseLightPalette.common);
    expect(palette.primary).toEqual(primaryPalette);
    expect(palette.secondary).toEqual(baseLightPalette.secondary);
    expect(palette.error).toEqual(baseLightPalette.error);
    expect(palette.warning).toEqual(baseLightPalette.warning);
    expect(palette.info).toEqual(baseLightPalette.info);
    expect(palette.success).toEqual(baseLightPalette.success);
    expect(palette.grey).toEqual(baseLightPalette.grey);
    expect(palette.text).toEqual(baseLightPalette.text);
    expect(palette.divider).toBe(baseLightPalette.divider);
    expect(palette.background).toEqual(baseLightPalette.background);
    expect(palette.boxShadow).toBe(baseLightPalette.boxShadow);
    expect(palette.layout).toEqual(baseLightPalette.layout);
    expect(palette.badge).toBe(baseLightPalette.badge);
    expect(palette.avatar).toBe(baseLightPalette.avatar);
    expect(palette.graph).toEqual(baseLightPalette.graph);
    expect(palette.stacked_bars).toEqual(baseLightPalette.stacked_bars);
    expect(palette.classification).toEqual(baseLightPalette.classification);
    expect(palette.operational_readiness_status).toEqual(baseLightPalette.operational_readiness_status);
  });
});
