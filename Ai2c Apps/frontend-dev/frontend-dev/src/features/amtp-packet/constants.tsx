import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Theme, Typography } from '@mui/material';

import { CenterItem } from '@components/alignment';
import { PmxIconLink } from '@components/PmxIconLink';
import { IDA4856AssocaitedEvent } from '@store/amap_ai/counselings';
import { IDa7817s } from '@store/amap_ai/events';
import { FaultAction, FaultDetails } from '@store/amap_ai/faults/models';
import { ICtlsColumns } from '@store/amap_ai/readiness/models';
import { ISoldierFlag } from '@store/amap_ai/soldier_flag/models';
import { SupportingDocumentAssocaitedEvent } from '@store/amap_ai/supporting_documents/models';
import { StatusType } from '@utils/constants';

import StatusDisplay from './components/soldier-info/StatusDisplay';

export const criticalTaskCols = (
  theme: Theme,
  callback?: (val: number) => void,
  handleDownload?: (val: string) => void,
) => [
  { field: 'taskNumber', header: 'Task #' },
  {
    field: 'taskTitle',
    header: 'Task Title',
    renderCell: (_rowData: string, row: ICtlsColumns) => {
      return (
        <PmxIconLink
          isUnderlined={false}
          label={row.taskTitle}
          text={row.taskTitle}
          onClick={() => handleDownload && handleDownload(row.taskNumber)}
        />
      );
    },
  },
  { field: 'frequency', header: 'Frequency' },
  { field: 'subjectArea', header: 'Subject Area' },
  { field: 'skillLevel', header: 'SL' },
  { field: 'mos', header: 'MOS' },
  {
    field: 'lastTrained',
    header: 'Trained',
    renderCell: (rowData: string | null, row: ICtlsColumns) => {
      return rowData ? (
        <Typography
          component="a"
          sx={{
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
          {...(callback && row?.lastTrainedId && { onClick: () => callback(row.lastTrainedId as number) })}
        >
          {rowData}
        </Typography>
      ) : (
        '--'
      );
    },
  },
  {
    field: 'lastEvaluated',
    header: 'Evaluated',
    renderCell: (rowData: string | null, row: ICtlsColumns) => {
      return rowData ? (
        <Typography
          component="a"
          sx={{
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
          {...(callback && row?.lastEvaluatedById && { onClick: () => callback(row.lastEvaluatedById as number) })}
        >
          {rowData}
        </Typography>
      ) : (
        '--'
      );
    },
  },
  {
    field: 'nextDue',
    header: 'Next Due (days)',
    renderCell: (value: string | null) => {
      if (!value) {
        return '--';
      }
      const dueDate = Number(value);
      let colorStyle;

      if (dueDate <= 0) {
        colorStyle = theme.palette.error.main;
      } else if (dueDate <= 30) {
        colorStyle = theme.palette.error.main;
      } else if (dueDate <= 60) {
        colorStyle = theme.palette.warning.main;
      } else if (dueDate <= 90) {
        colorStyle = theme.palette.info.main;
      } else {
        colorStyle = theme.palette.success.main;
      }

      return <span style={{ color: colorStyle }}>{`${dueDate} days`}</span>;
    },
  },
];

export const maintainerRecordCols = [
  { field: 'date', header: 'Entry Date' },
  {
    field: 'mos',
    header: 'MOS-ML',
    renderCell: (_value: string | null, row: IDa7817s) => {
      if (!row.mos && !row.maintenanceLevel) {
        return '--';
      }
      return `${row?.mos ?? 'n/a'} - ${row?.maintenanceLevel ?? 'n/a'}`;
    },
  },
  {
    field: 'evaluationType',
    header: 'Event Info',
    renderCell: (_value: string, row: IDa7817s) => {
      const fields = [
        row.evaluationType,
        row.awardType,
        row.tcsLocation,
        row.trainingType,
        row.gainingUnit?.displayName,
      ];

      const eventInfo = fields.find((value) => value !== null && value !== undefined) || 'N/A';

      return `${row.eventType} - ${eventInfo}`;
    },
  },
  { field: 'comment', header: 'Comments' },
  {
    field: 'eventTasks',
    header: 'Associated Tasks',
    renderCell: (tasks: { number: string; name: string; goNoGo: string }[]) => {
      if (tasks && tasks.length > 0) {
        return tasks.map((task) => `${task.number} - ${task.name}`).join(', ');
      }
      return '--';
    },
  },
  {
    field: 'goNogo',
    header: 'GO/NOGO',
    renderCell: (value: string | null) => {
      if (!value) {
        return '--';
      }
      return value;
    },
  },
  { field: 'recorder', header: 'Recorder' },
  { field: 'totalMxHours', header: 'Total Hours' },
];

export const supportingDocumentsCols = (callback?: (val: number) => void) => [
  { field: 'uploadDate', header: 'Upload Date' },
  { field: 'documentDate', header: 'Document Date' },
  { field: 'documentTitle', header: 'Title' },
  {
    field: 'relatedEvent',
    header: 'Associated Event',
    renderCell: (event: SupportingDocumentAssocaitedEvent | null) => {
      return (
        <Box>
          {event && (
            <Typography
              component="a"
              sx={{
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              {...(callback && { onClick: () => callback(event.id) })}
            >
              {event.date} - {event.eventType} {event.eventSubType ? `- ${event.eventSubType}` : ''}
            </Typography>
          )}
          {!event && <Typography>--</Typography>}
        </Box>
      );
    },
  },
  { field: 'relatedDesignation', header: 'Associated Designation' },
  { field: 'uploadedBy', header: 'Recorder' },
];

export const counselingCols = (callback?: (val: number) => void) => [
  { field: 'date', header: 'Date' },
  { field: 'title', header: 'Title' },
  {
    field: 'associatedEvent',
    header: 'Associated Event',
    renderCell: (event: IDA4856AssocaitedEvent | null) => {
      return (
        <Box>
          {event && (
            <Typography
              component="a"
              sx={{
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              {...(callback && { onClick: () => callback(event.id) })}
            >
              {event.date} - {event.eventType} {event.eventSubType ? `- ${event.eventSubType}` : ''}
            </Typography>
          )}
          {!event && <Typography>--</Typography>}
        </Box>
      );
    },
  },
  { field: 'uploadedBy', header: 'Recorder' },
];

export const soldierFlagCols = [
  { field: 'flagType', header: 'Type' },
  { field: 'flagInfo', header: 'Flag Information' },
  {
    field: 'mxAvailability',
    header: 'MX Availablity',
    renderCell: (mxAvailability: string | null, rowData: ISoldierFlag | null) => {
      return (
        <StatusDisplay
          key={rowData?.id}
          status={mxAvailability === 'Available' ? mxAvailability : (`Flagged - ${mxAvailability}` as StatusType)}
          iconOnly
        />
      );
    },
  },
  { field: 'startDate', header: 'Start Date' },
  { field: 'endDate', header: 'End Date' },
  { field: 'flagRemarks', header: 'Flag Remarks' },
  { field: 'createdByName', header: 'Recorder' },
  { field: 'lastModifiedName', header: 'Updated by' },
  { field: 'unitName', header: 'Unit' },
];

export const soldierPersonnelFlagCols = [
  { field: 'primaryMos', header: 'MOS' },
  { field: 'rank', header: 'Rank' },
  {
    field: 'firstName',
    header: 'First Name',
  },
  { field: 'lastName', header: 'Last Name' },
  { field: 'unitName', header: 'Unit' },
];

export const faultRecordsCols = (callback: (val: string) => void) => [
  { field: 'faultActionId', header: '13-2 ID' },
  { field: 'role', header: 'Role' },
  {
    field: 'faultDetails',
    header: '13-1',
    renderCell: (val: FaultDetails, row: FaultAction) => (
      <PmxIconLink
        label="Fault Details Open Button"
        ComponentIcon={OpenInNewIcon}
        text={row?.faultDetails.aircraft}
        align="right"
        onClick={() => callback(val.faultId)}
        tooltipTitle={
          <>
            <CenterItem>
              <Typography variant="body1">13-1 ID:</Typography>
              <Typography variant="body1" ml={3}>
                {row?.faultDetails.faultId}
              </Typography>
            </CenterItem>
            <CenterItem>
              <Typography variant="body1">Aircraft:</Typography>
              <Typography variant="body1" ml={3}>
                {row?.faultDetails?.aircraft}
              </Typography>
            </CenterItem>
            <CenterItem>
              <Typography variant="body1">Unit:</Typography>
              <Typography variant="body1" ml={3}>
                {row?.faultDetails?.unitName}
              </Typography>
            </CenterItem>
            <CenterItem>
              <Typography variant="body1">Discoverer:</Typography>
              <Typography variant="body1" ml={3}>
                {row?.faultDetails?.discovererName}
              </Typography>
            </CenterItem>
            <CenterItem>
              <Typography variant="body1">Discover Date:</Typography>
              <Typography variant="body1" ml={3}>
                {row?.faultDetails?.discoveredOn}
              </Typography>
            </CenterItem>
            <CenterItem>
              <Typography variant="body1">Corrective Date:</Typography>
              <Typography variant="body1" ml={3}>
                {row?.faultDetails?.correctedOn}
              </Typography>
            </CenterItem>
            <CenterItem>
              <Typography variant="body1">WUC:</Typography>
              <Typography variant="body1" ml={3}>
                {row?.faultDetails?.faultWorkUnitCode}
              </Typography>
            </CenterItem>
            <CenterItem>
              <Typography variant="body1">Total MMH:</Typography>
              <Typography variant="body1" ml={3}>
                {row?.faultDetails?.totalManHours}
              </Typography>
            </CenterItem>
            <CenterItem>
              <Typography variant="body1">Inspector:</Typography>
              <Typography variant="body1" ml={3}>
                {row?.inspectorName}
              </Typography>
            </CenterItem>
            <CenterItem>
              <Typography variant="body1">Closer:</Typography>
              <Typography variant="body1" ml={3}>
                {row?.closerName}
              </Typography>
            </CenterItem>
            <CenterItem>
              <Typography variant="body1">Remarks:</Typography>
              <Typography variant="body1" ml={3}>
                {row?.faultDetails?.remarks}
              </Typography>
            </CenterItem>
          </>
        }
      />
    ),
  },
  { field: 'statusCode', header: 'Fault' },
  { field: 'discoveredOn', header: 'Discovered On' },
  { field: 'closedOn', header: 'Closed On' },
  { field: 'maintenanceAction', header: 'Maintenance Action' },
  { field: 'correctiveAction', header: 'Action' },
  { field: 'faultWorkUnitCode', header: 'WUC' },
  { field: 'manHours', header: 'MMH' },
];
