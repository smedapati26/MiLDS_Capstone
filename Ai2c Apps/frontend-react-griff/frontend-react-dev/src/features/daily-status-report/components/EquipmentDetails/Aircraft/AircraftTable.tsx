import { useMemo, useState } from 'react';

import { SearchBar } from '@ai2c/pmx-mui';

import { ColumnConfig, OrStatusTableCell, PmxEllipsisText, PmxTable, PmxTableWrapper } from '@components/data-tables';
import { PmxToggleButtonGroup } from '@components/inputs';
import AcdUploadButton from '@features/equipment-manager/components/AcdUploadButton';
import { useTableSearchOptions } from '@hooks/useTableSearchOptions';

import { IAutoDsr, ILocation } from '@store/griffin_api/auto_dsr/models';
import { useGetAutoDsrQuery } from '@store/griffin_api/auto_dsr/slices';

import { AircraftEquipmentFilterForm } from './AircraftEquipmentFilterForm';
import { ModsKitTooltip } from './ModsKitTooltip';
import { ORStatusTooltip } from './ORStatusTooltip';
import { aircraftDefaultValues, AircraftFilterSchemaType } from './schema';
import { useAircraftTableFilter } from './useAircraftTableFilter';
import { useModifications } from './useModifications';

/**
 * Table override type for tableData
 * -- Used to map/flatten nested location.name to location
 */
export type TableOverrideType = Omit<IAutoDsr, 'location'> & { location: string };

/**
 * Column configuration for the equipment details table.
 * Defines the structure, labels, and rendering for each column in the PmxTable.
 */
const columns: Array<ColumnConfig<TableOverrideType>> = [
  { key: 'serialNumber', label: 'SN', sortable: true },
  { key: 'model', label: 'Model', sortable: true },
  {
    key: 'remarks',
    label: 'Remarks',
    render: (value) => (value ? <PmxEllipsisText text={String(value)} maxLength={25} /> : ''),
  },
  { key: 'rtl', label: 'Status', sortable: true },
  {
    key: 'status',
    label: 'OR Status',
    minWidth: '130px',
    sortable: true,
    render: (_value, row) => (
      <ORStatusTooltip status={row?.status as string} ecd={row?.ecd} dateDown={row?.dateDown}>
        <div>
          <OrStatusTableCell status={row?.status as string} downDateCount={row?.dateDownCount as number} />
        </div>
      </ORStatusTooltip>
    ),
  },
  { key: 'flyingHours', label: 'Hrs Flown', sortable: true, minWidth: '130px' },
  {
    key: 'hoursToPhase',
    label: 'Hrs to Phase',
    sortable: true,
    minWidth: '150px',
    render: (value) => Number(value).toFixed(2),
  },
  { key: 'currentUnitName', label: 'Unit', minWidth: '200px', sortable: true },
  { key: 'location', label: 'Location', sortable: true },
  {
    key: 'modifications',
    label: 'Mods',
    render: (_value, row) => row?.modifications && <ModsKitTooltip mods={row.modifications} />,
  },
];

/**
 * @typedef AircraftTableProps
 * @prop
 */
export type AircraftTableProps = {
  uic: string | undefined;
  startDate: string;
  endDate: string;
  onToggle: (value: string) => void;
};

/**
 * AircraftTable Functional Component
 * @param { AircraftTableProps } props
 */
export const AircraftTable: React.FC<AircraftTableProps> = (props) => {
  const { uic, startDate, endDate, onToggle } = props;

  // Fetch equipment data using RTK Query
  const { data: autoDsrData, isLoading } = useGetAutoDsrQuery(
    {
      uic: uic,
      start_date: startDate,
      end_date: endDate,
    },
    { skip: !uic },
  );

  // Filter Form Data
  const [filters, setFilters] = useState<AircraftFilterSchemaType>(aircraftDefaultValues);

  // Helper function for location
  const getLocation = (location: ILocation): string => {
    if (location?.shortName) return location.shortName;
    else if (location?.name) return location.name;
    else if (location?.code) return location.code;
    else if (location?.mgrs) return location.mgrs;
    return '--';
  };

  /**
   * Memoize table data to avoid unnecessary re-computations
   * @see TableOverrideType
   */
  const tableData: Array<TableOverrideType> = useMemo(
    () => (autoDsrData?.data ? autoDsrData.data.map((row) => ({ ...row, location: getLocation(row.location) })) : []),
    [autoDsrData?.data],
  );

  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  // Flat options
  const options = useTableSearchOptions<TableOverrideType>(columns, tableData, {
    excludeColumns: ['modifications'],
  });
  // Memoized Modifications as IOptions
  const modifications = useModifications(tableData);
  // Combine options
  const searchOptions = useMemo(() => [...options, ...modifications], [modifications, options]);
  // Apply filtering to table rows based on search query and filters
  const filteredRows = useAircraftTableFilter({ tableData, searchQuery, filters, columns });

  return (
    <PmxTableWrapper
      leftControls={
        <PmxToggleButtonGroup value={'Aircraft'} options={['Aircraft', 'UAS', 'AGSE']} onChange={onToggle} />
      }
      rightControls={
        <>
          <AcdUploadButton />
          <AircraftEquipmentFilterForm tableData={tableData} onApplyFilters={(filters) => setFilters(filters)} />
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
