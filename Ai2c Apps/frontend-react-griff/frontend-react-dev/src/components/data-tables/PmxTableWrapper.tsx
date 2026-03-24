import * as React from 'react';

import { Box, Stack } from '@mui/material';

/**
 * Props for the PmxTableWrapper component.
 */
interface Props {
  table: React.ReactNode;
  leftControls?: React.ReactNode;
  rightControls?: React.ReactNode;
}

/**
 * PmxTableWrapper component function.
 * @description Layout component for table heading controls
 * @param table - PMX Table area
 * @param leftControls - Controls for table heading left
 * @param rightControls - Controls for table heading right
 */
const PmxTableWrapper: React.FC<Props> = (props: Props) => {
  const { table, leftControls, rightControls } = props;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {/* Table Controls Left */}
        {leftControls && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={2 /** 2X4=8px */}
            sx={{ alignSelf: 'flex-end', marginRight: 'auto' }}
          >
            {leftControls}
          </Stack>
        )}

        {/* Table Controls Right */}
        {rightControls && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={2 /** 2X4=8px */}
            sx={{ alignSelf: 'flex-end', marginLeft: 'auto' }}
          >
            {rightControls}
          </Stack>
        )}
      </Stack>

      {/* PmxTable */}
      {table}
    </Box>
  );
};

export default PmxTableWrapper;
