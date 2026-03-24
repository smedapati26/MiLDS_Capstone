import { useMemo, useState } from 'react';

import { SearchBar } from '@ai2c/pmx-mui';

import { ColumnConfig, OrStatusTableCell, PmxEllipsisText, PmxTable, PmxTableWrapper } from '@components/data-tables';
import { PmxToggleButtonGroup } from '@components/inputs';
import { useTableSearchOptions } from '@hooks/useTableSearchOptions';

import { IAGSE } from '@store/griffin_api/agse/models';
import { useGetAGSEQuery } from '@store/griffin_api/agse/slices';

import { AgseFilterForm } from './AgseFilterForm';
import { agseDefaultValues, AgseFilterSchemaType } from './schema';
import { useAgseTableFilter } from './useAgseTableFilter';

/**
 * Column configuration for the equipment details table.
 * Defines the structure, labels, and rendering for each column in the PmxTable.
 */
const columns: Array<ColumnConfig<IAGSE>> = [
  { key: 'serialNumber', label: 'SN', sortable: true },
  { key: 'model', label: 'Model', sortable: true },
  { key: 'displayName', label: 'Nomenclature', sortable: true },
  {
    key: 'remarks',
    label: 'Remarks',
    render: (value) => (value ? <PmxEllipsisText text={String(value)} maxLength={25} /> : ''),
  },
  {
    key: 'condition',
    label: 'OR Status',
    minWidth: '130px',
    sortable: true,
    render: (_value, row) => (
      <OrStatusTableCell status={row?.condition as string} downDateCount={row?.daysNmc as number} />
    ),
  },
  { key: 'currentUnit', label: 'Unit', minWidth: '200px', sortable: true },
  { key: 'lin', label: 'Location', sortable: true },
];

/**
 * @typedef AgseTableProps
 * @prop
 */
export type AgseTableProps = {
  uic: string | undefined;
  onToggle: (value: string) => void;
};

/**
 * AgseTable Functional Component
 * @param { AgseTableProps } props
 */
export const AgseTable: React.FC<AgseTableProps> = (props) => {
  const { uic, onToggle } = props;

  // Filter Form Data
  const [filters, setFilters] = useState<AgseFilterSchemaType>(agseDefaultValues);
  // Fetch equipment data using RTK Query
  const { data, isLoading } = useGetAGSEQuery(uic, { skip: !uic });
  // Memoize table data to avoid unnecessary re-computations
  const tableData = useMemo(() => (data ? data.agse : []), [data]);
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  // Generate search options based on table data and columns
  const searchOptions = useTableSearchOptions<IAGSE>(columns, tableData);
  // Apply filtering to table rows based on search query and filters
  const filteredRows = useAgseTableFilter({ tableData, searchQuery, filters, columns });

  return (
    <PmxTableWrapper
      leftControls={<PmxToggleButtonGroup value={'AGSE'} options={['Aircraft', 'UAS', 'AGSE']} onChange={onToggle} />}
      rightControls={
        <>
          <AgseFilterForm
            tableData={tableData}
            onApplyFilters={(filters) => {
              setFilters(filters);
            }}
          />
          <SearchBar
            options={searchOptions}
            onChange={(_, value) => setSearchQuery(value ? value.value.toString() : '')}
            styles={{ width: 260 }}
          />
        </>
      }
      table={<PmxTable paginate columns={columns} rows={filteredRows} sx={{ my: 3 }} isLoading={isLoading} />}
    />
  );
};
