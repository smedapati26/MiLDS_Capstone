export interface ITasksDto {
  mos_code: string;
  ictl_id: number;
  ictl_title: string;
  proponent: string;
  unit: string;
  skill_level: string;
  target_audience: string;
  status: string;
  task_number: string;
  task_title: string;
  pdf_url: string;
  unit_task_pdf: string | null;
  training_location: string;
  frequency: string;
  subject_area: string;
}

export interface ITasks {
  mosCode: string;
  ictlId: number;
  ictlTitle: string;
  proponent: string;
  unit: string;
  skillLevel: string;
  targetAudience: string;
  status: string;
  taskNumber: string;
  taskTitle: string;
  pdfUrl: string;
  unitTaskPdf: string | null;
  trainingLocation: string;
  frequency: string;
  subjectArea: string;
}

export interface IUCTLTasksDto {
  ictl_id: 0;
  ictl_title: string;
  date_published: string;
  status: string;
  skill_level: string;
  target_audience: string;
  unit_name: string;
  unit_uic: string;
  tasks: ITasksDto[];
}
export interface IUCTLTasks {
  ictlId: number;
  ictlTitle: string;
  datePublished: string;
  status: string;
  skillLevel: string;
  targetAudience: string;
  unitName: string;
  unitUic: string;
  tasks: ITasks[];
}

export interface UCTLSearchResult {
  ictlId: number;
  ictlTitle: string;
  datePublished: string;
  status: string;
  skillLevel?: string;
  targetAudience?: string;
  unitName: string;
  unitUic: string;
  similarityScore: number;
}

export interface TaskWithUCTLOut {
  taskNumber: string;
  taskTitle: string;
  trainingLocation?: string;
  frequency?: string;
  subjectArea?: string;
  pdfUrl?: string;
  similarityScore: number;
  uctlId: number;
  uctlTitle: string;
  unitName: string;
  unitUic: string;
}

export interface SearchResponse {
  search_type: string;
  query: string;
  uctlResults: UCTLSearchResult[];
  taskResults: TaskWithUCTLOut[];
}
