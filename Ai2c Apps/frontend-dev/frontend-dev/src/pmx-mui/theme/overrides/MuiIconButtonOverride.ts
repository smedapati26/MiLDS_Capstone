import { PmxPalette } from '../../models/PmxPalette';

/**
 * MUI Style Overrides for MuiIconButton
 */
export default (mode: keyof typeof pmxPalette, pmxPalette: PmxPalette) => {
  return {
    styleOverrides: {
      sizeSmall: {
        height: '25px',
        width: '25px',
        fontSize: '15px',
        '& .MuiSvgIcon-root': {
          fontSize: '15px',
        },
      },
      sizeMedium: {
        height: '30px',
        width: '30px',
        fontSize: '20px',
        '& .MuiSvgIcon-root': {
          fontSize: '20px',
        },
      },
      sizeLarge: {
        height: '35px',
        width: '35px',
        fontSize: '25px',
        '& .MuiSvgIcon-root': {
          fontSize: '25px',
        },
      },
      root: {
        color: pmxPalette[mode].text?.primary,
        '&:hover': {
          backgroundColor: `${pmxPalette[mode].grey?.main}66`, // grayscale.main @40%
        },
        '&:active': {
          backgroundColor: `${pmxPalette[mode].grey?.main}99`, // grayscale.main @60%
        },
        '&:disabled': {
          color: mode === 'dark' ? `${pmxPalette[mode].grey?.white}66` : `${pmxPalette[mode].grey?.d80}66`, // grayscale.d80 @40%
        },
      },
    },
  };
};
