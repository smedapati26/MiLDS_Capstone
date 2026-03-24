import React, { useMemo, useState } from 'react';

import { Button, Checkbox, Divider, Paper, Stack, Typography } from '@mui/material';

import { SearchBar } from '@ai2c/pmx-mui';

import { ColumnConfig } from '@components/data-tables';
import PmxSectionedTable from '@components/data-tables/PmxSectionedTable';
import { UnitSelect } from '@components/dropdowns/UnitSelect';
import { PmxToggleButtonGroup } from '@components/inputs';
import { useTableSearchOptions } from '@hooks/useTableSearchOptions';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { IAircraftTransferData } from '@store/griffin_api/aircraft/models';
import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';

import { AircraftTransferFilterForm } from './AircraftTransferFilterForm';
import { IAircraftTransferTransformation, UnitFromToggleType, UnitToToggleType } from './helper';
import { aircraftTransferDefaultValues, AircraftTransferFilterSchemaType } from './schema';

export interface AircraftTransferColumnProps extends IAircraftTransferTransformation {
  toggleOptions: UnitFromToggleType[] | UnitToToggleType[];
  unitToggleValue: UnitFromToggleType | UnitToToggleType;
  setUnitToggleValue:
    | React.Dispatch<React.SetStateAction<UnitFromToggleType>>
    | React.Dispatch<React.SetStateAction<UnitToToggleType>>;
  toggleDisabled: boolean;
  unitOptions: IUnitBrief[];
  selectedUnit: IUnitBrief | undefined;
  setSelectedUnit: React.Dispatch<React.SetStateAction<IUnitBrief | undefined>>;
  selectedSerials: string[];
  setSelectedSerials: React.Dispatch<React.SetStateAction<string[]>>;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  transferColumnType: 'Transfer From' | 'Transfer To';
}

/**
 * renders the Transfer From or Transfer To column for the Aircraft Transfer tab
 * @param {AircraftTransferColumnProps} props component props
 * @returns
 */
const AircraftTransferColumn: React.FC<AircraftTransferColumnProps> = (
  props: AircraftTransferColumnProps,
): React.ReactNode => {
  const {
    selectedSerials,
    setSelectedSerials,
    selectedUnit,
    setSelectedUnit,
    unitOptions,
    unitToggleValue,
    setUnitToggleValue,
    toggleOptions,
    toggleDisabled,
    transformedData,
    keyTitleMapping,
    columns,
    isLoading,
    setOpen,
    transferColumnType,
  } = props;

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AircraftTransferFilterSchemaType>(aircraftTransferDefaultValues);

  const tableData = useMemo(() => Object.values(transformedData).flat(), [transformedData]);
  const searchOptions = useTableSearchOptions<IAircraftTransferData>(columns, tableData);

  const handleUnitOptionsToggle = (value: string) => {
    if (transferColumnType === 'Transfer From') {
      (setUnitToggleValue as React.Dispatch<React.SetStateAction<UnitFromToggleType>>)(value as UnitFromToggleType);
    } else {
      (setUnitToggleValue as React.Dispatch<React.SetStateAction<UnitToToggleType>>)(value as UnitToToggleType);
    }
    setSelectedSerials([]);
  };

  const handleChangeUnit = (value: IUnitBrief) => {
    setSelectedUnit(value);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSelectRow = (serial: string) => {
    if (selectedSerials.includes(serial)) {
      setSelectedSerials((prev) => prev.filter((prevSerial) => prevSerial != serial));
    } else {
      setSelectedSerials((prev) => [...prev, serial]);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSelectAll = () => {
    if (dataCount == 0) return;

    if (selectedSerials.length === dataCount) {
      setSelectedSerials([]);
    } else {
      setSelectedSerials(
        Object.values(filteredData).flatMap((unit) => {
          return unit.map((aircraft) => aircraft.serial);
        }),
      );
    }
  };

  /** Filtered record of AircraftTransferData arrays based on model and status filters. */
  const filteredData = useMemo<Record<string, IAircraftTransferData[]>>(() => {
    if (filters.models.length == 0 && filters.statuses.length == 0 && !searchQuery) {
      return transformedData;
    }

    const filteredData: Record<string, IAircraftTransferData[]> = {};

    for (const [unit, aircraftData] of Object.entries(transformedData)) {
      const filteredAircraftData = aircraftData.filter((aircraft) => {
        const hasModel = filters.models.length == 0 || filters.models.includes(aircraft.model);
        const hasStatus =
          filters.statuses.length == 0 ||
          filters.statuses.includes(aircraft.ORStatus as OperationalReadinessStatusEnum);
        const hasSearchQuery =
          !searchQuery ||
          columns.some((column) => {
            const cellValue = aircraft[column.key as keyof IAircraftTransferData];
            return cellValue?.toString().toLowerCase().includes(searchQuery.toLowerCase());
          });
        return hasModel && hasStatus && hasSearchQuery;
      });

      filteredData[unit] = filteredAircraftData;
    }

    return filteredData;
  }, [filters, transformedData, searchQuery, columns]);

  const dataCount = useMemo<number>(() => {
    return Object.values(filteredData).reduce((sum, arr) => sum + arr.length, 0);
  }, [filteredData]);

  const selectableColumns = useMemo(() => {
    return [
      {
        label: '',
        key: 'checkbox',
        width: '10%',
        render: (_: IAircraftTransferData, row: IAircraftTransferData) => {
          return (
            <Checkbox
              checked={selectedSerials.includes(row['serial'])}
              onChange={() => handleSelectRow(row['serial'])}
              inputProps={{
                'aria-label': `Select serial ${row['serial']}`,
              }}
            />
          );
        },
        renderHeader: () => {
          return (
            <Checkbox
              checked={selectedSerials.length > 0 && selectedSerials.length === dataCount}
              indeterminate={selectedSerials.length > 0 && selectedSerials.length < dataCount}
              onChange={() => handleSelectAll()}
              onClick={(event) => event.stopPropagation()}
              data-testid={`transfer-${transferColumnType == 'Transfer From' ? 'from' : 'to'}-checkbox-all`}
            />
          );
        },
      },
      ...columns,
    ] as ColumnConfig<IAircraftTransferData>[];
  }, [columns, selectedSerials, handleSelectRow, dataCount, transferColumnType, handleSelectAll]);

  return (
    <Paper sx={{ width: '35vw', height: '100%' }}>
      <Stack sx={{ py: 5, px: 4 }} direction="column" spacing={4}>
        <Typography variant="h6">{transferColumnType}</Typography>
        <PmxToggleButtonGroup
          options={toggleOptions}
          onChange={(e) => handleUnitOptionsToggle(e)}
          value={unitToggleValue}
          minWidth={`${100 / toggleOptions.length}%`}
          disabled={toggleDisabled}
        />
        <UnitSelect
          units={unitOptions ? unitOptions : []}
          onChange={handleChangeUnit}
          value={selectedUnit}
          disabled={!unitOptions}
          readOnly={!unitOptions}
          label={transferColumnType == 'Transfer From' ? 'Losing Unit' : 'Gaining Unit'}
          id={transferColumnType == 'Transfer From' ? 'losing-unit' : 'gaining-unit'}
        />
      </Stack>
      <Divider sx={{ mx: 3 }} />
      <Stack sx={{ m: 3 }} gap={2}>
        <Stack
          direction="row"
          justifyContent={transferColumnType == 'Transfer From' ? 'right' : 'space-between'}
          alignItems="center"
          gap={2}
        >
          {transferColumnType == 'Transfer From' ? (
            <AircraftTransferFilterForm tableData={tableData} onApplyFilters={(filters) => setFilters(filters)} />
          ) : (
            <Button
              data-testid="submit-transfer-button"
              onClick={setOpen ? () => setOpen(true) : () => {}}
              variant="contained"
              disabled={Object.entries(filteredData).length == 0 || !selectedUnit}
            >
              Transfer Aircraft
            </Button>
          )}
          <SearchBar
            options={searchOptions}
            onChange={(_, value) => setSearchQuery(value ? value.value.toString() : '')}
            placeholder={'Search aircraft'}
            variant="standard"
            color="default"
            styles={{ minWidth: '200px', width: '50%' }}
            small={true}
          />
        </Stack>
        <PmxSectionedTable
          columns={selectableColumns as ColumnConfig<IAircraftTransferData>[]}
          data={filteredData}
          keyTitleMapping={keyTitleMapping}
          isLoading={isLoading}
          isPaginated={true}
          repeatColumnHeader={false}
          noDataMessage={
            transferColumnType == 'Transfer From'
              ? 'No aircraft for the selected unit'
              : 'Select aircraft from the "Transfer From" column'
          }
        />
      </Stack>
    </Paper>
  );
};

export default AircraftTransferColumn;
