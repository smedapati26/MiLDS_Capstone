import React from 'react';

import { Card, Divider, Stack, Typography, useTheme } from '@mui/material';

import { AirframeIcon } from '@components/AirframeIcon';

import { IAircraftEquipmentDetailsInfo, IEventDetails } from '@store/griffin_api/aircraft/models';

interface Props {
  aircraft: IAircraftEquipmentDetailsInfo;
  model: string;
  unitShortName: string;
}

const upcomingMaintenance = (events: IEventDetails[] | undefined): string => {
  const value = events
    ?.map((event) => `${event.inspection.inspectionName}: ${event.inspection.hoursInterval} hr`)
    .join(', ');
  return value as string;
};

const CardTypography = ({ title, value }: { title: string; value: string }): React.ReactNode => {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1}>
      <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
        {title}:
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Stack>
  );
};

/**
 * The Card that is shown in the edit page
 * @param {IAircraftEquipmentDetailsInfo} props.aircraft - aircraft details info
 * @param {string} props.model - name of aircraft model
 * @param {string} props.unitShortName - short name of unit it belongs to
 *
 * @return {React.ReactNode}
 */

const SingleEditCard: React.FC<Props> = ({ aircraft, model, unitShortName }: Props): React.ReactNode => {
  return (
    <Card data-testid="aircraft-single-edit-card">
      <Stack direction="column" spacing={4} sx={{ pt: '20px', pb: '20px' }} alignItems="center">
        <AirframeIcon name={model} fontSize="small" width="273px" />
        <Stack direction="column" spacing={1}>
          <Stack direction="row" spacing="20px">
            <CardTypography title="Serial Number" value={aircraft.serial} />
            <Divider orientation="vertical" flexItem sx={{ width: '1px' }} />
            <CardTypography title="Model" value={model} />
            <Divider orientation="vertical" flexItem sx={{ width: '1px' }} />
            <CardTypography title="Unit" value={unitShortName} />
          </Stack>
          <CardTypography title="Upcoming Maintenance" value={upcomingMaintenance(aircraft.events)} />
        </Stack>
      </Stack>
    </Card>
  );
};

export default SingleEditCard;
