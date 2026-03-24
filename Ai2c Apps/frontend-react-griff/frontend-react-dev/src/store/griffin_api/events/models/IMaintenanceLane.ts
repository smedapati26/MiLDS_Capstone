import { ILocation, ILocationDto, mapToILocation } from './ILocation';

/* Represents the output data transfer object */
export interface IMaintenanceLaneDto {
  id: number;
  name: string;
  unit: string;
  airframe_families: Array<string>;
  subordinate_units: Array<string>;
  location: ILocationDto | null;
  contractor?: boolean;
  internal?: boolean;
}

/* Represents maintenance lane */
export interface IMaintenanceLane {
  id: number;
  name: string;
  unitUic: string;
  airframeFamilies: Array<string>;
  subordinateUnits: Array<string>;
  location: ILocation | null;
  isContractor: boolean;
  isInternal: boolean;
}

/* Represents the POST data transfer object */
export interface IMaintenanceLaneInDto {
  name: string;
  unit_id: string;
  airframes: Array<string>;
  location_id: ILocationDto | null;
  contractor?: boolean;
  internal?: boolean;
}

/**
 * Maps an `IMaintenanceLaneDto` object to an `IMaintenanceLane` object.
 *
 * @param dto - The data transfer object containing maintenance lane information.
 * @returns An `IMaintenanceLane` object with the mapped properties.
 */
export const mapToILane = (dto: IMaintenanceLaneDto): IMaintenanceLane => ({
  id: dto.id,
  location: dto.location ? mapToILocation(dto.location) : null,
  name: dto.name,
  unitUic: dto.unit,
  airframeFamilies: dto.airframe_families,
  subordinateUnits: dto.subordinate_units,
  isContractor: dto.contractor || false,
  isInternal: dto.internal || false,
});
