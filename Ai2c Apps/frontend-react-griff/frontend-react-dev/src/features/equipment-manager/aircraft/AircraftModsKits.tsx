import React, { useMemo } from 'react';

import { Box } from '@mui/material';

import KitsCarousel from '@features/equipment-manager/aircraft/components/KitsCarousel';
import ModsCarousel from '@features/equipment-manager/aircraft/components/ModsCarousel';
import { modsKitsToggle } from '@features/equipment-manager/components/EquipmentManagerModKits';

import { IMods } from '@store/griffin_api/mods/models';

export interface TransFormedMod {
  total: number;
  serials: string[];
  isSelected: boolean;
}

interface Props {
  data: IMods[] | undefined;
  setSerialFilter: React.Dispatch<React.SetStateAction<string[]>>;
  mkToggle?: modsKitsToggle;
}

/**
 * renders the carousel of the aircraft cards, filters the data, and does the
 * @param {Props} props component props
 * @param {modsKitsToggle} props.mkToggle toggle button choice between Modifications and Kits
 * @param {(value: string) => void} props.handleFilter - function that handles filtering when clicked
 * @returns
 */

const AircraftModsKits: React.FC<Props> = (props: Props): React.ReactNode => {
  const { data, setSerialFilter, mkToggle } = props;

  // transform the data so I can get a count with the serials to filter by
  const transformedData: Record<string, TransFormedMod> = useMemo(() => {
    if (!data) return {};
    return data.reduce<Record<string, TransFormedMod>>((acc, item) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'serialNumber') {
          if (key in acc) {
            if (item[key].trim() !== '') {
              acc[key].total += 1;
              acc[key].serials.push(item.serialNumber);
            }
          } else {
            acc[key] = {
              total: item[key].trim() !== '' ? 1 : 0,
              serials: item[key].trim() !== '' ? [item.serialNumber] : [],
              isSelected: false,
            };
          }
        }
      });
      return acc;
    }, {});
  }, [data]);

  const handleFilter = () => {
    Object.keys(transformedData).forEach((key) => {
      if (transformedData[key].isSelected) {
        setSerialFilter(transformedData[key].serials);
      }
    });
  };

  return (
    <Box data-testid="em-aircraft-mods-kits-carousel">
      {mkToggle === 'kits' ? <KitsCarousel /> : <ModsCarousel data={transformedData} handleFilter={handleFilter} />}
    </Box>
  );
};

export default AircraftModsKits;
