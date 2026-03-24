import React, { ReactNode, useEffect, useState } from 'react';

import { CSSProperties } from '@mui/material/styles/createMixins';

import PmxMultiSelect, { IOptionWithIds } from '@components/PmxMultiSelect';

import { IMaintenanceLane } from '@store/griffin_api/events/models';
import { useGetLanesQuery } from '@store/griffin_api/events/slices';
import { useAppSelector } from '@store/hooks';

interface LaneDropdownProps {
  values?: string[];
  handleSelect?: (val: string[]) => void;
  multiSelect?: boolean;
  disabled?: boolean;
  dropdownSx?: CSSProperties;
  containerSx?: CSSProperties;
  textFieldSx?: CSSProperties;
}

/**
 * Lane selector. Allows users to select multiple or single.
 *
 * @param {LaneDropdownProps} props - Properties interface
 * @param {string[]} props.values - list of select values
 * @param {function(string[]: void)} props.handleSelect- function that sets the values
 * @param {boolean} props.singleSelect - decides if we have a single or multi select dropdown
 * @param {CSSProperties} props.dropdownSx - properties of the dropdown
 * @param {CSSProperties} props.containerSx - properties of the dropdown container
 * @param {CSSProperties} props.textFieldSx - properties of the text field to overwrite
 *
 * @returns {ReactNode} The rendered component.
 */

const LaneDropdown: React.FC<LaneDropdownProps> = ({
  values = [],
  handleSelect = () => {},
  multiSelect = false,
  disabled = false,
  dropdownSx,
  containerSx,
  textFieldSx,
}: LaneDropdownProps): ReactNode => {
  const uic = useAppSelector((state) => state.appSettings.currentUic);
  const { data: lanes, isLoading: isLoadingLanes } = useGetLanesQuery(uic);
  const [laneOptions, setLaneOptions] = useState<string[]>([]);
  const [laneOptionWithIds, setLaneOptionWithIds] = useState<IOptionWithIds[]>([]);

  useEffect(() => {
    const fetchedLanes: string[] = [...new Set(lanes?.map((lane: IMaintenanceLane) => lane.name))];
    const fetchedLaneWithId: IOptionWithIds[] = [
      ...new Set(lanes?.map((lane: IMaintenanceLane) => ({ id: String(lane.id), value: lane.name }) as IOptionWithIds)),
    ];

    setLaneOptions(fetchedLanes);
    setLaneOptionWithIds(fetchedLaneWithId);
  }, [lanes]);

  const onChangeHandler = (newValues: string[]) => {
    const value = multiSelect ? newValues : newValues.slice(-1);
    handleSelect(value);
  };

  return (
    <PmxMultiSelect
      label="Lane*"
      data-testid="lane-maintenance-details"
      values={values}
      options={laneOptions}
      optionWithIds={laneOptionWithIds}
      loading={isLoadingLanes}
      disabled={disabled}
      onChange={onChangeHandler}
      aria-label="models-label"
      maxSelections={multiSelect ? undefined : 1}
      dropdownSx={dropdownSx}
      containerSx={containerSx}
      textFieldSx={textFieldSx}
    />
  );
};

export default LaneDropdown;
