export interface IMissionsFlownDetailDataSet {
  unit: string;
  flight_id: string;
  mission_type: string;
  day_mission_hours: number;
  night_mission_hours: number;
  start_date: string;
  stop_date: string;
  day_mission_flag?: boolean;
  night_mission_flag?: boolean;
}
