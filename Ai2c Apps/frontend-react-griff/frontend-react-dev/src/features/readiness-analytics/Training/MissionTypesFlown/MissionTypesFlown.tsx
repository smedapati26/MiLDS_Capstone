import React, { useCallback, useEffect, useState } from 'react';

import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

import PmxAccordionItemTemplate from '@components/PmxAccordionItemTemplate';

import { IMissionsFlownDetailDataSet, IMissionsFlownSummaryDataSet } from '@store/griffin_api/readiness/models';
import { MissionTypesEnum } from '@store/griffin_api/readiness/models/MissionTypeEnum';
import { useLazyGetMissionsFlownDetailQuery } from '@store/griffin_api/readiness/slices';

import MissionFlownTable from './MissionTypesFlownTable';

const MissionTypesFlown: React.FC<{
  data?: IMissionsFlownSummaryDataSet[];
  uic: string;
  start_date: string;
  end_date: string;
  validDateRange: boolean;
}> = ({ data, uic, start_date, end_date, validDateRange }) => {
  // Initialize lazy query for fetching mission details
  const [fetchMissionDetails] = useLazyGetMissionsFlownDetailQuery();
  // State to store fetched mission details
  const [fetchedMissionDetails, setFetchedMissionDetails] = useState<{ [key: string]: MissionDetails }>({});
  // State to manage the current view (missions or hours)
  const [view, setView] = useState<'missions' | 'hours'>('missions');
  // State to store totals for each mission type
  const [totals, setTotals] = useState<{ [key: string]: number }>({});
  // State to store the grand total of missions or hours
  const [grandTotal, setGrandTotal] = useState<number>(0);

  // Interface for mission details
  interface MissionDetails {
    label: MissionTypesEnum;
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
    data: IMissionsFlownDetailDataSet[];
  }

  // Function to fetch mission details
  const getMissionDetails = (mission_type: string) => {
    const currMissionDetails = fetchedMissionDetails[mission_type];
    let updatedMissionDetails = {
      ...currMissionDetails,
      label: MissionTypesEnum[mission_type as keyof typeof MissionTypesEnum],
      refetch: () => getMissionDetails(mission_type),
      isFetching: true,
      isError: false,
    };

    setFetchedMissionDetails((prev) => ({
      ...prev,
      [mission_type]: updatedMissionDetails,
    }));

    fetchMissionDetails({ uic, start_date, end_date, mission_type }).then((result) => {
      if (result.error) {
        updatedMissionDetails = {
          ...updatedMissionDetails,
          isFetching: false,
          isError: true,
        };
      } else if (result.data) {
        updatedMissionDetails = {
          ...updatedMissionDetails,
          isFetching: false,
          isError: false,
          data: result.data,
        };
      }

      setFetchedMissionDetails((prev) => ({
        ...prev,
        [mission_type]: updatedMissionDetails,
      }));
    });
  };

  // Handle accordion change to fetch mission details if not already fetched
  const handleAccordionChange = (missionType: string) => {
    if (!fetchedMissionDetails[missionType] && validDateRange) {
      getMissionDetails(missionType);
    }
  };

  // Calculate total missions or hours based on the current view
  const getTotal = useCallback(
    (item: IMissionsFlownSummaryDataSet) => {
      const itemCount = view === 'missions' ? item.amount_flown : item.hours_flown;

      return itemCount;
    },
    [view],
  );

  // Update totals and grand total when data or view changes
  useEffect(() => {
    if (data) {
      const newTotals: { [key: string]: number } = {};
      let newGrandTotal = 0;

      data.forEach((item) => {
        const missionType = item.mission_type;
        const total = getTotal(item);

        if (!newTotals[missionType]) {
          newTotals[missionType] = 0;
        }

        newTotals[missionType] += total;
        newGrandTotal += total;
      });

      setTotals(newTotals);
      setGrandTotal(newGrandTotal);
    }
  }, [data, view, getTotal]);

  return (
    <Box id="stat-card">
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={(_, newView) => {
          if (newView !== null) {
            setView(newView);
          }
        }}
        fullWidth
      >
        <ToggleButton sx={{ padding: '8px 0', lineHeight: 'normal' }} value="missions">
          Amount Flown
        </ToggleButton>
        <ToggleButton sx={{ padding: '8px 0', lineHeight: 'normal' }} value="hours">
          Hours Flown
        </ToggleButton>
      </ToggleButtonGroup>

      <Typography my={4}>
        {grandTotal} {view} flown
      </Typography>

      <Stack direction="column" gap={3}>
        {data?.map((missions) => {
          const missionData = fetchedMissionDetails[missions.mission_type] || {
            label: MissionTypesEnum[missions.mission_type as keyof typeof MissionTypesEnum],
            isFetching: false,
            isError: false,
            refetch: () => getMissionDetails(missions.mission_type),
            data: [] as IMissionsFlownDetailDataSet[],
          };

          return (
            <PmxAccordionItemTemplate
              key={missions.mission_type}
              title={missionData.label}
              total={totals[missions.mission_type] || 0}
              isFetching={missionData.isFetching}
              isError={missionData.isError}
              onAccordionChange={() => handleAccordionChange(missions.mission_type)}
              refetch={missionData.refetch}
            >
              {<MissionFlownTable data={missionData.data} />}
            </PmxAccordionItemTemplate>
          );
        })}
      </Stack>
    </Box>
  );
};

export default MissionTypesFlown;
