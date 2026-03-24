import React, { useEffect, useMemo, useRef, useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import { Accordion, Box, Button, Checkbox, Stack, styled, useTheme } from '@mui/material';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, { accordionSummaryClasses, AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';

import { ColumnConfig, PmxTable } from '@components/data-tables';
import { StyledAccordionSkeleton } from '@components/PmxAccordion';

export type AccordionVersion = 'uas' | 'other';

export interface Props<T> {
  data: Record<string, T[]>; // dictionary where key is the Accordion title, item is the data as T
  columns: ColumnConfig<T>[] | Record<string, ColumnConfig<T>[]>;
  keyTitleMapping?: Record<string, React.ReactNode>; // optional for user controlled titles
  isLoading?: boolean;
  checkBox?: boolean;
  selectedRows?: Record<string, boolean>;
  setSelectedRows?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  rowKey?: keyof T;
  isAllExpanded?: boolean;
  highLightedKeys?: string[];
  highlightColumnKey?: keyof T | undefined;
  checkBoxColumn?: boolean;
  accordionVersion?: AccordionVersion;
  onEditClick?: (key?: string) => void;
  paginate?: boolean;
  perPage?: number;
}

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<ArrowDropDownIcon />} {...props} />
))(({ theme }) => ({
  backgroundImage: 'none',
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.layout.background11 : theme.palette.layout.background5,
  flexDirection: 'row-reverse',
  marginBottom: theme.spacing(1),
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]: {
    transform: 'rotate(180deg)',
  },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(() => ({
  padding: 0,
}));

/**
 * Pmx styled table that groups and expands tables based on dictionary of data,
 * where the key is the accordion header and the item is the data of the table.
 * @param {Props<T>} props - props containing parameters to populate accordion table
 * @param {Record<string, T[]>} props.data - data to show in the row of the table
 * @param {ColumnConfig<T>[] | Record<string, ColumnConfig<T>[]>} props.columns - info about each column, the header, the way render cells of that column, and how to render that column. Can be a dictionary for each table in accordion, where key is the key of the table
 * @param {Record<string, React.ReactNode>} props.keyTitleMapping - optional for users to control how accordion summary looks
 * @param {boolean} props.isLoading - data loading boolean
 * @param {boolean} props.checkBox - user to include a checkBox column in table and summary.
 * @param {React.Dispatch<React.SetStateAction<Record<string, boolean>>>} props.setSelectedRows - function to set the list of items user checked
 * @param {Record<string, boolean>} props.selectedRows - the list of items user checked.
 * @param {keyof T} props.rowKey - the key to use to keep track of checked row
 * @param {boolean} props.isAllExpanded - to expand all of the accordions.
 * @param {string[]} props.highlightedKey - keys to highlight when done updating
 * @param {keyof T | undefined} props.highlightColumnKey - the column key to hightlight after updating
 * @param {boolean} props.checkBoxColumn - to add a checkbox column without a checkbox header
 * @param {accordionVersion} props.accordionVersion - different configurations to represent the tables?
 * * @param {() => void} props.onEditClick - function for edit button clicking.
 * @returns JSX.Element
 */

const PmxTableAccordion = <T extends object>(props: Props<T>): JSX.Element => {
  const {
    data,
    columns,
    isLoading,
    keyTitleMapping,
    checkBox,
    selectedRows,
    setSelectedRows,
    rowKey,
    isAllExpanded = false,
    highLightedKeys = [],
    highlightColumnKey,
    accordionVersion = 'other',
    onEditClick,
    paginate = false,
    perPage = 25,
  } = props;
  // State to track the expanded state for each accordion
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({});
  const theme = useTheme();
  const isInitialMount = useRef(true);
  const prevIsAllExpanded = useRef(isAllExpanded);
  // Memoize data keys to prevent unnecessary re-renders
  const dataKeys = useMemo(() => Object.keys(data).sort().join(','), [data]);

  useEffect(() => {
    // Only update if isAllExpanded actually changed, not on data changes
    if (prevIsAllExpanded.current === isAllExpanded && !isInitialMount.current) {
      return;
    }

    const keys = Object.keys(data);
    const updatedAccordions = keys.reduce(
      (acc, key) => {
        if (isInitialMount.current || prevIsAllExpanded.current !== isAllExpanded) {
          acc[key] = isAllExpanded;
        } else {
          acc[key] = expandedAccordions[key] !== undefined ? expandedAccordions[key] : isAllExpanded;
        }
        return acc;
      },
      {} as Record<string, boolean>,
    );
    setExpandedAccordions(updatedAccordions);
    isInitialMount.current = false;
    prevIsAllExpanded.current = isAllExpanded;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllExpanded, dataKeys]); // Use dataKeys instead of data

  // Function to handle accordion expansion
  const handleAccordionToggle = (key: string) => {
    setExpandedAccordions((prevExpanded) => ({
      ...prevExpanded,
      [key]: !prevExpanded[key], // Toggle the expanded state for the clicked accordion
    }));
  };

  const toggleRowCheck = (key: string) => {
    if (setSelectedRows) {
      setSelectedRows((prevRowCheck) => ({
        ...prevRowCheck,
        [key]: !prevRowCheck[key],
      }));
    } else {
      console.warn('setSelectedRows is no defined for creating checkboxes in the PmxTable');
    }
  };

  const setRowCheck = (key: string, value: boolean) => {
    if (setSelectedRows) {
      setSelectedRows((prevRowCheck) => ({
        ...prevRowCheck,
        [key]: value,
      }));
    } else {
      console.warn('setSelectedRows is no defined for creating checkboxes in the PmxTable');
    }
  };

  const handleRowCheck = (equipmentNumber: string) => {
    toggleRowCheck(equipmentNumber);
  };

  const handleAccordionCheck = (data: T[]) => {
    const newAccordionCheck: boolean = !data.every((row) => selectedRows?.[row[rowKey as keyof T] as string] === true);

    if (!setSelectedRows) return;

    data.map((row) => {
      setRowCheck(row[rowKey as keyof T] as string, newAccordionCheck);
    });
  };

  // Handler for when PmxTable selection changes (for UAS version)
  const handleSelectionChange = (rows: T[]): void => {
    if (!setSelectedRows || !rowKey) return;

    // handleAccordionCheck(rows);
    const newCheck: boolean = !rows.every((row) => selectedRows?.[row[rowKey as keyof T] as string] === true);

    // Batch all updates into a single setState call
    setSelectedRows((prevRowCheck) => {
      const newRowCheck = { ...prevRowCheck };

      // First, set ALL existing keys to false (blanket reset)
      Object.keys(newRowCheck).forEach((key) => {
        newRowCheck[key] = false;
      });

      rows.forEach((row) => {
        newRowCheck[row[rowKey as keyof T] as string] = newCheck;
      });

      return newRowCheck;
    });
  };

  return isLoading ? (
    <StyledAccordionSkeleton data-testid="pmx-accordion-table-skeleton" variant="rectangular" />
  ) : (
    <Box data-testid="pmx-accordion-table">
      {data &&
        Object.entries(data).map(([key, rows]) => {
          // Determine the columns for this accordion
          const tableColumns = Array.isArray(columns) ? columns : columns[key];

          // Add checkbox column if enabled
          let transformColumns = [];
          if (checkBox && accordionVersion === 'other') {
            transformColumns = [
              {
                label: '',
                key: 'checkBox',
                width: '10%',
                render: (_: T, rowData: T) => {
                  if (!rowKey) {
                    console.warn('rowKey is undefined and necessary for checkboxes');
                    return null;
                  }
                  if (!selectedRows) {
                    console.warn('selectRows dictionary is necessary');
                    return null;
                  }

                  const key = rowData[rowKey] as string;
                  return <Checkbox checked={selectedRows[key]} onChange={() => handleRowCheck(key)} sx={{ m: 4 }} />;
                },
              } as unknown as ColumnConfig<T>,
              ...tableColumns,
            ];
          } else {
            transformColumns = tableColumns;
          }

          return (
            <Accordion
              key={key}
              expanded={!!expandedAccordions[key]} // Check if this accordion is expanded
              onChange={() => handleAccordionToggle(key)}
              sx={{ m: 0, '&.Mui-expanded': { m: 0 } }}
            >
              <AccordionSummary aria-controls="panel2d-content" id={`panel2d-header`} sx={{ mb: 0 }}>
                <Stack direction="row" spacing={8} alignItems="center">
                  {checkBox && accordionVersion === 'other' && (
                    <Checkbox
                      checked={rows.every((row) => selectedRows?.[row[rowKey as keyof T] as string] === true)}
                      indeterminate={
                        rows.some((row) => selectedRows?.[row[rowKey as keyof T] as string] === true) &&
                        !rows.every((row) => selectedRows?.[row[rowKey as keyof T] as string] === true)
                      }
                      onChange={() => handleAccordionCheck(rows)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  )}
                  {keyTitleMapping?.[key] || key}
                </Stack>
              </AccordionSummary>
              <Stack
                direction="column"
                spacing={3}
                sx={{
                  marginLeft: theme.spacing(2),
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.layout.background11
                      : theme.palette.layout.background5,
                }}
              >
                {accordionVersion === 'uas' && onEditClick && (
                  <Button
                    startIcon={<EditIcon />}
                    variant="contained"
                    onClick={() => onEditClick(key)}
                    sx={{ maxWidth: 'fit-content' }}
                  >
                    Edit
                  </Button>
                )}
                <AccordionDetails>
                  <PmxTable
                    columns={transformColumns}
                    rows={rows}
                    paginate={paginate}
                    limit={perPage}
                    size="small"
                    highLightedKeys={highLightedKeys}
                    highlightColumnKey={highlightColumnKey}
                    selectable={accordionVersion === 'uas'}
                    onSelectionChange={accordionVersion === 'uas' ? handleSelectionChange : undefined}
                  />
                </AccordionDetails>
              </Stack>
            </Accordion>
          );
        })}
    </Box>
  );
};

export default PmxTableAccordion;
