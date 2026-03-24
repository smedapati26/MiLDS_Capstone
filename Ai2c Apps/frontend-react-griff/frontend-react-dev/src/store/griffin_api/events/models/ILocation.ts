/* Represents the output data transfer object */
export interface ILocationDto {
  name: string;
  short_name?: string | null;
  code?: string | null;
}

/* Represents maintenance lane location*/
export interface ILocation {
  name: string;
  shortName?: string | null;
  code?: string | null;
}

/**
 * Maps an ILocationDto object to an ILocation object.
 *
 * @param dto - The data transfer object containing location information.
 * @returns An ILocation object with the mapped properties.
 */
export const mapToILocation = (dto: ILocationDto): ILocation => ({
  name: dto.name,
  shortName: dto.short_name,
  code: dto.code,
});
