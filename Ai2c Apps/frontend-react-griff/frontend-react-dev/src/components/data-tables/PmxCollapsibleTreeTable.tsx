import React, { useEffect, useMemo, useState } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {
  Collapse,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';

import { ColumnConfig } from '@components/data-tables';

export interface ITreeRowData {
  id: string;
  parentId: string;
  level: number;
  expanded?: boolean;
  show?: boolean;
}

/** PmxCollapsibleTreeTable Props */
export interface Props<T> {
  /**
   * Added optional props (expand, show)
   * Row data is in a flat tree format (id, parentId)
   */
  rows: Array<T & ITreeRowData>;
  /** Table columns */
  columns: Array<ColumnConfig<T>>;
  /**
   * Key is used to display collapsible drawer content
   * @gotcha If content is null it dose not open drawer
   */
  collapsibleKey?: string;
}

/**
 * PmxCollapsibleTreeTable
 *
 * Renders a Tree Table with a Collapsible Drawer
 * @gotcha If collapsible drawer dose not open if null
 */
export const PmxCollapsibleTreeTable = <T,>(props: Props<T>) => {
  const { rows, columns, collapsibleKey } = props;
  const { palette } = useTheme();

  const [tableData, setTableData] = useState<Array<T & ITreeRowData>>([]);

  const tableColumns = useMemo(
    () => columns.filter((column) => column.key !== collapsibleKey && !column.hide),
    [collapsibleKey, columns],
  );

  // updates rows wih expanded, level, show props
  useEffect(() => {
    setTableData(rows.map((row) => ({ ...row, expanded: false, level: row.level ?? 0, show: row.level === 0 })));
  }, [rows]);

  // Get all children rows recursively
  const getRowChildren = (rows: (T & ITreeRowData)[], parentId: string | number): (T & ITreeRowData)[] => {
    const children = rows.filter((r) => r.parentId === parentId);
    return [...children, ...children.flatMap((child) => getRowChildren(rows, child.id))];
  };

  // Toggle expand and recursively collapse children
  const toggleExpand = (row: T & ITreeRowData) => {
    const prevTableData = [...tableData];
    const isExpanding = !row.expanded;

    const childRows = getRowChildren(prevTableData, row.id);

    setTableData(
      prevTableData.map((_row) => {
        if (_row.id === row.id) {
          _row.expanded = isExpanding;
          _row.show = true;
        }

        // If collapsing, hide all childRows
        if (!isExpanding && childRows.some((d) => d.id === _row.id)) {
          _row.expanded = false;
          _row.show = false;
        }

        // If expanding, show only direct children
        if (isExpanding && _row.parentId === row.id) {
          _row.show = true;
        }

        return _row;
      }),
    );
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        {/* Table Heading */}
        <TableHead>
          <TableRow sx={{ backgroundColor: palette.layout.background16 }}>
            {tableColumns.map((column) => (
              <TableCell key={String(column.key)} sx={{ minWidth: column.minWidth }} align="left">
                {column?.renderHeader ? column.renderHeader() : column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        {/* Table Body */}
        <TableBody>
          {tableData
            .filter((row) => row.show)
            .map((row, index) => (
              <React.Fragment key={`table-row-${index}`}>
                <TableRow key={`table-row-${index}`} id={`table-row-${index}`}>
                  {tableColumns.map((column, index) => (
                    <TableCell key={String(column.key)} align="left">
                      <Stack direction="row" gap={3}>
                        {
                          /** Expansion Icon */
                          index === 0 && (
                            <IconButton
                              aria-label="expand row"
                              size="large"
                              onClick={() => toggleExpand(row)}
                              sx={{
                                width: 5, // 20px
                                height: 5, // 20px
                                '& .MuiSvgIcon-root': { fontSize: 26 },
                                marginLeft: `${row.level * 20}px`,
                                marginTop: '-2px' /* Centers Icon */,
                              }}
                            >
                              {row.expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                            </IconButton>
                          )
                        }
                        {/* Column table data */}
                        {column.render ? column.render(row[column.key], row) : String(row[column.key])}
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>
                {columns.map(
                  (column) =>
                    /**
                     * IF collapsibleKey is not provided and
                     * IF render dose not return  null, display collapsible
                     */
                    column.key === (collapsibleKey as string) &&
                    column.render &&
                    column.render(row[column.key], row) && (
                      <TableRow key={`table-row=${index}-drawer`}>
                        <TableCell colSpan={columns.length} sx={{ padding: 0 }}>
                          <Collapse
                            id={`table-row-${index}-drawer-collapse`}
                            in={row.expanded}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Stack direction="column" gap={3} sx={{ mx: 4, my: 5 }}>
                              {column.render(row[column.key], row)}
                            </Stack>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    ),
                )}
              </React.Fragment>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
