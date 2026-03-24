export interface FetchUctlParams {
  uic: string;
  mos?: string;
  skill_level?: string;
}

export interface CreateUctlPayload {
  title: string;
  unit_uic: string;
  mos_codes: string[];
  skill_level: string;
  target_audience: string;
  tasks: string[];
}

export interface TaskPayload {
  task_title: string;
  training_location: string;
  frequency: string | null;
  subject_area: string | null;
}

export interface UpdateTaskPayload extends TaskPayload {
  task_number: string;
}

export interface CreateTaskPayload extends TaskPayload {
  ictl_ids: number[];
  unit_task_pdf: string;
}

export interface UpdateUctlPayload extends CreateUctlPayload {
  ictl_id: number;
}
