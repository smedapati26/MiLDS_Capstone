import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import {
  Checkbox,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  useTheme,
} from '@mui/material';
import { CSSProperties } from '@mui/material/styles/createMixins';

/**
 * Type definition for sort order direction
 * Used to determine whether data should be sorted in ascending or descending order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Configuration interface for table columns
 * Defines how each column should be displayed and behave
 *
 * @template T - The type of data objects in the table rows
 */
export interface ColumnConfig<T> {
  /** The key from the data object that this column represents */
  key: keyof T;
  /** Display label for the column header */
  label: string;
  /** Optional minimum width for the column */
  minWidth?: string;
  /** Optional custom render function for cell content */
  render?: (value: T[keyof T], row?: T) => React.ReactNode;
  /** Optional custom render function for column header */
  renderHeader?: () => React.ReactNode;
  /** Whether this column can be sorted */
  sortable?: boolean;
  /** Will hide column and row content @see PmxCollapsibleTreeTable */
  hide?: boolean;
}

/**
 * Props interface for the PmxTable component
 *
 * @template T - The type of data objects in the table rows
 */
export interface PmxTableProps<T> {
  /** Array of data objects to display in the table */
  rows: T[];
  /** Configuration for each column in the table */
  columns: ColumnConfig<T>[];
  /** Optional custom styles to apply to the table container */
  sx?: CSSProperties;
  /** Paginate boolean adds pagination to the table */
  paginate?: boolean;
  /** Rows per page */
  limit?: number;
  /** Is loading indicator */
  isLoading?: boolean;
  /** Size for condensed table */
  size?: 'small' | 'medium';
  /* for highlighting a row */
  highLightedKeys?: string[];
  highlightColumnKey?: keyof T | undefined;
  /** Enable row selection with checkboxes */
  selectable?: boolean;
  /** Selected rows when handled outside of component */
  selectedRows?: T[];
  /** Callback when selection changes */
  onSelectionChange?: (selectedRows: T[]) => void;
}

/**
 * PmxTable - A reusable paginated table component with sorting functionality
 *
 * This component provides a Material-UI based table with the following features:
 * - Pagination with configurable rows per page
 * - Column sorting for strings, numbers, and dayjs date objects
 * - Custom cell and header rendering
 * - Responsive design with Material-UI Paper container
 *
 * @template T - The type of data objects in the table rows
 * @param props - The component props
 * @returns A paginated table component
 */
export const PmxTable = <T,>({
  rows,
  columns,
  sx,
  paginate = false,
  isLoading = false,
  size = 'medium',
  limit = 25,
  highLightedKeys = [],
  highlightColumnKey,
  selectable = false,
  selectedRows,
  onSelectionChange,
}: PmxTableProps<T>) => {
  // State for tracking which column is currently being sorted
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  // State for tracking the sort direction (ascending or descending)
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  // State for storing the sorted data array
  const [sortedRows, setSortedRows] = useState<T[]>([]);
  // State for tracking the current page number (0-indexed)
  const [page, setPage] = useState<number>(0);
  // State for tracking how many rows to display per page
  const [rowsPerPage, setRowsPerPage] = useState<number>(limit);
  // State for selected rows if not controlled
  const [currentSelectedRows, setCurrentSelectedRows] = useState<T[]>(selectedRows ? selectedRows : []);

  // Theming
  const { palette } = useTheme();
  const selectColor = palette.mode === 'dark' ? palette.primary.d60 : palette.primary.l60;

  /**
   * Compares two string values for sorting
   * Uses localeCompare for proper string comparison with locale support
   *
   * @param valueA - First string to compare
   * @param valueB - Second string to compare
   * @param sortOrder - Direction of sort (asc/desc)
   * @returns Comparison result (-1, 0, or 1)
   */
  const compareStrings = (valueA: string, valueB: string, sortOrder: SortOrder) =>
    sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);

  /**
   * Compares two numeric values for sorting
   *
   * @param valueA - First number to compare
   * @param valueB - Second number to compare
   * @param sortOrder - Direction of sort (asc/desc)
   * @returns Comparison result (negative, 0, or positive)
   */
  const compareNumbers = (valueA: number, valueB: number, sortOrder: SortOrder) =>
    sortOrder === 'asc' ? valueA - valueB : valueB - valueA;

  /**
   * Compares two dayjs date objects for sorting
   * Uses dayjs methods for proper date comparison
   *
   * @param valueA - First dayjs object to compare
   * @param valueB - Second dayjs object to compare
   * @param sortOrder - Direction of sort (asc/desc)
   * @returns Comparison result (-1 or 1)
   */
  const compareDayjs = (valueA: dayjs.Dayjs, valueB: dayjs.Dayjs, sortOrder: SortOrder) => {
    if (sortOrder === 'asc') {
      return valueA.isBefore(valueB) ? -1 : 1;
    } else {
      return valueA.isAfter(valueB) ? -1 : 1;
    }
  };

  /**
   * Sorts the data array based on the specified column and sort order
   * Handles different data types: strings, numbers, and dayjs objects
   *
   * @param data - Array of data objects to sort
   * @param sortBy - The column key to sort by
   * @param sortOrder - Direction of sort (asc/desc)
   * @returns Sorted array of data objects
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sortData = (data: T[], sortBy: keyof T, sortOrder: SortOrder) => {
    return data.sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];

      // Handle undefined values by treating them as equal
      if (valueA === undefined || valueB === undefined) return 0;

      // Sort strings using locale-aware comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return compareStrings(valueA, valueB, sortOrder);
      }

      // Sort numbers using numeric comparison
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return compareNumbers(valueA, valueB, sortOrder);
      }

      // Sort dayjs objects using date comparison
      if (dayjs.isDayjs(valueA) && dayjs.isDayjs(valueB)) {
        return compareDayjs(valueA as dayjs.Dayjs, valueB as dayjs.Dayjs, sortOrder);
      }

      // Default case: treat as equal if type is not supported
      return 0;
    });
  };

  /**
   * Effect hook to update sorted rows whenever the data or sorting parameters change
   * Creates a copy of the rows array to avoid mutating the original data
   */
  useEffect(() => {
    if (sortBy) {
      // Sort the data if a sort column is selected
      setSortedRows(sortData([...rows], sortBy, sortOrder));
    } else {
      // Use original order if no sorting is applied
      setSortedRows(rows);
    }
  }, [rows, sortBy, sortOrder, sortData]);

  /**
   * Handles sort requests when a column header is clicked
   * Toggles between ascending and descending order for the same column
   *
   * @param columnKey - The key of the column to sort by
   */
  const handleSortRequest = (columnKey: keyof T) => {
    const isAsc = sortBy === columnKey && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(columnKey);
  };

  /**
   * Handles page change events from the pagination component
   *
   * @param event - The event object (unused)
   * @param newPage - The new page number to navigate to
   */
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  /**
   * Handles changes to the rows per page setting
   * Resets to the first page when changing rows per page
   *
   * @param event - The input change event containing the new value
   */
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  };

  /**
   * Calculate the subset of rows to display on the current page
   * Uses array slicing based on current page and rows per page settings
   */
  const paginatedRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  /**
   * Handles selecting/deselecting all rows on the current page
   */
  const handleSelectAll = () => {
    // Validates any row changes prior to filtering
    const currentRows = currentSelectedRows.filter((row) => rows.includes(row));
    let newSelected: T[];

    if (currentRows.length === 0) {
      // Select all on current page
      newSelected = [...new Set([...paginatedRows])];
    } else if (currentRows.some((row) => paginatedRows.includes(row))) {
      // Deselect all on current page
      newSelected = currentRows.filter((row) => !paginatedRows.includes(row));
    } else {
      // Select all on current page
      newSelected = [...new Set([...paginatedRows])];
    }

    if (onSelectionChange) {
      onSelectionChange(newSelected);
    }

    newSelected = selectedRows ? selectedRows : newSelected;
    setCurrentSelectedRows(newSelected);
  };

  /**
   * Handles selecting/deselecting a single row
   */
  const handleSelectRow = (row: T) => {
    // Validates any row changes prior to filtering
    const currentRows = currentSelectedRows.filter((row) => rows.includes(row));

    let newSelected = currentRows.includes(row)
      ? currentRows.filter((selectedRow) => selectedRow !== row)
      : [...currentRows, row];

    if (onSelectionChange) onSelectionChange(newSelected);

    newSelected = selectedRows ? selectedRows : newSelected;
    setCurrentSelectedRows(newSelected);
  };

  /** Watches for row data changes and removes selected */
  useEffect(() => {
    setCurrentSelectedRows(selectedRows ? selectedRows : []);
  }, [rows, selectedRows]);

  /**
   * Check if all rows on current page are selected
   */
  const isAllSelected = paginatedRows.every((row) => {
    return currentSelectedRows.includes(row);
  });

  /**
   * Check if some (but not all) rows on current page are selected
   */
  const isIndeterminate =
    paginatedRows.some((row) => {
      return currentSelectedRows.includes(row);
    }) && !isAllSelected;

  return (
    <>
      {/* Main table container with Material-UI Paper component for elevation */}
      <TableContainer component={Paper} {...(sx && { sx })}>
        <Table data-testid="pmx-table" size={size}>
          {/* Table header section */}
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected && rows.length !== 0}
                    onChange={handleSelectAll}
                    onClick={(event) => event.stopPropagation()}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={String(column.key)} sx={{ minWidth: column.minWidth }}>
                  {/* Render sortable column headers with sort controls */}
                  {column.sortable && (
                    <TableSortLabel
                      active={sortBy === column.key}
                      direction={sortOrder}
                      onClick={() => handleSortRequest(column.key)}
                    >
                      {/* Use custom header renderer if provided, otherwise use label */}
                      {column.renderHeader ? column.renderHeader() : column.label}
                    </TableSortLabel>
                  )}
                  {/* Render non-sortable column headers */}
                  {!column.sortable && (column?.renderHeader ? column.renderHeader() : column.label)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {/* Table body section with data rows */}
          <TableBody>
            {/** Is Loading*/}
            {isLoading && (
              <>
                {[...Array(rowsPerPage)].map((_, index) => (
                  <TableRow key={`skeleton-row-${index}`}>
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Skeleton variant="rectangular" height={size === 'small' ? 20 : 40} animation="wave" />
                      </TableCell>
                    )}
                    {[...Array(columns.length)].map((_, index) => (
                      <TableCell key={`skeleton-cell-${index}`}>
                        <Skeleton variant="rectangular" height={size === 'small' ? 20 : 40} animation="wave" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            )}

            {/** No Data */}
            {!isLoading && rows.length == 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)}>No data</TableCell>
              </TableRow>
            )}

            {!isLoading &&
              paginatedRows.map((row, rowIndex) => {
                // Generate unique key for each row using row index
                const uniqueKey = highlightColumnKey ? `${row[highlightColumnKey]}` : `${rowIndex}-${rowIndex + 1}`;

                return (
                  <TableRow
                    key={uniqueKey}
                    sx={{
                      backgroundColor: highLightedKeys.includes(uniqueKey) ? `${selectColor} !important` : 'inherit',
                    }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox checked={currentSelectedRows.includes(row)} onChange={() => handleSelectRow(row)} />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {/* Use custom cell renderer if provided, otherwise convert value to string */}
                        {column.render ? column.render(row[column.key], row) : String(row[column.key])}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        {/* Pagination controls */}
        {paginate && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]} // Available options for rows per page
            component="div"
            count={rows.length} // Total number of rows (not paginated rows)
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            size={size}
          />
        )}
      </TableContainer>
    </>
  );
};

export default PmxTable;
