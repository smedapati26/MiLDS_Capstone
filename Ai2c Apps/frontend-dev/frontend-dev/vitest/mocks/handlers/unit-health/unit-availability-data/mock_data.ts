import { IUnitAvailabilityDataDTO } from '@store/amap_ai/unit_health';

export const mockUnitAvailabilityData: IUnitAvailabilityDataDTO[] = [
  {
    unit_name: 'TSTUNIT1',
    soldiers: [
      {
        availability: 'Available',
        email: 'email1',
        ml: 'ML1',
        mos: 'MOS1',
        name: 'Test Megee',
        unit: 'TSTUNIT1',
        user_id: 'tstsoldier1',
        flag_details: {
          start_date: '05/11/1998',
          end_date: undefined,
          status: 'Available',
          flag_info: 'Flag Info',
          flag_type: 'Admin',
          recorced_by: 'Testy Megeey',
          remarks: 'Test Remarks',
          unit: 'TSTUNIT1',
          updated_by: undefined,
        },
      },
      {
        availability: 'Unavailable',
        email: 'email2',
        ml: 'ML2',
        mos: 'MOS2',
        name: 'Testy Megeey',
        unit: 'TSTUNIT2',
        user_id: 'tstsoldier2',
        flag_details: {
          start_date: '05/11/1998',
          end_date: undefined,
          status: 'Unavailable',
          flag_info: undefined,
          flag_type: undefined,
          recorced_by: undefined,
          remarks: undefined,
          unit: undefined,
          updated_by: undefined,
        },
      },

      {
        availability: 'Limited',
        email: 'email3',
        ml: 'ML3',
        mos: 'MOS3',
        name: 'Tester Megeer',
        unit: 'TSTUNIT3',
        user_id: 'tstsoldier3',
        flag_details: undefined,
      },
    ],
  },
];
