import React, { useMemo, useState } from 'react';

import { Stack, Typography } from '@mui/material';

import PmxCarousel from '@components/PmxCarousel';
import PmxMultiSelect from '@components/PmxMultiSelect';
import BarCard from '@features/flight-hour-program/overview/components/BarCard';
import SummaryBarChart from '@features/flight-hour-program/overview/SummaryBarChart';

import { IFhpModelsProgress, IFhpProgress } from '@store/griffin_api/fhp/models';

interface Props {
  data: IFhpProgress;
  height: number;
}

/**
 * The carousel that is shown with Model is selected in flight summary
 * @param {Props} props the component props
 * @param {IFhpModelsProgress[]} props.data the model data for user to select
 * @param {number} props.height height for the chart to render
 * @returns
 */

const FlightSummaryModelCarousel: React.FC<Props> = ({ data, height }: Props): React.ReactNode => {
  const modelList = useMemo(() => data.models.map((item) => item.model), [data]);
  const [models] = useState<string[]>(modelList);
  const [selectedModels, setSelectedModels] = useState<string[]>(modelList);

  const onModelSelect = (newValues: string[]) => {
    setSelectedModels(newValues);
  };

  const filteredData = data.models.filter((item) => selectedModels.includes(item.model));
  return (
    <Stack direction="column" data-testid="fhp-summary-model-carousel" spacing={4}>
      <PmxMultiSelect label="Models" onChange={onModelSelect} values={selectedModels} options={models} />
      {selectedModels.length > 0 ? (
        filteredData && (
          <PmxCarousel maxVisible={2}>
            {filteredData.map((item: IFhpModelsProgress, index) => {
              const chartData: IFhpProgress = {
                unit: item.dates,
                models: [item],
              };

              return (
                <SummaryBarChart
                  hasSwitch={false}
                  title={item.model}
                  key={`${index}-${item.model}`}
                  data={chartData}
                  height={height}
                  condensed={true}
                  showModels={true}
                  isCarousel={filteredData.length > 2}
                />
              );
            })}
          </PmxCarousel>
        )
      ) : (
        <BarCard>
          <Typography variant="body1">No models selected</Typography>
        </BarCard>
      )}
    </Stack>
  );
};

export default FlightSummaryModelCarousel;
