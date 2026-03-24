import { IInspectionReference, IInspectionReferenceDto, mapToInspectionReference } from './IInspectionReference';
import { IMaintEventAircraft, IMaintEventAircraftDto, mapToIMaintEventAircraft } from './IMaintEventAircraft';

/* Represents the output data transfer object */
export interface IMaintenanceEventDto {
  id: string | number;
  event_start: string;
  event_end: string;
  aircraft: IMaintEventAircraftDto;
  lane: number | string;
  maintenance_type: 'insp' | 'other';
  is_phase: boolean;
  inspection_reference?: IInspectionReferenceDto | null;
  inspection?: number | null;
  notes?: string | null;
  poc?: string | null;
  alt_poc?: string | null;
}

/* Represents maintenance event */
export interface IMaintenanceEvent {
  id: string | number;
  startDate: string;
  endDate: string;
  laneId: number | string;
  maintenanceType: 'insp' | 'other';
  notes: string | null;
  poc: string | null;
  altPoc: string | null;
  aircraft: IMaintEventAircraft;
  inspection: number | null;
  inspectionReference: IInspectionReference | null;
  isPhase: boolean;
  color?: string;
}

/**
 * Maps an `IMaintenanceEventDto` object to an `IMaintenanceEvent` object.
 *
 * @param dto - The data transfer object containing maintenance event details.
 * @returns An `IMaintenanceEvent` object with the mapped properties.
 */
export const mapToIMaintenanceEvent = (dto: IMaintenanceEventDto): IMaintenanceEvent => {
  return {
    id: dto.id,
    startDate: dto.event_start,
    endDate: dto.event_end,
    laneId: dto.lane,
    maintenanceType: dto.maintenance_type,
    aircraft: mapToIMaintEventAircraft(dto.aircraft),
    notes: dto.notes ?? null,
    poc: dto.poc ?? null,
    altPoc: dto.alt_poc ?? null,
    inspection: dto.inspection ?? null,
    inspectionReference: dto.inspection_reference ? mapToInspectionReference(dto.inspection_reference) : null,
    isPhase: dto.is_phase,
  };
};

export interface IMaintenanceEventResponse {
  id: number;
}
export interface MaintenanceEventPostDto {
  aircraft_id: string | null;
  lane_id: number | null;
  inspection_reference_id?: number | null;
  maintenance_type: string | null;
  event_start: string | null;
  event_end: string | null;
  notes?: string;
}

export interface MaintenanceEventPutDto extends MaintenanceEventPostDto {
  id: string;
}

export interface IUpcomingMaintenanceDto {
  aircraft: IMaintEventAircraftDto;
  is_phase: boolean;
  inspection_reference: IInspectionReferenceDto | null;
  id: number;
  event_start: string;
  event_end: string;
  notes: string | null;
  poc: string | null;
  alt_poc: string | null;
  inspection: string | null;
  lane: number;
  maintenance_type: string;
}

export interface IUpcomingMaintenance {
  id: number;
  title: string;
  progress: number;
  notes: string | null;
  status: string;
  eventStart: string;
  eventEnd: string;
  serialNumber: string;
  lane: number;
  inspectionName: string;
  aircraftModel: string;
}

export const mapToIUpcomingMaintenance = (dto: IUpcomingMaintenanceDto): IUpcomingMaintenance => ({
  id: dto.id,
  title: `${dto.aircraft.serial}, ${dto.inspection_reference?.common_name ?? dto.maintenance_type}`,
  progress: 0, // Calculate this in the component
  notes: dto.notes,
  status: 'In Progress',
  eventStart: dto.event_start,
  eventEnd: dto.event_end,
  serialNumber: dto.aircraft.serial,
  lane: dto.lane,
  inspectionName: `${dto.inspection_reference?.common_name ?? dto.maintenance_type}`,
  aircraftModel: dto.aircraft.airframe.model,
});
