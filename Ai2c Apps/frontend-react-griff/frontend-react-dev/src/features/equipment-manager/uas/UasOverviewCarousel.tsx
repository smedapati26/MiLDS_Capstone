import React from 'react';

import { Box, Skeleton } from '@mui/material';

import PmxCarousel from '@components/PmxCarousel';
import EmptyEquipmentManager from '@features/equipment-manager/components/EmptyEquipmentManager';
import { useEquipmentManagerContext } from '@features/equipment-manager/EquipmentManagerContext';
import UasPaper, { UasPaperData } from '@features/equipment-manager/uas/components/UasPaper';

import { IUAS } from '@store/griffin_api/uas/models/IUAS';
import { useGetUACQuery, useGetUAVQuery } from '@store/griffin_api/uas/slices';

/**
 * Aggregating data by model
 */
export const aggregateOverviewData = (data: IUAS[] | undefined): { [key: string]: UasPaperData } => {
  if (!data) return {};

  const aggregatedData = data.reduce(
    (acc, curr) => {
      if (!acc[curr.model]) {
        acc[curr.model] = {
          model: curr.model,
          rtl: 0,
          nrtl: 0,
          inPhase: 0,
          total: 0,
          fmc: 0,
          pmc: 0,
          nmc: 0,
          dade: 0,
        };
      }

      switch (curr.status) {
        case 'FMC':
          acc[curr.model].fmc += 1;
          break;
        case 'PMC':
          acc[curr.model].pmc += 1;
          break;
        case 'NMC':
          acc[curr.model].nmc += 1;
          break;
        case 'DADE':
          acc[curr.model].dade += 1;
          break;
      }

      if (curr.rtl === 'RTL') {
        acc[curr.model].rtl += 1;
      } else if (curr.rtl === 'NRTL') {
        acc[curr.model].nrtl += 1;
      }
      acc[curr.model].total += 1;
      return acc;
    },
    {} as { [mode: string]: UasPaperData },
  );

  return aggregatedData;
};

/**
 * Overview carousel for UAS tab
 * @returns react node.
 */
const UasOverviewCarousel: React.FC = (): React.ReactNode => {
  const { chosenUic } = useEquipmentManagerContext();
  const {
    data: uavData,
    isLoading: uavIsLoading,
    isFetching: uavIsFetching,
  } = useGetUAVQuery({ uic: chosenUic }, { skip: chosenUic === '' });
  const {
    data: uacData,
    isLoading: uacIsLoading,
    isFetching: uacIsFetching,
  } = useGetUACQuery({ uic: chosenUic }, { skip: chosenUic === '' });

  const aggUavData = aggregateOverviewData(uavData);
  const aggUacData = aggregateOverviewData(uacData);
  const aggregatedData: { [key: string]: UasPaperData } = { ...aggUavData, ...aggUacData };
  const isLoading = uacIsLoading || uacIsFetching || uavIsLoading || uavIsFetching;

  if (isLoading) {
    return <Skeleton data-testid="em-carousel-loading" variant="rectangular" height={50} />;
  }

  if (!aggregatedData || Object.keys(aggregatedData)?.length === 0) {
    return <EmptyEquipmentManager label="UAS" />;
  }

  return (
    <Box data-testid="em-uas-carousel">
      <PmxCarousel>
        {Object.keys(aggregatedData).map((key, index) => (
          <UasPaper data={aggregatedData[key]} key={`${key}-${index}`} />
        ))}
      </PmxCarousel>
    </Box>
  );
};

export default UasOverviewCarousel;
