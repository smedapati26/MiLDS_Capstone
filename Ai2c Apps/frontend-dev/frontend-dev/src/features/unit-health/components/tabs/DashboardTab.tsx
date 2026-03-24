import React, { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import PmxDatePicker from '@components/PmxDatePicker';
import { UnitSelect } from '@components/UnitSelect';
import { setSelectedHealthUnit } from '@features/unit-health/slices/unitHealthSlice';
import { IUnitHealthData, useLazyGetUnitHealthDataQuery } from '@store/amap_ai/unit_health';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks';

import SubordinateUnitDetailsSection from '../dashboard/SubordinateUnitDetailsSection';
import SubordinateUnitsSummarySection from '../dashboard/SubordinateUnitsSummarySection';
import UnitSummarySection from '../dashboard/UnitSummarySection';

const DashboardTab: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { unitHealthSelectedUnit } = useAppSelector((state) => state.unitHealth);
  const uic = useAppSelector((state) => state.appSettings.currentUic);
  const { data: units } = useGetUnitsQuery({
    role: 'Any',
  });
  const [unitHealthData, setUnitHealthData] = useState<IUnitHealthData | null>(null);
  const [asOfDate, setAsOfDate] = useState<Dayjs | null>(dayjs());
  const [unitTraversal, setUnitTraversal] = useState<string[]>([]);

  const [getUnitHealthData, { isFetching: loading }] = useLazyGetUnitHealthDataQuery();

  useEffect(() => {
    if (unitHealthSelectedUnit) return;
    if (units && units.length > 0) {
      const globalUnit = units.find((unit) => unit.uic === uic);
      if (globalUnit) {
        dispatch(setSelectedHealthUnit(globalUnit));
        setUnitTraversal([globalUnit.shortName]);
      } else {
        dispatch(setSelectedHealthUnit(units[0]));
        setUnitTraversal([units[0].shortName]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uic, units]);

  useEffect(() => {
    const fetchUnitAndSubordianteUnitHealthData = async () => {
      if (unitHealthSelectedUnit && asOfDate) {
        try {
          const selectedHealthData = await getUnitHealthData({
            unit_uic: unitHealthSelectedUnit?.uic,
            as_of_date: asOfDate.format('YYYY-MM-DD'),
          }).unwrap();

          setUnitHealthData(selectedHealthData);
        } catch (error) {
          console.error('Error fetching unit health data:\t', error);
        }
      }
    };

    fetchUnitAndSubordianteUnitHealthData();
  }, [unitHealthSelectedUnit, asOfDate, getUnitHealthData]);

  const handleChangeUnitHealthSelectedUnit = (unit: IUnitBrief) => {
    setUnitTraversal([unit.shortName]);
    dispatch(setSelectedHealthUnit(unit));
  };

  const childUnits =
    units?.filter((unit) =>
      unitHealthData?.unitsAvailability.some(
        (healthUnit) => healthUnit.unitUic === unit.uic && healthUnit.unitUic !== unitHealthSelectedUnit?.uic,
      ),
    ) ?? [];

  const suborinateUnitHealthData: IUnitHealthData = {
    unitEchelon: unitHealthData?.unitEchelon ?? 'Unknown',
    unitsAvailability:
      unitHealthData?.unitsAvailability.filter((avail) => avail.unitUic !== unitHealthSelectedUnit?.uic) ?? [],
    unitsEvals:
      unitHealthData?.unitsEvals.filter((evaluation) => evaluation.unitUic !== unitHealthSelectedUnit?.uic) ?? [],
    unitsMosBreakdowns:
      unitHealthData?.unitsMosBreakdowns.filter((mos) => mos.unitUic !== unitHealthSelectedUnit?.uic) ?? [],
  };

  return (
    <Box aria-label="Dashboard Tab">
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
          </Grid>
        </Grid>
      </Box>

      <Box display="flex" aria-label="Unit Traversal">
        {unitTraversal.map((unitShortName, index) => (
          <Typography
            key={unitShortName}
            variant="body1"
            sx={{
              pb: 2,
              pr: 1,
              color: index === unitTraversal.length - 1 ? theme.palette.text.primary : theme.palette.text.secondary,
            }}
          >
            {unitShortName} {index !== unitTraversal.length - 1 && '/ '}
          </Typography>
        ))}
      </Box>

      <UnitSummarySection
        selectedUnit={unitHealthSelectedUnit}
        asOfDate={asOfDate ?? dayjs()}
        unitHealthData={unitHealthData}
        loading={loading}
      />

      <SubordinateUnitsSummarySection
        selectedUnit={unitHealthSelectedUnit}
        unitHealthData={suborinateUnitHealthData}
        loading={loading}
      />

      <SubordinateUnitDetailsSection
        childUnits={childUnits}
        asOfDate={asOfDate ?? dayjs()}
        setSelectedUnit={(unit) => dispatch(setSelectedHealthUnit(unit as IUnitBrief))}
        setUnitTraversal={setUnitTraversal}
        loading={loading}
      />
    </Box>
  );
};

export default DashboardTab;
