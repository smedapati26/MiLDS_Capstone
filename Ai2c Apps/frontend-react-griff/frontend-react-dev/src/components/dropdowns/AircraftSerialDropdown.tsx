import React, { ReactNode, useEffect, useState } from 'react';

import { CSSProperties } from '@mui/material/styles/createMixins';

import PmxMultiSelect from '@components/PmxMultiSelect';

import { IAircraft } from '@store/griffin_api/aircraft/models/IAircraft';
import { useGetAircraftByUicQuery } from '@store/griffin_api/aircraft/slices';
import { useAppSelector } from '@store/hooks';

interface AircraftDropdownProps {
  values?: string[];
  handleSelect?: (val: string[]) => void;
  disabled?: boolean;
  multiSelect?: boolean;
  dropdownSx?: CSSProperties;
  containerSx?: CSSProperties;
  textFieldSx?: CSSProperties;
  setAllSerials?: boolean;
}

/**
 * Serial aircraft selector. Allows users to select multiple or single.
 *
 * @param {AircraftDropdownProps} props - Properties interface
 * @param {string[]} props.values - list of select values
 * @param {function(string[]: void)} props.handleSelect- function that sets the values
 * @param {boolean} props.disabled - decides whether the dropdown is disabled
 * @param {boolean} props.singleSelect - decides if we have a single or multi select dropdown
 * @param {CSSProperties} props.dropdownSx - properties of the dropdown
 * @param {CSSProperties} props.containerSx - properties of the dropdown container
 * @param {CSSProperties} props.textFieldSx - properties of the text field to overwrite
 *
 * @returns {ReactNode} The rendered component.
 */

const AircraftSerialDropdown: React.FC<AircraftDropdownProps> = ({
  values = [],
  handleSelect = () => {},
  disabled = false,
  multiSelect = false,
  dropdownSx,
  containerSx,
  textFieldSx,
  setAllSerials = false,
}: AircraftDropdownProps): ReactNode => {
  const uic = useAppSelector((state) => state.appSettings.currentUic);
  const { data: aircraftData, isLoading: aircraftLoading } = useGetAircraftByUicQuery(uic);
  const [aircraftSerials, setAircraftSerials] = useState<string[] | undefined>([]);

  useEffect(() => {
    if (!aircraftData) return;

    const options = aircraftData.map((aircraft: IAircraft) => {
      return `${aircraft.serial} - ${aircraft.aircraftModel}`;
    });

    setAircraftSerials(options);

    if (setAllSerials) {
      const serialsOnly = aircraftData.map((a) => a.serial);
      handleSelect(serialsOnly);
    }
  }, [aircraftData, handleSelect, setAllSerials]);

  const onChangeHandler = (newValues: string[]) => {
    const value = multiSelect ? newValues : newValues.slice(-1);
    handleSelect(value);
  };

  return (
    <PmxMultiSelect
      label="Serial Numbers"
      values={values}
      options={aircraftSerials ?? []}
      disabled={disabled}
      loading={aircraftLoading}
      onChange={onChangeHandler}
      data-testid="serial-numbers-pmx-search-select"
      aria-label="models-label"
      maxSelections={multiSelect ? undefined : 1}
      dropdownSx={dropdownSx}
      containerSx={containerSx}
      textFieldSx={textFieldSx}
    />
  );
};

export default AircraftSerialDropdown;
