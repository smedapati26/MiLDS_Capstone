import React from 'react';

import { Stack, Typography, useTheme } from '@mui/material';

import { IAircraftModification } from '@store/griffin_api/aircraft/models';

interface Props {
  serial: string;
  mods?: IAircraftModification[] | undefined;
}

const TextArea: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}): React.ReactNode => {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography variant="body3" sx={{ color: theme.palette.text.secondary }}>
        {label}:
      </Typography>
      <Typography variant="body3">{value}</Typography>
    </Stack>
  );
};

/**
 * Tooltip for aircraft modification in details table
 * @param param0
 * @returns
 */

const ModsTooltip: React.FC<Props> = ({ serial, mods }: Props): React.ReactNode => {
  return (
    <Stack direction="column" spacing={2} sx={{ p: 3 }}>
      <Typography variant="body4">{`${serial} Modification & Kits`}</Typography>
      {mods?.map((mod, index) => <TextArea key={`${mod.modType}-${index}`} label={mod.modType} value={mod.value} />)}
    </Stack>
  );
};

export default ModsTooltip;
