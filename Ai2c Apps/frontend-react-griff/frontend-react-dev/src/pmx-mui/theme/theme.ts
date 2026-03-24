import { PaletteMode, ThemeOptions } from '@mui/material/';
import { TypographyOptions } from '@mui/material/styles/createTypography';

import MuiAccordionOverride from './overrides/MuiAccordionOverride';
import MuiAlertOverride from './overrides/MuiAlertOverride';
import MuiAppBarOverride from './overrides/MuiAppBarOverride';
import MuiAvatarOverride from './overrides/MuiAvatarOverride';
import MuiBadgeOverride from './overrides/MuiBadgeOverride';
import MuiButtonGroupOverride from './overrides/MuiButtonGroupOverride';
import MuiButtonOverride from './overrides/MuiButtonOverride';
import MuiCardOverride from './overrides/MuiCardOverride';
import MuiCheckboxRadioOverride from './overrides/MuiCheckboxRadioOverride';
import MuiCircularProgressOverride from './overrides/MuiCircularProgressOverride';
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
    typography: typography as TypographyOptions,
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
      MuiCircularProgress: MuiCircularProgressOverride,
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
