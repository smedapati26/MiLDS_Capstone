import { useMemo, useState } from 'react';

import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import { useGetSimilarUnitsQuery } from '@store/griffin_api/auto_dsr/slices';
import { useAppSelector } from '@store/hooks';

import { ParamsContext } from './HoursFlownContext';
import HoursFlownModelGraph from './HoursFlownModelGraph';
import HoursFlownSubordinateGraph from './HoursFlownSubordinatesGraph';
import HoursFlownUnitGraph from './HoursFlownUnitGraph';

export enum ViewTypeEnum {
  Unit = 'UNIT',
  Subordinates = 'SUBORDINATES',
  Model = 'MODEL',
}

interface HoursFlownData {
  uic: string;
  start_date: string;
  end_date: string;
  validDateRange: boolean;
}

const HoursFlown = (props: HoursFlownData) => {
  const [units, setUnits] = useState<string[] | undefined>();
  const [models, setModels] = useState<string[] | undefined>();
  const [subordinates, setSubordinates] = useState<string[] | undefined>();
  // use this grab the similar units from the users UIC
  const { data: sUnits, isLoading: isLoadingSUnits } = useGetSimilarUnitsQuery({ uic: props.uic });
  // use this to grab all the units
  const aUnits = useAppSelector((state) => state.appSettings.allUnits);
  // use this to represent the list of similar Units by filtering similar units api (sunits) against the list of all units (aunits)
  const similarUnits = useMemo(() => {
    return aUnits?.length && sUnits?.length && !isLoadingSUnits
      ? aUnits.reduce(
          (acc, unit) =>
            sUnits.includes(unit.uic) ? { ...acc, [unit.uic]: { label: unit.shortName, value: unit.uic } } : acc,
          {} as { [key: string]: { label: string; value: string } },
        )
      : {};
  }, [sUnits, aUnits, isLoadingSUnits]);

  // Use this to manage the view type state and changes
  const [view_type, setView_type] = useState(ViewTypeEnum.Unit);
  const viewTypeOptions = useMemo(() => Object.entries(ViewTypeEnum).map(([key, val]) => ({ key, val })), []);

  const handleViewTypeChange = (_event: React.MouseEvent<HTMLElement>, newViewType: ViewTypeEnum) => {
    if (newViewType) {
      setView_type(newViewType);
    }
  };

  const propVal = useMemo(
    () => ({
      ...props,
      start_date: props.start_date,
      end_date: props.end_date,
      validDateRange: props.validDateRange,
      similarUnits,
      units,
      subordinates,
      models,
      setUnits,
      setModels,
      setSubordinates,
    }),
    [models, props, similarUnits, subordinates, units],
  );

  return (
    <>
      <ToggleButtonGroup
        color="primary"
        value={view_type}
        exclusive
        onChange={handleViewTypeChange}
        aria-label="View Type"
      >
        {viewTypeOptions.map(({ key, val }) => (
          <ToggleButton key={key} value={val} sx={{ width: '152px', padding: '8px 0', lineHeight: 'normal' }}>
            {val}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <ParamsContext.Provider value={propVal}>
        {(() => {
          switch (view_type) {
            case ViewTypeEnum.Unit:
              return <HoursFlownUnitGraph />;
            case ViewTypeEnum.Subordinates:
              return <HoursFlownSubordinateGraph />;
            case ViewTypeEnum.Model:
              return <HoursFlownModelGraph />;
            default:
              return null;
          }
        })()}
      </ParamsContext.Provider>
    </>
  );
};
export default HoursFlown;
