import React, { useEffect, useState } from 'react';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { IconButton, Paper, Stack, styled } from '@mui/material';

import { ColumnConfig } from '@components/data-tables';

import { PmxToolbarTable } from './PmxToolbarTable';

// Styled button
const TransferButton = styled(IconButton)(({ theme }) => ({
  border: '1px solid',
  color: theme.palette.primary.main,
  borderColor: theme.palette.primary.main,
  borderRadius: theme.shape.borderRadius,
  minWidth: '50px',
  padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
  '&.Mui-disabled': {
    borderColor: theme.palette.text.disabled,
  },
}));

/**
 * @typedef Props
 * @prop children
 */
export type Props<T> = {
  /* Column configs */
  leftColumns: ColumnConfig<T>[];
  rightColumns: ColumnConfig<T>[];
  /* Row data */
  leftData?: T[];
  rightData?: T[];
  /* Table heading labels */
  leftLabel?: string;
  rightLabel?: string;
  /* Table toolbar slot */
  leftToolbar?: React.ReactNode;
  rightToolbar?: React.ReactNode;
  /* Callback that returns left and right rows on change */
  onChange?: (left: T[], right: T[]) => void;
  /* Loading boolean */
  isLoading?: boolean;
  /* Searchable (Default [true]) */
  searchable?: boolean;
};

/**
 * PmxTransferTable Functional Component
 * @see PmxTable for table implementation
 */
export const PmxTransferTable = <T,>(props: Props<T>) => {
  const {
    leftColumns,
    rightColumns,
    leftData,
    rightData,
    leftLabel,
    leftToolbar,
    rightLabel,
    rightToolbar,
    onChange,
    isLoading = false,
    searchable = true,
  } = props;

  const [_leftData, setLeftData] = useState<T[]>([]);
  const [_rightData, setRightData] = useState<T[]>([]);
  const [leftSelected, setLeftSelected] = useState<T[]>([]);
  const [rightSelected, setRightSelected] = useState<T[]>([]);

  // Watch for external changes to update values
  useEffect(() => {
    if (leftData) setLeftData(leftData);
    if (rightData) setRightData(rightData);
  }, [leftData, rightData]);

  // Handle transfer between tables
  const handleTransfer = (direction: 'left' | 'right') => {
    let newLeftData: T[];
    let newRightData: T[];

    if (direction === 'left') {
      // Move selected from right to left
      const rightSelectedSet = new Set(rightSelected);
      newLeftData = [..._leftData, ...rightSelected];
      newRightData = _rightData.filter((row) => !rightSelectedSet.has(row));
    } else {
      // Move selected from left to right
      const leftSelectedSet = new Set(leftSelected);
      newRightData = [..._rightData, ...leftSelected];
      newLeftData = _leftData.filter((row) => !leftSelectedSet.has(row));
    }

    // Update state
    setLeftData(newLeftData);
    setRightData(newRightData);

    // Clear selections
    setRightSelected([]);
    setLeftSelected([]);

    // Trigger callback with updated data
    if (onChange) onChange(newLeftData, newRightData);
  };

  return (
    <Stack direction="row" gap={3} sx={{ width: '100%' }}>
      {/** Left Table */}
      <Paper sx={{ px: 3, py: 4, flexGrow: 1, width: '43%' }}>
        <PmxToolbarTable
          heading={leftLabel}
          columns={leftColumns}
          data={_leftData}
          toolbar={leftToolbar} // For slot or filtering outside of component
          onSelectionChange={setLeftSelected}
          searchable={searchable}
          isLoading={isLoading}
        />
      </Paper>
      {/** Transfer buttons */}
      <Stack
        id="transfer-table-buttons"
        direction="column"
        gap={3}
        sx={{ justifyContent: 'center', alignItems: 'center', width: '4%' }}
      >
        <TransferButton
          aria-label="transfer left"
          color="primary"
          onClick={() => handleTransfer('right')}
          disabled={leftSelected.length === 0}
        >
          <ArrowForwardIosIcon />
        </TransferButton>
        <TransferButton
          aria-label="transfer right"
          color="primary"
          onClick={() => handleTransfer('left')}
          disabled={rightSelected.length === 0}
        >
          <ArrowBackIosIcon sx={{ marginLeft: 2 /* Offsets to look more center */ }} />
        </TransferButton>
      </Stack>
      {/** Right Table */}
      <Paper sx={{ px: 3, py: 4, flexGrow: 1, width: '43%' }}>
        <PmxToolbarTable
          heading={rightLabel}
          columns={rightColumns}
          data={_rightData}
          toolbar={rightToolbar} // For slot or filtering outside of component
          onSelectionChange={setRightSelected}
        />
      </Paper>
    </Stack>
  );
};
