import { useMemo, useState } from 'react';

import { useTheme } from '@mui/material';

import { SearchBar } from '@ai2c/pmx-mui';

import { ColumnConfig, PmxTable, PmxTableWrapper } from '@components/data-tables';
import { PmxToggleButtonGroup } from '@components/inputs';
import PmxAccordion from '@components/PmxAccordion';
import { useTableSearchOptions } from '@hooks/useTableSearchOptions';

import { IMaintenanceDetailsDto } from '@store/griffin_api/events/models';
import { useGetMaintenanceDetailsQuery } from '@store/griffin_api/events/slices';

import {
  maintDetailDefaultValues,
  MaintDetailFilterSchemaType,
  MaintDetailsFilterForm,
} from './MaintDetailsFilterForm';
import { useMaintDetailsTableFilter } from './useMaintDetailsTableFilter';

/**
 * Column configuration for the equipment details table.
 * Defines the structure, labels, and rendering for each column in the PmxTable.
 */
const columns: Array<ColumnConfig<IMaintenanceDetailsDto>> = [
  { key: 'serial', label: 'SN', sortable: true },
  { key: 'model', label: 'Model', sortable: true },
  { key: 'inspection_name', label: 'Inspection', sortable: true },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => `${(Number(value) * 100).toFixed(0)}% complete`,
  },
  { key: 'lane_name', label: 'Lane', sortable: true },
  { key: 'responsible_unit', label: 'Responsible Unit', sortable: true },
  { key: 'start_date', label: 'Start Date', sortable: true },
  { key: 'end_date', label: 'End Date', sortable: true },
];

/* GridItem Props */
export type GridItemProps = {
  uic: string | undefined;
};

const MaintenanceDetailsGridItem: React.FC<GridItemProps> = (props: GridItemProps) => {
  const { uic } = props;
  const { palette } = useTheme();

  const [maintenanceType, setMaintenanceType] = useState('current');

  // State for applied filters
  const [filters, setFilters] = useState<MaintDetailFilterSchemaType>(maintDetailDefaultValues);
  // Fetch equipment data using RTK Query
  const { data, isFetching, isUninitialized, isLoading } = useGetMaintenanceDetailsQuery({ uic: uic }, { skip: !uic });
  // Memoize table data to avoid unnecessary re-computations
  const tableData: IMaintenanceDetailsDto[] = useMemo(() => data ?? [], [data]);
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  // Generate search options based on table data and columns
  const searchOptions = useTableSearchOptions<IMaintenanceDetailsDto>(columns, tableData);
  // Apply filtering to table rows based on search query and filters
  const filteredRows = useMaintDetailsTableFilter({ tableData, searchQuery, filters, columns });
  // Apply top level filtering by maintenance type (current | upcoming)
  const filteredByMaintTypeRows = useMemo(
    () => filteredRows.filter((row) => row.current_upcoming === maintenanceType),
    [filteredRows, maintenanceType],
  );

  return (
    <PmxAccordion
      heading="Maintenance Details"
      launchPath="/maintenance-schedule"
      isLoading={isFetching || isUninitialized}
      sx={{
        backgroundImage: 'none',
        borderColor: palette.mode === 'dark' ? palette.layout.background11 : palette.layout.background7,
        margin: 0,
      }}
    >
      <PmxTableWrapper
        leftControls={
          <PmxToggleButtonGroup
            value={maintenanceType}
            options={['current', 'upcoming']}
            onChange={(value) => setMaintenanceType(value as string)}
          />
        }
        rightControls={
          <>
            <MaintDetailsFilterForm tableData={tableData} onApplyFilters={(filters) => setFilters(filters)} />
            <SearchBar
              options={searchOptions}
              onChange={(_, value) => setSearchQuery(value ? value.value.toString() : '')}
              styles={{ width: 260 }}
            />
          </>
        }
        table={<PmxTable columns={columns} rows={filteredByMaintTypeRows} sx={{ my: 3 }} isLoading={isLoading} />}
      />
    </PmxAccordion>
  );
};

export default MaintenanceDetailsGridItem;
