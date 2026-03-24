import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CheckIcon from '@mui/icons-material/Check';

import { ColumnConfig, OrStatusTableCell, PmxTable, PmxTableCellBadge } from '@components/data-tables';
import PmxAccordion from '@components/PmxAccordion';

import { EquipmentSchemaType, SubordinateSchemaType } from './step 2/schema';
import { filterDataByModel } from './step 6/utils/filterDataByModel';
import { getModels } from './step 6/utils/getModels';

export const LEFT_COLUMNS: ColumnConfig<EquipmentSchemaType>[] = [
  { key: 'serial', label: 'Equipment SN', sortable: true },
  { key: 'model', label: 'Model', sortable: true, render: (value) => value ?? '--' },
  {
    key: 'unit',
    label: 'Unit',
    render: (_value, row) => (
      <PmxTableCellBadge color={row?.isAdmin ? 'success' : 'error'}>{row?.unit as string}</PmxTableCellBadge>
    ),
    sortable: true,
  },
  {
    key: 'status',
    label: 'OR Status',
    render: (_value, row) => <OrStatusTableCell status={row?.status as string} />,
    sortable: true,
  },
];

export const RIGHT_COLUMNS: ColumnConfig<EquipmentSchemaType>[] = [
  ...LEFT_COLUMNS,
  {
    key: 'isAdmin',
    label: 'Status',
    render: (_value, row) => (row?.isAdmin ? <CheckIcon /> : <AccessTimeFilledIcon />),
  },
];

/* Extending the table columns to name collapsible drawer content key & add model counts */
export interface IExtSubordinate extends SubordinateSchemaType {
  collapsibleDrawerContent?: React.ReactNode; // Custom table column to render custom content in collapsible drawer
  modelCount?: number; // Extra table column for equipment model counts
}

/* Defining table colums for expandable tree table */
export const EXPANDABLE_SUBORDINATE_COLUMNS: ColumnConfig<IExtSubordinate>[] = [
  { key: 'name', label: 'Subordinate Unit' },
  { key: 'echelon', label: 'Echelon' },
  { key: 'ownerId', label: 'Owner' },
  { key: 'shortname', label: 'Short Name' },
  { key: 'nickname', label: 'Nickname', render: (value) => (value ? String(value) : '--') },
  { key: 'modelCount', label: 'Models', render: (_value, row) => getModels(row).length },
  {
    key: 'collapsibleDrawerContent', // PmxCollapsibleTreeTable uses key name her for conditional rendering
    label: 'collapsibleDrawerContent',
    hide: true,
    render: (_value, row) => {
      // Get Models to map row data
      const models = getModels(row);

      return models.length === 0
        ? null
        : models.map((model: string) => {
            // Filters data by model & equipment type (aircraft, uas, agse)
            const { type, data } = filterDataByModel(row as IExtSubordinate, model);

            return (
              <PmxAccordion key={`drawer-${model}-accordion`} heading={model ? model : type} isLoading={false}>
                <PmxTable paginate rows={data} columns={LEFT_COLUMNS} size="small" />
              </PmxAccordion>
            );
          });
    },
  },
];
