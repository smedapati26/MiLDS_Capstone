import React from 'react';

import { Stack, Typography } from '@mui/material';

import { SearchBar } from '@ai2c/pmx-mui';

import { ColumnConfig, PmxTable } from '@components/data-tables';
import { useTableSearchFilter } from '@hooks/useTableSearchFilter';
import { useTableSearchOptions } from '@hooks/useTableSearchOptions';

/**
 * @typedef Props
 * @prop children
 */
export type Props<T> = {
  /** Column Config for table display */
  columns: ColumnConfig<T>[];
  /** Row Data */
  data: T[];
  /** Adds a heading to top of table */
  heading?: string;
  /** Toolbar slot is for rendering left side of search bar or external filtering */
  toolbar?: React.ReactNode;
  /** Callback when selection changes */
  onSelectionChange?: (selectedRows: T[]) => void;
  /** Searchable (Default [true]) */
  searchable?: boolean;
  /* Loading boolean */
  isLoading?: boolean;
};

/**
 * PmxToolbarTable Functional Component
 * @see PmxTable for table implementation
 */
export const PmxToolbarTable = <T,>(props: Props<T>) => {
  const { heading, columns, data, toolbar, onSelectionChange, searchable = true, isLoading = false } = props;
  // Custom hook get search options from data
  const options = useTableSearchOptions<T>(columns, data);
  // Use the custom simple search hook
  const { setSearchQuery, filteredData } = useTableSearchFilter<T>(columns, data);

  return (
    <>
      {/** Heading */}
      {heading && <Typography variant="h6">{heading}</Typography>}
      <Stack direction="column" gap={3} sx={{ my: 3, width: '100%' }}>
        {
          /** Toolbar */
          <Stack
            id="transfer-table--toolbar"
            direction="row"
            gap={3}
            justifyContent={toolbar ? 'space-between' : 'flex-end'}
            width={'100%'}
          >
            {toolbar}
            {searchable && (
              <SearchBar
                options={options}
                onChange={(_, value) => setSearchQuery(value ? value.value.toString() : '')}
                styles={{ width: '100%' }}
              />
            )}
          </Stack>
        }
        {/** Table */}
        <PmxTable
          rows={filteredData}
          columns={columns}
          size="small"
          paginate
          selectable
          onSelectionChange={onSelectionChange}
          isLoading={isLoading}
        />
      </Stack>
    </>
  );
};
