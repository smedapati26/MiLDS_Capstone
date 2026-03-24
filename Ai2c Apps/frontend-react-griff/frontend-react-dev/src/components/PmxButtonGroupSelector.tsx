import React, { ReactNode, useId } from 'react';

import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

import { slugify } from '@ai2c/pmx-mui';

export interface IToggleOption<T extends string | number> {
  id: T;
  value: string;
}

interface ButtonGroupSelectorProps<T extends string | number> {
  options?: IToggleOption<T>[] | string[];
  selected: string[] | number;
  setSelected: (values: string[]) => void;
  label?: string;
  exclusive?: boolean;
}

/**
 * Function that creates a group of selectors in button form, where users can click and select item.
 * In this component, the toggle button is customized to have a button with it's own theme to match the design.
 * @param {IToggleOption[] | string[]} props.options - list of options either all strings or an object of id and value, if the user wants to select ids instead of just name
 * @param {string[]} props.selected - Generic array of values to track selection options in the state
 * @param {function(T[]: void)} props.setSelected - Callback function for dropdown state management
 * @param {string} label - label of the groups to toggle
 *
 * @returns {ReactNode} the rendered button selector component
 */

/** */
const PmxButtonGroupSelector = <T extends string | number>({
  options,
  selected,
  setSelected,
  label,
  exclusive = false,
}: ButtonGroupSelectorProps<T>): ReactNode => {
  const baseId = useId();

  const toggleButtonGroupStyle = {
    gap: 1,
    mt: 2,
    mb: 2,
    flexWrap: 'wrap',
    '& .MuiToggleButtonGroup-grouped': {
      marginLeft: '8px !important', // remove any negative margins
      border: '1px solid',
      borderRadius: '4px',
    },
    '& .MuiToggleButtonGroup-grouped.Mui-selected + .MuiToggleButtonGroup-grouped.Mui-selected': {
      borderLeft: '1px solid',
    },
  };

  const toggleButtonStyle = {
    height: 36,
    m: 2,
    minWidth: '58px',
  };

  const handleSelection = (_event: React.MouseEvent<HTMLElement>, newSelection: string[]): void => {
    setSelected(newSelection);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="body3">{label}</Typography>
      <ToggleButtonGroup
        value={selected}
        onChange={handleSelection}
        aria-label={label}
        sx={toggleButtonGroupStyle}
        exclusive={exclusive}
      >
        {options?.map((option: IToggleOption<T> | string, index: number) => {
          const value = typeof option === 'object' ? option.id : option;
          const displayValue = typeof option === 'object' ? option.value : option;
          return (
            <ToggleButton
              value={value}
              sx={toggleButtonStyle}
              key={label ? `${slugify(label)}${baseId}-${index}-PmxToggleButton` : `${baseId}-${index}-PmxToggleButton`}
            >
              <Typography variant="body1">{displayValue}</Typography>
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </div>
  );
};

export default PmxButtonGroupSelector;
