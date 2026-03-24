export interface IInspectionTypeDto {
  id: number;
  code: string;
  model: string;
  common_name: string;
  tracking_type: string;
  is_phase: boolean;
}

export interface IInspectionType {
  id: number;
  code: string;
  model: string;
  commonName: string;
  trackingType: string;
  isPhase: boolean;
}

export const mapToIInspectionType = (dto: IInspectionTypeDto): IInspectionType => ({
  id: dto.id,
  code: dto.code,
  model: dto.model,
  commonName: dto.common_name,
  trackingType: dto.tracking_type,
  isPhase: dto.is_phase,
});
