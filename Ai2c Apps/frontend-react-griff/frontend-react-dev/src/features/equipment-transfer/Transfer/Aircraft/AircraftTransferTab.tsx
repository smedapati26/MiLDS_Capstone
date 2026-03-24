import React, { useEffect, useMemo, useState } from 'react';

import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { Box, Button, Snackbar, Stack } from '@mui/material';

import { ScrollableLayout } from '@ai2c/pmx-mui';

import { filterUnitsHierarchy } from '@utils/helpers/filterUnitsHierarchy';

import { useGetAircraftEquipmentDetailsQuery } from '@store/griffin_api/aircraft/slices';
import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';
import { useGetUserElevatedRolesQuery } from '@store/griffin_api/users/slices';
import { useAppSelector } from '@store/hooks';

import AircraftTransferColumn from './AircraftTransferColumn';
import AircraftTransferReviewModal from './AircraftTransferReviewModal';
import {
  IAircraftTransferTransformation,
  transformData,
  transientUnit,
  UnitFromToggleType,
  UnitToToggleType,
} from './helper';

const AircraftTransferTab: React.FC = () => {
  const appUser = useAppSelector((state) => state.appSettings.appUser);
  const currentUnit = useAppSelector((state) => state.appSettings.currentUnit);
  const allUnits = useAppSelector((state) => state.appSettings.allUnits);
  const { data: elevatedRoles } = useGetUserElevatedRolesQuery(appUser.userId);

  const [unitFromToggleValue, setUnitFromToggleValue] = useState<UnitFromToggleType>('My Unit');
  const [losingUnit, setLosingUnit] = useState<IUnitBrief | undefined>(undefined);
  const [serialsToAdd, setSerialsToAdd] = useState<string[]>([]);

  const [unitToToggleValue, setUnitToToggleValue] = useState<UnitToToggleType>('Unit');
  const [gainingUnit, setGainingUnit] = useState<IUnitBrief | undefined>(undefined);
  const [serialsToRemove, setSerialsToRemove] = useState<string[]>([]);

  const [serialsToTransfer, setSerialsToTransfer] = useState<string[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);

  // Using Aircraft Equipment Details to grab serial, model, and OR status
  const { data, refetch, isLoading, isFetching, isUninitialized } = useGetAircraftEquipmentDetailsQuery(
    { uic: losingUnit?.uic ?? '' },
    { skip: losingUnit === undefined },
  );

  const { transformedData, keyTitleMapping, columns } = useMemo<IAircraftTransferTransformation>(
    () => transformData(data),
    [data],
  );

  const transferFromData = Object.fromEntries(
    Object.entries(transformedData)
      .map(([key, value]) => [key, value.filter((aircraft) => !serialsToTransfer.includes(aircraft.serial))])
      .filter(([_key, value]) => value.length > 0),
  );

  const transferToData = Object.fromEntries(
    Object.entries(transformedData)
      .map(([key, value]) => [key, value.filter((aircraft) => serialsToTransfer.includes(aircraft.serial))])
      .filter(([_key, value]) => value.length > 0),
  );

  const adminUnits = useMemo(() => {
    if (appUser.isAdmin) {
      return allUnits;
    }

    if (allUnits && allUnits.length > 0 && elevatedRoles && elevatedRoles.admin.length > 0) {
      const targetUnits = allUnits.filter((unit) => elevatedRoles.admin.includes(unit.uic));
      return filterUnitsHierarchy(allUnits, targetUnits);
    }
    return [];
  }, [allUnits, appUser.isAdmin, elevatedRoles]);

  let unitFromOptions: IUnitBrief[] = [];
  switch (unitFromToggleValue) {
    case 'My Unit':
      unitFromOptions = adminUnits ?? [];
      break;
    case 'In Transit':
      unitFromOptions = [transientUnit];
      break;
    default:
      unitFromOptions = allUnits ?? [];
  }

  let unitToOptions: IUnitBrief[] = [];
  switch (unitToToggleValue) {
    case 'Unit':
      if (unitFromToggleValue === 'My Unit') {
        unitToOptions = allUnits ?? [];
      } else {
        unitToOptions = adminUnits ?? [];
      }
      break;
    default: // In Transit
      unitToOptions = [transientUnit];
  }

  useEffect(() => {
    switch (unitFromToggleValue) {
      case 'My Unit':
        setLosingUnit(
          adminUnits?.find((unit) => unit.uic === currentUnit.uic)
            ? currentUnit
            : adminUnits && adminUnits.length > 0
              ? adminUnits[0]
              : undefined,
        );
        break;
      case 'In Transit':
        setLosingUnit(transientUnit);
        // Can only transfer externally owned aircraft to user's admin units
        setUnitToToggleValue('Unit');
        setGainingUnit(undefined);
        break;
      default:
        setLosingUnit(currentUnit);
        // Can only transfer externally owned aircraft to user's admin units
        setUnitToToggleValue('Unit');
        setGainingUnit(undefined);
    }
  }, [unitFromToggleValue, adminUnits, currentUnit]);

  useEffect(() => {
    switch (unitToToggleValue) {
      case 'In Transit':
        setGainingUnit(transientUnit);
        break;
      default:
        setGainingUnit(undefined);
    }
  }, [unitToToggleValue]);

  useEffect(() => {
    switch (unitToToggleValue) {
      case 'In Transit':
        setGainingUnit(transientUnit);
        break;
      default:
        setGainingUnit(undefined);
    }
  }, [unitToToggleValue]);

  const handleAddToTransfer = () => {
    setSerialsToTransfer((prev) => [...new Set([...prev, ...serialsToAdd])]);
    setSerialsToAdd([]);
  };

  const handleRemoveFromTransfer = () => {
    setSerialsToTransfer((prev) => prev.filter((serial) => !serialsToRemove.includes(serial)));
    setSerialsToRemove([]);
  };

  const handleTransferSubmit = (success: boolean, adjudicated: boolean, count: number) => {
    if (success) {
      setSnackbarMessage(
        adjudicated ? `Aircraft (${count}) successfully transferred.` : `Aircraft (${count}) transfer requests sent.`,
      );
      setSerialsToTransfer([]);
      setSerialsToRemove([]);
    } else {
      setSnackbarMessage(`An error occurred while sending the requests.`);
    }

    setShowSnackbar(true);
    refetch();
  };

  return (
    <ScrollableLayout>
      <Stack direction={'row'} gap={2}>
        <Box sx={{ flex: 1 }}>
          <AircraftTransferColumn
            selectedSerials={serialsToAdd}
            setSelectedSerials={setSerialsToAdd}
            selectedUnit={losingUnit}
            setSelectedUnit={setLosingUnit}
            unitOptions={unitFromOptions}
            unitToggleValue={unitFromToggleValue}
            setUnitToggleValue={setUnitFromToggleValue}
            toggleOptions={['My Unit', 'In Transit', 'External']}
            toggleDisabled={serialsToTransfer.length > 0}
            transformedData={transferFromData}
            keyTitleMapping={keyTitleMapping}
            columns={columns}
            isLoading={isLoading || isFetching || isUninitialized}
            transferColumnType="Transfer From"
          />
        </Box>
        <Stack direction={'column'} alignSelf={'center'} gap={4}>
          <Button
            data-testid="transfer-add-btn"
            variant="outlined"
            disabled={serialsToAdd.length === 0}
            onClick={handleAddToTransfer}
          >
            <KeyboardArrowRight />
          </Button>
          <Button
            data-testid="transfer-remove-btn"
            variant="outlined"
            disabled={serialsToRemove.length === 0}
            onClick={handleRemoveFromTransfer}
          >
            <KeyboardArrowLeft />
          </Button>
        </Stack>
        <Box sx={{ flex: 1 }}>
          <AircraftTransferColumn
            selectedSerials={serialsToRemove}
            setSelectedSerials={setSerialsToRemove}
            selectedUnit={gainingUnit}
            setSelectedUnit={setGainingUnit}
            unitOptions={unitToOptions}
            unitToggleValue={unitToToggleValue}
            setUnitToggleValue={setUnitToToggleValue}
            toggleOptions={['Unit', 'In Transit']}
            toggleDisabled={unitFromToggleValue !== 'My Unit'}
            transformedData={transferToData}
            keyTitleMapping={keyTitleMapping}
            columns={columns}
            isLoading={isLoading || isFetching}
            setOpen={setOpenModal}
            transferColumnType="Transfer To"
          />
        </Box>
      </Stack>
      <AircraftTransferReviewModal
        losingUnit={losingUnit}
        gainingUnit={gainingUnit}
        open={openModal}
        setOpen={setOpenModal}
        handleSubmit={handleTransferSubmit}
        transformedData={transferToData}
        keyTitleMapping={keyTitleMapping}
        columns={columns}
      />
      <Snackbar
        data-testid={'aircraft-transfer-snackbar'}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        sx={{ marginTop: '75px', backgroundColor: (theme) => theme.palette.layout.background11 }}
        message={snackbarMessage}
        autoHideDuration={4000}
      />
    </ScrollableLayout>
  );
};

export default AircraftTransferTab;
