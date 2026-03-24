// Short Life Component Types
export interface IShortLifeComponentDto {
  id: number;
  aircraft: string;
  aircraft_model: string;
  work_unit_code: string;
  nomenclature: string;
  part_number: string;
  comp_serial_number: string;
  tracker_display_name: string | null;
  component_type: string | null;
  current_value: number;
  replacement_due: number | null;
  flying_hours_remaining: number | null;
}

// Mapped interface for frontend use
export interface IShortLife {
  aircraftModel: string;
  id: number;
  [key: string]: string | number | null;
  aircraftSerialNumber: string;
  workUnitCode: string;
  nomenclature: string;
  partNumber: string;
  serialNumber: string;
  trackerName: string | null;
  componentType: string | null;
  currentValue: number;
  replacementDue: number | null;
  hoursRemaining: number | null;
}

// Mapper function
export function mapToIShortLife(dto: IShortLifeComponentDto): IShortLife {
  return {
    id: dto.id,
    aircraftModel: dto.aircraft_model,
    aircraftSerialNumber: dto.aircraft,
    workUnitCode: dto.work_unit_code,
    nomenclature: dto.nomenclature,
    partNumber: dto.part_number,
    serialNumber: dto.comp_serial_number,
    trackerName: dto.tracker_display_name,
    componentType: dto.component_type,
    currentValue: dto.current_value,
    replacementDue: dto.replacement_due,
    hoursRemaining: dto.flying_hours_remaining,
  };
}
