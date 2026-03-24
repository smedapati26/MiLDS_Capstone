import { councelingHandlers } from './amtp-packet/counselings/handlers';
import { faultRecordsHandlers } from './amtp-packet/fault-records/handlers';
import { amtpPacketHandlers } from './amtp-packet/handlers';
import { maintainerRecordHandlers } from './amtp-packet/maintainer-record/handlers';
import { mosCodeHandlers } from './amtp-packet/mos-code/handlers';
import { soldierApiHandlers } from './amtp-packet/soldier/handlers';
import { soldierDesignationHandlers } from './amtp-packet/soldier-designation/handlers';
import { soldierFlagHandlers } from './amtp-packet/soldier-flags/handlers';
import { supportingDocumentHandlers } from './amtp-packet/supporting-documents/handlers';
import { tasksHandlers } from './tasks/handlers';
import { soldierManagerHandlers, transferRequestHandlers } from './transfer-requests/handlers';
import { unitAvailabilityDataHandlers } from './unit-health/unit-availability-data/handlers';
import { unitEvaluationsDataHandlers } from './unit-health/unit-evaluations-data/handlers';
import { unitHealthDataSummaryDataHandlers } from './unit-health/unit-health-summary-data/handlers';
import { unitMissingPacketsDataHandlers } from './unit-health/unit-missing-packets-data/handlers';
import { unitReportDataHandlers } from './unit-health/unit-report-data/handlers';
import { unitRosterDataHandlers } from './unit-health/unit-roster-data/handlers';
import { unitHandlers } from './units/handlers';
import { userRequestHandlers } from './user-requests/handlers';

export const handlers = [
  ...unitHandlers,
  ...amtpPacketHandlers,
  ...maintainerRecordHandlers,
  ...tasksHandlers,
  ...faultRecordsHandlers,
  ...supportingDocumentHandlers,
  ...soldierDesignationHandlers,
  ...councelingHandlers,
  ...soldierFlagHandlers,
  ...soldierManagerHandlers,
  ...transferRequestHandlers,
  ...unitEvaluationsDataHandlers,
  ...unitAvailabilityDataHandlers,
  ...unitMissingPacketsDataHandlers,
  ...unitHealthDataSummaryDataHandlers,
  ...unitRosterDataHandlers,
  ...unitReportDataHandlers,
  ...mosCodeHandlers,
  ...userRequestHandlers,
  ...soldierApiHandlers,
];
