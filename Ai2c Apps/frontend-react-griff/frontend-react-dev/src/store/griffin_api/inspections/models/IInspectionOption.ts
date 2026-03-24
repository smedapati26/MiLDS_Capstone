export interface IInspectionOptionDto {
  id: number;
  inspection_name: string;
}

export interface IInspectionOption {
  id: number;
  commonName: string;
}

export const mapToIInspectionOption = (dto: IInspectionOptionDto): IInspectionOption => ({
  id: dto.id,
  commonName: dto.inspection_name,
});
