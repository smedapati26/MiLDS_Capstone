import {
  IMissionsFlownDataSet,
  IMissionsFlownDetailDataSet,
  IMissionsFlownSummaryDataSet,
} from '@store/griffin_api/readiness/models';

export const mockMissionFlownUnit: IMissionsFlownDataSet = {
  mission_type: 'ACCEPTANCE_TEST_FLIGHT',
  day_mission_count: 4,
  night_mission_count: 0,
  day_mission_hours: 15.399999976158142,
  night_mission_hours: 0,
  weather_mission_count: 0,
  weather_mission_hours: 0,
};

export const mockMissionFlownDetail: IMissionsFlownDetailDataSet = {
  unit: 'WDDRC0',
  flight_id: '6D802C4D-3A32-44B5-A0A3-170E3769C9AB',
  mission_type: 'TRAINING',
  day_mission_hours: 0,
  night_mission_hours: 3,
  start_date: '2024-03-28',
  stop_date: '2024-03-28',
};

export const mockMissionFlownSummary: IMissionsFlownSummaryDataSet = {
  mission_type: 'ACCEPTANCE_TEST_FLIGHT',
  amount_flown: 4,
  hours_flown: 15,
};
