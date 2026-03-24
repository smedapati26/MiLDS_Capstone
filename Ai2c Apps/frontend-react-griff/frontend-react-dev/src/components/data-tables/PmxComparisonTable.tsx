import React, { CSSProperties } from 'react';

import {
  Box,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';

import { ColumnConfig } from '@components/data-tables';

interface PmxComparisonTableBaseProps<T> {
  rows: T[];
  comparativeRows: T[];
  columns: ColumnConfig<T>[];
  sx?: CSSProperties;
}

/**
 * Represents the styled section title for the PMX Section Table.
 */
export const SectionTitle = styled(Box)(({ theme }) => {
  return {
    padding: theme.spacing(4),
    width: '100%',
    backgroundColor: theme.palette.layout.background15,
  };
});

/** Base For PmxComparisonTable, based off of PmxTable but supports comparative colors.*/
const PmxComparisonTableBase = <T extends object>(props: PmxComparisonTableBaseProps<T>): JSX.Element => {
  const { rows, comparativeRows, columns, sx } = props;
  const theme = useTheme();

  return (
    <>
      {/* Main table container with Material-UI Paper component for elevation */}
      <TableContainer component={Paper} {...(sx && { sx })}>
        <Table>
          {/* Table header section */}
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={String(column.key)} sx={{ width: column.minWidth }}>
                  {column?.renderHeader ? column.renderHeader() : column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {/* Table body section with data rows */}
          <TableBody>
            {rows.map((row, rowIndex) => {
              const comparativeRow = comparativeRows[rowIndex];
              return (
                <TableRow key={`${rowIndex}-${rowIndex + 1}`}>
                  {columns.map((column, columnIndex) => (
                    <TableCell key={String(column.key)}>
                      {/* Update styling for rows that are different */}
                      {row[column.key] !== comparativeRow[column.key] ? (
                        <Typography
                          variant="body2"
                          sx={{ color: theme.palette.primary.d20 }}
                          data-testid={`${rowIndex}-${columnIndex}-diff`}
                        >
                          {column.render ? column.render(row[column.key], row) : String(row[column.key])}
                        </Typography>
                      ) : column.render ? (
                        column.render(row[column.key], row)
                      ) : (
                        String(row[column.key])
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export interface PmxComparisonTableProps<T> {
  data: T[] | Record<string, T[]>; // supports normal table or sectioned table
  comparativeData: T[] | Record<string, T[]>; // supports normal table or sectioned table
  columns: ColumnConfig<T>[] | Record<string, ColumnConfig<T>[]>;
  keyTitleMapping?: Record<string, React.ReactNode>; // optional for user controlled sections
  sectioned: boolean; //controls whether table is PmxSectionedTable or PmxPaginatedTable
  width?: string;
}

/**
 * Pmx styled table that groups and expands tables based on dictionary of data,
 * where the key is the section header and the item is the data of the table.
 * @param {PmxComparisonTableProps<T>} props - props containing parameters to populate comparison table
 * @param {T[] | Record<string, T[]>} props.data - data to show in the row of the table
 * @param {T[] | Record<string, T[]>} props.comparitcomparativeDataiveData - data to compare the row to, should mirror data
 * @param {ColumnConfig<T>[] | Record<string, ColumnConfig<T>[]>} props.columns - info about each column, the header, the way render cells of that column, and how to render that column. Can be a dictionary for each table in section, where key is the key of the table
 * @param {Record<string, React.ReactNode>} props.keyTitleMapping - optional for users to control how sections looks
 * @returns JSX.Element
 */

const PmxComparisonTable = <T extends object>(props: PmxComparisonTableProps<T>): JSX.Element => {
  const { data, comparativeData, columns, keyTitleMapping, sectioned, width = '100%' } = props;

  return (
    <Box data-testid="pmx-comparison-table" width={width}>
      {sectioned ? (
        Object.entries(data as Record<string, T[]>).map(([key, rows]) => {
          // Set columns to static array or dynamic array based on key
          const tableColumns = Array.isArray(columns) ? columns : columns[key];
          const comparativeRows = (comparativeData as Record<string, T[]>)[key];

          return (
            <>
              <SectionTitle key={String(keyTitleMapping?.[key] || key)}>{keyTitleMapping?.[key] || key}</SectionTitle>
              <PmxComparisonTableBase
                columns={tableColumns as ColumnConfig<T>[]}
                rows={rows}
                comparativeRows={comparativeRows}
              />
            </>
          );
        })
      ) : (
        <>
          <PmxComparisonTableBase
            columns={columns as ColumnConfig<T>[]}
            rows={data as T[]}
            comparativeRows={comparativeData as T[]}
          />
        </>
      )}
    </Box>
  );
};

export default PmxComparisonTable;
