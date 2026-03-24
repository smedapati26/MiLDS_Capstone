import React, { useState } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Box,
  Divider,
  Skeleton,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

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

export interface PmxTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  error?: FetchBaseQueryError | SerializedError | Error | null;
  getRowId: (row: T) => string | number;
  onSort?: (field: keyof T, direction: 'asc' | 'desc') => void;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  onPageChange?: (page: number) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  totalCount?: number;
}

export function PmxTable<T extends object>({
  columns,
  data,
  isLoading,
  error,
  getRowId,
  onSort,
  sortBy,
  sortOrder = 'asc',
  page = 0,
  onPageChange,
  rowsPerPage = 10,
  onRowsPerPageChange,
  totalCount = 0,
}: PmxTableProps<T>) {
  const [hoveredColumn, setHoveredColumn] = useState<keyof T | null>(null);

  const handleSort = (field: keyof T) => {
    if (onSort) {
      onSort(field, sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc');
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange?.(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange?.(parseInt(event.target.value, 10));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <StyledTable stickyHeader>
          <TableHead>
            <TableRow sx={{ borderBottom: '2px solid rgba(224, 224, 224, 1)' }}>
              {columns.map((column) => (
                <TableCell key={String(column.field)} style={{ width: column.width }}>
                  <TableSortLabel
                    active={sortBy === column.field}
                    direction={sortBy === column.field ? sortOrder : 'asc'}
                    onClick={() => handleSort(column.field)}
                    onMouseEnter={() => setHoveredColumn(column.field)}
                    onMouseLeave={() => setHoveredColumn(null)}
                    IconComponent={() => (
                      <DropdownIndicator
                        sortdirection={sortBy === column.field ? sortOrder : 'asc'}
                        active={sortBy === column.field || hoveredColumn === column.field}
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
            {isLoading && !data.length && (
              <>
                {[...Array(rowsPerPage)].map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((column, cellIndex) => (
                      <TableCell key={`${String(column.field)}-${cellIndex}`}>
                        <Skeleton variant="rectangular" height={40} animation="wave" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={columns.length}>Error loading data</TableCell>
              </TableRow>
            )}
            {data.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((column) => (
                  <TableCell key={String(column.field)}>
                    {column.renderCell ? column.renderCell(row[column.field], row) : String(row[column.field] || '--')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </Box>
      <Divider sx={{ borderColor: 'lightgrey', borderBottomWidth: '1px', opacity: '0.2' }} />
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
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
