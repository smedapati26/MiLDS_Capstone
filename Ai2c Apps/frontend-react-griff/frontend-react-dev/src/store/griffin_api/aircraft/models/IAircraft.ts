import dayjs from 'dayjs';

import { IAutoDsrLocation, IAutoDsrLocationDto, mapToIAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';

/* Represents army aircraft API out DTO */
export interface IAircraftDto {
  aircraft_model: string;
  aircraft_family: string;
  aircraft_mds: string;
  serial: string;
}

export interface IAircraftPhaseFlowDto {
  model: string;
  hours_to_320: number;
  serial: string;
  total_airframe_hours: number;
  flight_hours: number;
  next_phase_type: string;
  hours_to_phase: number;
  owning_unit: string;
  current_unit: string;
}

export interface IAircraftBankPercentageDto {
  key: string;
  bank_percentage: number;
}

export interface IAircraftCompanyDto {
  uic: string;
  short_name: string;
  display_name: string;
}
export interface IAircraftPhaseFlowSubordinatesDto {
  uic: string;
  short_name: string;
  aircraft: IAircraftPhaseFlowDto[];
}

export interface IAircraftPhaseFlowModelsDto {
  model: string;
  aircraft: IAircraftPhaseFlowDto[];
}

export interface IAircraftModificationDto {
  id: number;
  mod_type: string;
  value: string | null;
}

export interface IEventDetailsDto {
  inspection: IAircraftInspectionDto;
  maintenance: IMaintenanceEventDetailsDto | null;
}

export interface IAircraftEquipmentDetailsInfoDto {
  serial: string;
  remarks: string | null;
  rtl: string;
  status: string;
  or_status: string;
  date_down: Date | null;
  ecd: Date | null;
  total_airframe_hours: number;
  flight_hours: number;
  hours_to_phase: number;
  in_phase: boolean;
  location: IAutoDsrLocationDto | null;
  modifications: IAircraftModificationDto[];
  field_sync_status: { [sync: string]: boolean } | undefined;
  events: IEventDetailsDto[];
}

export interface IModelGroupDto {
  model: string;
  aircraft: IAircraftEquipmentDetailsInfoDto[];
}

export interface IAircraftEquipmentDetailsDto {
  unit_uic: string;
  unit_short_name: string;
  models: IModelGroupDto[];
}

export interface IAircraftDetailDto {
  date_down: Date;
  hours_to_phase: number;
  in_phase: boolean;
  last_update_time: Date;
  phase_start_date: Date;
  remarks: string;
  serial: string;
  total_airframe_hours: number;
}

export interface IAircraftInspectionDto {
  inspection__id: number;
  inspection__inspection_name: string;
  inspection__hours_interval: number;
  inspection__last_conducted_hours: number;
  inspection__next_due_hours: number;
  till_due: number;
  serial: string;
}

export interface IAircraftDsrDto {
  aircraft: IAircraftDetailDto[];
  inspection: IAircraftInspectionDto[];
}

export interface IMaintenanceEventDetailsDto {
  name: string | undefined;
  lane: string | undefined;
  event_start: string | undefined;
  event_end: string | undefined;
}

export interface IAircraftEditInDto {
  serial: string | undefined;
  rtl: string | undefined;
  status: string | undefined;
  date_down: string | null | undefined;
  ecd: string | null | undefined;
  total_airframe_hours: number | undefined;
  flight_hours: number | undefined;
  location_id: number | undefined;
  remarks: string | undefined;
  field_sync_status: { [sync: string]: boolean } | undefined;
  mods: IAircraftModificationDto[] | undefined;
}

export interface IAircraftEditOutDto {
  edited_aircraft: string[] | undefined;
  not_edited_aircraft: string[] | undefined;
  detail: string | undefined;
}

/* Represents army aircraft */
export interface IAircraft {
  aircraftModel: string;
  aircraftFamily: string;
  aircraftMds: string;
  serial: string;
}

export interface IAircraftDetail {
  dateDown: Date;
  hoursToPhase: number;
  inPhase: boolean;
  lastUpdateTime: Date;
  phaseStartDate: Date;
  remarks: string;
  serial: string;
  totalAirframeHours: number;
}

export interface IAircraftInspection {
  inspectionId: number;
  inspectionName: string;
  hoursInterval: number;
  lastConductedHours: number;
  nextDueHours: number;
  tillDue: number;
  serial: string;
}

export interface IAircraftDsr {
  aircraft: IAircraftDetail[];
  inspection: IAircraftInspection[];
}

export interface IMaintenanceEventDetails {
  name: string | undefined;
  lane: string | undefined;
  eventStart: string | undefined;
  eventEnd: string | undefined;
}

export interface IEventDetails {
  inspection: IAircraftInspection;
  maintenance: IMaintenanceEventDetails | null;
}

export interface IAircraftPhaseFlow {
  model: string;
  hoursTo320: number;
  serial: string;
  totalAirframeHours: number;
  flightHours: number;
  nextPhaseType: string;
  hoursToPhase: number;
  owningUnit: string;
  currentUnit: string;
}

export interface IAircraftPhaseFlowSubordinates {
  uic: string;
  shortName: string;
  aircraft: IAircraftPhaseFlow[];
}

export interface IAircraftPhaseFlowModels {
  model: string;
  aircraft: IAircraftPhaseFlow[];
}

export interface IAircraftBankPercentage {
  key: string;
  bankPercentage: number;
}

export interface IAircraftCompany {
  uic: string;
  shortName: string;
  displayName: string;
}

export interface IAircraftPhaseFlow {
  model: string;
  serial: string;
  totalAirframeHours: number;
  flightHours: number;
  hoursToPhase: number;
  owningUnit: string;
  currentUnit: string;
}

export interface IAircraftPhaseFlowSubordinates {
  uic: string;
  aircraft: IAircraftPhaseFlow[];
}

export interface IAircraftBankPercentage {
  key: string;
  bankPercentage: number;
}

export interface IAircraftCompany {
  uic: string;
  shortName: string;
  displayName: string;
}

export interface IAircraftModification {
  id: number;
  modType: string;
  value: string | null;
}

export interface IAircraftEquipmentDetailsInfo {
  serial: string;
  remarks: string | null;
  rtl: string;
  status: string;
  ORStatus: string;
  dateDown: Date | null;
  dateDownCount: number | null;
  ecd: Date | null;
  totalAirframeHours: number;
  flightHours: number;
  hoursToPhase: number;
  inPhase: boolean;
  location: IAutoDsrLocation | null;
  modifications: IAircraftModification[];
  fieldSyncStatus: { [sync: string]: boolean } | undefined;
  events: IEventDetails[];
}

export interface IModelGroup {
  model: string;
  aircraft: IAircraftEquipmentDetailsInfo[];
}

export interface IAircraftEquipmentDetails {
  unitUic: string;
  unitShortName: string;
  models: IModelGroup[];
}

export interface IAircraftEditIn {
  serial: string | undefined;
  rtl?: string | undefined;
  status?: string | undefined;
  dateDown?: Date | null | undefined;
  ecd?: Date | null | undefined;
  totalAirframeHours?: number | undefined;
  flightHours?: number | undefined;
  locationId?: number | undefined;
  remarks?: string | undefined;
  fieldSyncStatus?: { [sync: string]: boolean } | undefined;
  mods?: IAircraftModification[] | undefined;
}

export interface IAircraftEditOut {
  editedAircraft: string[] | undefined;
  notEditedAircraft: string[] | undefined;
  detail: string | undefined;
}

export interface IAircraftTransferData {
  serial: string;
  ORStatus: string;
  model: string;
  unitShortName: string;
}

/**
 * Maps an IAircraftDto DTO to an IAircraft object.
 *
 * @param dto - The data transfer object containing aircraft information.
 * @returns An IAircraft object with the mapped properties.
 */
export const mapToIAircraft = (dto: IAircraftDto): IAircraft => ({
  aircraftModel: dto.aircraft_model,
  aircraftFamily: dto.aircraft_family,
  aircraftMds: dto.aircraft_mds,
  serial: dto.serial,
});

export const mapToIAircraftPhaseFlow = (dto: IAircraftPhaseFlowDto): IAircraftPhaseFlow => ({
  model: dto.model,
  hoursTo320: dto.hours_to_320,
  serial: dto.serial,
  totalAirframeHours: dto.total_airframe_hours,
  flightHours: dto.flight_hours,
  nextPhaseType: dto.next_phase_type,
  hoursToPhase: dto.hours_to_phase,
  owningUnit: dto.owning_unit,
  currentUnit: dto.current_unit,
});

export const mapToAircraftPhaseFlowSubordinates = (
  dto: IAircraftPhaseFlowSubordinatesDto,
): IAircraftPhaseFlowSubordinates => ({
  uic: dto.uic,
  shortName: dto.short_name,
  aircraft: dto.aircraft.map(mapToIAircraftPhaseFlow),
});

export const mapToAircraftPhaseFlowModels = (dto: IAircraftPhaseFlowModelsDto): IAircraftPhaseFlowModels => ({
  model: dto.model,
  aircraft: dto.aircraft.map(mapToIAircraftPhaseFlow),
});

export const mapToIAircraftBankPercentage = (dto: IAircraftBankPercentageDto): IAircraftBankPercentage => ({
  key: dto.key,
  bankPercentage: dto.bank_percentage,
});

export const mapToIAircraftCompany = (dto: IAircraftCompanyDto): IAircraftCompany => ({
  uic: dto.uic,
  shortName: dto.short_name,
  displayName: dto.display_name,
});

/**
 * Maps an IAircraftDetailsDTO to an IAircraft object
 *
 * @param dto - The data transfer object containing aircraft details information
 * @returns An IAircraftDetails object with the mapped properties
 */
export const mapToIAircraftDetail = (dto: IAircraftDetailDto): IAircraftDetail => ({
  dateDown: dto.date_down,
  hoursToPhase: dto.hours_to_phase,
  inPhase: dto.in_phase,
  lastUpdateTime: dto.last_update_time,
  phaseStartDate: dto.phase_start_date,
  remarks: dto.remarks,
  serial: dto.serial,
  totalAirframeHours: dto.total_airframe_hours,
});

export const mapToIAircraftInspection = (dto: IAircraftInspectionDto): IAircraftInspection => ({
  inspectionId: dto.inspection__id,
  inspectionName: dto.inspection__inspection_name,
  hoursInterval: dto.inspection__hours_interval,
  lastConductedHours: dto.inspection__last_conducted_hours,
  nextDueHours: dto.inspection__next_due_hours,
  tillDue: dto.till_due,
  serial: dto.serial,
});

export const mapToIMaintenanceEventDetails = (dto: IMaintenanceEventDetailsDto): IMaintenanceEventDetails => ({
  name: dto.name,
  lane: dto.lane,
  eventEnd: dto.event_end,
  eventStart: dto.event_start,
});

export const mapToEventDetails = (dto: IEventDetailsDto): IEventDetails => ({
  inspection: mapToIAircraftInspection(dto.inspection),
  maintenance: dto.maintenance ? mapToIMaintenanceEventDetails(dto.maintenance) : null,
});

export const mapToAircraftModification = (dto: IAircraftModificationDto): IAircraftModification => ({
  id: dto.id,
  modType: dto.mod_type,
  value: dto.value,
});

const mapToAircraftEquipmentDetailsInfo = (dto: IAircraftEquipmentDetailsInfoDto): IAircraftEquipmentDetailsInfo => ({
  serial: dto.serial,
  remarks: dto.remarks,
  rtl: dto.rtl,
  status: dto.status,
  ORStatus: dto.or_status,
  dateDown: dto.date_down,
  dateDownCount: dayjs().diff(dto.date_down, 'day'),
  ecd: dto.ecd,
  totalAirframeHours: dto.total_airframe_hours,
  flightHours: dto.flight_hours,
  hoursToPhase: dto.hours_to_phase,
  inPhase: dto.in_phase,
  location: dto.location ? mapToIAutoDsrLocation(dto.location) : null,
  fieldSyncStatus: dto.field_sync_status,
  modifications: dto.modifications.map(mapToAircraftModification),
  events: dto.events.map(mapToEventDetails),
});

const mapToModelGroup = (dto: IModelGroupDto): IModelGroup => ({
  model: dto.model,
  aircraft: dto.aircraft.map(mapToAircraftEquipmentDetailsInfo),
});

export const mapToAircraftEquipmentDetails = (dto: IAircraftEquipmentDetailsDto): IAircraftEquipmentDetails => ({
  unitUic: dto.unit_uic,
  unitShortName: dto.unit_short_name,
  models: dto.models.map(mapToModelGroup),
});

export const mapToAircraftModificationDto = (data: IAircraftModification): IAircraftModificationDto => ({
  id: data.id,
  mod_type: data.modType,
  value: data.value,
});

export const mapToAircraftEditInDto = (data: IAircraftEditIn): IAircraftEditInDto => ({
  serial: data.serial,
  status: data.status,
  rtl: data.rtl,
  date_down: data.dateDown ? dayjs(data.dateDown).format('YYYY-MM-DD') : null,
  ecd: data.ecd ? dayjs(data.ecd).format('YYYY-MM-DD') : null,
  total_airframe_hours: data.totalAirframeHours,
  flight_hours: data.flightHours,
  location_id: data.locationId,
  remarks: data.remarks,
  field_sync_status: data.fieldSyncStatus,
  mods: data.mods?.map(mapToAircraftModificationDto),
});

export const mapToAircraftEditOut = (dto: IAircraftEditOutDto): IAircraftEditOut => ({
  editedAircraft: dto.edited_aircraft,
  notEditedAircraft: dto.not_edited_aircraft,
  detail: dto.detail,
});

export interface IEquipmentDetailsColumnMapping {
  label: string;
  key: keyof IAircraftEquipmentDetailsInfo | `inspections.${string}` | 'actions';
  width?: number | string;
  sortable?: boolean;
}

export const AIRCRAFT_EQUIPMENT_DETAILS_COLUMNS: IEquipmentDetailsColumnMapping[] = [
  { label: 'SN', key: 'serial', width: '10%', sortable: true },
  { label: 'Status', key: 'rtl', width: '10%' },
  { label: 'OR Status', key: 'ORStatus', width: '20%' },
  { label: 'Remarks', key: 'remarks', width: '10%' },
  { label: 'ECD', key: 'ecd', width: '10%' },
  { label: 'Total Hr', key: 'totalAirframeHours', width: '10%' },
  { label: 'Month Hr', key: 'flightHours', width: '10%' },
  { label: 'Location', key: 'location', width: '10%' },
  { label: 'Mods', key: 'modifications', width: '10%' },
  { label: 'Action', key: 'actions', width: '10%' },
];

export interface IModsKitsColumnMapping {
  label: string;
  key: keyof IAircraftModification | 'actions';
  width?: number | string;
  sortable?: boolean;
}

export const AIRCRAFT_MODIFICATION_KITS_COLUMNS: IModsKitsColumnMapping[] = [
  { label: 'SN', key: 'id', width: '10%', sortable: true },
  { label: 'Mod Type', key: 'modType', width: '10%' },
  { label: 'Value', key: 'value', width: '10%' },
  { label: 'Action', key: 'actions', width: '10%' },
];

export interface IAircraftTransferColumnMapping {
  label: string;
  key: keyof IAircraftTransferData;
  width?: number | string;
  sortable?: boolean;
}

export const AIRCRAFT_TRANSFER_COLUMNS: IAircraftTransferColumnMapping[] = [
  { label: 'Serial Number', key: 'serial', width: '10%', sortable: true },
  { label: 'Model', key: 'model', width: '10%' },
  { label: 'OR Status', key: 'ORStatus', width: '20%' },
];
