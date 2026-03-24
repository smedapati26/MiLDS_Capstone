import { useContext, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { ScatterData } from 'plotly.js';

import { Box, Typography } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';

import MultiSelectDropDown from '@components/dropdowns/MultiSelectDropDown';

import { useGetHoursFlownUnitsQuery } from '@store/griffin_api/readiness/slices';

import PlotGraphTemplate from '../../../../components/PlotGraphTemplate';
import { ParamsContext } from './HoursFlownContext';

const HoursFlownUnitGraph = () => {
  const { uic, start_date, end_date, validDateRange, similarUnits, units, setUnits } = useContext(ParamsContext);
  // use this as the parameter to send to the backend as similar_uics
  const [similar_uics, setSimilar_uics] = useState<string[]>([]);

  // make call to get hours flown data to populate the graph
  const { data, isFetching: isLoading } = useGetHoursFlownUnitsQuery(
    { uic, start_date, end_date, similar_uics },
    { skip: !validDateRange },
  );

  // use this to handle the user selection from the drop down
  const handleSelectionChange = (selectedValues: string[]) => {
    setSimilar_uics(selectedValues);
    setUnits(selectedValues);
  };

  const plotData = useMemo<Partial<ScatterData>[]>(() => {
    if (!data?.length) return [];
    return data.map((entries) => ({
      mode: 'lines+markers',
      name: entries.uic,
      type: 'scatter',
      line: {
        dash: entries.uic !== uic ? 'dashdot' : 'solid',
      },
      x: entries.hours_detail.map((entry) => dayjs(entry.reporting_month).format('DDMMMYY').toUpperCase()),
      y: entries.hours_detail.map((entry) => entry.hours_flown),
    }));
  }, [data, uic]);

  return (
    <>
      <Typography mt={5} mb={5}>
        Choose similar units to compare your unit&apos;s flight hours to.
      </Typography>

      <Box mb={5}>
        <MultiSelectDropDown
          isLoading={isLoading}
          value={units}
          options={similarUnits}
          onSelectionChange={handleSelectionChange}
          menuItemHeight={48}
          visibleItems={7}
          width="275px"
          label={'Compare Units'}
          size="small"
        />
      </Box>
      {isLoading ? (
        <Skeleton variant="rectangular" width={'100%'} height={630} animation="wave" />
      ) : (
        <PlotGraphTemplate yLabel="Flight Hours" height={630} plotData={plotData} />
      )}
    </>
  );
};

export default HoursFlownUnitGraph;
