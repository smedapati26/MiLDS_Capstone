import { useMemo, useState } from 'react';

import { Stack } from '@mui/material';

import { SearchBar } from '@ai2c/pmx-mui';

import { ColumnConfig, OrStatusTableCell, PmxCommentTooltip, PmxTable } from '@components/data-tables';
import PmxAccordion from '@components/PmxAccordion';
import { useTableSearchOptions } from '@hooks/useTableSearchOptions';

import { IUAS } from '@store/griffin_api/uas/models/IUAS';
import { useGetUACQuery } from '@store/griffin_api/uas/slices';

import { uacFilterDefaultValues, UACFilterSchemaType } from './schema';
import { UACFilterForm } from './UACFilterForm';
import { useUacTableFilter } from './useUACTableFilter';

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
 * @typedef UACTableProps
 * @prop
 */
export type UACTableProps = {
  uic: string | undefined;
};

/**
 * UACTable Functional Component
 * @param { UACTableProps } props
 */
export const UACTable: React.FC<UACTableProps> = (props) => {
  const { uic } = props;

  // Fetch equipment data using RTK Query
  const { data, isLoading } = useGetUACQuery({ uic: uic as string }, { skip: !uic });
  // Filter Form Data
  const [filters, setFilters] = useState<UACFilterSchemaType>(uacFilterDefaultValues);
  // Memoize table data to avoid unnecessary re-computations
  const tableData = useMemo(() => (data ? data : []), [data]);
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  // Generate search options based on table data and columns
  const searchOptions = useTableSearchOptions<IUAS>(columns, tableData);
  // Apply filtering to table rows based on search query and filters
  const filteredRows = useUacTableFilter({ tableData, searchQuery, filters, columns });

  return (
    <PmxAccordion heading="Components" isLoading={isLoading} sx={{ mt: 4, '& .MuiAccordionDetails-root': { pb: 2 } }}>
      <Stack direction="row" gap={2} alignItems="center" sx={{ float: 'right', mb: 2 }}>
        <UACFilterForm tableData={tableData} onApplyFilters={(filters) => setFilters(filters)} />
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
