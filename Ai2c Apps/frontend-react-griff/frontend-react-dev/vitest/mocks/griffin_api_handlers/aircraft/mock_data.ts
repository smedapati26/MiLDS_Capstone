import { CompanyOption } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';

import {
  IAircraft,
  IAircraftBankPercentageDto,
  IAircraftCompany,
  IAircraftCompanyDto,
  IAircraftDetailDto,
  IAircraftDsrDto,
  IAircraftDto,
  IAircraftEditOutDto,
  IAircraftEquipmentDetailsDto,
  IAircraftInspectionDto,
  IAircraftModificationDto,
  IAircraftPhaseFlow,
  IAircraftPhaseFlowDto,
  IAircraftPhaseFlowModels,
  IAircraftPhaseFlowModelsDto,
  IAircraftPhaseFlowSubordinates,
  IAircraftPhaseFlowSubordinatesDto,
  mapToAircraftPhaseFlowModels,
  mapToAircraftPhaseFlowSubordinates,
  mapToIAircraft,
  mapToIAircraftCompany,
  mapToIAircraftPhaseFlow,
} from '@store/griffin_api/aircraft/models';

// Mock DTOs
export const mockAircraftDto: IAircraftDto = {
  aircraft_model: 'UH-60',
  aircraft_family: 'BLACKHAWK',
  aircraft_mds: 'UH-60A',
  serial: '12345',
};

export const mockAircraftPhaseFlowDto: IAircraftPhaseFlowDto = {
  model: 'UH-60',
  hours_to_320: 100,
  serial: '12345',
  total_airframe_hours: 1000,
  flight_hours: 900,
  next_phase_type: 'Phase 1',
  hours_to_phase: 50,
  owning_unit: 'TEST_UIC',
  current_unit: 'TEST_UIC',
};

export const mockAircraftPhaseFlowSubordinatesDto: IAircraftPhaseFlowSubordinatesDto = {
  uic: 'TEST_UIC',
  short_name: 'Test Unit',
  aircraft: [mockAircraftPhaseFlowDto],
};

export const mockAircraftPhaseFlowModelsDto: IAircraftPhaseFlowModelsDto = {
  model: 'UH-60',
  aircraft: [mockAircraftPhaseFlowDto],
};

export const mockAircraftBankPercentageDto: IAircraftBankPercentageDto = {
  key: 'TEST_UIC',
  bank_percentage: 0.75,
};

export const mockAircraftCompanyDto: IAircraftCompanyDto = {
  uic: 'TEST_UIC',
  short_name: 'Test Company',
  display_name: 'Test Company Display',
};

export const mockAircraftDetailDto: IAircraftDetailDto = {
  date_down: new Date('2023-01-01'),
  hours_to_phase: 50,
  in_phase: true,
  last_update_time: new Date('2023-01-01'),
  phase_start_date: new Date('2023-01-01'),
  remarks: 'Test remarks',
  serial: '12345',
  total_airframe_hours: 1000,
};

export const mockAircraftInspectionDto: IAircraftInspectionDto = {
  inspection__id: 1,
  inspection__inspection_name: 'Test Inspection',
  inspection__hours_interval: 100,
  inspection__last_conducted_hours: 900,
  inspection__next_due_hours: 1000,
  till_due: 100,
  serial: '12345',
};

export const mockAircraftDsrDto: IAircraftDsrDto = {
  aircraft: [mockAircraftDetailDto],
  inspection: [mockAircraftInspectionDto],
};

export const mockTestSerial = '1003';
export const mockTestUic = 'TEST_UIC';

export const testAircraftDetailArray: IAircraftDetailDto[] = [
  ...Array.from({ length: 5 }, (_, index) => {
    const serial = (1000 + index).toString();

    return {
      date_down: new Date('2025-3-10'),
      hours_to_phase: Math.floor(Math.random() * (200 - 100 + 1)),
      in_phase: Math.random() >= 0.5,
      last_update_time: new Date('2025-3-10'),
      phase_start_date: new Date('2025-3-10'),
      remarks: `test for ${serial}`,
      serial: serial,
      total_airframe_hours: Math.floor(Math.random() * (3000 - 2000 + 1)),
    };
  }),
];

export const testAircraftInspectionArray: IAircraftInspectionDto[] = [
  ...Array.from({ length: 5 }, (_, index) => {
    const serial = (1000 + index).toString();
    const hoursInterval = 10 * index;

    return {
      inspection__id: 1000 + index,
      inspection__inspection_name: `Test ${serial}`,
      inspection__hours_interval: hoursInterval,
      inspection__last_conducted_hours: Math.floor(Math.random() * (3000 - 2000 + 1)),
      inspection__next_due_hours: Math.floor(Math.random() * (3000 - 2000 + 1)),
      till_due: Math.floor(Math.random() * (300 - 20 + 1)),
      serial: mockTestSerial,
    };
  }),
];

const aircraftFamilies = [
  { family: 'CHINOOK', model: 'CH-47F', mds: 'CH-47FV2' },
  { family: 'APACHE', model: 'AH-64D', mds: 'AH-64D' },
  { family: 'BLACK HAWK', model: 'UH-60L', mds: 'UH-60L' },
];

export const testAircraft: IAircraftDto = {
  aircraft_mds: 'CH-47FV2',
  aircraft_model: 'CH-47F',
  aircraft_family: 'CHINOOK',
  serial: '0123456',
};

export const testAircraftArray: IAircraftDto[] = [
  ...Array.from({ length: 50 }, (_, index) => {
    const aircraftIndex = Math.floor(Math.random() * aircraftFamilies.length);
    const serial = (1000 + index).toString();

    return {
      aircraft_mds: aircraftFamilies[aircraftIndex].mds,
      aircraft_model: aircraftFamilies[aircraftIndex].model,
      aircraft_family: aircraftFamilies[aircraftIndex].family,
      serial: serial,
    };
  }),
];

interface IExtendedBankPercentageType extends IAircraftBankPercentageDto {
  return_by: string;
}

export const testBankPercentage: IExtendedBankPercentageType[] = [
  {
    return_by: 'unit',
    key: 'test',
    bank_percentage: 0.5,
  },
  {
    return_by: 'unit',
    key: 'test',
    bank_percentage: 0.2,
  },
  {
    return_by: 'subordinate',
    key: 'test',
    bank_percentage: 0.3,
  },
  {
    return_by: 'model',
    key: 'test',
    bank_percentage: 0.1,
  },
];

export const testBankPercentageAll: IAircraftBankPercentageDto[] = [
  {
    key: 'test',
    bank_percentage: 55,
  },
];

export const testAircraftList: IAircraftDto[] = [
  { aircraft_model: 'Model A', aircraft_family: 'BLACK HAWK', serial: 'SN123', aircraft_mds: 'mds' },
  { aircraft_model: 'Model A', aircraft_family: 'Family 2', serial: 'SN152', aircraft_mds: 'mds' },
  { aircraft_model: 'Model A', aircraft_family: 'Family 3', serial: 'SN346', aircraft_mds: 'mds' },
  { aircraft_model: 'Model B', aircraft_family: 'BLACK HAWK', serial: 'SN456', aircraft_mds: 'mds' },
  { aircraft_model: 'Model B', aircraft_family: 'Family 2', serial: 'SN623', aircraft_mds: 'mds' },

  { aircraft_model: 'Model C', aircraft_family: 'BLACK HAWK', serial: 'SN196', aircraft_mds: 'mds' },
  { aircraft_model: 'Model C', aircraft_family: 'Family 3', serial: 'SN964', aircraft_mds: 'mds' },
];

export const mappedTestAircraft: IAircraft[] = testAircraftList.map((data) => mapToIAircraft(data));

export const companyOption: CompanyOption[] = [
  { uic: 'TEST_UIC1', color: '#B27FFF', selected: true },
  { uic: 'TEST_UIC2', color: '#47D3FF', selected: true },
  { uic: 'TEST_UIC3', color: '#B27FFF', selected: true },
];

export const testAircraftPhaseFlow: IAircraftPhaseFlowDto[] = [
  {
    model: 'Model A',
    serial: 'SN123',
    total_airframe_hours: 1000.2,
    flight_hours: 0,
    hours_to_phase: 250,
    owning_unit: 'TEST_UIC1',
    current_unit: 'TEST_UIC1',
    hours_to_320: 0,
    next_phase_type: '',
  },
  {
    model: 'Model C',
    serial: 'SN964',
    total_airframe_hours: 1000.2,
    flight_hours: 0,
    hours_to_phase: 240,
    owning_unit: 'TEST_UIC2',
    current_unit: 'TEST_UIC2',
    hours_to_320: 0,
    next_phase_type: '',
  },
  {
    model: 'Model A',
    serial: 'SN346',
    total_airframe_hours: 1000.2,
    flight_hours: 0,
    hours_to_phase: 150,
    owning_unit: 'TEST_UIC3',
    current_unit: 'TEST_UIC3',
    hours_to_320: 0,
    next_phase_type: '',
  },
  {
    model: 'Model A',
    serial: 'SN152',
    total_airframe_hours: 1000.2,
    flight_hours: 0,
    hours_to_phase: 45,
    owning_unit: 'TEST_UIC2',
    current_unit: 'TEST_UIC2',
    hours_to_320: 0,
    next_phase_type: '',
  },
  {
    model: 'Model B',
    serial: 'SN623',
    total_airframe_hours: 1000.2,
    flight_hours: 0,
    hours_to_phase: 15,
    owning_unit: 'TEST_UIC1',
    current_unit: 'TEST_UIC1',
    hours_to_320: 0,
    next_phase_type: '',
  },
  {
    model: 'Model C',
    serial: 'SN196',
    total_airframe_hours: 1000.2,
    flight_hours: 0,
    hours_to_phase: 12,
    owning_unit: 'TEST_UIC1',
    current_unit: 'TEST_UIC1',
    hours_to_320: 0,
    next_phase_type: '',
  },
];

export const mappedTestAircraftPhaseFlow: IAircraftPhaseFlow[] = testAircraftPhaseFlow.map((testData) =>
  mapToIAircraftPhaseFlow(testData),
);

export const testAircraftCompany: IAircraftCompanyDto[] = [
  {
    uic: 'TEST_UIC1',
    short_name: 'name 1',
    display_name: 'display name 1',
  },
  {
    uic: 'TEST_UIC2',
    short_name: 'name 2',
    display_name: 'display name 2',
  },
  {
    uic: 'TEST_UIC3',
    short_name: 'name 3',
    display_name: 'display name 3',
  },
];

export const mappedCompanyData: IAircraftCompany[] = testAircraftCompany.map((data) => mapToIAircraftCompany(data));

export const testAircraftPhaseFlowSubordinates: IAircraftPhaseFlowSubordinatesDto[] = [
  {
    uic: 'TEST_UIC1',
    short_name: 'name 1',
    aircraft: [
      {
        model: 'Model A',
        serial: 'SN123',
        total_airframe_hours: 1000.2,
        flight_hours: 0,
        hours_to_phase: 250,
        owning_unit: 'TEST_UIC1',
        current_unit: 'TEST_UIC1',
        hours_to_320: 0,
        next_phase_type: 'PMI1',
      },
      {
        model: 'Model B',
        serial: 'SN623',
        total_airframe_hours: 1000.2,
        flight_hours: 0,
        hours_to_phase: 480,
        owning_unit: 'TEST_UIC1',
        current_unit: 'TEST_UIC1',
        hours_to_320: 0,
        next_phase_type: 'PMI2',
      },
      {
        model: 'Model C',
        serial: 'SN964',
        total_airframe_hours: 1000.2,
        flight_hours: 0,
        hours_to_phase: 240,
        owning_unit: 'TEST_UIC1',
        current_unit: 'TEST_UIC1',
        hours_to_320: 0,
        next_phase_type: '',
      },
    ],
  },
  {
    uic: 'TEST_UIC2',
    short_name: 'name 2',
    aircraft: [
      {
        model: 'Model C',
        serial: 'SN196',
        total_airframe_hours: 1000.2,
        flight_hours: 0,
        hours_to_phase: 120,
        owning_unit: 'TEST_UIC2',
        current_unit: 'TEST_UIC2',
        hours_to_320: 0,
        next_phase_type: '',
      },
    ],
  },
  {
    uic: 'TEST_UIC3',
    short_name: 'name 3',
    aircraft: [
      {
        model: 'Model A',
        serial: 'SN346',
        total_airframe_hours: 1000.2,
        flight_hours: 0,
        hours_to_phase: 150,
        owning_unit: 'TEST_UIC3',
        current_unit: 'TEST_UIC3',
        hours_to_320: 0,
        next_phase_type: '',
      },
    ],
  },
];

export const mappedTestAircraftPhaseFlowSubordinates: IAircraftPhaseFlowSubordinates[] =
  testAircraftPhaseFlowSubordinates.map(mapToAircraftPhaseFlowSubordinates);

export const testAircraftPhaseFlowModels: IAircraftPhaseFlowModelsDto[] = [
  {
    model: 'A',
    aircraft: [
      {
        model: 'Model A',
        serial: 'SN123',
        total_airframe_hours: 1000.2,
        flight_hours: 0,
        hours_to_phase: 250,
        owning_unit: 'TEST_UIC1',
        current_unit: 'TEST_UIC1',
        hours_to_320: 0,
        next_phase_type: '',
      },
      {
        model: 'Model A',
        serial: 'SN152',
        total_airframe_hours: 1000.2,
        flight_hours: 0,
        hours_to_phase: 350,
        owning_unit: 'TEST_UIC2',
        current_unit: 'TEST_UIC2',
        hours_to_320: 0,
        next_phase_type: '',
      },
      {
        model: 'Model A',
        serial: 'SN346',
        total_airframe_hours: 1000.2,
        flight_hours: 0,
        hours_to_phase: 150,
        owning_unit: 'TEST_UIC3',
        current_unit: 'TEST_UIC3',
        hours_to_320: 0,
        next_phase_type: '',
      },
    ],
  },
  {
    model: 'B',
    aircraft: [
      {
        model: 'Model B',
        serial: 'SN623',
        total_airframe_hours: 1000.2,
        flight_hours: 0,
        hours_to_phase: 480,
        owning_unit: 'TEST_UIC1',
        current_unit: 'TEST_UIC1',
        hours_to_320: 0,
        next_phase_type: '',
      },
    ],
  },
  {
    model: 'C',
    aircraft: [
      {
        model: 'Model C',
        serial: 'SN196',
        total_airframe_hours: 1000.2,
        flight_hours: 0,
        hours_to_phase: 120,
        owning_unit: 'TEST_UIC2',
        current_unit: 'TEST_UIC2',
        hours_to_320: 0,
        next_phase_type: '',
      },
      {
        model: 'Model C',
        serial: 'SN964',
        total_airframe_hours: 1000.2,
        flight_hours: 0,
        hours_to_phase: 240,
        owning_unit: 'TEST_UIC1',
        current_unit: 'TEST_UIC1',
        hours_to_320: 0,
        next_phase_type: '',
      },
    ],
  },
];

export const mappedTestAircraftPhaseFlowModels: IAircraftPhaseFlowModels[] =
  testAircraftPhaseFlowModels.map(mapToAircraftPhaseFlowModels);

export const mockAircraftEquipmentDetailsDto: IAircraftEquipmentDetailsDto[] = [
  {
    unit_short_name: 'Test Unit 1',
    unit_uic: 'TEST0001',
    models: [
      {
        model: 'UH-60L',
        aircraft: [
          {
            serial: 'serial T1 1',
            remarks: 'remark 1',
            rtl: 'rtl status',
            status: 'FIELD',
            or_status: 'NMC',
            ecd: null,
            total_airframe_hours: 6062,
            flight_hours: 0,
            hours_to_phase: 36.1,
            in_phase: false,
            location: null,
            modifications: [],
            events: [
              {
                inspection: {
                  inspection__id: 123456,
                  inspection__hours_interval: 2,
                  inspection__inspection_name: 'insp name 1',
                  inspection__last_conducted_hours: 66,
                  inspection__next_due_hours: 77,
                  till_due: 11,
                  serial: 'serial T1 1',
                },
                maintenance: {
                  name: 'test event name',
                  lane: 'lane name',
                  event_start: '2000-01-01T00:00:00Z',
                  event_end: '2000-12-31T00:00:00Z',
                },
              },
              {
                inspection: {
                  inspection__id: 53252,
                  inspection__hours_interval: 8,
                  inspection__inspection_name: 'insp name 2',
                  inspection__last_conducted_hours: 5.4,
                  inspection__next_due_hours: 6.1,
                  till_due: 1.1,
                  serial: 'serial T1 1',
                },
                maintenance: null,
              },
            ],
            field_sync_status: { rtl: true, status: true },
            date_down: new Date('1-1-2025'),
          },
        ],
      },
    ],
  },
];

export const mockAircraftEditOutDto: IAircraftEditOutDto = {
  detail: 'test',
  edited_aircraft: ['1', '2'],
  not_edited_aircraft: [],
};

export const mockModificationAndKits: IAircraftModificationDto[] = [
  { id: 1, mod_type: 'test1', value: 'test1' },
  { id: 2, mod_type: 'test2', value: 'test2' },
  { id: 3, mod_type: 'test3', value: 'test3' },
];
