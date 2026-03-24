import { IEventReportSoldierDTO, IUnitMOSMLReportDTO } from '@store/amap_ai/unit_health';

export const mockUnitMOSMLReport: IUnitMOSMLReportDTO = {
  primary_unit: {
    unit_name: 'Test Unit',
    unit_uic: 'TSTUNIT',
    report_data: [
      {
        mos: 'TSTMOS',
        ml0: 0,
        ml1: 1,
        ml2: 2,
        ml3: 3,
        ml4: 4,
        available: 5,
        total: 6,
        missing_packets: 7,
      },
      {
        mos: 'TSTMOS2',
        ml0: 8,
        ml1: 9,
        ml2: 10,
        ml3: 11,
        ml4: 12,
        available: 13,
        total: 14,
        missing_packets: 15,
      },
    ],
  },
  subordinate_units: [
    {
      unit_name: 'Subordinate Unit',
      unit_uic: 'SUBUNIT',
      report_data: [
        {
          mos: 'TSTMOS',
          ml0: 0,
          ml1: 1,
          ml2: 2,
          ml3: 3,
          ml4: 4,
          available: 5,
          total: 6,
          missing_packets: 7,
        },
        {
          mos: 'TSTMOS2',
          ml0: 8,
          ml1: 9,
          ml2: 10,
          ml3: 11,
          ml4: 12,
          available: 13,
          total: 14,
          missing_packets: 15,
        },
      ],
    },
  ],
};

export const mockEventReportSoldierData: IEventReportSoldierDTO[] = [
  {
    soldier_name: 'Test MeGee',
    birth_month: 'JAN',
    mos: 'TSTMOS',
    soldier_id: '1234567890',
    unit: 'TSTUnit',
    events: [
      {
        id: 1,
        type: 'Test Eval',
        event_type: 'Evaluation',
        date: '01/01/2025',
        result: 'GO',
        occurences: ['12/01/2024 - NOGO', '01/01/2025 - GO'],
      },
      {
        id: 2,
        type: 'Test Train',
        event_type: 'Training',
        date: '01/02/2025',
        result: 'NOGO',
        occurences: ['01/02/2025 - NOGO'],
      },
    ],
  },
  {
    soldier_name: 'Tester MeGeer',
    birth_month: 'FEB',
    mos: 'TSTMOS2',
    soldier_id: '2345678901',
    unit: 'TSTUnit2',
    events: [
      {
        id: 3,
        type: 'Test Eval',
        event_type: 'Evaluation',
        date: '02/01/2025',
        result: 'GO',
        occurences: ['02/01/2025 - GO'],
      },
      {
        id: 4,
        type: 'Test Train',
        event_type: 'Training',
        date: '02/02/2025',
        result: 'NOGO',
        occurences: ['02/02/2025 - NOGO'],
      },
    ],
  },
];
