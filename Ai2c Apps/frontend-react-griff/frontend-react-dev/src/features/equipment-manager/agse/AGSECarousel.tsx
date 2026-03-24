import React from 'react';

import { Skeleton } from '@mui/material';

import PmxCarousel from '@components/PmxCarousel';
import AGSECard from '@features/equipment-manager/agse/components/AGSECard';
import EmptyEquipmentManager from '@features/equipment-manager/components/EmptyEquipmentManager';
import { useEquipmentManagerContext } from '@features/equipment-manager/EquipmentManagerContext';

import { useGetAggregateConditionQuery } from '@store/griffin_api/agse/slices/agseApi';

/**
 * the AGSE overview carousel
 * @returns JSX.Element
 */

const AGSECarousel: React.FC = (): JSX.Element => {
  const { chosenUic } = useEquipmentManagerContext();
  const { data, isLoading } = useGetAggregateConditionQuery(chosenUic, { skip: chosenUic === '' });
  if (isLoading) return <Skeleton variant="rectangular" height={50} data-testid="em-agse-carousel-loading" />;

  if (!data || data?.length === 0) {
    return <EmptyEquipmentManager label="AGSE" />;
  }

  return (
    <PmxCarousel>{data?.map((item, index) => <AGSECard data={item} key={`em-agse-card-${index}`} />)}</PmxCarousel>
  );
};

export default AGSECarousel;
