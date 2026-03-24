import { PmxPalette } from '../../models';

/**
 * MUI Style Overrides for MuiAccordion
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  const isDarkMode = mode === 'dark';

  return {
    styleOverrides: {
      root: {
        margin: '12px 2px', // theme.spacing(3) = 12px
        border: `1px solid ${isDarkMode ? pmxPalette.dark.layout.background12 : pmxPalette.light.layout.background8}`,
        borderRadius: '3px',
        boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.25)',
        backgroundColor: isDarkMode ? pmxPalette.dark.layout.background5 : pmxPalette.light.layout.base,
        '&::before': {
          backgroundColor: 'transparent',
        },
        '&.Mui-expanded': {
          margin: '12px 2px', // theme.spacing(3) = 12px
        },
        '& .MuiSvgIcon-root': {
          color: pmxPalette[mode].text?.primary,
          fill: pmxPalette[mode].text?.primary,
        },
        '& .MuiAccordionSummary-root.Mui-expanded': {
          minHeight: '60px',
        },
        '& .MuiAccordionSummary-content.Mui-expanded': {
          marginTop: '12px', // theme.spacing(3) = 12px
          marginBottom: '12px', // theme.spacing(3) = 12px
        },
      },
    },
  };
};
