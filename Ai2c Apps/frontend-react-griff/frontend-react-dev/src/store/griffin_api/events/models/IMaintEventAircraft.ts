/* Represents the output data transfer object */
export interface IMaintEventAircraftDto {
  serial: string;
  current_unit: string;
  airframe: {
    model: string;
    mds: string;
  };
}

/* Represents maintenance event aircraft */
export interface IMaintEventAircraft {
  serialNumber: string;
  currentUnitUic: string;
  model: string;
  mds: string;
}

/**
 * Maps an IMaintEventAircraftDto object to an IMaintEventAircraft object.
 *
 * @param dto - The data transfer object containing aircraft information.
 * @returns An IMaintEventAircraft object with the mapped properties.
 */
export const mapToIMaintEventAircraft = (dto: IMaintEventAircraftDto): IMaintEventAircraft => ({
  serialNumber: dto.serial,
  currentUnitUic: dto.current_unit,
  model: dto.airframe.model,
  mds: dto.airframe.mds,
});
