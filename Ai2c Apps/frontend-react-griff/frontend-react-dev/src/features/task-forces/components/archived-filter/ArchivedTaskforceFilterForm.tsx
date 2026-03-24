import React, { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { Divider, Stack, Typography } from '@mui/material';

import { SearchBar } from '@ai2c/pmx-mui';

import { RHFDateRangePicker, RHFLocationDropdown } from '@components/react-hook-form';
import { IOptionType } from '@models/IOptions';

import { ITaskForceSimple } from '@store/griffin_api/taskforce/models/ITaskforce';

import { TaskForceFilterSchemaType } from './schema';
import { getNestedField, isSameOrAfter, isSameOrBefore } from './utils';

type Props = {
  data: ITaskForceSimple[];
  onFilterChange: (filters: TaskForceFilterSchemaType) => void;
  onSearchChange: (searchQuery: IOptionType<string>) => void;
};

export const ArchivedTaskforceFilterForm: React.FC<Props> = ({ data, onFilterChange, onSearchChange }) => {
  const { watch } = useFormContext();
  const filters = watch();

  useEffect(() => {
    // 500ms delay for calling onFilterChange
    const handler = setTimeout(() => {
      onFilterChange(filters);
    }, 500);

    // clear timer when filters are changed
    return () => {
      clearTimeout(handler);
    };
  }, [filters, onFilterChange]);

  const searchOptions: Array<IOptionType<string>> = useMemo(() => {
    const options = new Set<string>();
    const SEARCHABLE_FIELDS = ['unit.uic', 'unit.displayName', 'unit.shortName', 'owner.rankAndName'];

    // Apply date and location filters first
    const preFilteredData = data.filter((taskforce) => {
      const matchesLocation = filters.location?.code ? taskforce.location?.code === filters.location?.code : true;
      const afterStartDate = filters.tfDateRange?.startDate
        ? isSameOrAfter(taskforce.startDate, filters.tfDateRange?.startDate)
        : true;
      const beforeEndDate = filters.tfDateRange?.endDate
        ? isSameOrBefore(taskforce.endDate, filters.tfDateRange?.endDate)
        : true;
      return matchesLocation && afterStartDate && beforeEndDate;
    });

    // Filter remaining data by unit and owner fields
    preFilteredData.forEach((item) => {
      SEARCHABLE_FIELDS.forEach((path) => {
        const value = getNestedField(item, path);

        if (value !== undefined && value !== null && String(value).trim() !== '') {
          options.add(String(value));
        }
      });
    });

    return Array.from(options).map((value) => ({
      value,
      label: value,
    }));
  }, [data, filters]);

  return (
    <Stack
      direction="row"
      sx={{ mx: 2, mr: 4, mb: 2 }}
      alignItems="end"
      justifyContent="space-between"
      data-testid="archived-tf-filters"
    >
      <Stack direction="row" gap={4} justifyContent="space-between">
        <Stack direction="column" gap={4}>
          <Typography>Filter by date range:</Typography>
          <RHFDateRangePicker field="tfDateRange" startLabel="" endLabel="" width={'18ch'} />
        </Stack>
        <Divider orientation="vertical" />
        <Stack direction="column" gap={4}>
          <Typography>Filter by location:</Typography>
          <RHFLocationDropdown field="location" label="" optionLabelField="name" width={'300px'} />
        </Stack>
      </Stack>
      <SearchBar
        options={searchOptions}
        onChange={(_, value) => onSearchChange(value as IOptionType<string>)}
        styles={{ minWidth: '200px', width: '25%', height: '100%' }}
      />
    </Stack>
  );
};
