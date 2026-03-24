import React, { useMemo, useState } from 'react';

import { Box } from '@mui/material';

import PmxCarousel from '@components/PmxCarousel';
import { TransFormedMod } from '@features/equipment-manager/aircraft/AircraftModsKits';
import ModCard from '@features/equipment-manager/aircraft/components/ModCard';
import { useEquipmentManagerContext } from '@features/equipment-manager/EquipmentManagerContext';
import ModsDetailsModal from '@features/equipment-manager/mods/ModsDetailsModal';

import { IModification } from '@store/griffin_api/mods/models';
import { useGetModificationsByUicQuery } from '@store/griffin_api/mods/slices';

interface Props {
  data: Record<string, TransFormedMod>;
  handleFilter: () => void;
}

/**
 * Mods Carousel component
 * @param {Props} props - component props
 * @param {string} props.data - Mods data to show
 * @param {number} props.count - number of assigned mods
 * @param {string[]} props.serials - list of aircraft with mod
 * @param {() => void} props.handleFilter handle the filtering of data
 * @returns
 */

const ModsCarousel: React.FC<Props> = (props: Props): React.ReactNode => {
  const { handleFilter, data } = props;
  const { chosenUic } = useEquipmentManagerContext();
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [modelType, setModelType] = useState<string>('');
  const {
    data: detailsData,
    isLoading: detailsLoading,
    isFetching: detailsFetching,
  } = useGetModificationsByUicQuery(chosenUic, { skip: chosenUic === '' });

  const handleDetailsClick = (value: string): void => {
    handleFilter();
    setModelType(value);
    setDetailsOpen(true);
  };

  const filteredData: IModification[] | undefined = useMemo(() => {
    if (!detailsData || detailsData.length === 0) {
      return detailsData;
    }

    return detailsData.filter((mod: IModification) => mod.model === modelType);
  }, [detailsData, modelType]);

  return (
    <Box data-testid="mods-carousel">
      <PmxCarousel>
        {Object.entries(data).map(([mod, item]) => (
          <ModCard
            title={mod}
            count={item.total}
            key={`mod-${mod}-${item.total}`}
            isSelected={item.isSelected}
            onClick={handleDetailsClick}
          />
        ))}
      </PmxCarousel>
      <ModsDetailsModal
        open={detailsOpen}
        setOpen={setDetailsOpen}
        model={modelType}
        data={filteredData}
        isLoading={detailsLoading || detailsFetching}
      />
    </Box>
  );
};

export default ModsCarousel;
