import { IHoursFlownModel, IHoursFlownSubordinate, IHoursFlownUnits } from '@store/griffin_api/readiness/models';

export const mockHoursFlownUnit: IHoursFlownUnits = {
  uic: 'TEST_UIC',
  hours_detail: [
    {
      hours_flown: 10,
      reporting_month: '2023-10-15',
    },
  ],
};

export const mockHoursFlownSubordinate: IHoursFlownSubordinate = {
  parent_uic: 'TEST_PARENT_UIC',
  uic: 'TEST_UIC',
  hours_detail: [
    {
      hours_flown: 10,
      reporting_month: '2023-10-15',
    },
  ],
};

export const mockHoursFlownModel: IHoursFlownModel = {
  model: 'CH-047f',
  hours_detail: [
    {
      hours_flown: 10,
      reporting_month: '2023-10-15',
    },
  ],
};
