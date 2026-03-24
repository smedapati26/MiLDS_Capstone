import dayjs from 'dayjs';

import { camelCase } from '@ai2c/pmx-mui';
import { camelToSnake } from '@ai2c/pmx-mui/helpers/camelCase';

import { getOrStatus, OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

export type UasType = 'Uac' | 'Uav';

const syncKeys = [
  'sync_serial_number',
  'sync_ecd',
  'sync_equipment_number',
  'sync_model',
  'sync_status',
  'sync_rtl',
  'sync_total_airframe_hours',
  'sync_flight_hours',
  'sync_remarks',
  'sync_date_down',
  'sync_location',
] as const;

type SyncKey = (typeof syncKeys)[number];

export const isSyncKey = (key: string): key is SyncKey => {
  return (syncKeys as readonly string[]).includes(key);
};

/**
 * Represents Data Transfer for both:
 * - UAS
 * - UAC
 */
export type IUasDto = {
  location_code?: string;
  location_name?: string;
  location_id?: number;
  id: string | number;
  serial_number: string;
  model: string;
  status: string;
  rtl: string;
  current_unit: string;
  short_name: string;
  total_airframe_hours?: number;
  flight_hours?: number;
  remarks: string;
  date_down: string | null;
  ecd: string | null;
  last_sync_time: string;
  last_update_time: string;
  should_sync: boolean;
  field_sync_status: { [key: string]: boolean };
};

export interface IUASInDto {
  location_id?: number | null;
  status?: string;
  rtl?: string;
  remarks?: string;
  flight_hours?: string;
  date_down?: string | null;
  ecd?: string | null;
  sync_serial_number?: boolean;
  sync_ecd?: boolean;
  sync_equipment_number?: boolean;
  sync_model?: boolean;
  sync_status?: boolean;
  sync_rtl?: boolean;
  sync_total_airframe_hours?: boolean;
  sync_flight_hours?: boolean;
  sync_remarks?: boolean;
  sync_date_down?: boolean;
  sync_location?: boolean;
}

// Represents UAV & UAC models
export type IUAS = {
  id: string | number;
  locationCode?: string;
  locationName?: string;
  locationId?: number;
  serialNumber: string;
  model: string;
  status: string | OperationalReadinessStatusEnum;
  displayStatus: OperationalReadinessStatusEnum;
  rtl: string;
  currentUnit: string;
  shortName: string;
  totalAirframeHours: number;
  flightHours: number;
  remarks: string;
  dateDown: string | null;
  dateDownCount: number | null;
  ecd: string | null;
  lastSyncTime: string;
  lastUpdateTime: string;
  shouldSync: boolean;
  fieldSyncStatus: { [key: string]: boolean };
};

export interface IUASIn {
  locationId?: number | null;
  status: string;
  rtl: string;
  remarks: string;
  flightHours?: string;
  dateDown?: string | null;
  ecd?: string | null;
  fieldSyncStatus?: { [key: string]: boolean };
}

export interface IUasOut {
  success: boolean;
  message: string;
}

// Maps DTO to local interface with derived variables
export const mapToUas = (dto: IUasDto): IUAS => {
  return {
    id: dto.id,
    locationCode: dto.location_code,
    locationName: dto.location_name,
    locationId: dto.location_id,
    serialNumber: dto.serial_number,
    model: dto.model,
    status: dto.status,
    displayStatus: getOrStatus(dto.status),
    rtl: dto.rtl,
    currentUnit: dto.current_unit,
    shortName: dto.short_name,
    totalAirframeHours: dto.total_airframe_hours ?? 0,
    flightHours: dto.flight_hours ?? 0,
    remarks: dto.remarks,
    dateDown: dto.date_down,
    dateDownCount: dto.date_down ? dayjs().diff(dto.date_down, 'day') : null,
    ecd: dto.ecd,
    lastSyncTime: dto.last_sync_time,
    lastUpdateTime: dto.last_update_time,
    shouldSync: dto.should_sync,
    fieldSyncStatus: Object.entries(dto.field_sync_status).reduce(
      (acc, [key, value]) => {
        acc[camelCase(key)] = value;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  };
};

export const mapIUasInToDto = (input: IUASIn): IUASInDto => {
  const dto: IUASInDto = {
    location_id: input.locationId,
    status: input.status,
    rtl: input.rtl,
    remarks: input.remarks,
    flight_hours: input.flightHours,
    date_down: input.dateDown,
    ecd: input.ecd,
  };

  // matching keys their sync_*
  Object.entries(input.fieldSyncStatus ?? {}).forEach(([key, value]) => {
    const syncKey = `sync_${camelToSnake(key)}`;
    if (isSyncKey(syncKey)) {
      (dto as Record<SyncKey, boolean | undefined>)[syncKey] = value;
    }
  });

  return dto;
};

export interface IColumnMapping {
  label: string;
  key: keyof IUAS | 'actions';
  width?: number | string; // Add width property
  sortable?: boolean;
}

export const UAV_EQUIPMENT_DETAILS_COLUMNS: IColumnMapping[] = [
  { label: 'SN', key: 'serialNumber', width: '10%', sortable: true },
  { label: 'Status', key: 'rtl', width: '10%' },
  { label: 'OR Status', key: 'displayStatus', width: '10%' },
  { label: 'Remarks', key: 'remarks', width: '30%' },
  { label: 'ECD', key: 'ecd', width: '10%' },
  { label: 'Airframe Hrs', key: 'totalAirframeHours', width: '10%' },
  { label: 'Period Hrs', key: 'flightHours', width: '10%' },
  { label: 'Location', key: 'locationCode', width: '10%' },
  { label: 'Actions', key: 'actions', width: '5%' },
];

export const UAC_EQUIPMENT_DETAILS_COLUMNS: IColumnMapping[] = [
  { label: 'SN', key: 'serialNumber', width: '10%', sortable: true },
  { label: 'OR Status', key: 'displayStatus', width: '10%' },
  { label: 'Remarks', key: 'remarks', width: '40%' },
  { label: 'ECD', key: 'ecd', width: '10%' },
  { label: 'Location', key: 'locationCode', width: '10%' },
  { label: 'Actions', key: 'actions', width: '5%' },
];
