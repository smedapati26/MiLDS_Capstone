import React, { useEffect, useMemo, useState } from 'react';

import ErrorIcon from '@mui/icons-material/Error';
import {
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Skeleton,
  Typography,
} from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';

import { IMaintainerDto } from '@store/amap_api/personnel/models';
import { useGetMaintainersQuery } from '@store/amap_api/personnel/slices';
import { useAppSelector } from '@store/hooks';

export interface MaintainerDropdownProps {
  label?: string;
  values?: string[]; // selected user IDs
  handleSelect?: (val: string[]) => void;
  multiSelect?: boolean;
  startDate?: string;
  endDate?: string;
  disabled?: boolean;
  helperText?: string;
}

const MENU_PROPS = {
  PaperProps: {
    style: {
      maxHeight: 10 * 48 + 8, // 10 items * item height + some padding
    },
  },
};

const MaintainerDropdown: React.FC<MaintainerDropdownProps> = ({
  label,
  values = [],
  handleSelect = () => {},
  multiSelect = false,
  startDate,
  endDate,
  disabled,
  helperText,
}) => {
  const uic = useAppSelector((state) => state.appSettings.currentUic);
  const { data: maintainers, isLoading } = useGetMaintainersQuery(
    startDate && endDate ? { uic, start_date: startDate, end_date: endDate } : skipToken,
  );

  const [groupedMaintainers, setGroupedMaintainers] = useState<Record<string, IMaintainerDto[]>>({});

  useEffect(() => {
    if (maintainers) {
      const grouped: Record<string, IMaintainerDto[]> = {};
      maintainers.forEach((m) => {
        if (!grouped[m.mos]) grouped[m.mos] = [];
        grouped[m.mos].push(m);
      });

      // Sort each group alphabetically by last name
      Object.keys(grouped).forEach((mos) => {
        grouped[mos].sort((a, b) => a.last_name.localeCompare(b.last_name));
      });

      setGroupedMaintainers(grouped);
    }
  }, [maintainers]);

  const validUserIds = useMemo(() => {
    return maintainers?.map((m) => m.user_id) ?? [];
  }, [maintainers]);

  const filteredValues = values?.filter((val) => validUserIds.includes(val)) ?? [];

  useEffect(() => {
    if (values?.length) {
      const validUserIdsSet = new Set(validUserIds);
      const filtered = values.filter((val) => validUserIdsSet.has(val));
      if (filtered.length !== values.length) {
        console.warn(
          'Invalid user_id(s) passed to MaintainerDropdown:',
          values.filter((val) => !validUserIdsSet.has(val)),
        );
      }
    }
  }, [values, validUserIds]);

  const singleValue = filteredValues[0] ?? '';

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const rawValue = event.target.value;

    if (multiSelect) {
      const selected = Array.isArray(rawValue) ? rawValue : String(rawValue).split(',');
      handleSelect(selected);
    } else {
      handleSelect([String(rawValue)]);
    }
  };

  const renderValue = (selected: string[] | string) => {
    const ids = Array.isArray(selected) ? selected : [selected];
    const selectedMaintainers = maintainers?.filter((m) => ids.includes(m.user_id)) ?? [];
    return selectedMaintainers
      .map((m) => `${m.first_name} ${m.last_name} — ${m.ml}${m.availability_flag ? ' ⚠️' : ''}`)
      .join(', ');
  };

  if (isLoading) {
    return <Skeleton variant="rectangular" height={50} />;
  }

  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select
        multiple={multiSelect}
        value={multiSelect ? filteredValues : singleValue}
        onChange={handleChange}
        input={<OutlinedInput label="Select Maintainer" />}
        renderValue={renderValue}
        MenuProps={MENU_PROPS}
        disabled={disabled}
      >
        {Object.entries(groupedMaintainers).map(([mos, people]) => [
          <ListSubheader key={mos}>{mos}</ListSubheader>,
          ...people.map((m) => (
            <MenuItem key={m.user_id} value={m.user_id}>
              {multiSelect && <Checkbox checked={filteredValues.includes(m.user_id)} />}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {`${m.first_name} ${m.last_name} — ${m.ml}`}
                {m.availability_flag && <ErrorIcon fontSize="small" color="error" />}
              </Box>
            </MenuItem>
          )),
        ])}
      </Select>
      <Typography variant="caption" color="error" sx={{ textAlign: 'left', mb: 1 }} data-testid="permission-warning">
        {helperText}
      </Typography>
    </FormControl>
  );
};

export default MaintainerDropdown;
