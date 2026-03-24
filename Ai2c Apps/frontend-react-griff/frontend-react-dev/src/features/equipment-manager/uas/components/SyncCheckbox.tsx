import React from 'react';

import { Checkbox, FormControlLabel, SxProps, Theme } from '@mui/material';

interface SyncCheckboxProps {
  /** The field key to sync */
  field: string;
  /** Label text to display */
  label: string;
  /** The current sync status state object */
  fieldSyncStatus: { [sync: string]: boolean };
  /** State setter for fieldSyncStatus */
  setFieldSyncStatus: React.Dispatch<React.SetStateAction<{ [sync: string]: boolean }>>;
  /** Optional custom styles */
  sx?: SxProps<Theme>;
}

export const SyncCheckbox: React.FC<SyncCheckboxProps> = ({
  field,
  label,
  fieldSyncStatus,
  setFieldSyncStatus,
  sx,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldSyncStatus((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  return (
    <FormControlLabel
      sx={sx}
      control={<Checkbox checked={fieldSyncStatus[field] ?? false} onChange={handleChange} />}
      label={label}
    />
  );
};

export default SyncCheckbox;
