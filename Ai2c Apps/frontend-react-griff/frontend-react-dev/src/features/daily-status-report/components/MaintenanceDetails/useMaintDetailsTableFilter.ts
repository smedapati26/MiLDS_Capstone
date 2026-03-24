import { useMemo } from 'react';
import dayjs from 'dayjs';

import { ColumnConfig } from '@components/data-tables';
import { DAYJS_DATE_FORMAT } from '@utils/constants';

import { IMaintenanceDetailsDto } from '@store/griffin_api/events/models';

import { MaintDetailFilterSchemaType } from './MaintDetailsFilterForm';

interface Props {
  tableData: IMaintenanceDetailsDto[] | undefined;
  searchQuery: string;
  filters: MaintDetailFilterSchemaType;
  columns: Array<ColumnConfig<IMaintenanceDetailsDto>>;
}

/**
 * Custom hook for filtering maintenance details table data based on search query and various filter criteria.
 *
 * This hook applies two levels of filtering:
 * 1. Text-based search across specified columns
 * 2. Multi-criteria filters including status, serial numbers, models, units, locations, modifications, and hour ranges
 *
 * @param tableData - Array of maintenance details data objects to be filtered
 * @param searchQuery - String to search for across table columns (case-insensitive)
 * @param filters - Object containing all filter criteria from the filter schema
 * @param columns - Array of column configurations defining which columns are searchable
 * @returns Filtered array of maintenance details data objects
 */
export const useMaintDetailsTableFilter = ({
  tableData,
  searchQuery,
  filters,
  columns,
}: Props): IMaintenanceDetailsDto[] => {
  return useMemo(() => {
    // Return empty array if no data is provided
    if (!tableData) return [];

    return (
      tableData
        // First filter: Apply search query across all searchable columns
        .filter((row) => {
          // If no search query, include all rows
          if (!searchQuery) return true;

          // Check if search query matches any column value (case-insensitive)
          return columns.some((column) => {
            const cellValue = row[column.key as keyof IMaintenanceDetailsDto];
            return cellValue?.toString().toLowerCase().includes(searchQuery.toLowerCase());
          });
        })
        // Second filter: Apply all specified filter criteria
        .filter((row) => {
          const matchesSerial = filters.serialNumbers.length === 0 || filters.serialNumbers.includes(row.serial);
          const matchesModel = filters.models.length === 0 || filters.models.includes(row.model);
          const matchesInspection =
            filters.inspections.length === 0 || filters.inspections.includes(row.inspection_name);
          const matchesLane = filters.lanes.length === 0 || filters.lanes.includes(row.lane_name);
          const matchesResponsibleUnit = filters.units.length === 0 || filters.units.includes(row.responsible_unit);

          // Start date range filter
          const startDate = dayjs(row.start_date, DAYJS_DATE_FORMAT);
          const matchesStartDateFrom =
            !filters.startDateRange?.startDate ||
            startDate.isAfter(dayjs(filters.startDateRange?.startDate, DAYJS_DATE_FORMAT).subtract(1, 'day'));
          const matchesStartDateTo =
            !filters.startDateRange?.endDate ||
            startDate.isBefore(dayjs(filters.startDateRange?.endDate, DAYJS_DATE_FORMAT).add(1, 'day'));

          // End range filter
          const endDate = dayjs(row.end_date, DAYJS_DATE_FORMAT);
          const matchesEndDateFrom =
            !filters.endDateRange?.startDate ||
            endDate.isAfter(dayjs(filters.endDateRange?.startDate, DAYJS_DATE_FORMAT).subtract(1, 'day'));
          const matchesEndDateTo =
            !filters.endDateRange?.endDate ||
            endDate.isBefore(dayjs(filters.endDateRange?.endDate, DAYJS_DATE_FORMAT).add(1, 'day'));

          // Completion Status Filter
          const completionPercentage = row.status * 100; // Convert status to percentage
          const matchesCompletionStatus =
            !filters.isCompletionStatusChecked ||
            (completionPercentage >= filters.completionStatus[0] &&
              completionPercentage <= filters.completionStatus[1]);

          // Row must match ALL filter criteria
          return (
            matchesSerial &&
            matchesModel &&
            matchesInspection &&
            matchesLane &&
            matchesResponsibleUnit &&
            matchesStartDateFrom &&
            matchesStartDateTo &&
            matchesEndDateFrom &&
            matchesEndDateTo &&
            matchesCompletionStatus
          );
        })
    );
  }, [columns, filters, searchQuery, tableData]); // Dependencies for useMemo
};
