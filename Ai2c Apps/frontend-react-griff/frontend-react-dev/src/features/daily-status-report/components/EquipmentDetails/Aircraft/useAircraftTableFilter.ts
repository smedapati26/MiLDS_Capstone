import { useMemo } from 'react';

import { ColumnConfig } from '@components/data-tables';
import { getBasicOrStatus } from '@models/OperationalReadinessStatusEnum';

import { TableOverrideType } from './AircraftTable';
import { AircraftFilterSchemaType } from './schema';

interface UseAircraftTableFilterProps {
  tableData: TableOverrideType[] | undefined;
  searchQuery: string;
  filters: AircraftFilterSchemaType;
  columns: Array<ColumnConfig<TableOverrideType>>;
}

/**
 * Custom hook for filtering aircraft table data based on search query and various filter criteria.
 *
 * This hook applies two levels of filtering:
 * 1. Text-based search across specified columns
 * 2. Multi-criteria filters including status, serial numbers, models, units, locations, modifications, and hour ranges
 *
 * @param tableData - Array of aircraft data objects to be filtered
 * @param searchQuery - String to search for across table columns (case-insensitive)
 * @param filters - Object containing all filter criteria from the filter schema
 * @param columns - Array of column configurations defining which columns are searchable
 * @returns Filtered array of aircraft data objects
 */
export const useAircraftTableFilter = ({
  tableData,
  searchQuery,
  filters,
  columns,
}: UseAircraftTableFilterProps): TableOverrideType[] => {
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
            const cellValue = row[column.key as keyof TableOverrideType];
            return cellValue?.toString().toLowerCase().includes(searchQuery.toLowerCase());
          });
        })
        // Second filter: Apply all specified filter criteria
        .filter((row) => {
          // Filter by launch status (RTL - Ready to Launch)
          const matchesStatus = !filters.launchStatus || filters.launchStatus === row.rtl;

          // Filter by operational readiness status
          const matchesOrStatus = !filters.orStatus || filters.orStatus == getBasicOrStatus(row.status);

          // Filter by selected serial numbers (include if no serials selected or serial matches)
          const matchesSerialNumbers =
            filters.serialNumbers.length === 0 || filters.serialNumbers.includes(row.serialNumber);

          // Filter by selected aircraft models
          const matchesModels = filters.models.length === 0 || filters.models.includes(row.model);

          // Filter by selected owning units
          const matchesUnits = filters.units.length === 0 || filters.units.includes(row.currentUnitName);

          // Filter by selected locations
          const matchesLocations = filters.location.length === 0 || filters.location.includes(row.location);

          // Filter by selected modifications (converted to string for comparison)
          const matchesModifications =
            filters.modifications.length === 0 ||
            row.modifications.some((mod) => filters.modifications.includes(mod.modType));

          // Filter by flying hours range (only if checkbox is checked)
          const matchesHoursFlownRange =
            !filters.isHoursFlownChecked || // If not checked, include all
            (Number(row.flyingHours) >= filters.hoursFlown[0] && Number(row.flyingHours) <= filters.hoursFlown[1]);

          // Filter by hours to phase range (only if checkbox is checked)
          const matchesHoursToPhaseRange =
            !filters.isHoursToPhaseChecked || // If not checked, include all
            (Number(row.hoursToPhase) >= filters.hoursToPhase[0] &&
              Number(row.hoursToPhase) <= filters.hoursToPhase[1]);

          // Row must match ALL filter criteria
          return (
            matchesStatus &&
            matchesOrStatus &&
            matchesSerialNumbers &&
            matchesModels &&
            matchesUnits &&
            matchesLocations &&
            matchesModifications &&
            matchesHoursFlownRange &&
            matchesHoursToPhaseRange
          );
        })
    );
  }, [columns, filters, searchQuery, tableData]); // Dependencies for useMemo
};
