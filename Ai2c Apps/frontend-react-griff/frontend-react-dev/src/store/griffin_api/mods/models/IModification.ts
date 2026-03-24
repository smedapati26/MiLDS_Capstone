import { IAutoDsrLocation, IAutoDsrLocationDto, mapToIAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';

/* Options for Tracking Variable that mirror frontend labels to backend model values */
export const TrackingVariableOptions = {
  STATUS: { value: 'Status', label: 'Operational Readiness Status', shortLabel: 'OR Status' },
  INSTALL: { value: 'Install', label: 'Install' },
  OTHER: { value: 'Other', label: 'Other' },
};

/**
 * @typedef IModificationDto
 * @prop { number } id - DB ID for the Modification since Serial does not exist on historical data
 * @prop { string } serial_number - Serial Number for the Modification
 * @prop { string } model - Model Type of the Modification
 * @prop { string } unit - UIC of Owning Unit for that Modification
 * @prop { string } tracking_variable - Variable type that the Modification is tracking - i.e. OR Status
 * @prop { string | undefined} value -Actual status of the variable being tracked for the Modification - i.e. FMC, PMC, NMC, DADE
 * @prop { IAutoDsrLocationDto | undefined } location - ID for location of the Modification
 * @prop { string | undefined } remarks - Display remarks for Modification
 * @prop { string | undefined } assigned_aircraft - Serial Number of Aircraft if assigned else undefined
 */
export interface IModificationDto {
  id: number;
  serial_number: string;
  model: string;
  unit: string;
  tracking_variable: string;
  value: string | undefined;
  location: IAutoDsrLocationDto | undefined;
  remarks: string | undefined;
  assigned_aircraft: string | undefined;
}

/**
 * @typedef INewModificationDto
 * @prop { string } serial_number - Serial Number for the Modification
 * @prop { string } model - Model Type of the Modification
 * @prop { string } unit_uic - UIC of Owning Unit for that Modification
 * @prop { string } tracking_variable - Variable type that the Modification is tracking - i.e. OR Status
 * @prop { string } value -Actual status of the variable being tracked for the Modification - i.e. FMC, PMC, NMC, DADE
 * @prop { string | undefined } assigned_aircraft - Serial Number of Aircraft if assigned else undefined
 */
export interface INewModificationDto {
  serial_number: string;
  model: string;
  unit_uic: string;
  tracking_variable: string;
  value: string;
  assigned_aircraft: string[];
  remarks: string;
}

/**
 * @typedef IModificationEditInDto
 * @prop { number } id - DB ID for the Modification since Serial does not exist on historical data
 * @prop { string } serial_number - Serial Number for the Modification
 * @prop { string } model - Model Type of the Modification
 * @prop { string } unit_uic - UIC of Owning Unit for that Modification
 * @prop { string | undefined } tracking_variable - Optional new tracking variable type for the Modification
 * @prop { string | undefined } value - Optional new variable status for the Modification
 * @prop { number | undefined } location_id - Optional new ID for location of the Modification
 * @prop { string | undefined } remarks - Optional new display remarks for Modification
 * @prop { string | undefined } assigned_aircraft - Optional new Aircraft assignment
 */
export interface IModificationEditInDto {
  id: number;
  serial_number: string;
  model: string;
  unit_uic: string;
  tracking_variable: string | undefined;
  value: string | undefined;
  location_id: number | undefined;
  remarks: string | undefined;
  assigned_aircraft: string | undefined;
}

/**
 * @typedef IModificationEditOutDto
 * @prop { number[] | undefined } edited_mods - IDs of Modifications that were successfully updated
 * @prop { number[] | undefined  } not_edited_mods - IDs of Modifications that were unable to be updated
 * @prop { string } detail - Message with information on the status of the updates
 */
export interface IModificationEditOutDto {
  edited_mods: number[] | undefined;
  not_edited_mods: number[] | undefined;
  detail: string | undefined;
}

/**
 * @typedef IModification
 * @prop { number } id - DB ID for the Modification since Serial does not exist on historical data
 * @prop { string } serialNumber - Serial Number for the Modification
 * @prop { string } model - Model Type of the Modification
 * @prop { string } unit - UIC of Owning Unit for that Modification
 * @prop { string } trackingVariable - Variable type that the Modification is tracking - i.e. OR Status
 * @prop { string | undefined } value -Actual status of the variable being tracked for the Modification - i.e. FMC, PMC, NMC, DADE
 * @prop { IAutoDsrLocation | undefined } location - location of the Modification
 * @prop { string | undefined } remarks - Display remarks for Modification
 * @prop { string | undefined } assignedAircraft - Serial Number of Aircraft if assigned else undefined
 */
export interface IModification {
  id: number;
  serialNumber: string;
  model: string;
  unit: string;
  trackingVariable: string;
  value: string | undefined;
  location?: IAutoDsrLocation;
  remarks?: string;
  assignedAircraft?: string;
}

/**
 * @typedef IModificationEditIn
 * @prop { number } id - DB ID for the Modification since Serial does not exist on historical data
 * @prop { string } serialNumber - Serial Number for the Modification
 * @prop { string } model - Model Type of the Modification
 * @prop { string } unit - UIC of Owning Unit for that Modification
 * @prop { string } trackingVariable - Optional new tracking variable type for the Modification
 * @prop { string } value - Optional new variable status for the Modification
 * @prop { id } locationId - Optional new ID for location of the Modification
 * @prop { string } remarks - Optional new display remarks for Modification
 * @prop { string | undefined } assignedAircraft - Optional new Aircraft assignment
 */
export interface IModificationEditIn {
  id: number;
  serialNumber: string;
  model: string;
  unit: string;
  trackingVariable?: string;
  value?: string;
  locationId?: number;
  remarks?: string;
  assignedAircraft?: string | undefined;
}

/**
 * @typedef IModificationEditOut
 * @prop { number[] | undefined } editedMods - IDs of Modifications that were successfully updated
 * @prop { number[] | undefined  } notEditedMods - IDs of Modifications that were unable to be updated
 * @prop { string } detail - Message with information on the status of the updates
 */
export interface IModificationEditOut {
  editedMods: number[] | undefined;
  notEditedMods: number[] | undefined;
  detail: string | undefined;
}

/**
 * @function mapToIModification
 *
 * @param {IModificationDto} dto - Modification DTO returned from API
 * @returns { IModification } - Converted Modification object from Modification DTO
 */
export function mapToIModification(dto: IModificationDto): IModification {
  return {
    id: dto.id,
    serialNumber: dto.serial_number ?? '',
    model: dto.model,
    trackingVariable: dto.tracking_variable,
    value: dto.value,
    unit: dto.unit,
    location: dto.location ? mapToIAutoDsrLocation(dto.location) : undefined,
    remarks: dto.remarks,
    assignedAircraft: dto.assigned_aircraft,
  };
}

/**
 * @function mapToIModificationEditOut
 *
 * @param {IModificationEditOutDto} dto - ModificationEditOut DTO returned from API
 * @returns { IModificationEditOut } - Converted ModificationEditOut object from ModificationEditOut DTO
 */
export const mapToIModificationEditOut = (dto: IModificationEditOutDto): IModificationEditOut => ({
  editedMods: dto.edited_mods,
  notEditedMods: dto.not_edited_mods,
  detail: dto.detail,
});

/**
 * @function mapToIModificationEditInDto
 *
 * @param {IModificationEditIn} data - ModificationEditIn Object updated in React to transform and send to API
 * @returns { IModificationEditInDto } - Converted ModificationEditIn DTO from ModificationEditIn object to send to API
 */
export const mapToIModificationEditInDto = (data: IModificationEditIn): IModificationEditInDto => ({
  id: data.id,
  serial_number: data.serialNumber ?? '',
  model: data.model,
  tracking_variable: data.trackingVariable,
  value: data.value,
  location_id: data.locationId,
  remarks: data.remarks,
  unit_uic: data.unit,
  assigned_aircraft: data.assignedAircraft,
});

export interface IModificationColumnMapping {
  label: string;
  key: keyof IModification | 'actions';
  width?: number | string;
}

export const MODIFICATION_DETAIL_COLUMNS: IModificationColumnMapping[] = [
  { label: 'SN', key: 'serialNumber' },
  { label: 'Assigned AC', key: 'assignedAircraft' },
  { label: 'Variable', key: 'trackingVariable' },
  { label: 'Status', key: 'value' },
  { label: 'Location', key: 'location' },
  { label: 'Remarks', key: 'remarks' },
];
