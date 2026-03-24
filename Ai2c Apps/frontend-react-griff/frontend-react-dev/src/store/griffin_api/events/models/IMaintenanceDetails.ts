export interface IMaintenanceDetailsDto {
  serial: string;
  model: string;
  inspection_name: string;
  status: number;
  lane_name: string;
  responsible_unit: string;
  start_date: string;
  end_date: string;
  current_upcoming: string;
}
