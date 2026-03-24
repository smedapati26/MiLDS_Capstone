import { Stack, Typography } from '@mui/material';

import { Echelon } from '@ai2c/pmx-mui';

import { OrStatusTableCell } from '@components/data-tables';

import {
  AIRCRAFT_TRANSFER_COLUMNS,
  IAircraftEquipmentDetails,
  IAircraftTransferColumnMapping,
  IAircraftTransferData,
} from '@store/griffin_api/aircraft/models';
import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';

/* Unit toggle selection options for Transfer From and Transfer To columns */
export type UnitFromToggleType = 'My Unit' | 'In Transit' | 'External';
export type UnitToToggleType = 'Unit' | 'In Transit';

/* Sectioned table data ITransformation type for IAircraftTransfer data */
export interface IAircraftTransferTransformation {
  transformedData: Record<string, IAircraftTransferData[]>;
  keyTitleMapping: Record<string, React.ReactNode>;
  columns: IAircraftTransferColumnMapping[];
}

/* Transient Unit constant to be used for In Transit selection */
export const transientUnit: IUnitBrief = {
  uic: 'TRANSIENT',
  echelon: Echelon.UNKNOWN,
  component: '',
  level: 0,
  displayName: 'Aircraft in Transit',
  shortName: 'Transient',
};

/**
 * Generate the columns to be dynamic for each table in the section
 * @returns
 */
export const generateColumns = (
  columns: IAircraftTransferColumnMapping[] = AIRCRAFT_TRANSFER_COLUMNS,
): IAircraftTransferColumnMapping[] => {
  return columns.map((column) => ({
    ...column,
    render: (
      value: IAircraftTransferData[keyof IAircraftTransferData], // value based on a key
      _row: IAircraftTransferData, // whole row
    ) => {
      const { key } = column;

      switch (key) {
        case 'ORStatus':
          return <OrStatusTableCell status={value as string} />;
        default:
          // Model and Serial Number returned as plain value
          return value ?? '--';
      }
    },
  }));
};

/**
 * Transform the data
 * @param data - data of table
 * @returns
 */
export const preprocessTableData = (data: IAircraftEquipmentDetails): IAircraftTransferData[] => {
  return data.models.flatMap((model) =>
    model.aircraft.map(
      (aircraft) =>
        ({
          serial: aircraft.serial,
          ORStatus: aircraft.ORStatus,
          model: model.model,
          unitShortName: data.unitShortName,
        }) as IAircraftTransferData,
    ),
  );
};

export function transformData(data: IAircraftEquipmentDetails[] | undefined): IAircraftTransferTransformation {
  const columns = generateColumns();
  if (!data) {
    return {
      transformedData: {},
      keyTitleMapping: {},
      columns: columns,
    };
  }

  const initialAccumulator = {
    transformedData: {} as Record<string, IAircraftTransferData[]>,
    keyTitleMapping: {} as Record<string, React.ReactNode>,
  };

  const transformation = data.reduce((acc, item) => {
    const accordionKey = item.unitShortName;

    acc.transformedData[accordionKey] = preprocessTableData(item);
    acc.keyTitleMapping[accordionKey] = (
      <Stack direction="row" spacing={8} alignItems="center">
        <Typography variant="body2">{item.unitShortName}</Typography>
      </Stack>
    );

    return acc;
  }, initialAccumulator);

  return {
    ...transformation,
    columns: columns,
  };
}
