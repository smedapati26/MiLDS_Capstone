import React, { useEffect, useState } from 'react';
import { RouteObject } from 'react-router-dom';

import { Box, Typography } from '@mui/material';

import { TabsLayout } from '@ai2c/pmx-mui';

import { UnitSelect } from '@components/dropdowns/UnitSelect';

import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';
import { useGetUnitsQuery } from '@store/griffin_api/auto_dsr/slices';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

import { useEquipmentManagerContext } from './EquipmentManagerContext';

export interface Props {
  title: string;
  routes?: Array<RouteObject>;
}

/**
 * Wrapper component that will add the unit filtering on top
 * @param props
 * @param {string} props.title - title of page
 * @param {RouteObject[]} props.routes - array of routes
 * @returns jsx.element
 */

const TabsLayoutWrapper: React.FC<Props> = ({ title, routes }: Props) => {
  // const dispatch = useAppDispatch();
  const { filteredUnit, setFilteredUnit, resetFilteredUnit } = useEquipmentManagerContext();
  const globalUic = useAppSelector(selectCurrentUic);
  const [units, setUnits] = useState<IUnitBrief[]>([]);
  const [level, setLevel] = useState<number>(0);
  const { data } = useGetUnitsQuery({ topLevelUic: globalUic });

  useEffect(() => {
    if (data) {
      resetFilteredUnit();
      const filteredData = data.filter((unit) => unit.parentUic !== unit.uic);
      setUnits(filteredData);
      setLevel(filteredData[0].level); // highest level so UnitSelect knows how classify units
    }
  }, [data, resetFilteredUnit, setUnits]);

  const handleUnitSelect = (selection: IUnitBrief) => {
    setFilteredUnit(selection);
  };

  return (
    <TabsLayout title={title} routes={routes}>
      <Box sx={{ mt: 4 }}>
        <Typography variant="body1">See equipment in a unit underneath your global unit.</Typography>
        <Box sx={{ my: 3 }}>
          <UnitSelect
            onChange={handleUnitSelect}
            units={units as IUnitBrief[]}
            value={filteredUnit as IUnitBrief}
            width="329px"
            label="Unit Filter"
            required={false}
            unitLevel={level}
            shortname={true}
            onClear={resetFilteredUnit}
          />
        </Box>
      </Box>
    </TabsLayout>
  );
};

export default TabsLayoutWrapper;
