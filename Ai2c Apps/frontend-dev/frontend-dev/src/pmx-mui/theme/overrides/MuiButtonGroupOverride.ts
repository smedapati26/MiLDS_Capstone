import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiButtonGroup
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  const isDarkMode = mode === 'dark';
  const textColor = pmxPalette[mode].text?.primary;
  const textColor60percent = `${textColor}99`; // 60% alpha

  return {
    styleOverrides: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      root: ({ ownerState }: any) => {
        const commonStyles = {
          borderRadius: '3px',
          color: textColor,
          boxShadow: 'none',
        };

        if (ownerState.variant === 'outlined') {
          return {
            ...commonStyles,
            '& .MuiButtonBase-root': {
              color: isDarkMode ? textColor : textColor60percent,
              border: '1px solid',
              borderColor: isDarkMode ? textColor : pmxPalette.light.grey?.main,
              '&:hover': {
                color: isDarkMode ? textColor : textColor60percent,
                borderColor: isDarkMode ? textColor : textColor60percent,
                backgroundColor: `${pmxPalette.light.grey?.main}66`, // 40% alpha
              },
              '&:active': {
                color: isDarkMode ? textColor : textColor60percent,
                borderColor: isDarkMode ? textColor : textColor60percent,
                backgroundColor: `${pmxPalette.light.grey?.main}99`, // 60% alpha
              },
              '& .MuiTouchRipple-child': {
                backgroundColor: `${pmxPalette.light.grey?.main}99`, // 60% alpha
              },
            },
          };
        }

        return commonStyles;
      },
    },
  };
};
