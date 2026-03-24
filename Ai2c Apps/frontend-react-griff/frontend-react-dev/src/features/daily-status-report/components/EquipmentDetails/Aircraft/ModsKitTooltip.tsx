import { useMemo } from 'react';

import { Stack, Typography } from '@mui/material';

import { PmxClickableTooltip } from '@components/data-tables';

import { IMod } from '@store/griffin_api/auto_dsr/models';

/**
 * @typedef Props
 * @prop
 */
export type Props = {
  mods: Array<IMod>;
};

/**
 * ModsKitTooltip Functional Component
 *
 * @param { Props } props
 */
export const ModsKitTooltip: React.FC<Props> = (props) => {
  const { mods } = props;
  const equippedMods = useMemo(() => mods, [mods]);
  const totalModsCount = useMemo(() => equippedMods.length, [equippedMods]);

  return (
    <PmxClickableTooltip
      value={totalModsCount}
      title={
        <>
          <Typography>Modifications &amp; Kits</Typography>
          <Stack>
            {equippedMods.map((mod, index) => {
              return (
                <Stack key={`${mod.modType}-${index}`} direction="row" gap={2}>
                  <Typography variant="body3" sx={{ color: 'text.secondary' }}>
                    {mod.modType} :
                  </Typography>
                  <Typography variant="body3">{mod.value}</Typography>
                </Stack>
              );
            })}
          </Stack>
        </>
      }
    />
  );
};
