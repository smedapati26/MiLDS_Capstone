import React, { Fragment } from 'react';

import LegendToggleIcon from '@mui/icons-material/LegendToggle';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { slugify } from '@ai2c/pmx-mui';

import { usePhaseFlowContext } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';
import { BlackHawkPatternsLegend } from '@features/maintenance-schedule/components/PhaseFlow/Visuals/Action/BlackHawkPatterns';
import {
  Legend320,
  Legend640,
} from '@features/maintenance-schedule/components/PhaseFlow/Visuals/Action/ChinookPhasePatten';
import { generateUniqueId } from '@utils/helpers/generateID-map-keys';

import { IAircraftCompany } from '@store/griffin_api/aircraft/models/IAircraft';

interface LegendHoverProps {
  companyInfo: IAircraftCompany[] | undefined;
}

const PatternsLegend: React.FC = (): JSX.Element => {
  const { selectedFamily, chinookPhase } = usePhaseFlowContext();

  switch (selectedFamily[0]) {
    case 'BLACK HAWK':
      return <BlackHawkPatternsLegend />;
    case 'CHINOOK':
      return chinookPhase === '320' ? <Legend320 /> : <Legend640 />;
    default:
      return <></>;
  }
};

const LegendContent = ({ companyInfo }: LegendHoverProps): JSX.Element => {
  const { companyOption } = usePhaseFlowContext();

  return (
    <Fragment>
      <PatternsLegend />
      <Stack direction="column" spacing={2} data-testid="company-hover-legend">
        {companyInfo?.map((item) => {
          const opt = companyOption?.find((o) => o.uic === item.uic);
          return (
            <Stack key={`${slugify(item.shortName)}-${generateUniqueId()}`} direction="row" alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: opt?.color,
                  borderRadius: '50%',
                  mr: 2,
                  ml: 2,
                }}
              />
              <Typography>{item.shortName}</Typography>
            </Stack>
          );
        })}
      </Stack>
    </Fragment>
  );
};

const LegendHover: React.FC<LegendHoverProps> = ({ companyInfo }: LegendHoverProps): JSX.Element => {
  return (
    <Tooltip
      sx={{ mr: 3 }}
      title={<LegendContent companyInfo={companyInfo} />}
      placement="top-start"
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -10],
              },
            },
          ],
        },
      }}
    >
      <IconButton size="large" data-testid="maintenance-schedule-legend-hover">
        <LegendToggleIcon />
      </IconButton>
    </Tooltip>
  );
};

export default LegendHover;
