import React from 'react';

import { SvgIcon, useTheme } from '@mui/material';

import { IconProps } from '../models/IconProps';

/**
 * Diagonal Icon
 *
 * @param { IconProps } props
 */
export const DiagonalIcon: React.FC<IconProps> = (props) => {
  const theme = useTheme();
  const { size, height = '25', width = '25', fill = theme.palette.text.primary, sx } = props;

  return (
    <SvgIcon
      sx={{
        ...sx,
        height: size || height,
        width: size || width,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={size || height}
        viewBox="0 -960 960 960"
        width={size || width}
        fill={fill}
      >
        <path d="m268-212-56-56q-12-12-12-28.5t12-28.5l423-423q12-12 28.5-12t28.5 12l56 56q12 12 12 28.5T748-635L324-212q-11 11-28 11t-28-11Z" />
      </svg>
    </SvgIcon>
  );
};
