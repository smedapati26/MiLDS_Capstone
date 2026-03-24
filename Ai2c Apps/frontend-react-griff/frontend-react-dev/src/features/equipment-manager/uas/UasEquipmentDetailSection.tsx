import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Paper, Skeleton, Snackbar, Stack, Tooltip, Typography, useTheme } from '@mui/material';

import { ColumnConfig, OrStatusTableCell } from '@components/data-tables';
import EquipmentManagerDetails from '@features/equipment-manager/components/EquipmentManagerDetails';
import { AddSyncField } from '@features/equipment-manager/components/helper';
import { useEquipmentManagerContext } from '@features/equipment-manager/EquipmentManagerContext';
import { MultiStepProvider } from '@features/equipment-manager/uas/UasEditSteps';
import UasMultiEdit from '@features/equipment-manager/uas/UasMultiEdit';
import UasSingleEdit from '@features/equipment-manager/uas/UasSingleEdit';
import { formatNumbers } from '@utils/helpers';

import {
  IUAS,
  UAC_EQUIPMENT_DETAILS_COLUMNS,
  UasType,
  UAV_EQUIPMENT_DETAILS_COLUMNS,
} from '@store/griffin_api/uas/models/IUAS';
import { useGetUACQuery, useGetUAVQuery } from '@store/griffin_api/uas/slices';

/**
 * Aggregate the UAS data by company
 * @param {IUAS[]} data to aggregate
 * @param {UasType} type differentiating UAV and UAC
 * @returns {Record<string, IUAS[]>} aggregated data
 */
export const aggregateByCompany = (
  data: IUAS[] | undefined,
  type: UasType,
): {
  transformedData: Record<string, IUAS[]>;
  keyTitleMapping: Record<string, React.ReactNode>;
} => {
  if (!data) return { transformedData: {}, keyTitleMapping: {} };

  return data.reduce<{
    transformedData: Record<string, IUAS[]>;
    keyTitleMapping: Record<string, React.ReactNode>;
  }>(
    (acc, curr) => {
      const accordionKey = `${curr.currentUnit}-${type}`; // the one and two is to make sure Uav appears first when tableData is sorted

      if (!acc.transformedData[accordionKey]) {
        acc.transformedData[accordionKey] = [];
      }
      acc.transformedData[accordionKey].push(curr);

      if (!acc.keyTitleMapping[accordionKey]) {
        acc.keyTitleMapping[accordionKey] = (
          <Stack direction="row" spacing={8} alignItems="center">
            <Typography variant="body2">
              {curr.shortName} ({curr.currentUnit})
            </Typography>
            <Typography variant="body2">{type === 'Uav' ? 'UAVs' : 'Components (UACs)'}</Typography>
          </Stack>
        );
      }

      return acc;
    },
    { transformedData: {}, keyTitleMapping: {} },
  );
};

/**
 * Equipment details of UACs and UAVs
 * @returns
 */
const UasEquipmentDetailSection: React.FC = (): React.ReactNode => {
  const theme = useTheme();
  const [rowCheckUav, setRowCheckUav] = useState<Record<string, boolean>>({});
  const [rowCheckUac, setRowCheckUac] = useState<Record<string, boolean>>({});
  const [editSerial, setEditSerial] = useState<string[]>([]);
  const [openSingle, setOpenSingle] = useState<boolean>(false);
  const [openMulti, setOpenMulti] = useState<boolean>(false);
  const [updated, setUpdated] = useState<string[]>([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [editUasType, setEditUasType] = useState<UasType>('Uav');
  const [multiEditData, setMultiEditData] = useState<IUAS[] | undefined>(undefined);
  const [editTitle, setEditTitle] = useState<React.ReactNode | undefined>(undefined);
  const [uavSearchValue, setUavSearchValue] = useState<string>('');
  const [uacSearchValue, setUacSearchValue] = useState<string>('');

  const { chosenUic } = useEquipmentManagerContext();
  const {
    data: uavData,
    isLoading: uavIsLoading,
    isFetching: uavIsFetching,
    refetch: refetchUav,
  } = useGetUAVQuery({ uic: chosenUic, search: uavSearchValue }, { skip: chosenUic === '' });
  const {
    data: uacData,
    isLoading: uacIsLoading,
    isFetching: uacIsFetching,
    refetch: refetchUac,
  } = useGetUACQuery({ uic: chosenUic, search: uacSearchValue }, { skip: chosenUic === '' });

  const isLoading = uacIsLoading || uacIsFetching || uavIsLoading || uavIsFetching;

  const aggUavData = useMemo(() => aggregateByCompany(uavData, 'Uav'), [uavData]);
  const aggUacData = useMemo(() => aggregateByCompany(uacData, 'Uac'), [uacData]);
  const tableData = { ...aggUavData.transformedData, ...aggUacData.transformedData };
  const dataKeysTitle = { ...aggUavData.keyTitleMapping, ...aggUacData.keyTitleMapping };

  const onSingleEditClick = (value: string, uasType: UasType) => {
    setEditSerial([value]);
    setEditUasType(uasType);
    setOpenSingle(true);
  };

  const uavTableColumns = UAV_EQUIPMENT_DETAILS_COLUMNS.map((column) => ({
    ...column,
    render: (value: IUAS[keyof IUAS], row: IUAS) => {
      const { key } = column;

      switch (key) {
        case 'actions':
          return (
            <Button onClick={() => onSingleEditClick(row.serialNumber, 'Uav')}>
              <EditIcon fontSize="small" />
            </Button>
          );
        case 'totalAirframeHours':
          return (
            <AddSyncField syncs={row.fieldSyncStatus} field={String(key)}>
              <Box>{String(formatNumbers(value as string, 0) ?? '--')}</Box>
            </AddSyncField>
          );
        case 'flightHours':
          return (
            <AddSyncField syncs={row.fieldSyncStatus} field={String(key)}>
              <Box>{String(formatNumbers(value as string, 0) ?? '--')}</Box>
            </AddSyncField>
          );
        case 'displayStatus':
          return (
            <AddSyncField syncs={row.fieldSyncStatus} field={'status'}>
              <Tooltip
                title={
                  row.dateDown ? (
                    <Stack direction="column" spacing={1}>
                      <Typography variant="body2">Date Down:</Typography>
                      <Typography variant="body1">{dayjs(row.dateDown).format('MM/DD/YYYY')}</Typography>
                    </Stack>
                  ) : (
                    'No date down'
                  )
                }
                placement="top"
              >
                <span>
                  <OrStatusTableCell
                    status={row.displayStatus}
                    downDateCount={row.dateDownCount as number}
                    sx={{ width: '100%', minWidth: '12ch' }}
                  />
                </span>
              </Tooltip>
            </AddSyncField>
          );
        case 'ecd':
          return (
            <AddSyncField syncs={row.fieldSyncStatus} field={key}>
              <Box>{value ? dayjs(value as string).format('MM/DD/YYYY') : '--'}</Box>
            </AddSyncField>
          );
        case 'remarks':
          return (
            <AddSyncField syncs={row.fieldSyncStatus} field={String(key)}>
              <Box>{value ? String(value).trim() : '--'}</Box>
            </AddSyncField>
          );
        case 'locationCode':
          return (
            <AddSyncField syncs={row.fieldSyncStatus} field={'location'}>
              <Box>{String(value ?? '--')}</Box>
            </AddSyncField>
          );
        default:
          return (
            <AddSyncField syncs={row.fieldSyncStatus} field={String(key)}>
              <Box>{String(value ?? '--')}</Box>
            </AddSyncField>
          );
      }
    },
  }));

  const uacTableColumns = UAC_EQUIPMENT_DETAILS_COLUMNS.map((column) => ({
    ...column,
    render: (value: IUAS[keyof IUAS], row: IUAS) => {
      const { key } = column;

      switch (key) {
        case 'actions':
          return (
            <Button onClick={() => onSingleEditClick(row.serialNumber, 'Uac')}>
              <EditIcon fontSize="small" />
            </Button>
          );
        case 'displayStatus':
          return (
            <AddSyncField syncs={row.fieldSyncStatus} field={'status'}>
              <Tooltip
                title={
                  row.dateDown ? (
                    <Stack direction="column" spacing={1}>
                      <Typography variant="body2">Date Down:</Typography>
                      <Typography variant="body1">{dayjs(row.dateDown).format('MM/DD/YYYY')}</Typography>
                    </Stack>
                  ) : (
                    'No date down'
                  )
                }
                placement="top"
              >
                <span>
                  <OrStatusTableCell
                    status={row.displayStatus}
                    downDateCount={row.dateDownCount as number}
                    sx={{ width: '100%', minWidth: '12ch' }}
                  />
                </span>
              </Tooltip>
            </AddSyncField>
          );
        case 'remarks':
          return (
            <AddSyncField syncs={row.fieldSyncStatus} field={String(key)}>
              <Box>{value ? String(value).trim() : '--'}</Box>
            </AddSyncField>
          );
        case 'locationCode':
          return (
            <AddSyncField syncs={row.fieldSyncStatus} field={'location'}>
              <Box>{String(value ?? '--')}</Box>
            </AddSyncField>
          );
        default:
          return (
            <AddSyncField syncs={row.fieldSyncStatus} field={String(key)}>
              <Box>{String(value ?? '--')}</Box>
            </AddSyncField>
          );
      }
    },
  }));

  const editData: IUAS[] | undefined = useMemo(() => {
    if (!(uacData && uavData) || editSerial.length === 0) {
      return undefined;
    }

    const uac: IUAS[] = uacData.filter((data) => editSerial.includes(data.serialNumber));
    const uav: IUAS[] = uavData.filter((data) => editSerial.includes(data.serialNumber));

    return [...uav, ...uac];
  }, [uacData, uavData, editSerial]);

  useEffect(() => {
    if (updated.length > 0) {
      // Promise.all([refetchUav(), refetchUac()]);
      if (editUasType === 'Uav') {
        refetchUav();
      } else {
        refetchUac();
      }
      const timer = setTimeout(() => {
        setUpdated([]);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [editUasType, refetchUac, refetchUav, updated]);

  if (isLoading) {
    return <Skeleton data-testid="em-carousel-loading" variant="rectangular" height={50} />;
  }

  const onEditClick = (uasType: UasType, key?: string) => {
    setEditUasType(uasType);
    const rowCheck = uasType === 'Uav' ? rowCheckUav : rowCheckUac;
    const toEdit = Object.keys(rowCheck).filter((key) => rowCheck[key] === true);
    setEditSerial(toEdit);

    if (toEdit.length === 1) {
      setOpenSingle(true);
    } else if (toEdit.length > 1) {
      if (uasType === 'Uav') {
        setEditTitle(aggUavData.keyTitleMapping[key as string]);
        setMultiEditData(aggUavData.transformedData[key as string]?.filter((uav) => toEdit.includes(uav.serialNumber)));
      } else {
        setEditTitle(aggUacData.keyTitleMapping[key as string]);
        setMultiEditData(aggUacData.transformedData[key as string]?.filter((uac) => toEdit.includes(uac.serialNumber)));
      }
      setOpenMulti(true);
    }
  };

  if (Object.keys(tableData).length === 0) return <></>;

  return (
    <Paper
      data-testid="uas-equipment-details"
      sx={{
        backgroundImage: 'none',
        ...(theme.palette.mode === 'dark' && { backgroundColor: theme.palette.layout.background5 }),
      }}
    >
      <Stack sx={{ p: '20px 16px' }} direction="column" spacing={3}>
        <Typography variant="h6">Equipment</Typography>
        <EquipmentManagerDetails
          title="UAV Details"
          isLoading={isLoading}
          columns={uavTableColumns as ColumnConfig<IUAS>[]}
          data={aggUavData.transformedData as Record<string, IUAS[]>}
          keyTitleMapping={dataKeysTitle}
          checkBox={true}
          rowKey="serialNumber"
          updatedRows={updated}
          setRowCheck={setRowCheckUav}
          rowCheck={rowCheckUav}
          onEditClick={(key) => onEditClick('Uav', key)}
          accordionVersion="uas"
          searchValue={uavSearchValue}
          setSearchValue={setUavSearchValue}
        />
        <EquipmentManagerDetails
          title="UAC Details"
          isLoading={isLoading}
          columns={uacTableColumns as ColumnConfig<IUAS>[]}
          data={aggUacData.transformedData as Record<string, IUAS[]>}
          keyTitleMapping={dataKeysTitle}
          checkBox={true}
          rowKey="serialNumber"
          updatedRows={updated}
          setRowCheck={setRowCheckUac}
          rowCheck={rowCheckUac}
          onEditClick={(key) => onEditClick('Uac', key)}
          accordionVersion="uas"
          searchValue={uacSearchValue}
          setSearchValue={setUacSearchValue}
        />
        {editData &&
          (editSerial.length === 1 ? (
            <UasSingleEdit
              data={editData[0] as IUAS}
              open={openSingle}
              setOpen={setOpenSingle}
              setUpdatedRows={setUpdated}
              setShowSnackbar={setShowSnackbar}
              uasType={editUasType}
            />
          ) : (
            <MultiStepProvider>
              <UasMultiEdit
                open={openMulti}
                setOpen={setOpenMulti}
                columns={
                  editUasType === 'Uav'
                    ? (uavTableColumns as ColumnConfig<IUAS>[])
                    : (uacTableColumns as ColumnConfig<IUAS>[])
                }
                rows={multiEditData as IUAS[]}
                setUpdatedRows={setUpdated}
                setShowSnackbar={setShowSnackbar}
                editUasType={editUasType}
                editTitle={editTitle}
              />
            </MultiStepProvider>
          ))}
      </Stack>
      <Snackbar
        data-testid={'uas-edit-undo-snackbar'}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        sx={{ marginTop: '75px', backgroundColor: theme.palette.layout?.background11 }}
        message={`${editSerial.join(', ')} information updated.`}
        autoHideDuration={4000}
      />
    </Paper>
  );
};

export default UasEquipmentDetailSection;
