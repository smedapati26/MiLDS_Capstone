import React from 'react';

import { Box, Skeleton } from '@mui/material';

import PmxCarousel from '@components/PmxCarousel';
import AircraftPaper from '@features/equipment-manager/aircraft/components/AircraftPaper';
import EmptyEquipmentManager from '@features/equipment-manager/components/EmptyEquipmentManager';
import { useEquipmentManagerContext } from '@features/equipment-manager/EquipmentManagerContext';

import { useGetAircraftModelStatusQuery } from '@store/griffin_api/equipment/slices/equipmentApi';

/**
 * The Aircraft information carousel for equipment manager page
 * @returns JSX element
 */

const AircraftOverviewCarousel: React.FC = (): JSX.Element => {
  const { chosenUic } = useEquipmentManagerContext();
  const { data, isLoading, isFetching } = useGetAircraftModelStatusQuery(chosenUic, { skip: chosenUic === '' });

  if (isLoading || isFetching) {
    return <Skeleton data-testid="em-carousel-loading" variant="rectangular" height={50} />;
  }

  if (!data || data?.length === 0) {
    return <EmptyEquipmentManager />;
  }

  return (
    <Box data-testid="em-aircraft-carousel">
      <PmxCarousel>
        {data.map((item, index) => (
          <AircraftPaper key={`em-aircraft-status-${index}`} item={item} />
        ))}
      </PmxCarousel>
    </Box>
  );
};

export default AircraftOverviewCarousel;
