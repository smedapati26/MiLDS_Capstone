import { PaletteMode } from '@mui/material';
import { PaletteColorOptions, PaletteOptions } from '@mui/material/styles';

import { baseDarkPalette, baseLightPalette } from '.';

export function createPmxPalette(mode: PaletteMode, primaryPalette: PaletteColorOptions): PaletteOptions {
  const basePalette = mode === 'dark' ? baseDarkPalette : baseLightPalette;

  return {
    mode: mode,
    common: basePalette.common,
    primary: primaryPalette,
    secondary: { ...basePalette.secondary },
    error: { ...basePalette.error },
    warning: { ...basePalette.warning },
    info: { ...basePalette.info },
    success: { ...basePalette.success },
    grey: { ...basePalette.grey },
    text: { ...basePalette.text },
    divider: basePalette.divider,
    background: { ...basePalette.background },
    // PMX-MUI extra properties
    boxShadow: basePalette.boxShadow,
    layout: { ...basePalette.layout },
    badge: basePalette.badge,
    avatar: basePalette.avatar,
    graph: basePalette.graph,
    stacked_bars: basePalette.stacked_bars,
    classification: { ...basePalette.classification },
    operational_readiness_status: basePalette.operational_readiness_status,
  };
}
