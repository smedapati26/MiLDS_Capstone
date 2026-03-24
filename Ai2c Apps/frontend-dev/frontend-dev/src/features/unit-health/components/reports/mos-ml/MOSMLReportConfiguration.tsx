import React, { useEffect, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import { Box, Button, Divider, Grid, styled } from '@mui/material';
import { Typography } from '@mui/material';
import { ToggleButton } from '@mui/material';
import { useTheme } from '@mui/material';

import { Column } from '@components/PmxTable';
import { UnitSelect } from '@components/UnitSelect';
import { MLReportColumns, MOSMLReportColumns, MOSReportColumns } from '@features/unit-health/constants';
import {
  IEventReportSoldier,
  IMOSMLReportData,
  ITaskReportSoldier,
  IUnitMOSMLReport,
} from '@store/amap_ai/unit_health';
import { useLazyGetUnitMOSMLReportQuery } from '@store/amap_ai/unit_health/slices/unitHealthApi';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useAppSelector } from '@store/hooks';

export interface IMOSMLReportConfigurationsProps {
  units: IUnitBrief[] | undefined;
  reportUnit: IUnitBrief | undefined;
  setReportUnit: React.Dispatch<React.SetStateAction<IUnitBrief | undefined>>;
  setFilterValue: React.Dispatch<React.SetStateAction<string>>;
  setReportTitle: React.Dispatch<React.SetStateAction<string>>;
  setReportData: React.Dispatch<
    React.SetStateAction<IUnitMOSMLReport | IEventReportSoldier[] | ITaskReportSoldier[] | undefined>
  >;
  setReportColumns: React.Dispatch<
    React.SetStateAction<Column<IMOSMLReportData>[] | Column<IEventReportSoldier>[] | null>
  >;
}

export const MOSMLReportConfigurations: React.FC<IMOSMLReportConfigurationsProps> = ({
  units,
  reportUnit,
  setReportUnit,
  setFilterValue,
  setReportTitle,
  setReportData,
  setReportColumns,
}) => {
  const theme = useTheme();
  const { reportConfig } = useAppSelector((state) => state.unitHealth);
  const [unitMOSMLViewBy, setUnitMOSMLViewBy] = useState<Array<'mos' | 'ml'>>([]);

  const [getUnitMOSMLReport] = useLazyGetUnitMOSMLReportQuery();

  useEffect(() => {
    if (reportConfig) setUnitMOSMLViewBy(reportConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateMOSMLReport = async () => {
    if (reportUnit) {
      setFilterValue('');

      if (unitMOSMLViewBy.includes('mos') && unitMOSMLViewBy.includes('ml')) {
        setReportTitle('MOS - ML Report');
      } else if (unitMOSMLViewBy.includes('mos')) {
        setReportTitle('MOS Report');
      } else {
        setReportTitle('ML Report');
      }

      try {
        const reportMOSData = await getUnitMOSMLReport({
          unit_uic: reportUnit?.uic,
          mos: unitMOSMLViewBy.includes('mos'),
          ml: unitMOSMLViewBy.includes('ml'),
        }).unwrap();

        setReportData(reportMOSData);

        if (unitMOSMLViewBy.includes('mos') && unitMOSMLViewBy.includes('ml')) {
          setReportColumns(MOSMLReportColumns as Column<IMOSMLReportData>[]);
        } else if (unitMOSMLViewBy.includes('mos')) {
          setReportColumns(MOSReportColumns as Column<IMOSMLReportData>[]);
        } else {
          setReportColumns(MLReportColumns as Column<IMOSMLReportData>[]);
        }
      } catch (error) {
        console.error('Error fetching unit mos/ml data:\t', error);
      }
    }
  };

  const ThemedToggleButton = styled(ToggleButton)({
    textTransform: 'none',
    color: theme.palette.text.primary,
    borderColor: theme.palette.grey.main,
    '&.Mui-selected': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.d60 : '#99C7F5',
      borderColor: theme.palette.primary.main,
    },
  });

  const canGenerateReport = !!reportUnit && (unitMOSMLViewBy.includes('ml') || unitMOSMLViewBy.includes('mos'));

  return (
    <React.Fragment>
      <Grid size={{ xs: 4 }} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ width: '100%', pr: 4 }}>
          <Typography variant="body2" sx={{ pb: 2 }}>
            Unit*
          </Typography>
          <UnitSelect
            units={units ?? []}
            onChange={(unit: IUnitBrief) => setReportUnit(unit)}
            value={reportUnit}
            readOnly={false}
            width="100%"
            label="Unit"
            displayEmpty
          />
        </Box>
        <Divider orientation="vertical" sx={{ mr: -1 }} />
      </Grid>
      <Grid size={{ xs: 4 }} display="flex" flexDirection={'column'}>
        <Typography variant="body2">View By*</Typography>
        <Box sx={{ mt: 'auto' }}>
          <ThemedToggleButton
            aria-label="MOS View By Button"
            value="mos"
            selected={unitMOSMLViewBy.includes('mos')}
            onChange={() =>
              setUnitMOSMLViewBy((prev) =>
                prev.includes('mos') ? prev.filter((viewBy) => viewBy !== 'mos') : [...prev, 'mos'],
              )
            }
            sx={{ mr: 2, borderRadius: 2 }}
          >
            {unitMOSMLViewBy.includes('mos') && (
              <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="unit-checked" />
            )}
            MOS
          </ThemedToggleButton>
          <ThemedToggleButton
            aria-label="ML View By Button"
            value="ml"
            selected={unitMOSMLViewBy.includes('ml')}
            onChange={() =>
              setUnitMOSMLViewBy((prev) =>
                prev.includes('ml') ? prev.filter((viewBy) => viewBy !== 'ml') : [...prev, 'ml'],
              )
            }
            sx={{ borderRadius: 2 }}
          >
            {unitMOSMLViewBy.includes('ml') && (
              <CheckIcon sx={{ width: '20px', height: '20px', mr: 2 }} aria-label="subordinates-checked" />
            )}
            ML
          </ThemedToggleButton>
        </Box>
      </Grid>
      <Grid size={{ xs: 12 }} display={'flex'} justifyContent={'end'}>
        <Button variant="contained" onClick={() => generateMOSMLReport()} disabled={!canGenerateReport}>
          Generate
        </Button>
      </Grid>
    </React.Fragment>
  );
};
