import {
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';

import { Column } from '@components/PmxTable';

type PmxTableBasicProps<T extends object> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
};

const PmxTableBasic = <T extends object>({
  columns,
  data,
  loading = false,
}: PmxTableBasicProps<T>): React.JSX.Element => {
  const skeletonRows = Array.from({ length: 5 });
  const theme = useTheme();
  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: 'transparent',
        boxShadow: 'none',
      }}
    >
      <Table
        sx={{
          minWidth: 650,
          backgroundColor: 'transparent',
          '& thead th': {
            backgroundColor: `${theme.palette.layout.background11} !important`,
            fontWeight: 600,
            borderBottom: 'none',
          },
          '& tbody td': {
            backgroundColor: `${theme.palette.layout.background11} !important`,
            borderBottom: 'none',
          },
          '& tbody tr': {
            backgroundColor: `${theme.palette.layout.background11} !important`,
          },
          '& tbody tr:nth-of-type(even)': {
            backgroundColor: `${theme.palette.layout.background11} !important`,
          },
          '& tbody tr:hover': {
            backgroundColor: `${theme.palette.layout.background11} !important`,
          },
        }}
        aria-label="pmx basic table"
      >
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={String(column.header)} align="left">
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? skeletonRows.map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columns.map((_column, colIndex) => (
                    <TableCell key={`skeleton-cell-${colIndex}`} align="left">
                      <Skeleton role="progressbar" variant="text" width="80%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={String(column.field)} align="left">
                      {column.renderCell
                        ? column.renderCell(row[column.field], row)
                        : String(row[column.field] ?? '--')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PmxTableBasic;
