import { IFaultOverTime } from '@store/griffin_api/faults/models';

export const mockFaultOverTime: IFaultOverTime = {
  reporting_period: '2024-01-01',
  no_status: 5,
  cleared: 10,
  ti_cleared: 3,
  diagonal: 2,
  dash: 1,
  admin_deadline: 4,
  deadline: 6,
  circle_x: 0,
  nuclear: 2,
  chemical: 1,
  biological: 0,
};
