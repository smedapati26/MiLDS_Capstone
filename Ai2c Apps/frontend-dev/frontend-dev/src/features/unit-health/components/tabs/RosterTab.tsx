import React, { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import InfoIcon from '@mui/icons-material/Info';
import { Box, Grid, IconButton, Tooltip } from '@mui/material';

import PmxDatePicker from '@components/PmxDatePicker';
import { UnitSelect } from '@components/UnitSelect';
import { IUnitRoster, useLazyGetUnitRosterDataQuery } from '@store/amap_ai/unit_health';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppSelector } from '@store/hooks';

import { UnitRosterTable } from '../tables/UnitRoster/UnitRosterTable';

const RosterTab: React.FC = () => {
  const uic = useAppSelector((state) => state.appSettings.currentUic);
  const { data: units } = useGetUnitsQuery({
    role: 'Manager',
  });
  const [unitHealthSelectedUnit, setUnitHealthSelectedUnit] = useState<IUnitBrief | undefined>(undefined);
  const [asOfDate, setAsOfDate] = useState<Dayjs | null>(dayjs());
  const [unitRosterData, setUnitRosterData] = useState<IUnitRoster[]>([]);

  const [getUnitRosterData, { isFetching }] = useLazyGetUnitRosterDataQuery();

  useEffect(() => {
    if (units && units.length > 0) {
      const globalUnit = units.find((unit) => unit.uic === uic);
      if (globalUnit) {
        setUnitHealthSelectedUnit(globalUnit);
      } else {
        setUnitHealthSelectedUnit(units[0]);
      }
    }
  }, [uic, units]);

  useEffect(() => {
    const fetchUnitRosterData = async () => {
      if (unitHealthSelectedUnit && asOfDate) {
        try {
          const selectedRosterData = await getUnitRosterData({
            unit_uic: unitHealthSelectedUnit?.uic,
            as_of_date: asOfDate.format('YYYY-MM-DD'),
          }).unwrap();

          setUnitRosterData(selectedRosterData);
        } catch (error) {
          console.error('Error fetching unit health data:\t', error);
        }
      }
    };

    fetchUnitRosterData();
  }, [unitHealthSelectedUnit, asOfDate, getUnitRosterData]);

  const handleChangeUnitHealthSelectedUnit = (unit: IUnitBrief) => {
    setUnitHealthSelectedUnit(unit);
  };

  return (
    <Box aria-label="Roster Tab">
      <Box sx={{ py: 4 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 4 }} alignItems={'center'}>
            <UnitSelect
              units={units ?? []}
              onChange={handleChangeUnitHealthSelectedUnit}
              value={unitHealthSelectedUnit}
              readOnly={false}
              width="100%"
              label="Unit"
            />
          </Grid>
          <Grid size={{ xs: 6 }} display={'flex'} alignItems={'center'}>
            <PmxDatePicker label="As Of Date" value={asOfDate} onChange={(date: Dayjs | null) => setAsOfDate(date)} />

            <Tooltip
              placement={'top'}
              title={
                'A reporting period month occurs from the 16th of the month before to the 15th of the selected month'
              }
            >
              <IconButton>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>

        <UnitRosterTable unitAvailabilityData={unitRosterData} loading={isFetching} />
      </Box>
    </Box>
  );
};

export default RosterTab;
