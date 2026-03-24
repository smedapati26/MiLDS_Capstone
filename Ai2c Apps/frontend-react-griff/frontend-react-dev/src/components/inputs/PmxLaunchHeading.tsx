import { ReactNode } from 'react';

import { Stack, SxProps, Theme, Typography } from '@mui/material';

import { PmxLaunchButton } from './PmxLaunchButton';

/**
 * @typedef Props
 * @prop
 */
export type Props = {
  heading?: string;
  path?: string;
  children?: ReactNode;
  sx?: SxProps<Theme>;
};

/**
 * PmxLaunchHeading Functional Component
 * @param { Props } props
 */
export const PmxLaunchHeading: React.FC<Props> = (props) => {
  const { heading, path, children, sx } = props;
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 3, ...sx }}>
      {heading && <Typography variant="h6">{heading}</Typography>}
      {path && <PmxLaunchButton path={path} />}
      {children}
    </Stack>
  );
};
