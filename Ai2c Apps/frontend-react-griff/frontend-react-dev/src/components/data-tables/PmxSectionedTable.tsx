import React, { useMemo, useState } from 'react';

import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
} from '@mui/material';

import { ColumnConfig } from './PmxTable';

export interface PmxSectionedTableProps<T> {
  data: Record<string, T[]>; // dictionary where key is the Accordion title, item is the data as T
  columns: ColumnConfig<T>[] | Record<string, ColumnConfig<T>[]>;
  keyTitleMapping?: Record<string, React.ReactNode>; // optional for user controlled titles
  isPaginated?: boolean; // Used for determining pagination
  isLoading?: boolean; // Used for determining page loading
  repeatColumnHeader?: boolean; // Used for determining if column labels repeat for each section
  noDataMessage?: string; // Used for empty state display
}

type DetailedRow<T> = { type: 'header'; key: string } | { type: 'row'; key: string; row: T };

/**
 * Pmx styled table that groups and expands tables based on dictionary of data,
 * where the key is the section header and the item is the data of the table.
 * @param {PmxSectionedTableProps<T>} props - props containing parameters to populate sectioned table
 * @param {Record<string, T[]>} props.data - data to show in the row of the table
 * @param {ColumnConfig<T>[] | Record<string, ColumnConfig<T>[]>} props.columns - info about each column, the header, the way render cells of that column, and how to render that column. Can be a dictionary for each table in section, where key is the key of the table
 * @param {Record<string, React.ReactNode>} props.keyTitleMapping - optional for users to control how sections looks
 * @returns JSX.Element
 */

const PmxSectionedTable = <T extends object>(props: PmxSectionedTableProps<T>): JSX.Element => {
  const {
    data,
    columns,
    keyTitleMapping,
    isPaginated = false,
    isLoading = false,
    repeatColumnHeader = true,
    noDataMessage = 'No data.',
  } = props;

  // State for tracking the current page number (0-indexed)
  const [page, setPage] = useState<number>(0);
  // State for tracking how many rows to display per page
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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
   * Calculate the flattened rows
   */
  const allDataRows: DetailedRow<T>[] = useMemo(() => {
    const allDataRows: DetailedRow<T>[] = [];

    Object.entries(data).forEach(([key, rows]) => {
      rows.forEach((row) => {
        allDataRows.push({ type: 'row', key: key, row: row });
      });
    });

    return allDataRows;
  }, [data]);

  /**
   * Calculate the subset of rows to display on the current page
   * Uses array slicing based on current page and rows per page settings
   */
  const paginatedRows: DetailedRow<T>[] = useMemo(() => {
    const paginatedTableRows: DetailedRow<T>[] = [];
    let currentHeaderKey: string | undefined;

    // Slice the data rows to get only the data for the current page
    const paginatedDataRows = isPaginated
      ? allDataRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : allDataRows;

    // Add section headers based on unique keys and all row data
    paginatedDataRows.forEach((item) => {
      if (item.key !== currentHeaderKey) {
        currentHeaderKey = item.key;
        paginatedTableRows.push({ type: 'header', key: currentHeaderKey });
      }

      paginatedTableRows.push(item);
    });

    return paginatedTableRows;
  }, [allDataRows, isPaginated, page, rowsPerPage]);

  return (
    <Box data-testid="pmx-sectioned-table">
      <TableContainer component={Paper} sx={{ m: 0 }}>
        <Table>
          <TableBody>
            {paginatedRows.length > 0
              ? paginatedRows.map((item, index) => {
                  const tableColumns = Array.isArray(columns) ? columns : columns[item.key];

                  // Section Headers
                  if (item.type === 'header') {
                    return (
                      <>
                        {/* Single Column Header Row */}
                        {!repeatColumnHeader && index === 0 && (
                          <TableRow key={`section-${keyTitleMapping?.[item.key] || item.key}`}>
                            <TableCell key={`cell-${keyTitleMapping?.[item.key] || item.key}`} sx={{ p: 0 }}>
                              <Box
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns: `repeat(${tableColumns.length}, 1fr)`,
                                  backgroundColor: (theme) => theme.palette.layout.background15,
                                }}
                                alignItems={'center'}
                              >
                                {tableColumns.map((column) => (
                                  <Box
                                    key={`cell-${String(column.key)}`}
                                    sx={{ mx: 2, my: 4, minWidth: column.minWidth }}
                                  >
                                    {column?.renderHeader ? column.renderHeader() : column.label}
                                  </Box>
                                ))}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}

                        {/* Section Header Row */}
                        <TableRow key={`columns-${keyTitleMapping?.[item.key] || item.key}`}>
                          <TableCell
                            colSpan={tableColumns.length}
                            sx={{ backgroundColor: (theme) => theme.palette.layout.background15, p: 4 }}
                          >
                            {keyTitleMapping?.[item.key] || item.key}
                          </TableCell>
                        </TableRow>

                        {/* Repeating Column Header Rows for each Section */}
                        {repeatColumnHeader && (
                          <TableRow key={`section-${keyTitleMapping?.[item.key] || item.key}`}>
                            <TableCell sx={{ p: 0 }}>
                              <Box
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns: `repeat(${tableColumns.length}, 1fr)`,
                                }}
                              >
                                {tableColumns.map((column) => (
                                  <Box key={String(column.key)} sx={{ mx: 2, my: 4, minWidth: column.minWidth }}>
                                    {column?.renderHeader ? column.renderHeader() : column.label}
                                  </Box>
                                ))}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  } else {
                    // Data Rows
                    return (
                      <>
                        {isLoading ? (
                          <>
                            <TableRow key={`skeleton-row-${index}`}>
                              <TableCell key={`skeleton-cell-${index}`} colSpan={tableColumns.length}>
                                <Skeleton variant="rectangular" height={40} animation="wave" />
                              </TableCell>
                            </TableRow>
                          </>
                        ) : (
                          <>
                            <TableRow key={`row-${index}-${index + 1}`}>
                              <TableCell sx={{ p: 0 }}>
                                <Box
                                  sx={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${tableColumns.length}, 1fr)`,
                                  }}
                                >
                                  {tableColumns.map((column) => (
                                    <Box key={String(column.key)} sx={{ mx: 2, my: 4 }}>
                                      {column.render
                                        ? column.render(item.row[column.key], item.row)
                                        : String(item.row[column.key])}
                                    </Box>
                                  ))}
                                </Box>
                              </TableCell>
                            </TableRow>
                          </>
                        )}
                      </>
                    );
                  }
                })
              : (() => {
                  // No Data
                  const tableColumns = Array.isArray(columns)
                    ? columns
                    : Object.values(columns).length > 0
                      ? Object.values(columns)[0]
                      : [];

                  return (
                    <>
                      <TableRow key={`section-no-data`}>
                        <TableCell key={`cell-no-data`} sx={{ p: 0 }}>
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: `repeat(${tableColumns.length}, 1fr)`,
                              backgroundColor: (theme) => theme.palette.layout.background15,
                            }}
                            alignItems={'center'}
                          >
                            {tableColumns.map((column) => (
                              <Box key={`cell-${String(column.key)}`} sx={{ mx: 2, my: 4, minWidth: column.minWidth }}>
                                {column?.renderHeader ? column.renderHeader() : column.label}
                              </Box>
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow key={'row-no-data'}>
                        <TableCell key={'col-no-data'} colSpan={Array.isArray(columns) ? columns.length : undefined}>
                          {noDataMessage}
                        </TableCell>
                      </TableRow>
                    </>
                  );
                })()}
          </TableBody>
        </Table>
        {/* Pagination controls */}
        {isPaginated && paginatedRows.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={allDataRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </TableContainer>
    </Box>
  );
};

export default PmxSectionedTable;
