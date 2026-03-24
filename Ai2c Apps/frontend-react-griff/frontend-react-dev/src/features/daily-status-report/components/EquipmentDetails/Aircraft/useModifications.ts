import { useMemo } from 'react';

import { IAutoDsr } from '@store/griffin_api/auto_dsr/models';

import { TableOverrideType } from './AircraftTable';

/**
 * Custom hook to extract unique modification types from table data.
 * @param tableData - The array of table data containing modifications.
 * @returns An array of objects with label and value for each unique modification type.
 */
export const useModifications = (tableData: Array<TableOverrideType | IAutoDsr>) => {
  return useMemo(
    () =>
      Array.from(new Set(tableData.flatMap((row) => row.modifications.map((mod) => mod.modType)))).map((mod) => ({
        label: mod ?? '',
        value: mod ?? '',
      })),
    [tableData],
  );
};
