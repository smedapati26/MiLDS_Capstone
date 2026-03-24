import dayjs from 'dayjs';

import { IAppUser, IAppUserDto, mapToIAppUser } from '@store/griffin_api/users/models';

export interface ILocationDto {
  abbreviation?: string;
  code?: string;
  mgrs: string;
  name?: string;
  short_name?: string;
}

/* Represents  IAutoDsr the output data transfer object. */
export interface IAutoDsrDto {
  serial_number: string;
  owning_unit_uic: string;
  owning_unit_name: string;
  location: ILocationDto;
  model: string;
  status: string;
  rtl: string;
  remarks: string;
  date_down: string;
  ecd: string;
  hours_to_phase: number;
  flying_hours: number;
  last_sync_time: string;
  last_export_upload_time: string;
  last_user_edit_time: string;
  data_update_time: string;
  modifications: Array<IModDto>;
  current_unit_uic: string;
  current_unit_name: string;
}

export interface IModDto {
  mod_type: string;
  value: string;
}

export interface IAutoDsrLocationDto {
  id: number;
  code: string;
  name: string;
}

export interface IAutoDsrSimilarUnitsDto {
  uic: string;
  short_name: string;
}

export interface IAutoDsrSingleUnitInfoDto {
  uic: string;
  short_name: string;
  display_name: string;
  nick_name: string;
  echelon: string;
  parent_uic: string;
  level: number;
  similar_units: IAutoDsrSimilarUnitsDto[];
}

export type AcdUploadStatus = 'Transmitting' | 'Pending' | 'Processing' | 'Complete' | 'Cancelled';

export interface IAcdProcessMessagesOutDto {
  message: string;
  message_dt: Date;
}

export interface IAcdHistoryOutDto {
  user?: IAppUserDto;
  file_name?: string;
  messages: IAcdProcessMessagesOutDto[];
  id: string | number;
  uploaded_at: Date;
  succeeded: boolean;
  unit: string;
  upload_type: string;
  status: AcdUploadStatus;
  sync: boolean;
}

/* Represents  IAutoDsr Object */

export interface ILocation {
  abbreviation?: string;
  code?: string;
  mgrs?: string;
  name?: string;
  shortName?: string;
}
export interface IAutoDsr {
  serialNumber: string;
  owningUnitUic: string;
  owningUnitName: string;
  location: ILocation;
  model: string;
  status: string;
  rtl: string;
  remarks: string;
  dateDown: string;
  dateDownCount: number;
  ecd: string;
  hoursToPhase: number | string;
  flyingHours: number | string;
  lastSyncTime: string;
  lastExportUploadTime: string;
  lastUserEditTime: string;
  dataUpdateTime: string;
  modifications: Array<IMod>;
  currentUnitUic: string;
  currentUnitName: string;
}

export interface IMod {
  modType: string;
  value: string;
}

export interface IAutoDsrLocation {
  id: number;
  code: string;
  name: string;
}

export interface IAutoDsrSimilarUnits {
  uic: string;
  shortName: string;
}

export interface IAutoDsrSingleUnitInfo {
  uic: string;
  shortName: string;
  displayName: string;
  nickName: string;
  echelon: string;
  parentUic: string;
  level: number;
  similarUnits: IAutoDsrSimilarUnits[];
}

export interface IAcdProcessMessagesOut {
  message: string;
  messageDt: Date;
}

export interface IAcdHistoryOut {
  user?: IAppUser;
  fileName?: string;
  messages?: IAcdProcessMessagesOut[];
  id: string | number;
  uploadedAt: Date;
  succeeded: boolean;
  unit: string;
  uploadType: string;
  status: AcdUploadStatus;
  sync: boolean;
}

/* Maps IAutoDsrDto to  Object IAutoDsr */
export function mapToILocation(dto: ILocationDto): ILocation {
  return {
    abbreviation: dto?.abbreviation,
    code: dto?.code,
    mgrs: dto?.mgrs,
    name: dto?.name,
    shortName: dto?.short_name,
  };
}

/* Maps IModDto to  Object IMod */
export function mapToIMod(dto: IModDto): IMod {
  return {
    modType: dto?.mod_type,
    value: dto?.value,
  };
}

/* Maps IAutoDsrDto to  Object IAutoDsr */
export function mapToIAutoDsr(dto: IAutoDsrDto): IAutoDsr {
  return {
    serialNumber: dto.serial_number,
    owningUnitUic: dto.owning_unit_uic,
    owningUnitName: dto.owning_unit_name,
    location: mapToILocation(dto.location),
    model: dto.model,
    status: dto.status,
    rtl: dto.rtl,
    remarks: dto.remarks,
    dateDown: dto.date_down,
    dateDownCount: dayjs().diff(dto.date_down, 'day'),
    ecd: dto.ecd,
    hoursToPhase: dto.hours_to_phase,
    flyingHours: dto.flying_hours.toFixed(1),
    lastSyncTime: dto.last_sync_time,
    lastExportUploadTime: dto.last_export_upload_time,
    lastUserEditTime: dto.last_user_edit_time,
    dataUpdateTime: dto.data_update_time,
    modifications: dto.modifications.map(mapToIMod),
    currentUnitUic: dto.current_unit_uic,
    currentUnitName: dto.current_unit_name,
  };
}

export const mapToIAutoDsrLocation = (dto: IAutoDsrLocationDto): IAutoDsrLocation => ({
  id: dto.id,
  code: dto.code,
  name: dto.name,
});

export const mapToIAutoDsrLocationDto = (data: IAutoDsrLocation): IAutoDsrLocationDto => ({
  id: data.id,
  code: data.code,
  name: data.name,
});

export const mapToAutoDsrSimilarUnits = (dto: IAutoDsrSimilarUnitsDto): IAutoDsrSimilarUnits => ({
  uic: dto.uic,
  shortName: dto.short_name,
});

export const mapToAutoDsrSingleUnitInfo = (dto: IAutoDsrSingleUnitInfoDto): IAutoDsrSingleUnitInfo => ({
  uic: dto.uic,
  shortName: dto.short_name,
  displayName: dto.display_name,
  nickName: dto.nick_name,
  echelon: dto.echelon,
  parentUic: dto.parent_uic,
  level: dto.level,
  similarUnits: dto.similar_units.map(mapToAutoDsrSimilarUnits),
});

const mapToAcdProcessMessagesOut = (dto: IAcdProcessMessagesOutDto): IAcdProcessMessagesOut => ({
  message: dto.message,
  messageDt: dto.message_dt,
});

export const mapToAcdHistoryOut = (dto: IAcdHistoryOutDto): IAcdHistoryOut => ({
  id: dto.id,
  user: mapToIAppUser(dto.user as IAppUserDto),
  messages: dto.messages && dto.messages.map(mapToAcdProcessMessagesOut),
  fileName: dto.file_name,
  uploadedAt: dto.uploaded_at,
  succeeded: dto.succeeded,
  unit: dto.unit,
  uploadType: dto.upload_type,
  status: dto.status,
  sync: dto.sync,
});
