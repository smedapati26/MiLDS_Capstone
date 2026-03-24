import { IBankTimeForecast, IBankTimeForecastDto } from '@store/griffin_api/auto_dsr/models';
import {
  ILocationDto,
  IMaintenanceLaneDto,
  IMaintenanceLaneInDto,
  IMaintEventAircraftDto,
} from '@store/griffin_api/events/models';
import {
  IMaintenanceEventDto,
  IUpcomingMaintenance,
  IUpcomingMaintenanceDto,
  MaintenanceEventPostDto,
} from '@store/griffin_api/events/models/IMaintenanceEvent';

export const mockMaintenanceLaneDto: IMaintenanceLaneDto = {
  id: 1,
  name: 'Test Lane',
  unit: 'TEST_UIC',
  airframe_families: ['F-35'],
  subordinate_units: ['SUB1'],
  location: null,
  contractor: false,
  internal: true,
};

export const mockMaintenanceLaneInDto: IMaintenanceLaneInDto = {
  name: 'New Lane',
  unit_id: 'TEST_UIC',
  airframes: ['F-35'],
  location_id: null,
  contractor: false,
  internal: true,
};

// Mock data for maintenance events
export const mockMaintenanceEventDto: IMaintenanceEventDto = {
  id: 1,
  event_start: '2023-01-01T00:00:00Z',
  event_end: '2023-01-02T00:00:00Z',
  aircraft: {
    serial: '12345',
    current_unit: 'TEST_UIC',
    airframe: {
      model: 'F-35A',
      mds: 'F-35',
    },
  },
  lane: 1,
  maintenance_type: 'insp',
  is_phase: false,
  inspection_reference: {
    id: 1,
    common_name: 'Test Inspection',
    code: 'TI',
    is_phase: false,
  },
  inspection: 1,
  notes: 'Test notes',
  poc: 'Test POC',
  alt_poc: 'Alt POC',
};

export const mockMaintenanceEventPostDto: MaintenanceEventPostDto = {
  aircraft_id: 'A1',
  lane_id: 1,
  inspection_reference_id: 1,
  maintenance_type: 'insp',
  event_start: '2023-01-01T00:00:00Z',
  event_end: '2023-01-02T00:00:00Z',
  notes: 'New event notes',
};

export const mockMaintenanceCountsData = [
  {
    reporting_period: '2023-01-01',
    unscheduled: 5,
    scheduled: 10,
  },
  {
    reporting_period: '2023-01-02',
    unscheduled: 3,
    scheduled: 8,
  },
];

export const mockTestUic = 'TEST_UIC';

export const mockLocation: ILocationDto = {
  name: 'Location 1',
  short_name: 'loc-1',
  code: 'loc-1',
};

export const mockMaintenanceLane: IMaintenanceLaneDto = {
  id: 1,
  name: 'Lane 1',
  unit: mockTestUic,
  airframe_families: ['Chinook'],
  subordinate_units: ['PARENT_' + mockTestUic],
  location: mockLocation,
  contractor: false,
  internal: false,
};

export const mockMaintEventAircraft: IMaintEventAircraftDto = {
  serial: '0123456789',
  current_unit: mockTestUic,
  airframe: {
    model: 'CH-47',
    mds: 'CH-47FM3',
  },
};

export const mockMaintenanceEvent: IMaintenanceEventDto = {
  id: 1,
  event_start: '20241201',
  event_end: '20241230',
  aircraft: mockMaintEventAircraft,
  lane: mockMaintenanceLane.id,
  maintenance_type: 'insp',
  is_phase: true,
  inspection_reference: null,
  inspection: null,
  notes: null,
  poc: null,
  alt_poc: null,
};

export const mockMaintenanceCreatedEvent: IMaintenanceEventDto = {
  id: 2,
  event_start: '20241201',
  event_end: '20241230',
  aircraft: mockMaintEventAircraft,
  lane: mockMaintenanceLane.id,
  maintenance_type: 'insp',
  is_phase: true,
  inspection_reference: null,
  inspection: null,
  notes: 'Test created event',
  poc: null,
  alt_poc: null,
};

export const mockUpcomingMaintenanceDto: IUpcomingMaintenanceDto = {
  aircraft: {
    airframe: {
      mds: 'Model X V1',
      model: 'Model X',
    },
    serial: '123456',
    current_unit: 'Test Unit',
  },
  is_phase: true,
  inspection_reference: {
    id: 1,
    common_name: 'Test Phase',
    code: 'TP100',
    is_phase: true,
  },
  id: 1,
  event_start: '2023-01-01',
  event_end: '2023-01-02',
  notes: 'Notes',
  poc: '123456789',
  alt_poc: '987654321',
  inspection: 'INSP#1',
  lane: 1,
  maintenance_type: 'INSP',
};

export const mockUpcomingMaintenance: IUpcomingMaintenance = {
  id: 1,
  title: '123456, Test Phase',
  progress: 0,
  notes: 'Notes',
  status: 'In Progress',
  eventStart: '2023-01-01',
  eventEnd: '2023-01-02',
  serialNumber: '123456',
  lane: 1,
  inspectionName: 'Test Phase',
  aircraftModel: 'Model X',
};

export const mockBankTimeForecast: IBankTimeForecast = {
  model: 'CH-47F',
  projections: [
    { date: '2025-02-15', value: 28.9 },
    { date: '2025-03-15', value: 26.4 },
    { date: '2025-04-15', value: 24.3 },
    { date: '2025-05-15', value: 21.7 },
    { date: '2025-06-15', value: 18.6 },
    { date: '2025-07-15', value: 16.1 },
    { date: '2025-08-15', value: 13.5 },
    { date: '2025-09-15', value: 11.4 },
    { date: '2025-10-15', value: 9.8 },
    { date: '2025-11-15', value: 7.0 },
    { date: '2025-12-15', value: 5.5 },
    { date: '2026-01-15', value: 4.9 },
  ],
};

export const mockBankTimeProjection: IBankTimeForecastDto = {
  'CH-47F': {
    '2025-02-15': 28.9,
    '2025-03-15': 26.4,
    '2025-04-15': 24.3,
    '2025-05-15': 21.7,
    '2025-06-15': 18.6,
    '2025-07-15': 16.1,
    '2025-08-15': 13.5,
    '2025-09-15': 11.4,
    '2025-10-15': 9.8,
    '2025-11-15': 7.0,
    '2025-12-15': 5.5,
    '2026-01-15': 4.9,
  },
};
