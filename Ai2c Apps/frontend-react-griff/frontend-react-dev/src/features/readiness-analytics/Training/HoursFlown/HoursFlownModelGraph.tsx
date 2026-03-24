import { useContext, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { ScatterData } from 'plotly.js';

import { Box, Typography } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';

import MultiSelectDropDown from '@components/dropdowns/MultiSelectDropDown';

import { useGetHoursFlownModelsQuery } from '@store/griffin_api/readiness/slices';

import PlotGraphTemplate from '../../../../components/PlotGraphTemplate';
import { ParamsContext } from './HoursFlownContext';

const HoursFlownModelGraph = () => {
  const { uic, start_date, end_date, validDateRange, models, setModels } = useContext(ParamsContext);

  const [options, setOptions] = useState({});
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // make call to get hours flown data to populate the graph
  const { data, isFetching: isLoading } = useGetHoursFlownModelsQuery(
    { uic, start_date, end_date },
    { skip: !validDateRange },
  );

  // get list of models for dropdown based on whats returned from hoursFlownData when the user select the model filter
  useEffect(() => {
    if (data) {
      const options = data.reduce(
        (acc, item) => ({ ...acc, [item.model]: { label: item.model, value: item.model } }),
        {},
      );
      setOptions(options);
      setSelectedValues(models || Object.keys(options));
    }
  }, [data, models, setModels]);

  const filteredData = useMemo(() => {
    return data ? data.filter((entry) => selectedValues.includes(entry.model)) : data;
  }, [data, selectedValues]);

  // use this to handle the user selection from the drop down
  const handleSelectionChange = (selectedValues: string[]) => {
    setSelectedValues(selectedValues);
    setModels(selectedValues);
  };

  const plotData = useMemo<Partial<ScatterData>[]>(() => {
    if (!filteredData?.length) return [];
    return filteredData.map((entries) => ({
      mode: 'lines+markers',
      name: entries.model,
      type: 'scatter',
      x: entries.hours_detail.map((entry) => dayjs(entry.reporting_month).format('DDMMMYY').toUpperCase()),
      y: entries.hours_detail.map((entry) => entry.hours_flown),
    }));
  }, [filteredData]);

  return (
    <>
      <Typography mt={5} mb={5}>
        Choose the models you want to view.
      </Typography>

      <Box mb={5}>
        <MultiSelectDropDown
          isLoading={isLoading}
          options={options}
          value={selectedValues}
          onSelectionChange={handleSelectionChange}
          menuItemHeight={48}
          visibleItems={7}
          width="275px"
          label={'Models'}
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

export default HoursFlownModelGraph;
