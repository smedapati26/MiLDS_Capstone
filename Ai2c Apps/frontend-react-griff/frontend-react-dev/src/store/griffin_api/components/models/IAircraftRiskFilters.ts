export interface IAircraftRiskFilters {
  uic: string;
  variant?: 'top' | 'bottom';
  serial_numbers?: string[];
  other_uics?: string[];
  part_numbers?: string[];
}
