import { ReactElement } from 'react';

import { PaletteMode, ThemeOptions } from '@mui/material';

import MuiAccordionOverride from './overrides/MuiAccordionOverride';
import MuiAlertOverride from './overrides/MuiAlertOverride';
import MuiAppBarOverride from './overrides/MuiAppBarOverride';
import MuiAvatarOverride from './overrides/MuiAvatarOverride';
import MuiBadgeOverride from './overrides/MuiBadgeOverride';
import MuiButtonGroupOverride from './overrides/MuiButtonGroupOverride';
import MuiButtonOverride from './overrides/MuiButtonOverride';
import MuiCardOverride from './overrides/MuiCardOverride';
import MuiCheckboxRadioOverride from './overrides/MuiCheckboxRadioOverride';
import MuiContainerOverride from './overrides/MuiContainerOverride';
import MuiDataGridOverride from './overrides/MuiDataGridOverride';
import MuiDateCalendarOverride from './overrides/MuiDateCalendarOverride';
import MuiDialogOverride from './overrides/MuiDialogOverride';
import MuiDividerOverride from './overrides/MuiDividerOverride';
import MuiDrawerOverride from './overrides/MuiDrawerOverride';
import MuiElevationOverride from './overrides/MuiElevationOverride';
import MuiIconButtonOverride from './overrides/MuiIconButtonOverride';
import MuiLinearProgressOverride from './overrides/MuiLinearProgressOverride';
import MuiLinkOverride from './overrides/MuiLinkOverride';
import MuiMenuItemOverride from './overrides/MuiMenuItemOverride';
import MuiMultiSectionDigitalClockOverride from './overrides/MuiMultiSectionDigitalClockOverride';
import MuiSelectOverride from './overrides/MuiSelectOverride';
import MuiSliderOverride from './overrides/MuiSliderOverride';
import MuiSnackbarOverride from './overrides/MuiSnackbarOverride';
import MuiSwitchOverride from './overrides/MuiSwitchOverride';
import MuiTableOverride from './overrides/MuiTableOverride';
import MuiTabsOverride from './overrides/MuiTabsOverride';
import MuiToggleButtonOverride from './overrides/MuiToggleButtonOverride';
import MuiTooltipOverride from './overrides/MuiTooltipOverride';

import { PmxPalette } from '../models/PmxPalette';
import { typography } from './typography';

declare module '@mui/material/styles' {
  // Allows you to use any key value pair with MUI Theme Options components
  interface Components {
    [key: string]: unknown;
  }

  // Extra props
  interface TypographyVariants {
    body3: React.CSSProperties;
  }

  // Extra props
  interface TypographyVariantsOptions {
    body3?: React.CSSProperties;
  }

  // Extended palette to match PMx Style Guide
  export interface SimplePaletteColorOptions {
    white?: string;
    black?: string;
    l90?: string;
    l80?: string;
    l60?: string;
    l40?: string;
    l20?: string;
    d20?: string;
    d40?: string;
    d60?: string;
    d80?: string;
    d90?: string;
  }
}

declare module '@mui/material' {
  // Extended Color to match PMx Style Guide
  export interface Color {
    black?: string;
    white?: string;
    l90?: string;
    l80?: string;
    l60?: string;
    l40?: string;
    l20?: string;
    main?: string;
    d20?: string;
    d40?: string;
    d60?: string;
    d80?: string;
    d90?: string;
  }
}

declare module '@mui/material/styles' {
  export interface BaseTheme {}

  // Palette with layout props
  export interface Palette {
    boxShadow: string;
    layout: {
      base: string;
      background5: string;
      background7: string;
      background8: string;
      background9: string;
      background11: string;
      background12: string;
      background14: string;
      background15: string;
      background16: string;
    };
    graph: {
      purple: string;
      cyan: string;
      teal: string;
      pink: string;
      green: string;
      blue: string;
      magenta: string;
      yellow: string;
      teal2: string;
      cyan2: string;
      orange: string;
      purple2: string;
    };
    stacked_bars: {
      magenta: string;
      blue: string;
      cyan2: string;
      teal2: string;
      purple: string;
    };
    classification: {
      unclassified: string;
      cui: string;
      confidential: string;
      secret: string;
      top_secret: string;
      top_secret_sci: string;
    };
    operational_readiness_status: {
      fmc: string;
      pmcs: string;
      pmcm: string;
      nmcs: string;
      nmcm: string;
      dade: string;
    };
    avatar: string;
    badge: string;
  }

  // Palette Options with additional parameters to sync up with PMx Style Guide
  export interface PaletteOptions {
    boxShadow: string;
    layout: {
      base?: string;
      background5?: string;
      background7?: string;
      background8?: string;
      background9?: string;
      background11?: string;
      background12?: string;
      background14?: string;
      background15?: string;
      background16?: string;
    };
    graph?: {
      purple?: string;
      cyan?: string;
      teal?: string;
      pink?: string;
      green?: string;
      blue?: string;
      magenta?: string;
      yellow?: string;
      teal2?: string;
      cyan2?: string;
      orange?: string;
      purple2?: string;
    };
    stacked_bars?: {
      magenta?: string;
      blue?: string;
      cyan2?: string;
      teal2?: string;
      purple?: string;
    };
    classification?: {
      unclassified?: string;
      cui?: string;
      confidential?: string;
      secret?: string;
      top_secret?: string;
      top_secret_sci?: string;
    };
    operational_readiness_status?: {
      fmc: string;
      pmcs: string;
      pmcm: string;
      nmcs: string;
      nmcm: string;
      dade: string;
    };
    avatar: string;
    badge: string;
  }

  // Extending Palette Color
  export interface PaletteColor {
    l90?: string;
    l80?: string;
    l60?: string;
    l40?: string;
    l20?: string;
    d20?: string;
    d40?: string;
    d60?: string;
    d80?: string;
    d90?: string;
  }

  // Adding contrast text to have black and white text
  export interface TypeText {
    contrastText: string;
  }
}

/**
 * Custom secondary variant Container
 */
declare module '@mui/material/Container' {
  export interface ContainerOwnProps {
    variant?: string;
  }
}

/**
 * Custom basic Variant
 */
declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    basic: true;
    selected: true;
  }
}

/**
 * Custom properties to set for styled components
 */
declare module '@mui/material/Popover' {
  export interface PopoverProps {
    spacing?: number;
  }
}

/**
 * Update the Typography's variant prop options
 */
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    h7: true;
    body3: true;
  }
}

/**
 * Button Base extended for Tabs
 */
declare module '@mui/material/ButtonBase' {
  export interface ButtonBaseOwnProps {
    to?: string;
  }
}

/**
 * React Router Route extended
 */
declare module 'react-router-dom' {
  export interface IndexRouteObject {
    label: string;
    icon?: ReactElement | null;
  }
  export interface NonIndexRouteObject {
    label: string;
    icon?: ReactElement | null;
  }
}

/**
 * Mui Theme Settings
 *
 * @param {string} mode ? light : dark
 * @returns Mui Theme Options
 */
export const getDesignTokens = (mode: PaletteMode, pmxPalette: PmxPalette): ThemeOptions => {
  return {
    palette: mode === 'dark' ? pmxPalette.dark : pmxPalette.light,
    spacing: 4, // theme.spacing(2) => 4 * 2 = 8px    // or sx={{ m: 2 }} => 8px
    shape: {
      borderRadius: 3,
    },
    typography: typography,
    // Mui Component Customizations
    components: {
      MuiAccordion: MuiAccordionOverride(mode, pmxPalette), // declaration issue
      MuiAlert: MuiAlertOverride(mode, pmxPalette),
      MuiAppBar: MuiAppBarOverride(mode, pmxPalette),
      MuiAvatar: MuiAvatarOverride(mode, pmxPalette),
      MuiBadge: MuiBadgeOverride(mode, pmxPalette),
      MuiButtonGroup: MuiButtonGroupOverride(mode, pmxPalette),
      MuiButton: MuiButtonOverride(mode, pmxPalette),
      MuiCard: MuiCardOverride(mode, pmxPalette),
      MuiCheckbox: MuiCheckboxRadioOverride(mode, pmxPalette),
      MuiContainer: MuiContainerOverride(mode, pmxPalette),
      MuiGrid: MuiDataGridOverride(mode, pmxPalette),
      MuiDateCalendar: MuiDateCalendarOverride(mode, pmxPalette),
      MuiDialog: MuiDialogOverride,
      MuiDivider: MuiDividerOverride(mode, pmxPalette),
      MuiDrawer: MuiDrawerOverride(mode, pmxPalette),
      MuiPaper: MuiElevationOverride(mode, pmxPalette),
      MuiIconButton: MuiIconButtonOverride(mode, pmxPalette),
      MuiLinearProgress: MuiLinearProgressOverride(mode, pmxPalette),
      MuiLink: MuiLinkOverride(mode, pmxPalette),
      MuiMenuItem: MuiMenuItemOverride(mode, pmxPalette),
      MuiMultiSectionDigitalClock: MuiMultiSectionDigitalClockOverride(mode, pmxPalette),
      MuiRadio: MuiCheckboxRadioOverride(mode, pmxPalette),
      MuiSelect: MuiSelectOverride(mode, pmxPalette),
      MuiSlider: MuiSliderOverride(mode, pmxPalette),
      MuiSnackbar: MuiSnackbarOverride(mode, pmxPalette),
      MuiSwitch: MuiSwitchOverride(mode, pmxPalette),
      MuiTab: MuiTabsOverride(mode, pmxPalette),
      MuiTable: MuiTableOverride(mode, pmxPalette),
      MuiToggleButton: MuiToggleButtonOverride(mode, pmxPalette),
      MuiTooltip: MuiTooltipOverride(mode, pmxPalette),
    },
  };
};
