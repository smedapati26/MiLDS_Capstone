/* eslint-disable no-case-declarations */
import { PmxPalette as PmxPaletteType } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for Button
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPaletteType) => {
  const isDarkMode = mode === 'dark';

  return {
    styleOverrides: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      root: ({ ownerState }: any) => {
        const commonStyles = {
          borderRadius: '3px',
          color: pmxPalette[mode].text?.contrastText,
          boxShadow: 'none',
          '&.MuiButtonBase-root': {
            '&:hover': {
              boxShadow: 'none',
            },
            '&:active': {
              boxShadow: 'none',
            },
          },
          '& .MuiTouchRipple-child': {
            backgroundColor: isDarkMode ? pmxPalette.dark.primary?.l40 : pmxPalette.light.primary?.d40,
          },
        };

        switch (ownerState.color) {
          case 'primary':
            if (ownerState.variant === 'contained') {
              return {
                ...commonStyles,
                backgroundColor: pmxPalette[mode].primary?.main,
                '&.Mui-disabled': {
                  background: `${pmxPalette[mode].primary?.main}66`,
                  color: `${pmxPalette[mode].text?.contrastText}66`,
                },
                '&:hover': {
                  background: isDarkMode ? pmxPalette.dark.primary?.l20 : pmxPalette.light.primary?.d20,
                },
                '&:active': {
                  background: isDarkMode ? pmxPalette.dark.primary?.l40 : pmxPalette.light.primary?.d40,
                },
              };
            }

            if (ownerState.variant === 'outlined') {
              const outlinedTextColor = isDarkMode ? pmxPalette.dark.primary?.l20 : pmxPalette.light.primary?.d20;
              const outlinedTextColorHover = isDarkMode
                ? `${pmxPalette.dark.primary?.d20}66`
                : `${pmxPalette.light.primary?.l60}66`; // 40% alpha
              const outlinedTextColorDisabled = `${outlinedTextColor}66`; // 40% alpha

              return {
                ...commonStyles,
                borderColor: outlinedTextColor,
                color: outlinedTextColor,
                '&.Mui-disabled': {
                  background: 'transparent',
                  borderColor: outlinedTextColorDisabled,
                  color: outlinedTextColorDisabled,
                },
                '&:hover': {
                  borderColor: outlinedTextColor,
                  background: outlinedTextColorHover,
                },
              };
            }
            break;

          case 'secondary':
            const secondaryTextColor = isDarkMode ? pmxPalette.dark.secondary?.l20 : pmxPalette.light.secondary?.d60;
            const secondaryTextColorHover = isDarkMode
              ? `${pmxPalette.dark.secondary?.d20}66`
              : `${pmxPalette.light.secondary?.l60}66`; // 40% alpha
            const secondaryTextColorDisabled = `${secondaryTextColor}66`; // 40% alpha

            return {
              ...commonStyles,
              border: '1px solid ',
              background: 'transparent',
              borderColor: secondaryTextColor,
              color: secondaryTextColor,
              '&.Mui-disabled': {
                background: 'transparent',
                borderColor: secondaryTextColorDisabled,
                color: secondaryTextColorDisabled,
              },
              '&:hover': {
                borderColor: secondaryTextColor,
                background: secondaryTextColorHover,
              },
              '& .MuiTouchRipple-child': {
                backgroundColor: isDarkMode ? pmxPalette.dark.secondary?.l40 : pmxPalette.light.secondary?.d40,
              },
            };

          case 'error':
            if (ownerState.variant === 'outlined') {
              const errorTextColor = isDarkMode ? pmxPalette.dark.error?.l20 : pmxPalette.light.error?.d60;
              const errorTextColorHover = isDarkMode
                ? `${pmxPalette.dark.error?.d20}66`
                : `${pmxPalette.light.error?.l60}66`; // 40% alpha
              const errorTextColorDisabled = `${errorTextColor}66`; // 40% alpha

              return {
                ...commonStyles,
                border: '1px solid ',
                background: 'transparent',
                borderColor: errorTextColor,
                color: errorTextColor,
                '&.Mui-disabled': {
                  background: 'transparent',
                  borderColor: errorTextColorDisabled,
                  color: errorTextColorDisabled,
                },
                '&:hover': {
                  borderColor: errorTextColor,
                  background: errorTextColorHover,
                },
                '& .MuiTouchRipple-child': {
                  backgroundColor: isDarkMode ? pmxPalette.dark.error?.l40 : pmxPalette.light.error?.d40,
                },
              };
            }

            return {
              color: pmxPalette[mode].text?.contrastText,
              borderColor: pmxPalette[mode].error?.main,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                background: isDarkMode ? pmxPalette.dark.error?.l20 : pmxPalette.light.error?.d20,
              },
              '&:active': {
                boxShadow: 'none',
                background: isDarkMode ? pmxPalette.dark.error?.l40 : pmxPalette.light.error?.d40,
              },
              '&.Mui-disabled': {
                boxShadow: 'none',
                background: `${pmxPalette[mode].error?.main}66`,
                color: `${pmxPalette[mode].text?.contrastText}66`,
              },
            };

          case 'success':
            if (ownerState.variant === 'outlined') {
              const successTextColor = isDarkMode ? pmxPalette.dark.success?.l20 : pmxPalette.light.success?.d60;
              const successTextColorHover = isDarkMode
                ? `${pmxPalette.dark.success?.d20}66`
                : `${pmxPalette.light.success?.l60}66`; // 40% alpha
              const successTextColorDisabled = `${successTextColor}66`; // 40% alpha

              return {
                ...commonStyles,
                border: '1px solid ',
                background: 'transparent',
                borderColor: successTextColor,
                color: successTextColor,
                '&.Mui-disabled': {
                  background: 'transparent',
                  borderColor: successTextColorDisabled,
                  color: successTextColorDisabled,
                },
                '&:hover': {
                  borderColor: successTextColor,
                  background: successTextColorHover,
                },
                '& .MuiTouchRipple-child': {
                  backgroundColor: isDarkMode ? pmxPalette.dark.success?.l40 : pmxPalette.light.success?.d40,
                },
              };
            }

            return {
              color: pmxPalette[mode].text?.contrastText,
              borderColor: pmxPalette[mode].success?.main,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                background: isDarkMode ? pmxPalette.dark.success?.l20 : pmxPalette.light.success?.d20,
              },
              '&:active': {
                boxShadow: 'none',
                background: isDarkMode ? pmxPalette.dark.success?.l40 : pmxPalette.light.success?.d40,
              },
              '&.Mui-disabled': {
                boxShadow: 'none',
                background: `${pmxPalette[mode].success?.main}66`,
                color: `${pmxPalette[mode].text?.contrastText}66`,
              },
            };

          default:
            break;
        }
      },
    },
  };
};
