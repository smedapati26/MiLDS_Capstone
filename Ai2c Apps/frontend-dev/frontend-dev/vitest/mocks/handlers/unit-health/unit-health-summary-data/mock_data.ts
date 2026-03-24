import { IUnitHealthDataDTO } from '@store/amap_ai/unit_health';

export const mockUnitHealthData: IUnitHealthDataDTO = {
  unit_echelon: 'Batallion',
  units_availability: [
    {
      unit_name: 'Battalion 1',
      unit_uic: 'BTT1',
      available_count: 12,
      limited_count: 7,
      unavailable_count: 5,
    },
    {
      unit_name: 'Battalion 2',
      unit_uic: 'BTT2',
      available_count: 9,
      limited_count: 4,
      unavailable_count: 3,
    },
    {
      unit_name: 'Company A',
      unit_uic: 'CMPA',
      available_count: 6,
      limited_count: 2,
      unavailable_count: 1,
    },
    {
      unit_name: 'Company B',
      unit_uic: 'CMPB',
      available_count: 8,
      limited_count: 3,
      unavailable_count: 2,
    },
  ],
  units_evals: [
    {
      unit_name: 'Battalion 1',
      unit_uic: 'BTT1',
      due_count: 7,
      met_count: 3,
      overdue_count: 5,
    },
    {
      unit_name: 'Battalion 2',
      unit_uic: 'BTT2',
      due_count: 10,
      met_count: 6,
      overdue_count: 2,
    },
    {
      unit_name: 'Company A',
      unit_uic: 'CMPA',
      due_count: 4,
      met_count: 4,
      overdue_count: 0,
    },
    {
      unit_name: 'Company B',
      unit_uic: 'CMPB',
      due_count: 6,
      met_count: 2,
      overdue_count: 3,
    },
  ],
  units_mos_breakdowns: [
    {
      unit_name: 'Battalion 1',
      unit_uic: 'BTT1',
      mos_list: [
        {
          mos: '15A',
          ml0: 10,
          ml1: 2,
          ml2: 5,
          ml3: 7,
          ml4: 4,
        },
        {
          mos: '25B',
          ml0: 6,
          ml1: 3,
          ml2: 2,
          ml3: 4,
          ml4: 1,
        },
      ],
    },
    {
      unit_name: 'Battalion 2',
      unit_uic: 'BTT2',
      mos_list: [
        {
          mos: '11B',
          ml0: 12,
          ml1: 5,
          ml2: 6,
          ml3: 3,
          ml4: 2,
        },
        {
          mos: '42A',
          ml0: 4,
          ml1: 1,
          ml2: 2,
          ml3: 0,
          ml4: 1,
        },
      ],
    },
    {
      unit_name: 'Company A',
      unit_uic: 'CMPA',
      mos_list: [
        {
          mos: '68W',
          ml0: 5,
          ml1: 2,
          ml2: 1,
          ml3: 2,
          ml4: 0,
        },
      ],
    },
    {
      unit_name: 'Company B',
      unit_uic: 'CMPB',
      mos_list: [
        {
          mos: '19K',
          ml0: 7,
          ml1: 3,
          ml2: 2,
          ml3: 1,
          ml4: 0,
        },
      ],
    },
  ],
};

export const mockSubordinateUnitHealthData: IUnitHealthDataDTO = {
  unit_echelon: 'Company',
  units_availability: [
    {
      unit_name: 'Company 1',
      unit_uic: 'CMP1',
      available_count: 5,
      limited_count: 12,
      unavailable_count: 7,
    },
    {
      unit_name: 'Company 2',
      unit_uic: 'CMP2',
      available_count: 3,
      limited_count: 9,
      unavailable_count: 4,
    },
    {
      unit_name: 'Company 3',
      unit_uic: 'CMP3',
      available_count: 2,
      limited_count: 1,
      unavailable_count: 6,
    },
    {
      unit_name: 'Company 4',
      unit_uic: 'CMP4',
      available_count: 2,
      limited_count: 8,
      unavailable_count: 3,
    },
    {
      unit_name: 'Company 5',
      unit_uic: 'CMP5',
      available_count: 6,
      limited_count: 9,
      unavailable_count: 3,
    },
  ],
  units_evals: [
    {
      unit_name: 'Company 1',
      unit_uic: 'CMP1',
      due_count: 7,
      met_count: 3,
      overdue_count: 5,
    },
    {
      unit_name: 'Company 2',
      unit_uic: 'CMP2',
      due_count: 10,
      met_count: 6,
      overdue_count: 2,
    },
    {
      unit_name: 'Company 3',
      unit_uic: 'CMP3',
      due_count: 4,
      met_count: 4,
      overdue_count: 0,
    },
    {
      unit_name: 'Company 4',
      unit_uic: 'CMP4',
      due_count: 6,
      met_count: 2,
      overdue_count: 3,
    },
    {
      unit_name: 'Company 5',
      unit_uic: 'CMP5',
      due_count: 7,
      met_count: 4,
      overdue_count: 8,
    },
  ],
  units_mos_breakdowns: [
    {
      unit_name: 'Company 1',
      unit_uic: 'CMP1',
      mos_list: [
        {
          mos: '15A',
          ml0: 10,
          ml1: 2,
          ml2: 5,
          ml3: 7,
          ml4: 4,
        },
        {
          mos: '25B',
          ml0: 6,
          ml1: 3,
          ml2: 2,
          ml3: 4,
          ml4: 1,
        },
      ],
    },
    {
      unit_name: 'Company 2',
      unit_uic: 'CMP2',
      mos_list: [
        {
          mos: '11B',
          ml0: 12,
          ml1: 5,
          ml2: 6,
          ml3: 3,
          ml4: 2,
        },
        {
          mos: '42A',
          ml0: 4,
          ml1: 1,
          ml2: 2,
          ml3: 0,
          ml4: 1,
        },
      ],
    },
    {
      unit_name: 'Company 3',
      unit_uic: 'CMP3',
      mos_list: [
        {
          mos: '68W',
          ml0: 5,
          ml1: 2,
          ml2: 1,
          ml3: 2,
          ml4: 0,
        },
      ],
    },
    {
      unit_name: 'Company 4',
      unit_uic: 'CMP4',
      mos_list: [
        {
          mos: '19K',
          ml0: 7,
          ml1: 3,
          ml2: 2,
          ml3: 1,
          ml4: 0,
        },
      ],
    },
    {
      unit_name: 'Company 5',
      unit_uic: 'CMP5',
      mos_list: [
        {
          mos: '40K',
          ml0: 8,
          ml1: 6,
          ml2: 1,
          ml3: 0,
          ml4: 5,
        },
      ],
    },
  ],
};
