import { Dayjs } from 'dayjs';

import { IUnitBrief } from '@store/amap_ai/units/models';

export type EventTaskDto = { number: string; name?: string; go_nogo: string };
export type GoNoGoStatus = 'GO' | 'NOGO' | 'N/A' | undefined;
export type EventType =
  | 'Evaluation'
  | 'Training'
  | 'Award'
  | 'TCS'
  | 'PCS/ETS'
  | 'In-Unit Transfer'
  | 'Records Review'
  | 'Other'
  | undefined;

export interface ICreateEventOut {
  user_id: string;
  date: Dayjs | string | null;
  uic: string;
  event_type: string;
  training_type?: string;
  evaluation_type?: string;
  go_nogo?: GoNoGoStatus;
  award_type?: string;
  tcs_location?: string;
  comment?: string;
  maintenance_level?: string;
  recorded_by: string;
  recorded_by_legacy?: string;
  mass_entry_key?: string;
  total_mx_hours?: number;
  gaining_unit?: string;
  mos?: string;
  event_tasks?: EventTaskDto[];
}

export interface ICreateMassEventOut {
  date: Dayjs | string | null;
  uic: string;
  event_type: string;
  training_type?: string;
  go_nogo?: GoNoGoStatus;
  award_type?: string;
  tcs_location?: string;
  comment?: string;
  recorded_by: string;
  recorded_by_legacy?: string;
  gaining_unit?: string;
  soldiers: ISoldierEventOut[];
  event_tasks?: EventTaskDto[];
}

export interface ISoldierEventOut {
  soldier_id: string;
  go_nogo?: GoNoGoStatus;
  event_tasks?: EventTaskDto[];
}

export interface IUpdateEventOut extends ICreateEventOut {
  id: number;
  event_tasks?: EventTaskDto[];
}

export interface IUpdateEventOut extends ICreateEventOut {
  id: number;
}

export interface IDa7817sDto {
  id: number;
  soldier_id: string;
  date: string;
  uic_id: string;
  event_type: string;
  training_type: string | null;
  evaluation_type: string | null;
  go_nogo: GoNoGoStatus;
  gaining_unit_id: string | null;
  gaining_unit: IUnitBrief | null;
  tcs_location: string | null;
  award_type: string | null;
  total_mx_hours: number | null;
  comment: string;
  maintenance_level: string | null;
  recorded_by_legacy: string | null;
  recorded_by_id: string | null;
  recorded_by_non_legacy: string | null;
  attached_da_4856_id: string | null;
  event_deleted: boolean;
  mos: string | null;
  event_tasks: EventTaskDto[];
  has_associations: boolean;
}

export interface IDa7817s {
  id: number;
  soldierId: string;
  date: string;
  uicId: string;
  eventType: EventType;
  trainingType: string | null;
  evaluationType: string | null;
  goNogo: GoNoGoStatus;
  gainingUnitId: string | null;
  gainingUnit: IUnitBrief | null;
  tcsLocation: string | null;
  awardType: string | null;
  totalMxHours: number | null;
  comment: string;
  maintenanceLevel: string | null;
  recordedByLegacy: string | null;
  recordedById: string | null;
  recordedByNonLegacy: string | null;
  attachedDa4856Id: string | null;
  attachedDa_4856Id?: string | null;
  eventDeleted: boolean;
  mos: string | null;
  eventTasks: { number: string; name: string; goNogo: string }[];
  hasAssociations: boolean;
}
