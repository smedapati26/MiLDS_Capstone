import React, { useEffect, useMemo, useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import { Button, Paper, Snackbar, Stack, Typography, useTheme } from '@mui/material';

import { ColumnConfig, OrStatusTableCell } from '@components/data-tables';
import AGSEMultiEdit from '@features/equipment-manager/agse/AGSEMultiEdit';
import AGSESingleEdit from '@features/equipment-manager/agse/AGSESingleEdit';
import EquipmentManagerDetails from '@features/equipment-manager/components/EquipmentManagerDetails';
import { useEquipmentManagerContext } from '@features/equipment-manager/EquipmentManagerContext';

import { AGSE_EQUIPMENT_DETAILS_COLUMNS, IAGSE, IAGSESubordinate, ISync } from '@store/griffin_api/agse/models';
import { useGetAGSESubordinateQuery } from '@store/griffin_api/agse/slices/agseApi';

const AGSEEquipmentDetailsSection: React.FC = (): JSX.Element => {
  const theme = useTheme();
  const { chosenUic } = useEquipmentManagerContext();
  const [rowCheck, setRowCheck] = useState<Record<string, boolean>>({});
  const [openSingle, setOpenSingle] = useState<boolean>(false);
  const [openMulti, setOpenMulti] = useState<boolean>(false);
  const [editEquipmentNumber, setEditEquipmentNumber] = useState<string[]>([]);
  const [updated, setUpdated] = useState<string[]>([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const {
    data: agseSub,
    isLoading,
    refetch,
  } = useGetAGSESubordinateQuery({ uic: chosenUic, search: searchValue }, { skip: !chosenUic || chosenUic === '' });

  function transformData(data: IAGSESubordinate[] | undefined): {
    transformedData: Record<string, IAGSE[]>;
    keyTitleMapping: Record<string, React.ReactNode>;
  } {
    if (!data) return { transformedData: {}, keyTitleMapping: {} };
    return data?.reduce<{
      transformedData: Record<string, IAGSE[]>;
      keyTitleMapping: Record<string, React.ReactNode>;
    }>(
      (acc, item) => {
        const accordionKey = `${item.shortName}-${item.displayName}`;
        acc.transformedData[accordionKey] = item.agse;
        acc.keyTitleMapping[accordionKey] = (
          <Stack direction="row" spacing={8} alignItems="center">
            <Typography variant="body2">
              {item.shortName} ({item.uic})
            </Typography>
            <Typography variant="body2">{item.displayName}</Typography>
          </Stack>
        );
        return acc;
      },
      { transformedData: {}, keyTitleMapping: {} },
    );
  }

  const { transformedData, keyTitleMapping } = useMemo(() => transformData(agseSub), [agseSub]);

  const onSingleEditClick = (serial: string): void => {
    setEditEquipmentNumber([serial]);
    setOpenSingle(true);
  };

  const tableColumns = AGSE_EQUIPMENT_DETAILS_COLUMNS.map((column) => ({
    ...column,
    render: (value: IAGSE[keyof IAGSE], row: IAGSE) => {
      const { key } = column;

      switch (key) {
        case 'location':
          return row.location?.code;
        case 'status':
          return (
            <OrStatusTableCell
              status={row.status as string}
              downDateCount={row.earliestNmcStartCount as number}
              sx={{ minWidth: '12ch' }}
            />
          );
        case 'actions':
          return (
            <Button onClick={() => onSingleEditClick(row.equipmentNumber)}>
              <EditIcon fontSize="small" />
            </Button>
          );
        case 'remarks':
          return value ? String(value).trim() : '--';
        default:
          return value ?? '--';
      }
    },
  }));

  const onEditClick = () => {
    const toEdit = Object.keys(rowCheck).filter((key) => rowCheck[key] === true);
    setEditEquipmentNumber(toEdit);

    if (toEdit.length === 1) {
      setOpenSingle(true);
    } else if (toEdit.length > 1) {
      setOpenMulti(true);
    }
  };

  const editData: IAGSESubordinate[] | undefined = useMemo(() => {
    if (!agseSub || editEquipmentNumber.length === 0) {
      return undefined;
    }

    const returnData = agseSub
      .map((sub) => ({
        ...sub,
        agse: sub.agse.filter((agse) => editEquipmentNumber.includes(agse.equipmentNumber)),
        syncs: sub.syncs.filter((sync) => editEquipmentNumber.includes(sync.equipmentNumber)),
      }))
      .filter((sub) => sub.agse.length > 0);

    return returnData;
  }, [agseSub, editEquipmentNumber]);

  const multiEditData = useMemo(() => transformData(editData), [editData]);
  const multiEditColumns = useMemo(() => tableColumns.filter((col) => col.key !== 'actions'), [tableColumns]);

  useEffect(() => {
    if (updated.length > 0) {
      refetch();
      const timer = setTimeout(() => {
        setUpdated([]);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [refetch, updated]);

  if (agseSub?.length === 0) return <></>;

  return (
    <Paper data-testid="agse-equipment-details">
      <Stack sx={{ p: '20px 16px' }} direction="column" spacing={3}>
        <Typography variant="h6">Equipment</Typography>
        <EquipmentManagerDetails
          title="AGSE Details"
          isLoading={isLoading}
          columns={tableColumns as ColumnConfig<IAGSE>[]}
          data={transformedData as Record<string, IAGSE[]>}
          keyTitleMapping={keyTitleMapping}
          checkBox={true}
          rowKey="equipmentNumber"
          rowCheck={rowCheck}
          setRowCheck={setRowCheck}
          onEditClick={onEditClick}
          updatedRows={updated}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        {editData &&
          (editEquipmentNumber.length === 1 ? (
            <AGSESingleEdit
              data={editData[0].agse[0] as IAGSE}
              syncData={editData[0].syncs[0] as ISync}
              open={openSingle}
              setOpen={setOpenSingle}
              setUpdatedRows={setUpdated}
              setShowSnackbar={setShowSnackbar}
            />
          ) : (
            <AGSEMultiEdit
              open={openMulti}
              setOpen={setOpenMulti}
              columns={multiEditColumns as ColumnConfig<IAGSE>[]}
              data={multiEditData.transformedData}
              keyTitleMapping={multiEditData.keyTitleMapping}
              setUpdatedRows={setUpdated}
              setShowSnackbar={setShowSnackbar}
            />
          ))}
      </Stack>
      <Snackbar
        data-testid={'aircraft-edit-undo-snackbar'}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        sx={{ marginTop: '75px', backgroundColor: theme.palette.layout?.background11 }}
        message={`${editEquipmentNumber.join(', ')} information updated.`}
        autoHideDuration={4000}
      />
    </Paper>
  );
};

export default AGSEEquipmentDetailsSection;
