import { IUnitEvaluationsSoldierDataDTO } from '@store/amap_ai/unit_health';

export const mockUnitEvaluationsSoldierData: IUnitEvaluationsSoldierDataDTO[] = [
  {
    evaluation_status: 'Met - In Window',
    ml: 'ML1',
    mos: 'MOS1',
    name: 'Test Megee',
    unit: 'TSTUNIT1',
    user_id: 'tstsoldier1',
  },
  {
    evaluation_status: 'Due - 10 Days Remaining',
    ml: 'ML2',
    mos: 'MOS2',
    name: 'Testy Megeey',
    unit: 'TSTUNIT2',
    user_id: 'tstsoldier2',
  },

  {
    evaluation_status: 'Overdue (by 20 days)',
    ml: 'ML3',
    mos: 'MOS3',
    name: 'Tester Megeer',
    unit: 'TSTUNIT3',
    user_id: 'tstsoldier3',
  },
];
