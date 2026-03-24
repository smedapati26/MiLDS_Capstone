export interface ICTLResponse {
  soldier_ictl: ICtlsDto[];
  soldier_uctl: ICtlsDto[];
}

export interface ICtlsDto {
  MOS: string;
  document_link: string;
  frequency: string;
  ictl__ictl_title: string;
  ictl__unit: string | null;
  ictl__unit__short_name: string | null;
  ictl_proponent: string;
  last_evaluated: string | null;
  last_evaluated_id: number | null;
  last_trained: string | null;
  last_trained_id: number | null;
  next_due: string | null;
  skill_level: string;
  subject_area: string;
  task_number: string;
  task_title: string;
}

export interface ICtls {
  mos: string;
  documentLink: string;
  frequency: string;
  ictlProponent: string;
  ictlIctlTitle: string;
  ictlUnit: string | null;
  ictlUnitShortName: string | null;
  lastEvaluated: string | null;
  lastEvaluatedById: number | null;
  lastTrained: string | null;
  lastTrainedId: number | null;
  nextDue: string | null;
  skillLevel: string;
  subjectArea: string;
  taskNumber: string;
  taskTitle: string;
}

/* Represents a Critical Task List Table Row */
export type ICtlsColumns = {
  ictlIctlTitle: string;
  taskNumber: string;
  taskTitle: string;
  frequency: string;
  subjectArea: string;
  skillLevel: string;
  mos: string;
  lastTrained: string | null;
  lastTrainedId: number | null;
  lastEvaluated: string | null;
  lastEvaluatedById: number | null;
  nextDue: string | null;
  documentLink: string | null;
};

export const mapToICtls = (dto: ICtlsDto): ICtls => ({
  mos: dto.MOS,
  documentLink: dto.document_link,
  frequency: dto.frequency,
  ictlProponent: dto.ictl_proponent,
  ictlIctlTitle: dto.ictl__ictl_title,
  ictlUnit: dto.ictl__unit ?? null,
  ictlUnitShortName: dto.ictl__unit__short_name ?? null,
  lastEvaluated: dto.last_evaluated ?? null,
  lastEvaluatedById: dto.last_evaluated_id ?? null,
  lastTrained: dto.last_trained ?? null,
  lastTrainedId: dto.last_trained_id ?? null,
  nextDue: dto.next_due ?? null,
  skillLevel: dto.skill_level,
  subjectArea: dto.subject_area,
  taskNumber: dto.task_number,
  taskTitle: dto.task_title,
});
