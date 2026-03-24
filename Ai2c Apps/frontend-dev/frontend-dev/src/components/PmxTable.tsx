import React, { useEffect, useState } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {
  Box,
  Collapse,
  Divider,
  IconButton,
  Skeleton,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  useTheme,
} from '@mui/material';

const StyledTable = styled(Table)({
  tableLayout: 'fixed',
});

const DropdownIndicator = styled('div')<{ sortdirection: 'asc' | 'desc'; active: boolean }>(
  ({ sortdirection, active }) => ({
    display: 'flex',
    alignItems: 'center',
    marginLeft: '8px',
    opacity: active ? 1 : 0,
    '& .MuiSvgIcon-root': {
      fontSize: '1.2rem',
      transform: sortdirection === 'desc' ? 'rotate(180deg)' : 'rotate(0)',
      transition: 'transform 200ms',
    },
  }),
);

export interface Column<T> {
  field: keyof T;
  header: string;
  width?: string | number;
  renderCell?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface PmxTableProps<T, U> {
  tableTitle?: string | React.ReactNode;
  titleBtn?: React.ReactNode;
  columns: Column<T>[];
  data: T[];
  highlightedRows?: Array<string | number>;
  isLoading?: boolean;
  getRowId: (row: T) => string | number;
  filters?: React.ReactNode;
  headerDialogs?: React.ReactNode;
  expandable?: boolean;
  expandableColumns?: Column<U>[];
  expandableData?: U[];
  getExpandedRowId?: (row: U) => string | number;
  tablePage?: number;
  tableRowsPerPage?: number;
  count?: number;
  enforceHeight?: boolean;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PmxTable<T extends object, U extends object>({
  columns,
  data,
  isLoading,
  getRowId,
  filters,
  headerDialogs,
  tableTitle,
  titleBtn,
  expandable = false,
  expandableColumns = [],
  expandableData = [],
  getExpandedRowId = () => '',
  tablePage,
  tableRowsPerPage,
  highlightedRows,
  count,
  enforceHeight = true,
  onPageChange,
  onRowsPerPageChange,
}: PmxTableProps<T, U>) {
  const theme = useTheme();
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({ '': false });

  useEffect(() => {
    // if sorting or filter reset table to first page to display correct data
    setPage(0);
  }, [data]);

  const isDateString = (value: string): boolean => {
    const d = new Date(value);
    return !isNaN(d.getTime());
  };

  const handleSort = (field: keyof T) => {
    setSortBy(field);
    setSortOrder(sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortBy) return 0;

    const aVal = a[sortBy];
    const bVal = b[sortBy];

    const aStr = String(aVal);
    const bStr = String(bVal);

    if (isDateString(aStr) && isDateString(bStr)) {
      const aDate = new Date(aStr).getTime();
      const bDate = new Date(bStr).getTime();
      return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
    }
    return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const currentPage = tablePage ?? page;
  const currentRowsPerPage = tableRowsPerPage ?? rowsPerPage;

  const paginatedData =
    tablePage !== undefined && tableRowsPerPage !== undefined
      ? sortedData // data already paginated from server, don’t slice again
      : sortedData.slice(currentPage * currentRowsPerPage, currentPage * currentRowsPerPage + currentRowsPerPage);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    const currentData: Record<string, boolean> = Object.fromEntries(paginatedData.map((row) => [getRowId(row), false]));

    setExpandedRows(currentData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const handleChangeExpanded = (row: T) => {
    setExpandedRows((prev) => ({ ...prev, [getRowId(row)]: !prev[getRowId(row)] }));
  };

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
      {/* Header Section */}
      {(tableTitle || filters || headerDialogs) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{tableTitle}</Typography>
            {titleBtn}
          </Box>
          {(filters || headerDialogs) && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              {filters}
              {headerDialogs}
            </Box>
          )}
        </Box>
      )}

      {/* Table Section */}
      <Box
        sx={{
          height: enforceHeight ? 'calc(100vh - 340px)' : '100%',
          maxHeight: 'calc(100vh - 340px)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <StyledTable stickyHeader>
          <TableHead>
            <TableRow
              sx={{ borderBottom: `2px solid ${theme.palette?.layout?.background12 ?? 'rgba(224, 224, 224, 1)'}` }}
            >
              {columns.map((column) => (
                <TableCell key={String(column.field)} style={{ width: column.width }}>
                  <TableSortLabel
                    active={sortBy === column.field}
                    direction={sortBy === column.field ? sortOrder : 'asc'}
                    onClick={() => handleSort(column.field)}
                    IconComponent={() => (
                      <DropdownIndicator
                        sortdirection={sortBy === column.field ? sortOrder : 'asc'}
                        active={sortBy === column.field}
                      >
                        <ArrowDropDownIcon />
                      </DropdownIndicator>
                    )}
                  >
                    {column.header}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <>
                {[...Array(rowsPerPage)].map((_, rowIndex) => (
                  <TableRow key={`row-${rowIndex}`}>
                    {columns.map((column, cellIndex) => (
                      <TableCell key={`${String(column.field)}-${cellIndex}`}>
                        <Skeleton variant="rectangular" height={40} animation="wave" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            )}
            {paginatedData.length === 0 && (
              <TableRow>
                {columns.map((column, idx) => (
                  <TableCell key={String(column.field)}>
                    {idx === 0 && <Typography>No results found.</Typography>}
                  </TableCell>
                ))}
              </TableRow>
            )}
            {paginatedData.map((row) => (
              <React.Fragment key={getRowId(row)}>
                <TableRow
                  {...(highlightedRows?.includes(getRowId(row)) && {
                    sx: {
                      backgroundColor: `${theme.palette.mode === 'light' ? theme.palette.primary.l60 : theme.palette.primary.d60} !important`,
                    },
                  })}
                >
                  {columns.map((column, index) => (
                    <TableCell key={String(column.field)}>
                      {index === 0 && expandable && (
                        <Box display="flex" alignItems="center">
                          <IconButton
                            sx={{ ml: -2 }}
                            onClick={() => {
                              handleChangeExpanded(row);
                            }}
                          >
                            {expandedRows[getRowId(row)] ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
                          </IconButton>
                          {column.renderCell
                            ? column.renderCell(row[column.field], row)
                            : String(row[column.field] || '--')}
                        </Box>
                      )}
                      {(index > 0 || !expandable) && (
                        <Box>
                          {column.renderCell
                            ? column.renderCell(row[column.field], row)
                            : String(row[column.field] || '--')}
                        </Box>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {expandable && <TableRow />}
                {expandable && (
                  <TableRow key={`${getRowId(row)}-expanded`}>
                    <TableCell colSpan={10} sx={{ p: 0 }}>
                      <Collapse
                        in={expandedRows[getRowId(row)]}
                        timeout="auto"
                        unmountOnExit
                        sx={{ width: '100%', px: 4, py: 5, background: `${theme.palette?.layout?.background5}` }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow
                              sx={{
                                borderBottom: `2px solid ${theme.palette?.layout?.background12 ?? 'rgba(224, 224, 224, 1)'}`,
                              }}
                            >
                              {expandableColumns.map((column) => (
                                <TableCell key={String(column.field)} style={{ width: column.width }}>
                                  {column.header}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {expandableData.filter((expandedRow) => getExpandedRowId(expandedRow) === getRowId(row))
                              .length === 0 && (
                              <TableRow>
                                {expandableColumns.map((column, idx) => (
                                  <TableCell key={String(column.field)}>
                                    {idx === 0 && <TableCell>No results found.</TableCell>}
                                  </TableCell>
                                ))}
                              </TableRow>
                            )}
                            {expandableData
                              .filter((expandedRow) => getExpandedRowId(expandedRow) === getRowId(row))
                              .map((expandedRow) => (
                                <TableRow
                                  key={getExpandedRowId(expandedRow)}
                                  sx={{ background: `${theme.palette.layout.base} !important` }}
                                >
                                  {expandableColumns.map((column) => (
                                    <TableCell key={String(column.field)}>
                                      {column.renderCell
                                        ? column.renderCell(expandedRow[column.field], expandedRow)
                                        : String(expandedRow[column.field] || '--')}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </StyledTable>
      </Box>

      {/* Pagination Section */}
      <Divider sx={{ borderColor: 'lightgrey', borderBottomWidth: '1px', opacity: '0.2' }} />
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={count ?? data.length}
        {...(tableRowsPerPage ? { rowsPerPage: tableRowsPerPage } : { rowsPerPage })}
        {...(tablePage ? { page: tablePage } : { page })}
        {...(onPageChange ? { onPageChange } : { onPageChange: handleChangePage })}
        {...(onRowsPerPageChange ? { onRowsPerPageChange } : { onRowsPerPageChange: handleChangeRowsPerPage })}
        sx={{
          borderTop: 'none',
          '.MuiTablePagination-toolbar': {
            minHeight: '52px',
          },
        }}
      />
    </Box>
  );
}
