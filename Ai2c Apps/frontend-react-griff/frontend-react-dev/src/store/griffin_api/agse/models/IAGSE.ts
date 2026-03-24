import dayjs from 'dayjs';

import { IAutoDsrLocation, IAutoDsrLocationDto, mapToIAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';

export interface IAggregateConditionDto {
  display_name: string;
  fmc: number;
  pmc: number;
  nmc: number;
}

export interface IAGSEDto {
  equipment_number: string;
  lin: string;
  serial_number: string;
  condition: string;
  status: string;
  current_unit: string;
  current_unit_short_name: string;
  nomenclature: string;
  display_name: string;
  earliest_nmc_start: string | null;
  model: string;
  days_nmc: number | null;
  remarks: string | null;
  location: IAutoDsrLocationDto | null;
}

interface ISyncDto {
  equipment_number: string;
  sync_condition: boolean;
  sync_remarks: boolean;
  sync_earliest_nmc_start: boolean;
  sync_location: boolean;
}

export interface IAGSEOutDto {
  agse: IAGSEDto[];
  syncs: ISyncDto[];
}

export interface IAGSESubordinateDto {
  subordinate: string;
  display_name: string;
  short_name: string;
  uic: string;
  agse: IAGSEDto[];
  syncs: ISyncDto[];
}

export interface IAGSEEditInDto {
  equipment_number: string;
  condition: string | undefined;
  location_id: number | undefined;
  remarks: string | undefined;
  field_sync_status: { [sync: string]: boolean } | undefined;
}

export interface IAGSEEditOutDto {
  edited_agse: string[] | undefined;
  not_edited_agse: string[] | undefined;
  detail: string | undefined;
}

export interface IAggregateCondition {
  displayName: string;
  fmc: number;
  pmc: number;
  nmc: number;
  total: number;
}

export interface IAGSE {
  equipmentNumber: string;
  lin: string;
  serialNumber: string;
  condition: string;
  status: string;
  currentUnit: string;
  currentUnitShortName: string;
  nomenclature: string;
  displayName: string;
  earliestNmcStart: string | null;
  earliestNmcStartCount: number | null;
  model: string;
  daysNmc: number | null;
  remarks: string | null;
  location: IAutoDsrLocation | null;
}

export interface ISync {
  equipmentNumber: string;
  syncCondition: boolean;
  syncRemarks: boolean;
  syncEarliestNmcStart: boolean;
  syncLocation: boolean;
}

export interface IAGSEOut {
  agse: IAGSE[];
  syncs: ISync[];
}

export interface IAGSESubordinate {
  subordinate: string;
  displayName: string;
  shortName: string;
  uic: string;
  agse: IAGSE[];
  syncs: ISync[];
}

export interface IAGSEEditIn {
  equipmentNumber: string;
  condition?: string | undefined;
  locationId?: number | undefined;
  remarks?: string | undefined;
  fieldSyncStatus?: { [sync: string]: boolean } | undefined;
}

export interface IAGSEEditOut {
  editedAGSE: string[] | undefined;
  notEditedAGSE: string[] | undefined;
  detail: string | undefined;
}

const mapToAGSE = (dto: IAGSEDto): IAGSE => ({
  equipmentNumber: dto.equipment_number,
  lin: dto.lin,
  serialNumber: dto.serial_number,
  condition: dto.condition,
  status: dto.status,
  currentUnit: dto.current_unit,
  currentUnitShortName: dto.current_unit_short_name,
  nomenclature: dto.nomenclature,
  displayName: dto.display_name,
  earliestNmcStart: dto.earliest_nmc_start,
  earliestNmcStartCount: dayjs().diff(dto.earliest_nmc_start, 'day'),
  model: dto.model,
  daysNmc: dto.days_nmc,
  remarks: dto.remarks,
  location: dto.location ? mapToIAutoDsrLocation(dto.location) : null,
});

const mapToSyncs = (dto: ISyncDto): ISync => ({
  equipmentNumber: dto.equipment_number,
  syncCondition: dto.sync_condition,
  syncRemarks: dto.sync_remarks,
  syncEarliestNmcStart: dto.sync_earliest_nmc_start,
  syncLocation: dto.sync_location,
});

export const mapToAGSEOut = (dto: IAGSEOutDto): IAGSEOut => ({
  agse: dto.agse.map(mapToAGSE),
  syncs: dto.syncs.map(mapToSyncs),
});

export const mapToAGSESubordinate = (dto: IAGSESubordinateDto): IAGSESubordinate => ({
  subordinate: dto.subordinate,
  displayName: dto.display_name,
  shortName: dto.short_name,
  uic: dto.uic,
  agse: dto.agse.map(mapToAGSE),
  syncs: dto.syncs.map(mapToSyncs),
});

export const mapToAggregateCondition = (dto: IAggregateConditionDto): IAggregateCondition => ({
  displayName: dto.display_name,
  fmc: dto.fmc,
  pmc: dto.pmc,
  nmc: dto.nmc,
  total: dto.fmc + dto.pmc + dto.nmc,
});

export const mapToAGSEEditInDto = (data: IAGSEEditIn): IAGSEEditInDto => ({
  equipment_number: data.equipmentNumber,
  condition: data.condition,
  location_id: data.locationId,
  remarks: data.remarks,
  field_sync_status: data.fieldSyncStatus,
});

export const mapToAGSEEditOut = (dto: IAGSEEditOutDto): IAGSEEditOut => ({
  editedAGSE: dto.edited_agse,
  notEditedAGSE: dto.not_edited_agse,
  detail: dto.detail,
});

export interface IColumnMapping {
  label: string;
  key: keyof IAGSE | 'actions';
  width?: number | string; // Add width property
  sortable?: boolean;
}

export const AGSE_EQUIPMENT_DETAILS_COLUMNS: IColumnMapping[] = [
  { label: 'SN', key: 'equipmentNumber', width: '10%', sortable: true },
  { label: 'OR Status', key: 'status', width: '10%' },
  { label: 'Remarks', key: 'remarks', width: '60%' },
  { label: 'Location', key: 'location', width: '10%' },
  { label: 'Actions', key: 'actions', width: '5%' },
];
