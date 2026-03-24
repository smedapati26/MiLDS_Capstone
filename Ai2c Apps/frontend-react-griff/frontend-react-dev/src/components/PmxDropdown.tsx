import React, { ReactNode } from 'react';

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { CSSProperties } from '@mui/material/styles/createMixins';

interface PmxDropdownProps {
  options: string[];
  value: string;
  label: string;
  onChange: (value: string) => void;
  dropdownSx?: CSSProperties;
  containerSx?: CSSProperties;
}

/**
 * PmxDropdown component renders a simple dropdown.
 *
 * @component
 * @param {PmxDropdownProps} props - The properties interface.
 * @param {string} props.label - Label for the dropdown
 * @param {string} props.value - The selected value of the dropdown
 * @param {function(string): void} props.onChange - Callback function for dropdown state management
 *
 * @returns {ReactNode} The rendered dropdown component.
 */

const PmxDropdown: React.FC<PmxDropdownProps> = ({
  options,
  value,
  label,
  dropdownSx,
  containerSx,
  onChange,
}: PmxDropdownProps): ReactNode => {
  const handleChange = (event: SelectChangeEvent<typeof value>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth {...(containerSx && { sx: containerSx })}>
      <InputLabel id="unique-simple-select-label">{label}</InputLabel>
      <Select
        labelId="unique-simple-select-label"
        value={value}
        label={label}
        onChange={handleChange}
        {...(dropdownSx && { sx: dropdownSx })}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default PmxDropdown;
