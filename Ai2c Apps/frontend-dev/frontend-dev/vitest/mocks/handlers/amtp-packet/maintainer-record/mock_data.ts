import { EventType, GoNoGoStatus, ICreateEventOut, IDa7817s, IDa7817sDto } from '@store/amap_ai/events';

// Mock data for Event Types
export const mockEventTypes = [
  { type: 'Training', description: 'Training Event' },
  { type: 'Inspection', description: 'Inspection Event' },
  { type: 'Maintenance', description: 'Maintenance Event' },
];

// Mock data for Evaluation Types
export const mockEvaluationTypes = [
  { type: 'Annual', description: 'Annual Evaluation' },
  { type: 'Quarterly', description: 'Quarterly Evaluation' },
];

// Mock data for Award Types
export const mockAwardTypes = [
  { type: 'Achievement', description: 'Achievement Award' },
  { type: 'Excellence', description: 'Excellence Award' },
];

// Mock data for Training Types
export const mockTrainingTypes = [
  { type: 'TCS', description: 'Temporary Change of Station' },
  { type: 'PCS', description: 'Permanent Change of Station' },
];

// Mock data for User Tasks
export const mockTasks = {
  '123': {
    all: [
      { taskNumber: '1', taskTitle: 'Engine Maintenance', mos: '15F' },
      { taskNumber: '2', taskTitle: 'Flight Inspection', mos: '15F' },
    ],
    partial: [{ taskNumber: '1', taskTitle: 'Engine Maintenance', mos: '15F' }],
  },
};

// Mock data for DA 7817 Events (DTO format)
export const mockDa7817sDto: IDa7817sDto[] = [
  {
    id: 1,
    soldier_id: '123456789',
    date: '2023-01-01',
    uic_id: 'A123',
    event_type: 'Training',
    training_type: 'TCS',
    evaluation_type: 'Annual',
    go_nogo: 'GO',
    gaining_unit_id: null,
    gaining_unit: null,
    tcs_location: 'XYZ',
    award_type: 'Achievement',
    total_mx_hours: 5,
    comment: 'Event comment example.',
    maintenance_level: 'ML1',
    recorded_by_legacy: null,
    recorded_by_id: 'user123',
    recorded_by_non_legacy: null,
    attached_da_4856_id: null,
    event_deleted: false,
    mos: 'MOS001',
    event_tasks: [
      { number: '001', name: 'Engine Maintenance', go_nogo: 'GO' },
      { number: '002', name: 'Flight Inspection', go_nogo: 'NO-GO' },
    ],
    has_associations: true,
  },
];

// Mock data for DA 7817 Events (Client-side format)
export const mockDa7817s: IDa7817s[] = mockDa7817sDto.map((dto) => ({
  id: dto.id,
  soldierId: dto.soldier_id,
  date: dto.date,
  uicId: dto.uic_id,
  eventType: dto.event_type as EventType,
  trainingType: dto.training_type,
  evaluationType: dto.evaluation_type,
  goNogo: dto.go_nogo as GoNoGoStatus,
  gainingUnitId: dto.gaining_unit_id,
  gainingUnit: dto.gaining_unit,
  tcsLocation: dto.tcs_location,
  awardType: dto.award_type,
  totalMxHours: dto.total_mx_hours,
  comment: dto.comment,
  maintenanceLevel: dto.maintenance_level,
  recordedByLegacy: dto.recorded_by_legacy,
  recordedById: dto.recorded_by_id,
  recordedByNonLegacy: dto.recorded_by_non_legacy,
  attachedDa4856Id: dto.attached_da_4856_id,
  eventDeleted: dto.event_deleted,
  mos: dto.mos,
  eventTasks: dto.event_tasks.map((task) => ({ number: task.number, name: task?.name ?? 'n/a', goNogo: task.go_nogo })),
  hasAssociations: dto.has_associations,
}));

// Mock data for creating a new event
export const mockCreateEvent: ICreateEventOut = {
  user_id: '12345678',
  date: '2023-05-10',
  uic: 'B123',
  event_type: 'Training',
  training_type: 'TCS',
  evaluation_type: 'Quarterly',
  go_nogo: 'GO',
  award_type: 'Excellence',
  tcs_location: 'Base XYZ',
  comment: 'This is a new event creation test.',
  maintenance_level: 'ML2',
  recorded_by: 'user456',
  recorded_by_legacy: '',
  mass_entry_key: '',
  total_mx_hours: 8,
  gaining_unit: 'Unit 123',
  mos: 'MOS002',
  event_tasks: [
    { number: '001', name: 'Task 1', go_nogo: 'GO' },
    { number: '002', name: 'Task 2', go_nogo: 'NO-GO' },
  ],
};
