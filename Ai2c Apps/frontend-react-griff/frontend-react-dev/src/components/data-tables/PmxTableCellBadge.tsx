import React from 'react';

import { Badge, BadgeOrigin, Stack, SxProps, Typography } from '@mui/material';

/** PmxTableCellBadge Props */
export type Props = {
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  children?: React.ReactNode | string;
  anchorOrigin?: BadgeOrigin;
  sx?: SxProps;
};

/**
 * PmxTableCellBadge Functional Component
 * Displays contend with MUI colored badge dot to left of content
 */
export const PmxTableCellBadge: React.FC<Props> = (props) => {
  const { color, children, anchorOrigin = { vertical: 'top', horizontal: 'left' }, sx } = props;
  return (
    <Stack direction="row" gap={3}>
      <Badge
        data-testid="table-cell-badge"
        color={color}
        badgeContent={''}
        anchorOrigin={anchorOrigin}
        sx={{
          '& .MuiBadge-badge': {
            top: 9,
            left: '-16px',
            minWidth: '12px',
            height: '12px',
          },
          ...sx,
        }}
      >
        {typeof children === 'string' ? <Typography>{children}</Typography> : children}
      </Badge>
    </Stack>
  );
};
