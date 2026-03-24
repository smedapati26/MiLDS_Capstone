export interface IMissionsFlownDataSet {
  mission_type: string;
  day_mission_count: number;
  night_mission_count: number;
  day_mission_hours: number;
  night_mission_hours: number;
  weather_mission_count?: number;
  weather_mission_hours?: number;
}
