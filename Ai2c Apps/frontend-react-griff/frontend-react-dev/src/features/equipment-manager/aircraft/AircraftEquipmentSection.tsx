import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

import EditIcon from '@mui/icons-material/Edit';
import { Button, Paper, Snackbar, Stack, Tooltip, Typography, useTheme } from '@mui/material';

import { ColumnConfig, OrStatusTableCell } from '@components/data-tables';
import { PmxEllipsisText } from '@components/index';
import AircraftModsKits from '@features/equipment-manager/aircraft/AircraftModsKits';
import AircraftMultiEdit from '@features/equipment-manager/aircraft/AircraftMultiEdit';
import AircraftSingleEdit from '@features/equipment-manager/aircraft/AircraftSingleEdit';
import ModsTooltip from '@features/equipment-manager/aircraft/components/ModsTooltip';
import AcdUploadButton from '@features/equipment-manager/components/AcdUploadButton';
import EquipmentManagerDetails from '@features/equipment-manager/components/EquipmentManagerDetails';
import EquipmentManagerModKits from '@features/equipment-manager/components/EquipmentManagerModKits';
import { useEquipmentManagerContext } from '@features/equipment-manager/EquipmentManagerContext';
import { formatNumbers } from '@utils/helpers';

import {
  AIRCRAFT_EQUIPMENT_DETAILS_COLUMNS,
  IAircraftEquipmentDetails,
  IAircraftEquipmentDetailsInfo,
  IAircraftInspection,
  IEquipmentDetailsColumnMapping,
} from '@store/griffin_api/aircraft/models';
import { useGetAircraftEquipmentDetailsQuery } from '@store/griffin_api/aircraft/slices';
import { useGetSelectedModsByUicQuery } from '@store/griffin_api/mods/slices';

interface ITransformation {
  transformedData: Record<string, IAircraftEquipmentDetailsInfo[]>;
  keyTitleMapping: Record<string, React.ReactNode>;
  dynamicColumns: Record<string, IEquipmentDetailsColumnMapping[]>;
}

type TransformedAircraftEquipmentDetailsInfo = IAircraftEquipmentDetailsInfo & {
  inspections?: Record<string, number>; // Dynamically added inspection keys with `tillDue` values
};

/**
 * Generate the columns to be dynamic for each table in accordion
 * @param inspections - the dictionary that will control the columns
 * @returns
 */
const generateDynamicColumns = (
  inspections: IAircraftInspection[],
  onEdit: ((value: string) => void) | undefined,
  truncateRemarks?: boolean,
  columns: IEquipmentDetailsColumnMapping[] = AIRCRAFT_EQUIPMENT_DETAILS_COLUMNS,
): IEquipmentDetailsColumnMapping[] => {
  const uniqueInspectionNames = new Set<string>(); // Track unique inspection names

  const inspectionColumns = inspections
    .filter((inspection) => {
      // Only process inspections with unique names
      if (uniqueInspectionNames.has(inspection.inspectionName)) {
        return false; // Skip duplicates
      }
      uniqueInspectionNames.add(inspection.inspectionName);
      return true;
    })
    .map((inspection) => ({
      label: inspection.inspectionName,
      key: `inspections.${inspection.inspectionName}` as `inspections.${string}`, // Allow dynamic inspection name as key
      width: '10%',
      render: (_: unknown, row: TransformedAircraftEquipmentDetailsInfo) => {
        // NOTE: Not deleting this, because we are going to implement this after MVP
        // const maintenance = row.events.find(
        //   (event) => event.inspection?.inspectionName === inspection.inspectionName,
        // )?.maintenance;

        return (
          formatNumbers(row.inspections?.[inspection.inspectionName], 1) ?? '--'
          // NOTE: Not deleting this, because we are going to implement this after MVP
          // <PmxClickableTooltip
          //   value={formatNumbers(row.inspections?.[inspection.inspectionName], 0)}
          //   title={
          //     <MaintenanceTitle
          //       title={`${inspection.inspectionName} Maintenance Event`}
          //       tillDue={row.inspections?.[inspection.inspectionName]}
          //       maintenance={maintenance}
          //     />
          //   }
          // />
        );
      },
    }));

  // rendering columns based no headers
  const staticColumns = columns.map((column) => ({
    ...column,
    render: (
      value: IAircraftEquipmentDetailsInfo[keyof IAircraftEquipmentDetailsInfo], // value based on a key
      row: IAircraftEquipmentDetailsInfo, // whole row
    ) => {
      const { key } = column;

      switch (key) {
        case 'modifications':
          return (
            <Tooltip
              id={`${row.serial}-mods-${row.modifications.length}`}
              placement="top"
              sx={{
                maxHeight: '330px',
                overflow: 'auto',
              }}
              title={<ModsTooltip serial={row.serial} mods={row.modifications} />}
            >
              <Typography variant="body1">{row.modifications.length}</Typography>
            </Tooltip>
          );
        case 'location':
          return row.location?.code;
        case 'ORStatus':
          return (
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
                  status={row.ORStatus}
                  downDateCount={row.dateDownCount as number}
                  sx={{ minWidth: '12ch' }}
                />
              </span>
            </Tooltip>
          );
        case 'ecd':
          return value ? dayjs(value as Date).format('MM/DD/YYYY') : '--';
        case 'totalAirframeHours':
          return formatNumbers(value as string, 1) ?? '--';
        case 'flightHours':
          return formatNumbers(value as string, 1) ?? '--';
        case 'remarks':
          return truncateRemarks ? (
            <PmxEllipsisText text={value ? String(value).trim() : '--'} maxLength={8} />
          ) : (
            <Typography>{value ? String(value).trim() : '--'}</Typography>
          );
        case 'actions':
          return (
            <Button onClick={() => onEdit && onEdit(row.serial)}>
              <EditIcon fontSize="small" />
            </Button>
          );
        default:
          return value ?? '--';
      }
    },
  }));

  // Find the index of the "Location" column
  const locationColumnIndex = staticColumns.findIndex((column) => column.key === 'location');

  // Create a copy of the original columns
  const updatedColumns = [...staticColumns];

  // Insert inspection columns before the "Location" column
  updatedColumns.splice(locationColumnIndex, 0, ...inspectionColumns);
  if (truncateRemarks) {
    // Remove the Remarks column and insert it after SN
    const remarksColumnIndex = updatedColumns.findIndex((column) => column.key === 'remarks');
    const [remarksItem] = updatedColumns.splice(remarksColumnIndex, 1);
    updatedColumns.splice(1, 0, remarksItem);
  }

  return updatedColumns;
};

/**
 * Transform the data
 * @param data - data of table
 * @returns
 */
const preprocessTableData = (data: IAircraftEquipmentDetailsInfo[]): TransformedAircraftEquipmentDetailsInfo[] => {
  return data.map((item) => {
    const inspections = item.events.reduce(
      (acc, event) => {
        if (event.inspection) {
          acc[event.inspection.inspectionName] = event.inspection.tillDue; // Use inspectionName as the key
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      ...item,
      inspections, // Add the dynamically generated inspection keys
    };
  });
};

const extractInspections = (aircraft: IAircraftEquipmentDetailsInfo[]): IAircraftInspection[] => {
  return aircraft.flatMap((item) =>
    item.events.map((event) => event.inspection).filter((inspection) => inspection !== null),
  );
};

/**
 * Aircraft Equipment Details section
 * @returns
 */
const AircraftEquipmentDetailsSection: React.FC = (): JSX.Element => {
  const theme = useTheme();
  const { chosenUic } = useEquipmentManagerContext();
  const [rowCheck, setRowCheck] = useState<Record<string, boolean>>({});
  const [openSingle, setOpenSingle] = useState<boolean>(false);
  const [openMulti, setOpenMulti] = useState<boolean>(false);
  const [editSerial, setEditSerial] = useState<string[]>([]);
  const [updated, setUpdated] = useState<string[]>([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [filterSerial, setFilterSerial] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');

  const {
    data,
    isLoading: detailsLoading,
    isFetching: detailsFetching,
    refetch,
  } = useGetAircraftEquipmentDetailsQuery(
    { uic: chosenUic, serials: filterSerial, search: searchValue },
    { skip: chosenUic === '' },
  );
  const {
    data: modsData,
    isLoading: modsLoading,
    isFetching: modsFetching,
  } = useGetSelectedModsByUicQuery(chosenUic, { skip: chosenUic === '' });

  const onSingleEditClick = (value: string) => {
    setEditSerial([value]);
    setOpenSingle(true);
  };

  function transformData(
    data: IAircraftEquipmentDetails[] | undefined,
    isMultiEditData: boolean = false,
  ): ITransformation {
    if (!data) return { transformedData: {}, keyTitleMapping: {}, dynamicColumns: {} };
    return data?.reduce<ITransformation>(
      (acc, item) => {
        item.models.map((model) => {
          const accordionKey = `${item.unitShortName}-${model.model}`;
          acc.transformedData[accordionKey] = preprocessTableData(model.aircraft);
          acc.keyTitleMapping[accordionKey] = (
            <Stack direction="row" spacing={8} alignItems="center">
              <Typography variant="body2">
                {item.unitShortName} ({item.unitUic})
              </Typography>
              <Typography variant="body2">{model.model}</Typography>
            </Stack>
          );

          // extract inspection for this table
          const inspections = extractInspections(model.aircraft);

          const columns = AIRCRAFT_EQUIPMENT_DETAILS_COLUMNS.filter((col) => col.key !== 'actions');
          if (isMultiEditData) {
            acc.dynamicColumns[accordionKey] = generateDynamicColumns(inspections, undefined, true, columns);
          } else {
            acc.dynamicColumns[accordionKey] = generateDynamicColumns(inspections, onSingleEditClick);
          }
        });

        return acc;
      },
      { transformedData: {}, keyTitleMapping: {}, dynamicColumns: {} },
    );
  }

  const onEditClick = () => {
    const toEdit = Object.keys(rowCheck).filter((key) => rowCheck[key] === true);
    setEditSerial(toEdit);

    if (toEdit.length === 1) {
      setOpenSingle(true);
    } else if (toEdit.length > 1) {
      setOpenMulti(true);
    }
  };

  const editData: IAircraftEquipmentDetails[] | undefined = useMemo(() => {
    if (!data || editSerial.length === 0) {
      return undefined; // Return undefined
    }

    const returnData = data
      .map((unit) => ({
        ...unit,
        models: unit.models
          .map((modelGroup) => ({
            ...modelGroup,
            aircraft: modelGroup.aircraft.filter((aircraft) => editSerial.includes(aircraft.serial)),
          }))
          .filter((modelGroup) => modelGroup.aircraft.length > 0), // Keep only models with matching aircraft
      }))
      .filter((unit) => unit.models.length > 0);

    return returnData;
  }, [data, editSerial]);

  const { transformedData, keyTitleMapping, dynamicColumns } = useMemo<ITransformation>(
    () => transformData(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const multiEditData = useMemo<ITransformation>(() => transformData(editData, true), [editData]);

  useEffect(() => {
    // flash for a sec
    if (updated.length > 0) {
      refetch();
      const timer = setTimeout(() => {
        setUpdated([]);
      }, 1000);

      // Cleanup the timer when the component unmounts or `updated` changes
      return () => clearTimeout(timer);
    }
  }, [refetch, updated]);

  if ((!data && !modsData) || (data?.length === 0 && modsData?.length === 0)) return <></>;

  return (
    <Paper data-testid="em-aircraft-equipment-details">
      <Stack sx={{ py: 5, px: 4 }} direction="column" spacing={3}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">Equipment</Typography>
          <AcdUploadButton />
        </Stack>
        <EquipmentManagerModKits isLoading={modsLoading || modsFetching}>
          <AircraftModsKits data={modsData} setSerialFilter={setFilterSerial} />
        </EquipmentManagerModKits>
        <EquipmentManagerDetails
          title="Aircraft Details"
          isLoading={detailsLoading || detailsFetching}
          columns={dynamicColumns as Record<string, ColumnConfig<IAircraftEquipmentDetailsInfo>[]>}
          data={transformedData}
          keyTitleMapping={keyTitleMapping}
          checkBox={true}
          rowKey="serial"
          rowCheck={rowCheck}
          setRowCheck={setRowCheck}
          onEditClick={onEditClick}
          updatedRows={updated}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        {editData &&
          (editSerial.length === 1 ? (
            <AircraftSingleEdit
              data={editData[0] as IAircraftEquipmentDetails}
              open={openSingle}
              setOpen={setOpenSingle}
              setUpdatedRows={setUpdated}
              setShowSnackbar={setShowSnackbar}
            />
          ) : (
            <AircraftMultiEdit
              open={openMulti}
              setOpen={setOpenMulti}
              columns={multiEditData.dynamicColumns as Record<string, ColumnConfig<IAircraftEquipmentDetailsInfo>[]>}
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
        message={`${editSerial.join(', ')} information updated.`}
        autoHideDuration={4000}
      />
    </Paper>
  );
};

export default AircraftEquipmentDetailsSection;
