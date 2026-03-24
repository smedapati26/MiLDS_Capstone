import React, { useMemo } from 'react';
import dayjs from 'dayjs';

import { useTheme } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { generateUniqueId } from '@utils/helpers/generateID-map-keys';

import { IMissionsFlownDetailDataSet } from '@store/griffin_api/readiness/models';

interface MissionDataWithId extends IMissionsFlownDetailDataSet {
  id: string;
}

const addIdsToData = (data: IMissionsFlownDetailDataSet[]): MissionDataWithId[] => {
  return data.map((row) => ({
    ...row,
    id: generateUniqueId(),
  }));
};

const MissionFlownTable: React.FC<{
  data: IMissionsFlownDetailDataSet[];
}> = ({ data: missionData }) => {
  const theme = useTheme();
  const dataWithIds = useMemo(() => addIdsToData(missionData), [missionData]);
  // Helper function to get the total mission hours

  const getTotalHours = (_value: unknown, row: MissionDataWithId): number => {
    const total = row.day_mission_hours + row.night_mission_hours;
    return Number(total.toFixed(2));
  };

  const formatDate = (dateString: string): string => {
    return dayjs(dateString).format('DDMMMYY').toUpperCase();
  };

  const getMissionType = (_value: unknown, row: IMissionsFlownDetailDataSet): string => {
    const mask = (row.day_mission_hours > 0 ? 1 : 0) | (row.night_mission_hours > 0 ? 2 : 0);

    const lookupTable: Record<number, string> = {
      0: '',
      1: 'Day',
      2: 'Night',
      3: 'Day / Night',
    };

    return lookupTable[mask];
  };

  const columns: GridColDef[] = [
    {
      field: 'unit',
      headerName: 'Unit',
      flex: 1,
      sortable: true,
      align: 'left',
      headerAlign: 'left',
      hideSortIcons: true,
    },
    {
      field: 'hours',
      headerName: 'Hours',
      flex: 1,
      sortable: true,
      valueGetter: getTotalHours,
      type: 'number',
      align: 'left',
      headerAlign: 'left',
      hideSortIcons: true,
    },
    {
      field: 'start_date',
      headerName: 'Start',
      flex: 1,
      sortable: true,
      valueFormatter: (value) => formatDate(value),
      type: 'date',
      align: 'left',
      headerAlign: 'left',
      hideSortIcons: true,
    },
    {
      field: 'stop_date',
      headerName: 'End',
      flex: 1,
      sortable: true,
      valueFormatter: (value) => formatDate(value),
      type: 'date',
      align: 'left',
      headerAlign: 'left',
      hideSortIcons: true,
    },
    {
      field: 'mission_type',
      headerName: 'Type',
      flex: 1,
      sortable: true,
      valueGetter: getMissionType,
      align: 'left',
      headerAlign: 'left',
      hideSortIcons: true,
    },
  ];

  const initialState = {
    pagination: {
      paginationModel: { pageSize: 10, page: 0 },
    },
  };

  return (
    <DataGrid
      rows={dataWithIds}
      columns={columns}
      initialState={initialState}
      pageSizeOptions={[10]}
      disableRowSelectionOnClick
      disableColumnMenu
      columnHeaderHeight={35}
      rowHeight={35}
      getRowHeight={() => 'auto'}
      sx={{
        '.MuiDataGrid-cell': {
          padding: theme.spacing(2),
          paddingLeft: theme.spacing(4),
          paddingRight: 0,
        },
        '.MuiTablePagination-root': {
          width: '100%',
        },
        '.MuiDataGrid-columnHeaders': {
          '.MuiDataGrid-columnHeader': {
            paddingLeft: theme.spacing(4),
            paddingRight: 0,
          },
        },
        '.MuiDataGrid-row': {
          fontWeight: '400',
        },
        '.MuiDataGrid-iconSeparator': {
          display: 'none',
        },
      }}
    />
  );
};

export default MissionFlownTable;
