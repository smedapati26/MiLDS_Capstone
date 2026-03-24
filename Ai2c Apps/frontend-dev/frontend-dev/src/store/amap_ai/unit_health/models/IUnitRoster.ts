import {
  IUnitAvailabilityFlagDetails,
  IUnitAvailabilityFlagDetailsDTO,
  mapToIUnitAvailabilityFlagDetails,
} from './IUnitAvailabilityData';

export interface IEventTaskDTO {
  number: string;
  name?: string;
  go_nogo?: string;
}

export interface IEventTask {
  number: string;
  name?: string;
  goNoGo?: string;
}

export const mapToIEventTask = (dto: IEventTaskDTO): IEventTask => {
  return {
    number: dto.number,
    name: dto.name,
    goNoGo: dto.go_nogo,
  };
};

export interface IUnitEvaluationEventDTO {
  id?: number;
  eval_date?: string;
  go_nogo?: string;
  total_mx_hours?: string;
  comment: string;
  event_type?: string;
  evaluation_type?: string;
  maintenance_level?: string;
  mos?: string;
  event_tasks?: IEventTaskDTO[];
}

export interface IUnitEvaluationEvent {
  id?: number;
  evalDate?: string;
  goNoGo?: string;
  totalMXHours?: string;
  comment: string;
  eventType?: string;
  evaluationType?: string;
  maintenanceLevel?: string;
  mos?: string;
  eventTasks?: IEventTask[];
}

export const mapToIUnitEvaluationEvent = (dto: IUnitEvaluationEventDTO): IUnitEvaluationEvent => {
  return {
    id: dto.id,
    evalDate: dto.eval_date,
    goNoGo: dto.go_nogo,
    totalMXHours: dto.total_mx_hours,
    comment: dto.comment,
    eventType: dto.event_type,
    evaluationType: dto.evaluation_type,
    maintenanceLevel: dto.maintenance_level,
    mos: dto.mos,
    eventTasks: dto.event_tasks?.map(mapToIEventTask),
  };
};

export interface IUnitRosterDTO {
  rank: string;
  name: string;
  user_id: string;
  email: string;
  availability: string;
  unit: string;
  mos: string;
  ml: string;
  birth_month: string;
  last_evaluation_date: string;
  last_evaluation_data?: IUnitEvaluationEventDTO;
  evaluation_status: string;
  flag_availability_data?: IUnitAvailabilityFlagDetailsDTO;
}

export interface IUnitRoster {
  rank: string;
  name: string;
  userId: string;
  email: string;
  availability: string;
  unit: string;
  mos: string;
  ml: string;
  birthMonth: string;
  lastEvaluationDate: string;
  lastEvaluationData?: IUnitEvaluationEvent;
  evaluationStatus: string;
  flagAvailabilityData?: IUnitAvailabilityFlagDetails | undefined;
}

export const mapToIUnitRoster = (dto: IUnitRosterDTO): IUnitRoster => {
  return {
    rank: dto.rank,
    name: dto.name,
    userId: dto.user_id,
    email: dto.email,
    availability: dto.availability,
    unit: dto.unit,
    mos: dto.mos,
    ml: dto.ml,
    birthMonth: dto.birth_month,
    lastEvaluationDate: dto.last_evaluation_date,
    lastEvaluationData: dto.last_evaluation_data ? mapToIUnitEvaluationEvent(dto.last_evaluation_data) : undefined,
    evaluationStatus: dto.evaluation_status,
    flagAvailabilityData: mapToIUnitAvailabilityFlagDetails(dto.flag_availability_data),
  };
};

export interface IMOSMLReportDataDTO {
  mos: string;
  ml0: number;
  ml1: number;
  ml2: number;
  ml3: number;
  ml4: number;
  missing_packets: number;
  total: number;
  available: number;
}

export interface IMOSMLReportData {
  mos: string;
  ml0: number;
  ml1: number;
  ml2: number;
  ml3: number;
  ml4: number;
  missingPackets: number;
  total: number;
  available: number;
}

export const mapToIMOSMLReportData = (dto: IMOSMLReportDataDTO): IMOSMLReportData => {
  return {
    mos: dto.mos,
    ml0: dto.ml0,
    ml1: dto.ml1,
    ml2: dto.ml2,
    ml3: dto.ml3,
    ml4: dto.ml4,
    missingPackets: dto.missing_packets,
    total: dto.total,
    available: dto.available,
  };
};

export interface IUnitMOSMLReportDataDTO {
  unit_uic: string;
  unit_name: string;
  report_data?: IMOSMLReportDataDTO[];
}

export interface IUnitMOSMLReportData {
  unitUic: string;
  unitName: string;
  reportData?: IMOSMLReportData[];
}

export const mapToIUnitMOSMLReportData = (dto: IUnitMOSMLReportDataDTO): IUnitMOSMLReportData => {
  return {
    unitUic: dto.unit_uic,
    unitName: dto.unit_name,
    reportData: dto.report_data?.map(mapToIMOSMLReportData),
  };
};

export interface IUnitMOSMLReportDTO {
  primary_unit: IUnitMOSMLReportDataDTO;
  subordinate_units: IUnitMOSMLReportDataDTO[];
}

export interface IUnitMOSMLReport {
  primaryUnit: IUnitMOSMLReportData;
  subordinateUnits: IUnitMOSMLReportData[];
}

export const mapToIUnitMOSMLReport = (dto: IUnitMOSMLReportDTO): IUnitMOSMLReport => {
  return {
    primaryUnit: mapToIUnitMOSMLReportData(dto.primary_unit),
    subordinateUnits: dto.subordinate_units.map(mapToIUnitMOSMLReportData),
  };
};

export interface IEventReportEventDataDTO {
  id: number;
  event_type: string;
  type: string;
  date: string;
  result: string;
  occurences: string[] | undefined;
}

export interface IEventReportEventData {
  id: number;
  eventType: string;
  type: string;
  date: string;
  result: string;
  occurences: string[] | undefined;
}

export const mapToIUnitEventReportEventData = (dto: IEventReportEventDataDTO): IEventReportEventData => {
  return {
    id: dto.id,
    eventType: dto.event_type,
    type: dto.type,
    date: dto.date,
    result: dto.result,
    occurences: dto.occurences,
  };
};

export interface IEventReportFiltersOut {
  unit_uic: string;
  birth_months: string[];
  start_date: string;
  end_date: string;
  completion_types: string[];
  evaluation_types: string[];
  training_types: string[];
}

export interface IEventReportSoldierDTO {
  soldier_id: string;
  soldier_name: string;
  mos: string | undefined;
  unit: string;
  birth_month: string;
  events: IEventReportEventDataDTO[];
}

export interface IEventReportSoldier {
  soldierId: string;
  soldierName: string;
  mos: string | undefined;
  unit: string;
  birthMonth: string;
  events: IEventReportEventData[];
}

export const mapToIEventReportSoldier = (dto: IEventReportSoldierDTO): IEventReportSoldier => {
  return {
    soldierId: dto.soldier_id,
    soldierName: dto.soldier_name,
    mos: dto.mos,
    unit: dto.unit,
    birthMonth: dto.birth_month,
    events: dto.events.map(mapToIUnitEventReportEventData),
  };
};

export interface IUnitTaskDTO {
  uctl_id: number;
  uctl_title: string;
}

export interface IUnitTask {
  uctlId: number;
  uctlTitle: string;
}

export const mapToIUnitTask = (dto: IUnitTaskDTO): IUnitTask => {
  return {
    uctlId: dto.uctl_id,
    uctlTitle: dto.uctl_title,
  };
};

export interface IIndividualTaskDTO {
  task_number: string;
  task_title: string;
}

export interface IIndividualTask {
  taskNumber: string;
  taskTitle: string;
}

export const mapToIIndividualTask = (dto: IIndividualTaskDTO): IIndividualTask => {
  return {
    taskNumber: dto.task_number,
    taskTitle: dto.task_title,
  };
};

export interface ITaskReportFilterOut {
  unit_uic: string;
  birth_months: string[];
  start_date: string;
  end_date: string;
  uctl_ids: string[];
  task_numbers: string[];
}

export interface ITaskReportDataDTO {
  task_name: string;
  familiarized_date: string | undefined;
  familiarized_go_no_go: string | undefined;
  trained_date: string | undefined;
  trained_go_no_go: string | undefined;
  evaluated_date: string | undefined;
  evaluated_go_no_go: string | undefined;
}

export interface ITaskReportData {
  taskName: string;
  familiarizedDate: string | undefined;
  familiarizedGoNoGo: string | undefined;
  trainedDate: string | undefined;
  trainedGoNoGo: string | undefined;
  evaluatedDate: string | undefined;
  evaluatedGoNoGo: string | undefined;
}

export const mapToITaskReportData = (dto: ITaskReportDataDTO): ITaskReportData => {
  return {
    taskName: dto.task_name,
    familiarizedDate: dto.familiarized_date,
    familiarizedGoNoGo: dto.familiarized_go_no_go,
    trainedDate: dto.trained_date,
    trainedGoNoGo: dto.trained_go_no_go,
    evaluatedDate: dto.evaluated_date,
    evaluatedGoNoGo: dto.evaluated_go_no_go,
  };
};

export interface ITaskReportListDataDTO {
  ctl_name: string;
  tasks: ITaskReportDataDTO[];
}

export interface ITaskReportListData {
  ctlName: string;
  tasks: ITaskReportData[];
}

export const mapToITaskReportListData = (dto: ITaskReportListDataDTO): ITaskReportListData => {
  return {
    ctlName: dto.ctl_name,
    tasks: dto.tasks.map(mapToITaskReportData),
  };
};

export interface ITaskReportSoldierDTO {
  soldier_id: string;
  soldier_name: string;
  mos: string | undefined;
  unit: string;
  birth_month: string;
  tasks_list: ITaskReportListDataDTO[];
  individual_tasks_list: ITaskReportDataDTO[];
}

export interface ITaskReportSoldier {
  soldierId: string;
  soldierName: string;
  mos: string | undefined;
  unit: string;
  birthMonth: string;
  tasksList: ITaskReportListData[];
  individualTasksList: ITaskReportData[];
}

export const mapToITaskReportSoldier = (dto: ITaskReportSoldierDTO): ITaskReportSoldier => {
  return {
    soldierId: dto.soldier_id,
    soldierName: dto.soldier_name,
    mos: dto.mos,
    unit: dto.unit,
    birthMonth: dto.birth_month,
    tasksList: dto.tasks_list.map(mapToITaskReportListData),
    individualTasksList: dto.individual_tasks_list.map(mapToITaskReportData),
  };
};

export interface ITaskReportExportableData {
  soldierId: string;
  soldierName: string;
  mos: string | undefined;
  unit: string;
  birthMonth: string;
  ctlName: string | undefined;
  taskName: string;
  familiarizedDate: string | undefined;
  familiarizedGoNoGo: string | undefined;
  trainedDate: string | undefined;
  trainedGoNoGo: string | undefined;
  evaluatedDate: string | undefined;
  evaluatedGoNoGo: string | undefined;
}
