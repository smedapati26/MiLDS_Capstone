import { useMemo } from 'react';

import { ColumnConfig } from '@components/data-tables';
import { LaunchStatusEnum } from '@models/LaunchStatusEnum';

import { IUAS } from '@store/griffin_api/uas/models/IUAS';

import { UACFilterSchemaType } from './schema';

interface Props {
  tableData: IUAS[] | undefined;
  searchQuery: string;
  filters: UACFilterSchemaType;
  columns: Array<ColumnConfig<IUAS>>;
}

/**
 * Custom hook for filtering agse table data based on search query and various filter criteria.
 *
 * This hook applies two levels of filtering:
 * 1. Text-based search across specified columns
 * 2. Multi-criteria filters including status, serial numbers, models, units, locations, modifications, and hour ranges
 *
 * @param tableData - Array of agse data objects to be filtered
 * @param searchQuery - String to search for across table columns (case-insensitive)
 * @param filters - Object containing all filter criteria from the filter schema
 * @param columns - Array of column configurations defining which columns are searchable
 * @returns Filtered array of agse data objects
 */
export const useUacTableFilter = ({ tableData, searchQuery, filters, columns }: Props): IUAS[] => {
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
            const cellValue = row[column.key as keyof IUAS];
            return cellValue?.toString().toLowerCase().includes(searchQuery.toLowerCase());
          });
        })
        // Second filter: Apply all specified filter criteria
        .filter((row) => {
          // Filter by operational readiness conditions
          const matchesStatus = !filters.status || filters.status === row.displayStatus;

          // Filter by operational readiness conditions
          const matchesLaunchStatus =
            !filters.launchStatus || filters.launchStatus == LaunchStatusEnum.ALL || filters.launchStatus === row.rtl;

          // Filter by selected serial numbers (include if no serials selected or serial matches)
          const matchesSerialNumbers =
            filters.serialNumbers.length === 0 || filters.serialNumbers.includes(row.serialNumber);

          // Filter by selected agse models
          const matchesModels = filters.models.length === 0 || filters.models.includes(row.model);

          // Filter by selected owning units
          const matchesUnits = filters.units.length === 0 || filters.units.includes(row.currentUnit);

          // Filter by selected locations
          const matchesLocations =
            filters.location.length === 0 || filters.location.includes(row.locationCode as string);

          // Row must match ALL filter criteria
          return (
            matchesSerialNumbers &&
            matchesModels &&
            matchesStatus &&
            matchesLaunchStatus &&
            matchesUnits &&
            matchesLocations
          );
        })
    );
  }, [columns, filters, searchQuery, tableData]); // Dependencies for useMemo
};
