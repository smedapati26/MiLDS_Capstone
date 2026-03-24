import { useMemo, useState } from 'react';

import { Stack } from '@mui/material';

import { SearchBar } from '@ai2c/pmx-mui';

import { ColumnConfig, OrStatusTableCell, PmxCommentTooltip, PmxTable } from '@components/data-tables';
import PmxAccordion from '@components/PmxAccordion';
import { useTableSearchOptions } from '@hooks/useTableSearchOptions';

import { IUAS } from '@store/griffin_api/uas/models/IUAS';
import { useGetUAVQuery } from '@store/griffin_api/uas/slices/uavApi';

import { uavFilterDefaultValues, UAVFilterSchemaType } from './schema';
import { UAVFilterForm } from './UAVFilterForm';
import { useUavTableFilter } from './useUAVTableFilter';

/**
 * Column configuration for the equipment details table.
 * Defines the structure, labels, and rendering for each column in the PmxTable.
 */
const columns: Array<ColumnConfig<IUAS>> = [
  { key: 'serialNumber', label: 'SN', sortable: true },
  { key: 'model', label: 'Model', sortable: true },
  { key: 'rtl', label: 'Status', sortable: true },
  {
    key: 'displayStatus',
    label: 'OR Status',
    minWidth: '130px',
    sortable: true,
    render: (_value, row) => (
      <OrStatusTableCell status={row?.displayStatus as string} downDateCount={row?.dateDownCount as number} />
    ),
  },
  { key: 'flightHours', label: 'Period Hrs', sortable: true, minWidth: '150px' },
  {
    key: 'totalAirframeHours',
    label: 'Airframe Hrs',
    sortable: true,
    minWidth: '150px',
    render: (value) => Number(value).toFixed(2),
  },
  { key: 'currentUnit', label: 'Unit', minWidth: '200px', sortable: true },
  {
    key: 'locationCode',
    label: 'Location',
    sortable: true,
    render: (value) => (value && typeof value !== 'object' ? value : '--'),
  },
  {
    key: 'remarks',
    label: 'Remarks',
    render: (value) => (value ? <PmxCommentTooltip title={String(value)} /> : ''),
  },
];

/**
 * @typedef UAVTableProps
 * @prop
 */
export type UAVTableProps = {
  uic: string | undefined;
};

/**
 * UAVTable Functional Component
 * @param { UAVTableProps } props
 */
export const UAVTable: React.FC<UAVTableProps> = (props) => {
  const { uic } = props;

  // Fetch equipment data using RTK Query
  const { data, isLoading } = useGetUAVQuery({ uic: uic as string }, { skip: !uic });
  // Filter Form Data
  const [filters, setFilters] = useState<UAVFilterSchemaType>(uavFilterDefaultValues);
  // Memoize table data to avoid unnecessary re-computations
  const tableData = useMemo(() => (data ? data : []), [data]);
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  // Generate search options based on table data and columns
  const searchOptions = useTableSearchOptions<IUAS>(columns, tableData);
  // Apply filtering to table rows based on search query and filters
  const filteredRows = useUavTableFilter({ tableData, searchQuery, filters, columns });

  return (
    <PmxAccordion heading="UAV&#39;s" isLoading={isLoading} sx={{ mt: 4, '& .MuiAccordionDetails-root': { pb: 2 } }}>
      <Stack direction="row" gap={2} alignItems="center" sx={{ float: 'right', mb: 2 }}>
        <UAVFilterForm tableData={tableData} onApplyFilters={(filters) => setFilters(filters)} />
        <SearchBar
          options={searchOptions}
          onChange={(_, value) => setSearchQuery(value ? value.value.toString() : '')}
          styles={{ width: 260 }}
        />
      </Stack>
      <PmxTable paginate size="small" columns={columns} rows={filteredRows} sx={{ my: 3 }} isLoading={isLoading} />
    </PmxAccordion>
  );
};
