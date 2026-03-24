import React, { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import { Box, Stack, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

import { useAppSelector } from '@store/hooks';

import CrewExperience from './Accordions/CrewExperience/CrewExperience';
import CrewStrength from './Accordions/CrewStrength/CrewStrength';
import MaintainerExperience from './Accordions/MaintainerExperience/MaintainerExperience';
import MaintainerStrength from './Accordions/MaintainerStrength/MaintainerStrength';
import AirframeCrewStat from './StatCards/AirframeCrewStat';
import MaintainerStrengthStat from './StatCards/MaintainerStrengthStat';

const PersonnelTab: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Dayjs | null>(dayjs());
  const isLoading = true;
  const uic = useAppSelector((state) => state.appSettings.currentUic);

  return (
    <Box id="readiness-analytics-personnel-tab">
      <Box component="section" id="personnel-tab-heading">
        <Typography variant="body1" sx={{ mb: 4 }}>
          Viewing today&apos;s personnel analytics for {uic}.
        </Typography>
        <DatePicker
          label="Current Date"
          value={currentDate}
          onChange={(newValue) => setCurrentDate(newValue)}
          sx={{ width: '176px' }}
        />
      </Box>
      <Stack id="personal-tab-stat-cards" direction="row" component="section" gap={3} sx={{ mt: 4 }}>
        <MaintainerStrengthStat isLoading={isLoading} />
        <AirframeCrewStat
          isLoading={isLoading}
          title="Apaches"
          rate={40}
          rateChange={-12}
          authorizedCrew={36}
          totalCrew={100}
        />
        <AirframeCrewStat
          isLoading={isLoading}
          title="Blackhawks"
          rate={40}
          rateChange={-12}
          authorizedCrew={36}
          totalCrew={100}
        />
        <AirframeCrewStat
          isLoading={isLoading}
          title="Chinooks"
          rate={40}
          rateChange={-12}
          authorizedCrew={36}
          totalCrew={100}
        />
        <AirframeCrewStat
          isLoading={isLoading}
          title="Lakotas"
          rate={40}
          rateChange={-12}
          authorizedCrew={36}
          totalCrew={100}
        />
      </Stack>
      <Stack id="personnel-tab-accordions" component="section" gap={4} sx={{ mt: 4 }}>
        <MaintainerExperience />
        <MaintainerStrength />
        <CrewExperience />
        <CrewStrength />
      </Stack>
    </Box>
  );
};

export default PersonnelTab;
