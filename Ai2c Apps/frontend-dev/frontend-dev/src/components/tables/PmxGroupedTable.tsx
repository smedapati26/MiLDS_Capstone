import { Fragment, useEffect, useRef, useState } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {
  Box,
  Checkbox,
  Divider,
  IconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';

import { Column } from '@components/PmxTable';

export type PmxGroupData<T extends object> = Array<{
  id: string;
  label: React.ReactNode;
  children: T[];
}>;

type PmxGroupedTableProps<T extends object> = {
  data: Array<{
    id: string;
    label: React.ReactNode;
    children: T[];
  }>;
  columns: Column<T>[];
  isExpandable?: boolean;
  selectableRows?: boolean;
  selectedRows?: T[];
  loading?: boolean;
  onSelectionChange?: (selected: T[]) => void;
};

// Extend Column type to support sorting
declare module '@components/PmxTable' {
  interface Column<T> {
    sortable?: boolean;
    sortFn?: (a: T, b: T) => number;
  }
}

export function PmxGroupedTable<T extends object>({
  data,
  columns,
  isExpandable = true,
  selectableRows = false,
  selectedRows = [],
  loading = false,
  onSelectionChange,
}: PmxGroupedTableProps<T>) {
  const theme = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(data?.map((g) => [g.id, true]) ?? []),
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const paginatedGroups = data?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const [visibleChildrenCount, setVisibleChildrenCount] = useState<Record<string, number>>(
    Object.fromEntries(paginatedGroups?.map((g) => [g.id, 20]) ?? []),
  );

  const allChildren = paginatedGroups?.flatMap((g) => g.children.slice(0, visibleChildrenCount[g.id] || 0)) ?? [];

  // Sorting state
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortChildren = (children: T[]) => {
    if (!sortField) return children;

    const col = columns.find((c) => c.field === sortField);
    const sorted = [...children];

    sorted.sort((a, b) => {
      if (col?.sortFn) {
        return sortDirection === 'asc' ? col.sortFn(a, b) : col.sortFn(b, a);
      }

      const valA = a[sortField];
      const valB = b[sortField];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const isRowSelected = (row: T) => selectedRows.includes(row);

  const toggleRowSelection = (row: T) => {
    const isSelected = isRowSelected(row);
    const updated = isSelected ? selectedRows.filter((r) => r !== row) : [...selectedRows, row];
    onSelectionChange?.(updated);
  };

  const isAllSelected = selectedRows.length === allChildren.length;
  const isIndeterminate = selectedRows.length > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    const updated = isAllSelected ? [] : [...allChildren];
    onSelectionChange?.(updated);
  };

  const toggleGroup = (id: string) => {
    if (isExpandable) {
      setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const getRowColor = (idx: number) => (idx % 2 === 0 ? theme.palette.layout?.background5 : theme.palette.layout?.base);

  useEffect(() => {
    setVisibleChildrenCount((prev) => {
      let changed = false;
      const updated = { ...prev };

      paginatedGroups?.forEach((group) => {
        if (!(group.id in updated)) {
          updated[group.id] = 20;
          changed = true;
        }
      });

      return changed ? updated : prev;
    });
  }, [paginatedGroups]);

  const incrementVisibleCount = (group: (typeof paginatedGroups)[number], current: number): number => {
    const max = group.children.length;
    if (current >= max) return current;
    return Math.min(current + 20, max);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (nearBottom) {
        setVisibleChildrenCount((prev) => {
          const updated = { ...prev };
          for (const group of paginatedGroups) {
            const current = updated[group.id] ?? 20;
            updated[group.id] = incrementVisibleCount(group, current);
          }
          return updated;
        });
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginatedGroups]);

  return (
    <Box>
      <Box ref={scrollRef} sx={{ height: 300, overflowY: 'auto' }} aria-label="Unit Roster Table">
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: `${theme.palette.layout?.background16} !important` }}>
              {selectableRows && (
                <TableCell padding="checkbox">
                  <Checkbox checked={isAllSelected} indeterminate={isIndeterminate} onChange={toggleSelectAll} />
                </TableCell>
              )}

              {columns.map((col) => (
                <TableCell
                  key={String(col.field)}
                  onClick={() => col.sortable && handleSort(col.field)}
                  sx={{ cursor: col.sortable ? 'pointer' : 'default' }}
                >
                  <Box display="flex" alignItems="center">
                    {col.header}
                    {col.sortable &&
                      sortField === col.field &&
                      (sortDirection === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />)}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading &&
              Array.from({ length: rowsPerPage }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`}>
                  {selectableRows && (
                    <TableCell padding="checkbox">
                      <Skeleton variant="rectangular" width={24} height={24} />
                    </TableCell>
                  )}
                  {columns.map((_col, colIndex) => (
                    <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading &&
              paginatedGroups?.map((group) => {
                const sortedChildren = sortChildren(group.children);

                return (
                  <Fragment key={group.id}>
                    <TableRow sx={{ backgroundColor: `${theme.palette.layout?.background16} !important` }}>
                      <TableCell colSpan={columns.length + (selectableRows ? 1 : 0)}>
                        <Box display="flex" alignItems="center">
                          {isExpandable && (
                            <IconButton onClick={() => toggleGroup(group.id)}>
                              {expandedGroups[group.id] ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
                            </IconButton>
                          )}
                          <Typography variant="subtitle1" sx={{ ml: isExpandable ? 2 : 0, fontWeight: 'bold' }}>
                            {group.label}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {(isExpandable ? expandedGroups[group.id] : true) &&
                      sortedChildren.slice(0, visibleChildrenCount[group.id] || 0).map((child, index) => (
                        <TableRow
                          key={`${group.id}-child-${index}`}
                          sx={{ backgroundColor: `${getRowColor(index)} !important` }}
                        >
                          {selectableRows && (
                            <TableCell padding="checkbox">
                              <Checkbox checked={isRowSelected(child)} onChange={() => toggleRowSelection(child)} />
                            </TableCell>
                          )}

                          {columns.map((col) => (
                            <TableCell key={String(col.field)}>
                              {col.renderCell
                                ? col.renderCell(child[col.field], child)
                                : String(child[col.field] ?? '--')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </Fragment>
                );
              })}
          </TableBody>
        </Table>
      </Box>

      <Divider sx={{ borderColor: 'lightgrey', borderBottomWidth: '1px', opacity: '0.2' }} />

      <TablePagination
        aria-label="Unit Roster Table Footer"
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={data?.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
    </Box>
  );
}
