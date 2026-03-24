import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Button, Typography, useTheme } from '@mui/material';

import { Column } from '@components/PmxTable';
import { PmxGroupData, PmxGroupedTable } from '@components/tables';
import EventDialog from '@features/amtp-packet/components/maintainer-record/EventDialog';
import StatusDisplay from '@features/amtp-packet/components/soldier-info/StatusDisplay';
import { IMaintainer, setMaintainer } from '@features/amtp-packet/slices';
import { IUnitRoster } from '@store/amap_ai/unit_health';
import { useLazyGetUserQuery } from '@store/amap_ai/user';
import { useAppDispatch } from '@store/hooks';
import { StatusType } from '@utils/constants';
import { determineEvaluationStatus } from '@utils/helpers/dataTransformer';

import { MXAvailabilityTooltip } from '../../dashboard/MXAvailabilityTooltip';
import { RosterTableFilters } from './UnitRosterTableFilters';

export interface IRosterTable {
  unitAvailabilityData: IUnitRoster[] | undefined;
  loading: boolean;
}

export const UnitRosterTable: React.FC<IRosterTable> = ({ unitAvailabilityData, loading }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [trigger] = useLazyGetUserQuery();

  const [filteredUnitRosterData, setFilteredUnitRosterData] = useState<IUnitRoster[]>([]);
  const [eventDialogId, setEventDialogId] = useState<number | undefined>(undefined);
  const [eventDialogUserId, setEventDialogUserId] = useState<string>('');
  const [eventDialogOpen, setEventDialogOpen] = useState<boolean>(false);

  const theme = useTheme();

  const groupedRosterData: PmxGroupData<IUnitRoster> = useMemo(() => {
    if (!filteredUnitRosterData) return [];

    const groups: Record<string, { id: string; label: string; children: IUnitRoster[] }> = {};

    filteredUnitRosterData.forEach((soldier) => {
      const unit = soldier.unit;

      if (!groups[unit]) {
        groups[unit] = {
          id: unit,
          label: unit,
          children: [],
        };
      }

      groups[unit].children.push(soldier);
    });

    return Object.values(groups);
  }, [filteredUnitRosterData]);

  const handleCallback = async (userId: string) => {
    const currentSoldier = await trigger({ userId }).unwrap();

    const selectedSoldier = {
      id: currentSoldier.userId,
      name: `${currentSoldier.rank} ${currentSoldier.firstName} ${currentSoldier.lastName}`,
      pv2Dor: currentSoldier.pv2Dor,
      pfcDor: currentSoldier.pfcDor,
      sfcDor: currentSoldier.sfcDor,
      sgtDor: currentSoldier.sgtDor,
      spcDor: currentSoldier.spcDor,
      ssgDor: currentSoldier.ssgDor,
    };

    await dispatch(setMaintainer(selectedSoldier as IMaintainer));
    navigate('/amtp-packet');
  };

  const handleClickEvaluation = (soldierData: IUnitRoster) => {
    setEventDialogId(soldierData.lastEvaluationData?.id);
    setEventDialogUserId(soldierData.userId);
    setEventDialogOpen(true);
  };

  const handleCloseEvaluationDialog = () => {
    setEventDialogId(undefined);
    setEventDialogOpen(false);
  };

  const columns: Column<IUnitRoster>[] = [
    { field: 'rank', header: 'Rank' },
    {
      field: 'name',
      header: 'Name',
      renderCell: (value, row) => (
        <Typography
          component="a"
          sx={{ textDecoration: 'underline', cursor: 'pointer' }}
          onClick={() => handleCallback(row.userId)}
        >
          {String(value ?? '')}
        </Typography>
      ),
    },
    { field: 'userId', header: 'DOD ID' },
    {
      field: 'availability',
      header: 'MX Availability',
      renderCell: (_value, row) => (
        <MXAvailabilityTooltip flagData={row.flagAvailabilityData}>
          <StatusDisplay status={row.availability as StatusType} iconOnly />
        </MXAvailabilityTooltip>
      ),
    },
    { field: 'mos', header: 'Primary MOS' },
    { field: 'ml', header: 'ML' },
    { field: 'birthMonth', header: 'Birth Month' },
    {
      field: 'lastEvaluationDate',
      header: 'Last Evaluation',
      renderCell: (value, row) =>
        String(value)?.toLowerCase() !== 'none' ? (
          <Button
            onClick={() => handleClickEvaluation(row)}
            variant="text"
            sx={{
              textTransform: 'none',
              color: 'inherit',
              '&:hover': { backgroundColor: theme.palette.action.hover },
            }}
          >
            {String(value ?? '')}
          </Button>
        ) : (
          <Typography sx={{ pl: 2 }}>{String(value ?? '')}</Typography>
        ),
    },
    {
      field: 'evaluationStatus',
      header: 'Evaluation Status',
      renderCell: (_val, row) => (
        <Typography>
          {row.lastEvaluationDate !== 'None'
            ? determineEvaluationStatus(row.evaluationStatus, row.lastEvaluationDate).label
            : 'Not Complete'}
        </Typography>
      ),
    },
  ];

  return (
    <React.Fragment>
      <Box display={'flex'} justifyContent={'flex-end'} sx={{ py: 4 }} aria-label="Table Header and Filters">
        <RosterTableFilters
          unitRosterData={unitAvailabilityData}
          setFilteredUnitRosterData={setFilteredUnitRosterData}
        />
      </Box>

      <PmxGroupedTable
        data={groupedRosterData}
        columns={columns}
        isExpandable={false}
        selectableRows={false}
        loading={loading}
      />

      <EventDialog
        dialogType="view"
        eventId={eventDialogId}
        open={eventDialogOpen}
        title="View Event"
        handleClose={handleCloseEvaluationDialog}
        formSubmitted={() => false}
        actions={
          <>
            <Button variant="outlined" onClick={handleCloseEvaluationDialog}>
              Close
            </Button>
            <Button variant="contained" onClick={() => handleCallback(eventDialogUserId)}>
              Go To AMTP Packet
            </Button>
          </>
        }
      />
    </React.Fragment>
  );
};
