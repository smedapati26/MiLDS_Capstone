/* Represents the output data transfer object */
export interface IInspectionReferenceDto {
  id: number;
  common_name: string;
  code: string;
  is_phase: boolean;
}

/* Represents maintenance event inspection reference */
export interface IInspectionReference {
  id: number;
  commonName: string;
  code: string;
  isPhase: boolean;
}

/**
 * Maps an IInspectionReferenceDto object to an IInspectionReference object.
 *
 * @param dto - The data transfer object containing inspection reference data.
 * @returns An IInspectionReference object with the mapped properties.
 */
export const mapToInspectionReference = (dto: IInspectionReferenceDto): IInspectionReference => ({
  id: dto.id,
  commonName: dto.common_name,
  code: dto.code,
  isPhase: dto.is_phase,
});
