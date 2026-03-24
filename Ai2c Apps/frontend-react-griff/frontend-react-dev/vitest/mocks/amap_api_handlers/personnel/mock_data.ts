import { IMaintainerDto } from '@store/amap_api/personnel/models/IMaintainer';
import {
  IMaintainerExperienceMos,
  IMaintainerStrengthMosAvailability,
} from '@store/amap_api/personnel/models/IMaintainerExperience';
import { IMaintenancePersonnelCount } from '@store/amap_api/personnel/models/IMaintenancePersonnelCount';
import { IPhaseTeamDto } from '@store/amap_api/personnel/models/IPhaseTeam';

export const mockMaintenancePersonnelCount: IMaintenancePersonnelCount = {
  mos: '11X',
  ml: 'level',
  count: 10,
};

export const mockMaintenancePersonnelCounts: IMaintenancePersonnelCount[] = [
  {
    mos: '11B',
    ml: '1',
    count: 5,
  },
  {
    mos: '12A',
    ml: '2',
    count: 15,
  },
  {
    mos: '13B',
    ml: '3',
    count: 20,
  },
  {
    mos: '14C',
    ml: '1',
    count: 8,
  },
  {
    mos: '15D',
    ml: '2',
    count: 12,
  },
];

export const mockMaintainerExperienceMos: IMaintainerExperienceMos = {
  mos: '11B',
  data: [
    {
      date: '2023-01-01',
      counts: [
        { level: '1', count: 5 },
        { level: '2', count: 10 },
      ],
    },
    {
      date: '2023-02-01',
      counts: [
        { level: '1', count: 7 },
        { level: '2', count: 12 },
      ],
    },
  ],
};

export const mockMaintainerExperienceMosList: IMaintainerExperienceMos[] = [
  mockMaintainerExperienceMos,
  {
    mos: '12A',
    data: [
      {
        date: '2023-01-01',
        counts: [
          { level: '3', count: 3 },
          { level: '4', count: 8 },
        ],
      },
    ],
  },
];

export const mockMaintainerStrengthMosAvailability: IMaintainerStrengthMosAvailability = {
  mos: '11B',
  available_count: 15,
  total_count: 20,
};

export const mockMaintainerStrengthMosAvailabilityList: IMaintainerStrengthMosAvailability[] = [
  mockMaintainerStrengthMosAvailability,
  {
    mos: '12A',
    available_count: 10,
    total_count: 15,
  },
];

export const mockMaintainerDto: IMaintainerDto = {
  user_id: 'user123',
  first_name: 'John',
  last_name: 'Doe',
  ml: '2',
  mos: '11B',
  availability_flag: true,
};

export const mockMaintainerDtoList: IMaintainerDto[] = [
  mockMaintainerDto,
  {
    user_id: 'user456',
    first_name: 'Jane',
    last_name: 'Smith',
    ml: '3',
    mos: '12A',
    availability_flag: false,
  },
];

export const mockPhaseTeamDto: IPhaseTeamDto = {
  id: 1,
  phase_id: 123,
  phase_members: ['user123', 'user456'],
  phase_lead_user_id: 'user123',
  assistant_phase_lead_user_id: 'user456',
};
