import { Box, Theme, Typography } from '@mui/material';

import StatusDisplay from '@features/amtp-packet/components/soldier-info/StatusDisplay';
import {
  IUnitAvailabilitySoldierData,
  IUnitEvaluationsSoldierData,
  IUnitMissingPacketsSoldierData,
  IUnitRoster,
} from '@store/amap_ai/unit_health';
import { StatusType } from '@utils/constants';

import { MXAvailabilityTooltip } from './components/dashboard/MXAvailabilityTooltip';

export const unitHealthSoldierDataCols = (callback?: (val: string) => void) => [
  {
    field: 'name',
    header: 'Soldier',
    renderCell: (soldierName: string, soldierData: IUnitAvailabilitySoldierData) => {
      return (
        <Box key={`${soldierName}-${soldierData.userId}`}>
          <Typography
            component="a"
            sx={{
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            {...(callback && { onClick: () => callback(soldierData.userId) })}
          >
            {soldierName}
          </Typography>
        </Box>
      );
    },
  },
  { field: 'userId', header: 'DOD ID' },
  { field: 'email', header: 'Email' },
  {
    field: 'availability',
    header: 'MX Availability',
    renderCell: (mxAvailability: string, soldierData: IUnitAvailabilitySoldierData) => {
      return (
        <MXAvailabilityTooltip flagData={soldierData.flagDetails}>
          <Box component="span" display="inline-block" width="100%">
            <StatusDisplay
              key={soldierData?.userId}
              status={mxAvailability === 'Available' ? mxAvailability : (`Flagged - ${mxAvailability}` as StatusType)}
              iconOnly
            />
          </Box>
        </MXAvailabilityTooltip>
      );
    },
  },
  { field: 'unit', header: 'Unit' },
  { field: 'mos', header: 'MOS' },
  { field: 'ml', header: 'ML' },
];

export const unitHealthSoldierEvaluationsCols = (theme: Theme, callback?: (val: string) => void) => [
  {
    field: 'name',
    header: 'Soldier',
    renderCell: (soldierName: string, soldierData: IUnitEvaluationsSoldierData) => {
      return (
        <Box key={`${soldierName}-${soldierData.userId}`}>
          <Typography
            component="a"
            sx={{
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            {...(callback && { onClick: () => callback(soldierData.userId) })}
          >
            {soldierName}
          </Typography>
        </Box>
      );
    },
  },
  { field: 'userId', header: 'DOD ID' },
  {
    field: 'evaluationStatus',
    header: 'Annual Evaluation',
    renderCell: (evaluationStatus: string) => {
      return (
        <Typography
          variant="body1"
          sx={{ color: evaluationStatus.toLowerCase().includes('overdue') ? theme.palette.error.d20 : '' }}
        >
          {evaluationStatus}
        </Typography>
      );
    },
  },
  { field: 'unit', header: 'Unit' },
  { field: 'mos', header: 'MOS' },
  { field: 'ml', header: 'ML' },
];

export const unitHealthSoldierMissingPacketCols = (theme: Theme, callback?: (val: string) => void) => [
  {
    field: 'name',
    header: 'Soldier',
    renderCell: (soldierName: string, soldierData: IUnitMissingPacketsSoldierData) => {
      return (
        <Box key={`${soldierName}-${soldierData.userId}`}>
          <Typography
            component="a"
            sx={{
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            {...(callback && { onClick: () => callback(soldierData.userId) })}
          >
            {soldierName}
          </Typography>
        </Box>
      );
    },
  },
  { field: 'userId', header: 'DOD ID' },
  {
    field: 'packetStatus',
    header: 'Packet Status',
    renderCell: (packetStatus: string) => {
      return (
        <Typography
          variant="body1"
          sx={{ color: packetStatus.toLowerCase().includes('missing') ? theme.palette.error.d20 : '' }}
        >
          {packetStatus}
        </Typography>
      );
    },
  },
  {
    field: 'arrivalAtUnit',
    header: 'Arrival at Unit',
    renderCell: (arrivalDate: string | undefined) => {
      return <Typography variant="body1">{arrivalDate ?? '--'}</Typography>;
    },
  },
  { field: 'unit', header: 'Unit' },
];

export const unitHealthRosterCols = (_theme: Theme, callback?: (val: string) => void) => [
  {
    field: 'rank',
    header: 'Rank',
  },
  {
    field: 'name',
    header: 'Soldier',
    renderCell: (soldierName: string, soldierData: IUnitMissingPacketsSoldierData) => {
      return (
        <Box key={`${soldierName}-${soldierData.userId}`}>
          <Typography
            component="a"
            sx={{
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            {...(callback && { onClick: () => callback(soldierData.userId) })}
          >
            {soldierName}
          </Typography>
        </Box>
      );
    },
  },
  { field: 'userId', header: 'DOD ID' },
  {
    field: 'availability',
    header: 'MX Availability',
    renderCell: (mxAvailability: string, soldierData: IUnitAvailabilitySoldierData) => {
      return (
        <MXAvailabilityTooltip flagData={soldierData.flagDetails}>
          <Box component="span" display="inline-block" width="100%">
            <StatusDisplay
              key={soldierData?.userId}
              status={mxAvailability === 'Available' ? mxAvailability : (`Flagged - ${mxAvailability}` as StatusType)}
              iconOnly
            />
          </Box>
        </MXAvailabilityTooltip>
      );
    },
  },
  {
    field: 'mos',
    header: 'Primary MOS',
  },
  { field: 'ml', header: 'ML' },
  {
    field: 'birthMonth',
    header: 'Birth Month',
  },
  {
    field: 'lastEvaluationDate',
    header: 'Last Evaluation',
    renderCell: (lastEvaluationDate: string, _evaluationdata: IUnitRoster) => {
      return <Typography>{lastEvaluationDate}</Typography>;
    },
  },
  {
    field: 'evaluationStatus',
    header: 'Evaluation Status',
  },
];

export const MOSMLReportColumns = [
  {
    field: 'mos',
    header: 'MOS',
  },
  {
    field: 'ml0',
    header: 'ML 0',
  },
  {
    field: 'ml1',
    header: 'ML 1',
  },
  {
    field: 'ml2',
    header: 'ML 2',
  },
  {
    field: 'ml3',
    header: 'ML 3',
  },
  {
    field: 'ml4',
    header: 'ML 4',
  },
  {
    field: 'missingPackets',
    header: 'Missing Packets',
  },
  {
    field: 'total',
    header: 'Total',
  },
  {
    field: 'available',
    header: 'Available',
  },
];

export const MOSReportColumns = [
  {
    field: 'mos',
    header: 'MOS',
  },
  {
    field: 'missingPackets',
    header: 'Missing Packets',
  },
  {
    field: 'total',
    header: 'Total',
  },
  {
    field: 'available',
    header: 'Available',
  },
];

export const MLReportColumns = [
  {
    field: 'mos',
    header: 'ML',
  },
  {
    field: 'missingPackets',
    header: 'Missing Packets',
  },
  {
    field: 'total',
    header: 'Total',
  },
  {
    field: 'available',
    header: 'Available',
  },
];

export const UnitEventsReportColumns = [
  {
    field: 'soldierName',
    header: 'Soldier',
  },
  {
    field: 'mos',
    header: 'MOS',
  },
  {
    field: 'unit',
    header: 'Unit',
  },
  {
    field: 'birthMonth',
    header: 'Birth Month',
  },
];

export const UnitTaskReportExportableColumns = [
  { field: 'soldierId', header: 'Soldier ID' },
  { field: 'soldierName', header: 'Soldier Name' },
  { field: 'mos', header: 'MOS' },
  { field: 'unit', header: 'Unit' },
  { field: 'birthMonth', header: 'Birth Month' },
  { field: 'ctlName', header: 'CTL Name' },
  { field: 'taskName', header: 'Task Name' },
  { field: 'familiarizedDate', header: 'Familarized Date' },
  { field: 'familiarizedGoNoGo', header: 'Familarized Go-NoGo' },
  { field: 'trainedDate', header: 'Trained Date' },
  { field: 'trainedGoNoGo', header: 'Trained Go-NoGo' },
  { field: 'evaluatedDate', header: 'Evaluation Date' },
  { field: 'evaluatedGoNoGo', header: 'Evaluation Go-NoGo' },
];
