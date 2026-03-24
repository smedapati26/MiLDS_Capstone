import React from 'react';

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Skeleton } from '@mui/material';

interface InspectionOption {
  id: number;
  commonName: string;
  code: string;
}

interface InspectionDropdownProps {
  inspectionTypes: InspectionOption[];
  selectedInspectionReferenceId: number | null;
  onChange: (event: SelectChangeEvent<number>) => void;
  isLoading: boolean;
  disabled: boolean;
  menuProps?: object;
}

const ITEM_HEIGHT = 40;

export const InspectionDropdown: React.FC<InspectionDropdownProps> = ({
  inspectionTypes,
  selectedInspectionReferenceId,
  onChange,
  isLoading,
  disabled,
  menuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 10,
      },
    },
  },
}) => {
  const validIds = inspectionTypes.map((opt) => opt.id);
  const selectedId = selectedInspectionReferenceId ?? 0;
  const safeValue = validIds.includes(selectedId) ? selectedId : '';
  return (
    <FormControl fullWidth sx={{ mt: 2, mb: 4 }}>
      <InputLabel id="inspection-type-label">Inspection Type</InputLabel>
      {isLoading ? (
        <Skeleton variant="rectangular" height={50} />
      ) : (
        <Select
          labelId="inspection-type-label"
          value={safeValue}
          label="Inspection Type"
          onChange={onChange}
          disabled={disabled}
          MenuProps={menuProps}
        >
          {[...inspectionTypes]
            .map((option) => {
              const label =
                option.commonName === option.code ? option.commonName : `${option.commonName} - ${option.code}`;
              return {
                ...option,
                label,
                hasDistinctCode: option.commonName !== option.code,
              };
            })
            .sort((a, b) => {
              // Put ones with different commonName/code first
              if (a.hasDistinctCode !== b.hasDistinctCode) {
                return a.hasDistinctCode ? -1 : 1;
              }
              // Then sort alphabetically by label
              return a.label.localeCompare(b.label);
            })
            .map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
        </Select>
      )}
    </FormControl>
  );
};

export default InspectionDropdown;
